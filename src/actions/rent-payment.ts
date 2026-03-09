"use server";

import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RentBooking from "@/models/RentBooking";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" });

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return session.user;
}

// ─── createRentPaymentIntent ──────────────────────────────────────────────────
// Called when the tenant opens the payment modal (booking status = accepted).
// Creates a Stripe Customer (if not exists), creates a PaymentIntent for the
// first month rent with setup_future_usage="off_session" so the card is saved
// for later security deposit charges — all in one step.

export async function createRentPaymentIntent(bookingId: string): Promise<{
  clientSecret:         string;
  paymentIntentId:      string;
  rentalAmount:         number;
  securityDeposit:      number;
  tenantContractFee:    number;
  tenantContractFeeVat: number;
  tenantTotalCharged:   number;
}> {
  const user = await requireSession();
  await dbConnect();

  if (!Types.ObjectId.isValid(bookingId)) throw new Error("Invalid booking.");

  const booking = await RentBooking.findById(bookingId);
  if (!booking) throw new Error("Booking not found.");
  if (String(booking.tenantId) !== user.id) throw new Error("Forbidden.");
  // Accept both accepted and payment_pending — tenant may have closed modal before paying
  if (booking.status !== "accepted" && booking.status !== "payment_pending") {
    throw new Error("Booking is not in accepted status.");
  }

  // ── Get or create Stripe Customer ──
  let customerId = booking.stripe?.customerId;
  if (!customerId) {
    const userDoc = await User.findById(user.id)
      .select("email firstName lastName")
      .lean() as { email?: string; firstName?: string; lastName?: string } | null;

    const customer = await stripe.customers.create({
      email:    userDoc?.email,
      name:     userDoc ? `${userDoc.firstName ?? ""} ${userDoc.lastName ?? ""}`.trim() : undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await RentBooking.findByIdAndUpdate(bookingId, { "stripe.customerId": customerId });
  }

  // ── Reuse existing PI if tenant closed modal without paying ──
  const existingPiId = booking.stripe?.firstMonthPaymentIntentId;
  if (existingPiId) {
    const existing = await stripe.paymentIntents.retrieve(existingPiId);
    // Reuse if still awaiting payment
    if (existing.status === "requires_payment_method" || existing.status === "requires_confirmation" || existing.status === "requires_action") {
      return {
        clientSecret:         existing.client_secret!,
        paymentIntentId:      existing.id,
        rentalAmount:         booking.rentalAmount,
        securityDeposit:      booking.securityDeposit,
        tenantContractFee:    booking.fees?.tenantContractFee    ?? 0,
        tenantContractFeeVat: booking.fees?.tenantContractFeeVat ?? 0,
        tenantTotalCharged:   booking.fees?.tenantTotalCharged   ?? booking.rentalAmount,
      };
    }
  }

  // ── Create new PaymentIntent ──
  // Use tenantTotalCharged which includes contract fee + VAT if enabled
  const chargeAmount = booking.fees?.tenantTotalCharged ?? booking.rentalAmount;
  const amountCents  = Math.round(chargeAmount * 100);

  const pi = await stripe.paymentIntents.create({
    amount:      amountCents,
    currency:    "thb",
    customer:    customerId,
    automatic_payment_methods: { enabled: true },
    description: `First month rent — booking ${bookingId}`,
    metadata:    { bookingId, type: "rent_first_month" },
  });

  // Store PI id — do NOT change status here; status only changes on actual payment
  await RentBooking.findByIdAndUpdate(bookingId, {
    "stripe.firstMonthPaymentIntentId": pi.id,
  });

  return {
    clientSecret:         pi.client_secret!,
    paymentIntentId:      pi.id,
    rentalAmount:         booking.rentalAmount,
    securityDeposit:      booking.securityDeposit,
    tenantContractFee:    booking.fees?.tenantContractFee    ?? 0,
    tenantContractFeeVat: booking.fees?.tenantContractFeeVat ?? 0,
    tenantTotalCharged:   booking.fees?.tenantTotalCharged   ?? booking.rentalAmount,
  };
}

// ─── confirmRentPayment ───────────────────────────────────────────────────────
// Called on the client after Stripe confirms payment (no redirect).
// Only verifies the PI succeeded — all DB updates are done by the Stripe webhook.

export async function confirmRentPayment(
  bookingId:       string,
  paymentIntentId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireSession();
    await dbConnect();

    const booking = await RentBooking.findById(bookingId);
    if (!booking) return { success: false, error: "Booking not found." };
    if (String(booking.tenantId) !== user.id) return { success: false, error: "Forbidden." };

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      return { success: false, error: "Payment has not succeeded yet." };
    }

    // All DB updates (status, lockedPaymentMethodId, Transaction, Invoice)
    // are handled exclusively by the Stripe webhook.
    return { success: true };
  } catch (err) {
    console.error("[confirmRentPayment]", err);
    return { success: false, error: "Something went wrong." };
  }
}
