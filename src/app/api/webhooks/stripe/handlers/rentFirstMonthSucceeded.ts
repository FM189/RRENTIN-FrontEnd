import Stripe from "stripe";
import { Types } from "mongoose";
import RentBooking from "@/models/RentBooking";
import Transaction, { type TransactionType } from "@/models/Transaction";
import Invoice, { nextInvoiceNumber } from "@/models/Invoice";
import User from "@/models/User";
import { generateAndStoreInvoicePdf } from "@/lib/invoiceApi";

type TxBase = {
  referenceId:   Types.ObjectId;
  referenceType: "rent_booking";
  propertyId:    Types.ObjectId;
  stripeRef:     string;
  status:        "completed";
};

type TxEntry = TxBase & {
  type:        TransactionType;
  userId:      Types.ObjectId | null;
  amount:      number;
  description: string;
};

function buildTransactions(txBase: TxBase, params: {
  bookingId:          string;
  tenantId:           Types.ObjectId;
  ownerId:            Types.ObjectId;
  rentalAmount:       number;
  monthlyFees:        number;
  platformFeeRate:    number;
  platformFee:        number;
  vatOnPlatformFee:   number;
  stripeFee:          number;
  ownerNet:             number;
  ownerContractFee:     number;
  ownerContractFeeVat:  number;
  tenantContractFee:    number;
  tenantContractFeeVat: number;
}): TxEntry[] {
  const { bookingId, tenantId, ownerId, rentalAmount, monthlyFees, platformFeeRate,
    platformFee, vatOnPlatformFee, stripeFee, ownerNet,
    ownerContractFee, ownerContractFeeVat, tenantContractFee, tenantContractFeeVat } = params;

  const txs: TxEntry[] = [
    { ...txBase, type: "rent_payment", userId: tenantId, amount: rentalAmount,     description: `First month rent — booking ${bookingId}` },
    { ...txBase, type: "platform_fee", userId: null,     amount: platformFee,      description: `Platform fee (${(platformFeeRate * 100).toFixed(0)}%) — booking ${bookingId}` },
    { ...txBase, type: "vat",          userId: null,     amount: vatOnPlatformFee, description: `VAT on platform fee — booking ${bookingId}` },
    { ...txBase, type: "stripe_fee",   userId: null,     amount: stripeFee,        description: `Stripe processing fee — booking ${bookingId}` },
    { ...txBase, type: "owner_payout", userId: ownerId,  amount: ownerNet,         description: `Owner payout (first month${monthlyFees > 0 ? `, incl. THB ${monthlyFees.toLocaleString()} monthly fees` : ""}) — booking ${bookingId}` },
  ];

  if (tenantContractFee > 0) {
    txs.push({ ...txBase, type: "contract_fee", userId: tenantId, amount: tenantContractFee,    description: `Tenant contract fee — booking ${bookingId}` });
    if (tenantContractFeeVat > 0) {
      txs.push({ ...txBase, type: "vat",         userId: tenantId, amount: tenantContractFeeVat, description: `VAT on tenant contract fee — booking ${bookingId}` });
    }
  }

  if (monthlyFees > 0) {
    txs.push({ ...txBase, type: "monthly_fee", userId: tenantId, amount: monthlyFees, description: `Monthly property fees — booking ${bookingId}` });
  }

  if (ownerContractFee > 0) {
    txs.push({ ...txBase, type: "contract_fee", userId: ownerId, amount: ownerContractFee,    description: `Owner contract fee deducted — booking ${bookingId}` });
    if (ownerContractFeeVat > 0) {
      txs.push({ ...txBase, type: "vat",         userId: ownerId, amount: ownerContractFeeVat, description: `VAT on owner contract fee — booking ${bookingId}` });
    }
  }

  return txs;
}

function buildLineItems(params: {
  rentalAmount:         number;
  customFeesSnapshot:   { name: string; amount: number }[];
  tenantContractFee:    number;
  tenantContractFeeVat: number;
  contractFeeRate:      number;
  vatRate:              number;
  totalRentAmount:      number;
}) {
  const { rentalAmount, customFeesSnapshot, tenantContractFee, tenantContractFeeVat,
    contractFeeRate, vatRate, totalRentAmount } = params;

  const items = [
    { description: "First Month Rent", amount: rentalAmount, vatRate: 0, vatAmount: 0, total: rentalAmount },
  ];

  for (const fee of customFeesSnapshot) {
    if (fee.amount > 0) {
      items.push({
        description: fee.name,
        amount: fee.amount, vatRate: 0, vatAmount: 0, total: fee.amount,
      });
    }
  }

  if (tenantContractFee > 0) {
    items.push({
      description: `Contract Fee (${(contractFeeRate * 100).toFixed(0)}% of THB ${Math.round(totalRentAmount).toLocaleString("en-US")})`,
      amount: tenantContractFee, vatRate: 0, vatAmount: 0, total: tenantContractFee,
    });
  }

  if (tenantContractFeeVat > 0) {
    items.push({
      description: `VAT on Contract Fee (${(vatRate * 100).toFixed(0)}% of THB ${Math.round(tenantContractFee).toLocaleString("en-US")})`,
      amount: tenantContractFeeVat, vatRate, vatAmount: tenantContractFeeVat, total: tenantContractFeeVat,
    });
  }

  return items;
}

export async function handleRentFirstMonthSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const bookingId = pi.metadata?.bookingId;
  if (!bookingId) return;

  const booking = await RentBooking.findById(bookingId);
  if (!booking || booking.status === "active") return; // idempotent

  // ── Payment method detection ───────────────────────────────────────────────
  const paymentMethodId =
    typeof pi.payment_method === "string"
      ? pi.payment_method
      : (pi.payment_method as Stripe.PaymentMethod | null)?.id ?? "";

  const paidByCard = (pi.payment_method_types?.[0] ?? "") === "card";

  // ── Next rent due date ─────────────────────────────────────────────────────
  const nextRentDueDate = new Date(
    new Date(booking.moveInDate).getTime() + 30 * 24 * 60 * 60 * 1000,
  );

  await RentBooking.findByIdAndUpdate(bookingId, {
    "stripe.lockedPaymentMethodId": paymentMethodId,
    "stripe.firstMonthPaidAt":      new Date(),
    status:         "active",
    rentMonthsPaid: 1,
    nextRentDueDate,
    autoCharge:     paidByCard,
  });

  // ── Fee snapshot ───────────────────────────────────────────────────────────
  const fees               = booking.fees;
  const rentalAmount       = booking.rentalAmount;
  const monthlyFees        = booking.monthlyFees ?? 0;
  const tenantContractFee  = fees?.tenantContractFee    ?? 0;
  const tenantContractFeeVat = fees?.tenantContractFeeVat ?? 0;
  const tenantTotalCharged = fees?.tenantTotalCharged   ?? rentalAmount;
  const ownerContractFee    = fees?.ownerContractFee    ?? 0;
  const ownerContractFeeVat = fees?.ownerContractFeeVat ?? 0;
  const platformFeeRate    = fees?.platformFeeRate      ?? 0.09;
  const vatRate            = fees?.vatRate              ?? 0.07;
  const stripeFeePercent   = fees?.stripeFeePercent     ?? 0.034;
  const stripeFeeFixed     = fees?.stripeFeeFixed       ?? 10;

  // ── Calculations ───────────────────────────────────────────────────────────
  // Platform fee on base rent only (monthly fees are pass-through, not platform revenue)
  const platformFee      = Math.round(platformFeeRate * rentalAmount);
  const vatOnPlatformFee = Math.round(vatRate * platformFee);
  // Stripe fee on full tenant charge (includes monthly fees + contract fees)
  const stripeFee        = Math.round((stripeFeePercent * tenantTotalCharged) + stripeFeeFixed);
  // Owner receives base rent + monthly fees minus all platform deductions
  const ownerNet         = rentalAmount + monthlyFees - platformFee - vatOnPlatformFee - stripeFee - ownerContractFee - ownerContractFeeVat;
  const totalRentAmount  = (Math.floor(booking.stayDays / 30) * rentalAmount) + ((booking.remainderDays ?? 0) * (booking.dailyRate ?? rentalAmount / 30));

  // ── Tenant info ────────────────────────────────────────────────────────────
  const tenant = await User.findById(booking.tenantId)
    .select("firstName lastName email")
    .lean() as { firstName?: string; lastName?: string; email?: string } | null;

  const tenantName    = tenant ? `${tenant.firstName ?? ""} ${tenant.lastName ?? ""}`.trim() : "";
  const invoiceNumber = await nextInvoiceNumber();

  const txBase: TxBase = {
    referenceId:   booking._id as Types.ObjectId,
    referenceType: "rent_booking",
    propertyId:    booking.propertyId as Types.ObjectId,
    stripeRef:     pi.id,
    status:        "completed",
  };

  const transactions = buildTransactions(txBase, {
    bookingId, tenantId: booking.tenantId as Types.ObjectId,
    ownerId: booking.ownerId as Types.ObjectId,
    rentalAmount, platformFeeRate, platformFee, vatOnPlatformFee,
    monthlyFees, stripeFee, ownerNet, ownerContractFee, ownerContractFeeVat, tenantContractFee, tenantContractFeeVat,
  });

  const lineItems = buildLineItems({
    rentalAmount,
    customFeesSnapshot: (booking.customFeesSnapshot ?? []) as { name: string; amount: number }[],
    tenantContractFee, tenantContractFeeVat,
    contractFeeRate: fees?.tenantContractFeeRate ?? 0.05,
    vatRate, totalRentAmount,
  });

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
