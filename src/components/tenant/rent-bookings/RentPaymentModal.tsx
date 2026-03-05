"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import { createRentPaymentIntent, confirmRentPayment } from "@/actions/rent-payment";
import type { RentBookingDetail } from "@/actions/rent-booking";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Checkout form ────────────────────────────────────────────────────────────

interface CheckoutFormProps {
  bookingId:       string;
  paymentIntentId: string;
  rentalAmount:    number;
  securityDeposit: number;
  onBack:          () => void;
  onSuccess:       () => void;
}

function CheckoutForm({
  bookingId, paymentIntentId, rentalAmount, securityDeposit, onBack, onSuccess,
}: CheckoutFormProps) {
  const t        = useTranslations("Dashboard.rentPaymentModal");
  const stripe   = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/tenant/proposals`,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message ?? t("paymentFailed"));
        return;
      }

      // No redirect = payment succeeded on-page
      const result = await confirmRentPayment(bookingId, paymentIntentId);
      if (!result.success) {
        setError(result.error ?? t("paymentFailed"));
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("paymentFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PaymentElement options={{ layout: "tabs" }} />

      {error && <p className="text-xs text-[#E35454]">{error}</p>}

      <div className="flex items-center justify-end gap-4 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-[2px] bg-[#E35454] px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#C93D3D]"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading || !stripe}
          className="flex items-center gap-2 rounded-[2px] bg-[#0245A5] px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#01357A]"
        >
          {loading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {t("confirm", { amount: formatPrice(rentalAmount) })}
        </button>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  bookingId: string;
  detail:    RentBookingDetail;
  onClose:   () => void;
  onSuccess: () => void;
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function RentPaymentModal({ bookingId, detail, onClose, onSuccess }: Props) {
  const t = useTranslations("Dashboard.rentPaymentModal");

  const [clientSecret,    setClientSecret]    = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [rentalAmount,    setRentalAmount]    = useState(0);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [loadingPI,       setLoadingPI]       = useState(false);
  const [piError,         setPiError]         = useState<string | null>(null);
  const [succeeded,       setSucceeded]       = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setLoadingPI(true);
    setPiError(null);

    createRentPaymentIntent(bookingId)
      .then((r) => {
        setClientSecret(r.clientSecret);
        setPaymentIntentId(r.paymentIntentId);
        setRentalAmount(r.rentalAmount);
        setSecurityDeposit(r.securityDeposit);
      })
      .catch((err) => setPiError(err?.message ?? t("initFailed")))
      .finally(() => setLoadingPI(false));
  }, [bookingId, t]);

  const handleSuccess = () => {
    setSucceeded(true);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={succeeded ? undefined : (e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex w-full max-w-[720px] flex-col gap-5 overflow-y-auto rounded-[8px] bg-white p-6"
        style={{ boxShadow: "0px 2px 14px rgba(0,0,0,0.11)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-semibold text-[#32343C]">
            {succeeded ? t("successTitle") : t("title")}
          </h2>
          {!succeeded && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(50,52,60,0.44)] hover:bg-[rgba(50,52,60,0.6)]"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Success screen */}
        {succeeded ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-[#32343C]">{t("successTitle")}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#969696]">{t("successMessage")}</p>
            </div>
            <button
              type="button"
              onClick={onSuccess}
              className="rounded-[2px] bg-[#0245A5] px-10 py-2.5 text-sm font-semibold text-white hover:bg-[#01357A]"
            >
              {t("done")}
            </button>
          </div>
        ) : (
          <>
            {/* Property card */}
            <div>
              <p className="mb-2 text-sm font-semibold text-[#32343C]">{t("property")}</p>
              <div className="overflow-hidden rounded-[6px] border border-[rgba(65,65,65,0.16)]">
                <div className="relative h-[160px] w-full bg-[#F7FAFE]">
                  {detail.propertyImages[0] && (
                    <Image src={detail.propertyImages[0]} alt={detail.propertyTitle} fill className="object-cover" />
                  )}
                  {detail.propertyType && (
                    <span className="absolute left-2 top-2 rounded-[3px] bg-[#0245A5] px-2 py-0.5 text-xs font-semibold text-white">
                      {detail.propertyType}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 p-3">
                  {detail.propertyAddress && (
                    <p className="text-xs text-[#969696]">{detail.propertyAddress}</p>
                  )}
                  <p className="text-sm font-semibold text-[#32343C]">{detail.propertyTitle}</p>
                </div>
              </div>
            </div>

            {/* Price summary */}
            <div className="rounded-[6px] border border-[rgba(102,102,102,0.12)] p-4">
              <p className="mb-3 text-sm font-bold text-[#32343C]">{t("priceSummary")}</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#545454]">{t("firstMonthRent")}</span>
                  <span className="font-semibold text-[#32343C]">{formatPrice(detail.rentalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#545454]">{t("securityDeposit")}</span>
                  <span className="font-semibold text-[#32343C]">{formatPrice(detail.securityDeposit)}</span>
                </div>
                <div className="border-t border-[rgba(65,65,65,0.1)] pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#32343C]">{t("chargedToday")}</span>
                    <span className="text-base font-bold text-[#0245A5]">{formatPrice(detail.rentalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading PI */}
            {loadingPI && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#0245A5] border-t-transparent" />
              </div>
            )}

            {piError && !loadingPI && (
              <p className="text-sm text-[#E35454]">{piError}</p>
            )}

            {/* Stripe PaymentElement */}
            {!loadingPI && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: { theme: "stripe" } }}
              >
                <CheckoutForm
                  bookingId={bookingId}
                  paymentIntentId={paymentIntentId}
                  rentalAmount={rentalAmount}
                  securityDeposit={securityDeposit}
                  onBack={onClose}
                  onSuccess={handleSuccess}
                />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  );
}
