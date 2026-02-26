"use server";

import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import VisitRequest from "@/models/VisitRequest";
import { getActivePlatformFees } from "@/actions/platform-fees";
import { calculateFees } from "@/lib/fees";
import type { VisitRequestFormData } from "@/components/ui/VisitRequestModal";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" });

export interface VisitPaymentResult {
  clientSecret:    string;
  paymentIntentId: string;
  total:           number;
  breakdown: {
    subtotal:    number;
    platformFee: number;
    vat:         number;
    stripeFee:   number;
    total:       number;
  };
}

// Step 1 — called when payment modal opens.
// Only creates the Stripe PaymentIntent. No DB write yet.
export async function createVisitPaymentIntent(
  baseAmount:  number,
  propertyId:  string,
  title:       string,
): Promise<VisitPaymentResult> {
  const rates     = await getActivePlatformFees();
  const breakdown = calculateFees(baseAmount, rates);
  const totalCents = Math.round(breakdown.total * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   totalCents,
    currency: "thb",
    automatic_payment_methods: { enabled: true },
    description: `Visit request for property: ${title}`,
    metadata: { propertyId },
  });

  return {
    clientSecret:    paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    total:           breakdown.total,
    breakdown: {
      subtotal:    breakdown.subtotal,
      platformFee: breakdown.platformFee,
      vat:         breakdown.vat,
      stripeFee:   breakdown.stripeFee,
      total:       breakdown.total,
    },
  };
}

// Step 2a — called before PayPal redirect.
// Creates the VisitRequest in pending state and stamps visitRequestId onto PI metadata
// so the webhook can find it on return.
export async function createPendingVisitRequestForRedirect(
  paymentIntentId: string,
  baseAmount:       number,
  requestData:      VisitRequestFormData,
  propertyId:       string,
  tenantId:         string,
  ownerId:          string,
): Promise<{ visitRequestId: string }> {
  await dbConnect();

  const rates     = await getActivePlatformFees();
  const breakdown = calculateFees(baseAmount, rates);

  const doc = await VisitRequest.create({
    tenantId,
    ownerId,
    propertyId,
    tenantInfo: {
      fullName:          requestData.fullName,
      moveInDate:        requestData.moveInDate,
      moveOutDate:       requestData.moveOutDate,
      nationality:       requestData.nationality,
      numberOfOccupants: requestData.numberOfOccupants,
      purposeOfRental:   requestData.purposeOfRental,
    },
    preferredDate: requestData.selectedDate,
    preferredTime: requestData.selectedTime,
    visitFee:      baseAmount,
    feeBreakdown: {
      platformFee: breakdown.platformFee,
      vat:         breakdown.vat,
      stripeFee:   breakdown.stripeFee,
      total:       breakdown.total,
    },
    payment: {
      stripePaymentIntentId: paymentIntentId,
      status: "pending",
    },
    escrow: { status: "held" },
    status: "payment_pending",
  });

  const visitRequestId = String(doc._id);

  // Stamp visitRequestId onto PI metadata so webhook can update on PayPal return
  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: { visitRequestId },
  });

  return { visitRequestId };
}

// Step 2b — called after payment succeeds on the client.
// Creates the VisitRequest doc with payment info attached.
export async function confirmVisitRequest(
  paymentIntentId: string,
  baseAmount:       number,
  requestData:      VisitRequestFormData,
  propertyId:       string,
  tenantId:         string,
  ownerId:          string,
): Promise<{ visitRequestId: string }> {
  await dbConnect();

  // Guard: prevent duplicate active visit requests
  const existing = await VisitRequest.exists({
    propertyId,
    tenantId,
    status: { $nin: ["cancelled", "completed"] },
  });
  if (existing) {
    throw new Error("You already have an active visit request for this property.");
  }

  const rates     = await getActivePlatformFees();
  const breakdown = calculateFees(baseAmount, rates);

  const doc = await VisitRequest.create({
    tenantId,
    ownerId,
    propertyId,
    tenantInfo: {
      fullName:          requestData.fullName,
      moveInDate:        requestData.moveInDate,
      moveOutDate:       requestData.moveOutDate,
      nationality:       requestData.nationality,
      numberOfOccupants: requestData.numberOfOccupants,
      purposeOfRental:   requestData.purposeOfRental,
    },
    preferredDate: requestData.selectedDate,
    preferredTime: requestData.selectedTime,
    visitFee:      baseAmount,
    feeBreakdown: {
      platformFee: breakdown.platformFee,
      vat:         breakdown.vat,
      stripeFee:   breakdown.stripeFee,
      total:       breakdown.total,
    },
    payment: {
      stripePaymentIntentId: paymentIntentId,
      status: "paid",
      paidAt: new Date(),
    },
    escrow:  { status: "held" },
    status:  "payment_confirmed",
    // qrToken intentionally omitted — set only when owner accepts
  });

  return { visitRequestId: String(doc._id) };
}
