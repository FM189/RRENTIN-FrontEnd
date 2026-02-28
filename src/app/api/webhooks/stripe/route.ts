import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import VisitRequest from "@/models/VisitRequest";
import Transaction from "@/models/Transaction";
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

    // ── rent_booking ──────────────────────────────────────────────────────────
    // Wire up here when the rent booking payment flow is built:
    // if (referenceType === "rent_booking") { ... }

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
  }

  return NextResponse.json({ received: true });
}
