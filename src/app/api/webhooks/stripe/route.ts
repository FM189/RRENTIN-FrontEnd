import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import VisitRequest from "@/models/VisitRequest";
import RentBooking from "@/models/RentBooking";
import Transaction, { type TransactionType } from "@/models/Transaction";
import Invoice, { nextInvoiceNumber } from "@/models/Invoice";
import User from "@/models/User";
import { generateAndStoreInvoicePdf } from "@/lib/invoiceApi";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig     = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await dbConnect();

  // ── payment_intent.succeeded ────────────────────────────────────────────────
  if (event.type === "payment_intent.succeeded") {
    const pi              = event.data.object as Stripe.PaymentIntent;
    const referenceId     = pi.metadata?.visitRequestId;
    const referenceType   = pi.metadata?.referenceType ?? "visit_request";

    if (referenceId && referenceType === "visit_request") {
      const doc = await VisitRequest.findByIdAndUpdate(
        referenceId,
        {
          "payment.status": "paid",
          "payment.paidAt": new Date(),
          "escrow.status":  "held",
          status:           "payment_confirmed",
        },
        { new: true }
      );

      if (doc) {
        const totalPaid = pi.amount / 100;
        const visitFee  = doc.visitFee ?? 0;

        // Fetch tenant info for invoice
        const tenant = await User.findById(doc.tenantId)
          .select("firstName lastName email")
          .lean();

        const tenantName = tenant
          ? `${tenant.firstName} ${tenant.lastName}`.trim()
          : "";

        const invoiceNumber = await nextInvoiceNumber();

        await Promise.all([
          // Transactions
          Transaction.insertMany([
            {
              type:          "visit_payment",
              userId:        doc.tenantId,
              referenceId:   doc._id,
              referenceType: "visit_request",
              propertyId:    doc.propertyId,
              amount:        totalPaid,
              stripeRef:     pi.id,
              status:        "completed",
              description:   `Visit payment for property ${doc.propertyId}`,
            },
            {
              type:          "escrow_hold",
              userId:        doc.ownerId,
              referenceId:   doc._id,
              referenceType: "visit_request",
              propertyId:    doc.propertyId,
              amount:        visitFee,
              stripeRef:     pi.id,
              status:        "pending",
              description:   `Escrow hold for visit request ${doc._id}`,
            },
          ]),

          // Invoice for tenant — visit fee only
          Invoice.create({
            invoiceNumber,
            referenceId:   doc._id,
            referenceType: "visit_request",
            propertyId:    doc.propertyId,
            issuedTo: {
              userId:   doc.tenantId,
              fullName: tenantName,
              email:    tenant?.email ?? "",
            },
            lineItems: [
              {
                description: "Visit Request Service Fee",
                amount:      visitFee,
                vatRate:     0,
                vatAmount:   0,
                total:       visitFee,
              },
            ],
            subtotal:  visitFee,
            vatTotal:  0,
            total:     totalPaid,
            stripeRef: pi.id,
            status:    "issued",
            issuedAt:  new Date(),
          }).then((invoice) => {
            // Generate PDF async — does not block webhook response
            generateAndStoreInvoicePdf(invoice);
          }),
        ]);
      }
    }

    // ── rent_first_month ──────────────────────────────────────────────────────
    if (pi.metadata?.type === "rent_first_month") {
      const bookingId = pi.metadata?.bookingId;
      if (bookingId) {
        const booking = await RentBooking.findById(bookingId);

        // Idempotent — skip if already processed
        if (booking && booking.status !== "active") {
          const paymentMethodId =
            typeof pi.payment_method === "string"
              ? pi.payment_method
              : (pi.payment_method as Stripe.PaymentMethod | null)?.id ?? "";

          await RentBooking.findByIdAndUpdate(bookingId, {
            "stripe.lockedPaymentMethodId": paymentMethodId,
            "stripe.firstMonthPaidAt":      new Date(),
            status: "active",
          });

          // ── Fee snapshot from booking ──────────────────────────────────────
          const fees               = booking.fees;
          const rentalAmount       = booking.rentalAmount;
          const tenantContractFee  = fees?.tenantContractFee    ?? 0;
          const tenantContractFeeVat = fees?.tenantContractFeeVat ?? 0;
          const tenantTotalCharged = fees?.tenantTotalCharged   ?? rentalAmount;
          const ownerContractFee   = fees?.ownerContractFee     ?? 0;
          const platformFeeRate    = fees?.platformFeeRate      ?? 0.09;
          const vatRate            = fees?.vatRate              ?? 0.07;
          const stripeFeePercent   = fees?.stripeFeePercent     ?? 0.034;
          const stripeFeeFixed     = fees?.stripeFeeFixed       ?? 10;

          // ── Platform/owner calculations (applied to rentalAmount only) ─────
          const platformFee        = Math.round(platformFeeRate * rentalAmount);
          const vatOnPlatformFee   = Math.round(vatRate * platformFee);
          const stripeFee          = Math.round((stripeFeePercent * tenantTotalCharged) + stripeFeeFixed);
          const ownerNet           = rentalAmount - platformFee - vatOnPlatformFee - stripeFee - ownerContractFee;

          // ── Tenant info ────────────────────────────────────────────────────
          const tenant = await User.findById(booking.tenantId)
            .select("firstName lastName email")
            .lean() as { firstName?: string; lastName?: string; email?: string } | null;

          const tenantName = tenant
            ? `${tenant.firstName ?? ""} ${tenant.lastName ?? ""}`.trim()
            : "";

          const invoiceNumber = await nextInvoiceNumber();

          // ── Total contract value (basis for contract fee calculation) ────────
          const fullMonths_        = Math.floor(booking.stayDays / 30);
          const totalContractValue = (fullMonths_ * rentalAmount) + ((booking.remainderDays ?? 0) * (booking.dailyRate ?? rentalAmount / 30));

          // ── Build tenant invoice line items ────────────────────────────────
          const lineItems: {
            description: string; amount: number;
            vatRate: number; vatAmount: number; total: number;
          }[] = [
            {
              description: "First Month Rent",
              amount:      rentalAmount,
              vatRate:     0,
              vatAmount:   0,
              total:       rentalAmount,
            },
          ];

          if (tenantContractFee > 0) {
            lineItems.push({
              description: `Contract Fee (${((fees?.tenantContractFeeRate ?? 0.05) * 100).toFixed(0)}% of THB ${Math.round(totalContractValue).toLocaleString("en-US")})`,
              amount:      tenantContractFee,
              vatRate:     0,
              vatAmount:   0,
              total:       tenantContractFee,
            });
          }
          if (tenantContractFeeVat > 0) {
            lineItems.push({
              description: `VAT on Contract Fee (${(vatRate * 100).toFixed(0)}% of THB ${Math.round(tenantContractFee).toLocaleString("en-US")})`,
              amount:      tenantContractFeeVat,
              vatRate:     vatRate,
              vatAmount:   tenantContractFeeVat,
              total:       tenantContractFeeVat,
            });
          }

          // ── Build transaction records ──────────────────────────────────────
          const txBase = {
            referenceId:   booking._id,
            referenceType: "rent_booking" as const,
            propertyId:    booking.propertyId,
            stripeRef:     pi.id,
            status:        "completed" as const,
          };

          type TxEntry = typeof txBase & { type: TransactionType; userId: Types.ObjectId | null; amount: number; description: string };

          const transactions: TxEntry[] = [
            // Tenant: rent payment
            { ...txBase, type: "rent_payment",  userId: booking.tenantId, amount: rentalAmount,     description: `First month rent — booking ${bookingId}` },
            // Platform: platform fee (userId null = platform earnings)
            { ...txBase, type: "platform_fee",  userId: null,             amount: platformFee,      description: `Platform fee (${(platformFeeRate * 100).toFixed(0)}%) — booking ${bookingId}` },
            // Platform: VAT on platform fee
            { ...txBase, type: "vat",           userId: null,             amount: vatOnPlatformFee, description: `VAT on platform fee — booking ${bookingId}` },
            // Platform: Stripe fee
            { ...txBase, type: "stripe_fee",    userId: null,             amount: stripeFee,        description: `Stripe processing fee — booking ${bookingId}` },
            // Owner: net payout
            { ...txBase, type: "owner_payout",  userId: booking.ownerId,  amount: ownerNet,         description: `Owner payout (first month) — booking ${bookingId}` },
          ];

          // Tenant contract fee transaction (if charged)
          if (tenantContractFee > 0) {
            transactions.push({ ...txBase, type: "contract_fee" as const, userId: booking.tenantId, amount: tenantContractFee,    description: `Tenant contract fee — booking ${bookingId}` });
            if (tenantContractFeeVat > 0) {
              transactions.push({ ...txBase, type: "vat" as const,          userId: booking.tenantId, amount: tenantContractFeeVat, description: `VAT on tenant contract fee — booking ${bookingId}` });
            }
          }

          // Owner contract fee deduction (if enabled)
          if (ownerContractFee > 0) {
            transactions.push({ ...txBase, type: "contract_fee" as const, userId: booking.ownerId, amount: ownerContractFee, description: `Owner contract fee deducted — booking ${bookingId}` });
          }

          await Promise.all([
            Transaction.insertMany(transactions),

            Invoice.create({
              invoiceNumber,
              referenceId:   booking._id,
              referenceType: "rent_booking",
              propertyId:    booking.propertyId,
              issuedTo: {
                userId:   booking.tenantId,
                fullName: tenantName,
                email:    tenant?.email ?? "",
              },
              lineItems,
              subtotal:  tenantTotalCharged - tenantContractFeeVat,
              vatTotal:  tenantContractFeeVat,
              total:     tenantTotalCharged,
              stripeRef: pi.id,
              status:    "issued",
              issuedAt:  new Date(),
            }).then((invoice) => {
              generateAndStoreInvoicePdf(invoice);
            }),
          ]);
        }
      }
    }

    // ── agent_service ─────────────────────────────────────────────────────────
    // Wire up here when the agent service payment flow is built:
    // if (referenceType === "agent_service") { ... }
  }

  // ── payment_intent.payment_failed ───────────────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const pi            = event.data.object as Stripe.PaymentIntent;
    const referenceId   = pi.metadata?.visitRequestId;
    const referenceType = pi.metadata?.referenceType ?? "visit_request";

    if (referenceId && referenceType === "visit_request") {
      await VisitRequest.findByIdAndUpdate(referenceId, {
        "payment.status": "refunded",
        status:           "cancelled",
      });
      // Nothing was charged — no transactions or invoices to create
    }

    // Rent booking failed — revert to accepted so tenant can retry
    if (pi.metadata?.type === "rent_first_month") {
      const bookingId = pi.metadata?.bookingId;
      if (bookingId) {
        await RentBooking.findOneAndUpdate(
          { _id: bookingId, status: "payment_pending" },
          { status: "accepted", "stripe.firstMonthPaymentIntentId": "" },
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
