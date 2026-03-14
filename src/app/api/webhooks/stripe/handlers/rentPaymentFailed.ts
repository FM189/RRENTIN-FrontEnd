import Stripe from "stripe";
import VisitRequest from "@/models/VisitRequest";
import RentBooking from "@/models/RentBooking";

export async function handleVisitPaymentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  const referenceId = pi.metadata?.visitRequestId;
  if (!referenceId) return;

  await VisitRequest.findByIdAndUpdate(referenceId, {
    "payment.status": "refunded",
    status:           "cancelled",
  });
}

export async function handleRentFirstMonthFailed(pi: Stripe.PaymentIntent): Promise<void> {
  const bookingId = pi.metadata?.bookingId;
  if (!bookingId) return;

  // Revert to accepted so tenant can retry payment
  await RentBooking.findOneAndUpdate(
    { _id: bookingId, status: "payment_pending" },
    { status: "accepted", "stripe.firstMonthPaymentIntentId": "" },
  );
}
