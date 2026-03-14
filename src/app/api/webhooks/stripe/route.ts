import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import { handleVisitPaymentSucceeded }  from "./handlers/visitPaymentSucceeded";
import { handleRentFirstMonthSucceeded } from "./handlers/rentFirstMonthSucceeded";
import { handleRentMonthlySucceeded }   from "./handlers/rentMonthlySucceeded";
import { handleVisitPaymentFailed, handleRentFirstMonthFailed } from "./handlers/rentPaymentFailed";
import { handleRentOverdueManualSucceeded } from "./handlers/rentOverdueManualSucceeded";

const stripe        = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" });
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

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;

    if (pi.metadata?.referenceType === "visit_request" || pi.metadata?.visitRequestId) {
      await handleVisitPaymentSucceeded(pi);
    }

    if (pi.metadata?.type === "rent_first_month") {
      await handleRentFirstMonthSucceeded(pi);
    }

    if (pi.metadata?.type === "monthly_rent") {
      await handleRentMonthlySucceeded(pi);
    }

    if (pi.metadata?.type === "monthly_rent_overdue") {
      await handleRentOverdueManualSucceeded(pi);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;

    if (pi.metadata?.visitRequestId) {
      await handleVisitPaymentFailed(pi);
    }

    if (pi.metadata?.type === "rent_first_month") {
      await handleRentFirstMonthFailed(pi);
    }
  }

  return NextResponse.json({ received: true });
}
