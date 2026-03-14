import Stripe from "stripe";
import { Types } from "mongoose";
import RentBooking from "@/models/RentBooking";
import Transaction, { type TransactionType } from "@/models/Transaction";
import Invoice, { nextInvoiceNumber } from "@/models/Invoice";
import User from "@/models/User";
import { generateAndStoreInvoicePdf } from "@/lib/invoiceApi";

type TxEntry = {
  type:          TransactionType;
  userId:        Types.ObjectId | null;
  referenceId:   Types.ObjectId;
  referenceType: "rent_booking";
  propertyId:    Types.ObjectId;
  amount:        number;
  stripeRef:     string;
  status:        "completed";
  description:   string;
};

export async function handleRentMonthlySucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const bookingId  = pi.metadata?.bookingId;
  const monthNumber = Number(pi.metadata?.monthNumber ?? 0);
  if (!bookingId) return;

  const booking = await RentBooking.findById(bookingId);
  if (!booking || booking.status !== "active") return;

  // Idempotent — skip if this month already recorded
  if (booking.rentMonthsPaid >= monthNumber) return;

  // ── Charge amount ──────────────────────────────────────────────────────────
  const chargedAmount = pi.amount / 100; // convert from Stripe cents

  // ── Fee calculations (from snapshotted rates) ──────────────────────────────
  const fees           = booking.fees;
  const platformFeeRate  = fees?.platformFeeRate  ?? 0.09;
  const vatRate          = fees?.vatRate          ?? 0.07;
  const stripeFeePercent = fees?.stripeFeePercent ?? 0.034;
  const stripeFeeFixed   = fees?.stripeFeeFixed   ?? 10;

  const platformFee      = Math.round(platformFeeRate * chargedAmount);
  const vatOnPlatformFee = Math.round(vatRate * platformFee);
  const stripeFee        = Math.round((stripeFeePercent * chargedAmount) + stripeFeeFixed);
  const ownerNet         = chargedAmount - platformFee - vatOnPlatformFee - stripeFee;

  // ── Determine if all months are now paid ───────────────────────────────────
  const newRentMonthsPaid = monthNumber;
  const allPaid           = newRentMonthsPaid >= booking.contractMonths;
  const nextRentDueDate   = allPaid
    ? null
    : new Date((booking.nextRentDueDate ?? new Date()).getTime() + 30 * 24 * 60 * 60 * 1000);

  await RentBooking.findByIdAndUpdate(bookingId, {
    rentMonthsPaid:  newRentMonthsPaid,
    nextRentDueDate,
    // Clear overdue, retry state, and restriction on successful payment
    $set: {
      overdueMonths:             0,
      overdueAmount:             0,
      stripeRetryCount:          0,
      lateFeePendingAt:          null,
      isRestricted:              false,
      totalPaymentFailureCycles: 0,
    },
  });

  // ── Tenant info ────────────────────────────────────────────────────────────
  const tenant = await User.findById(booking.tenantId)
    .select("firstName lastName email")
    .lean() as { firstName?: string; lastName?: string; email?: string } | null;

  const tenantName    = tenant ? `${tenant.firstName ?? ""} ${tenant.lastName ?? ""}`.trim() : "";
  const invoiceNumber = await nextInvoiceNumber();

  const monthLabel = `Month ${monthNumber}`;

  // ── Transactions ───────────────────────────────────────────────────────────
  const txBase = {
    referenceId:   booking._id as Types.ObjectId,
    referenceType: "rent_booking" as const,
    propertyId:    booking.propertyId as Types.ObjectId,
    stripeRef:     pi.id,
    status:        "completed" as const,
  };

  const transactions: TxEntry[] = [
    { ...txBase, type: "rent_payment", userId: booking.tenantId as Types.ObjectId, amount: chargedAmount,    description: `${monthLabel} rent — booking ${bookingId}` },
    { ...txBase, type: "platform_fee", userId: null,                                amount: platformFee,      description: `Platform fee (${(platformFeeRate * 100).toFixed(0)}%) — booking ${bookingId}` },
    { ...txBase, type: "vat",          userId: null,                                amount: vatOnPlatformFee, description: `VAT on platform fee — booking ${bookingId}` },
    { ...txBase, type: "stripe_fee",   userId: null,                                amount: stripeFee,        description: `Stripe processing fee — booking ${bookingId}` },
    { ...txBase, type: "owner_payout", userId: booking.ownerId as Types.ObjectId,   amount: ownerNet,         description: `Owner payout (${monthLabel}) — booking ${bookingId}` },
  ];

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
      lineItems: [
        {
          description: `${monthLabel} Rent`,
          amount:      chargedAmount,
          vatRate:     0,
          vatAmount:   0,
          total:       chargedAmount,
        },
      ],
      subtotal:  chargedAmount,
      vatTotal:  0,
      total:     chargedAmount,
      stripeRef: pi.id,
      status:    "issued",
      issuedAt:  new Date(),
    }).then((invoice) => {
      generateAndStoreInvoicePdf(invoice);
    }),
  ]);
}
