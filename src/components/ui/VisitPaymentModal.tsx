"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import {
  createVisitPaymentIntent,
  createPendingVisitRequestForRedirect,
} from "@/actions/visit-payment";
import type { TenantPropertyDetail } from "@/actions/tenant-properties";
import type { VisitRequestFormData } from "@/components/ui/VisitRequestModal";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Checkout form (inside Elements context) ──────────────────────────────────

interface CheckoutFormProps {
  paymentIntentId: string;
  baseAmount:      number;
  detail:          TenantPropertyDetail;
  requestData:     VisitRequestFormData;
  tenantId:        string;
  onBack:          () => void;
  onSuccess:       () => void;
}

function CheckoutForm({
  paymentIntentId, baseAmount, detail, requestData, tenantId, onBack, onSuccess,
}: CheckoutFormProps) {
  const t        = useTranslations("Dashboard.visitPaymentModal");
  const stripe   = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      // Pre-create VisitRequest in pending state so webhook can update it
      // (required for redirect-based methods like bank transfers)
      await createPendingVisitRequestForRedirect(
        paymentIntentId, baseAmount, requestData, detail.id, tenantId, detail.ownerId,
      );

      const returnUrl = `${window.location.origin}/dashboard/tenant/visit-requests`;

      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message ?? t("paymentFailed"));
        return;
      }

      // No redirect = payment succeeded on-page (card, Google Pay, Apple Pay, Link)
      // Webhook will flip status to payment_confirmed; navigate to dashboard
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
          className="rounded-[2px] px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "#E35454" }}
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading || !stripe}
          className="flex items-center gap-2 rounded-[2px] px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "#0245A5" }}
        >
          {loading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {t("confirm")}
        </button>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface VisitPaymentModalProps {
  isOpen:      boolean;
  detail:      TenantPropertyDetail;
  requestData: VisitRequestFormData;
  tenantId:    string;
  onClose:     () => void;
  onBack:      () => void;
  onSuccess:   () => void;
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function VisitPaymentModal({
  isOpen, detail, requestData, tenantId, onClose, onBack, onSuccess,
}: VisitPaymentModalProps) {
  const t = useTranslations("Dashboard.visitPaymentModal");

  const [clientSecret,    setClientSecret]    = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loadingPI,       setLoadingPI]       = useState(false);
  const [piError,         setPiError]         = useState<string | null>(null);
  const [succeeded,       setSucceeded]       = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) { fetchedRef.current = false; setSucceeded(false); return; }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const amount = parseFloat(String(detail.visitRequestPrice).replace(/,/g, "")) || 0;
    if (!amount) { setPiError("Visit fee not set for this property."); return; }

    setLoadingPI(true);
    setPiError(null);
    setClientSecret(null);

    createVisitPaymentIntent(amount, detail.id, detail.title)
      .then((r) => {
        setClientSecret(r.clientSecret);
        setPaymentIntentId(r.paymentIntentId);
      })
      .catch((err) => setPiError(err?.message ?? "Failed to initialise payment."))
      .finally(() => setLoadingPI(false));
  }, [isOpen, detail]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={succeeded ? undefined : onClose}
    >
      <div
        className="relative flex w-full max-w-[720px] flex-col gap-5 overflow-y-auto rounded-[8px] bg-white p-6"
        style={{ boxShadow: "0px 2px 14px rgba(0,0,0,0.11)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="visit-pay-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="visit-pay-title" className="text-[22px] font-semibold leading-[26px] text-[#32343C]">
            {succeeded ? t("successTitle") : t("title")}
          </h2>
          {!succeeded && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
              style={{ background: "rgba(50,52,60,0.44)" }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <line x1="1" y1="1" x2="9" y2="9" stroke="#fff" strokeWidth="2.46" strokeLinecap="round"/>
                <line x1="9" y1="1" x2="1" y2="9" stroke="#fff" strokeWidth="2.46" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── Success screen ─────────────────────────────────────────────────── */}
        {succeeded ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm leading-relaxed text-[#32343C]">{t("successMessage")}</p>
            <button
              type="button"
              onClick={onSuccess}
              className="rounded-[2px] px-10 py-2.5 text-sm font-semibold text-white"
              style={{ background: "#0245A5" }}
            >
              {t("done")}
            </button>
          </div>
        ) : (
          <>
            {/* Property card */}
            <div>
              <p className="mb-2 text-sm font-semibold text-[#32343C]">{t("property")}</p>
              <div className="overflow-hidden rounded-lg border border-[rgba(65,65,65,0.16)]">
                <div className="relative h-[160px] w-full bg-[#F7FAFE] sm:h-[200px]">
                  {detail.photos[0] && (
                    <Image src={detail.photos[0]} alt={detail.title} fill className="object-cover" />
                  )}
                  {detail.type && (
                    <span className="absolute left-2 top-2 rounded-[3px] bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                      {detail.type}
                    </span>
                  )}
                  {detail.photos.length > 0 && (
                    <span className="absolute bottom-2 right-2 rounded-[3px] bg-black/50 px-1.5 py-0.5 text-xs text-white">
                      1/{detail.photos.length}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 p-3">
                  <p className="text-xs text-[#969696]">{[detail.address, detail.province].filter(Boolean).join(", ")}</p>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold leading-tight text-[#32343C]">{formatPrice(detail.minRentPrice)}</p>
                      <p className="text-sm text-[#32343C]">{detail.title}</p>
                    </div>
                    {detail.minRentPrice > 0 && (
                      <p className="shrink-0 text-xs text-[#969696]">{formatPrice(detail.minRentPrice)}<span>/month</span></p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(65,65,65,0.1)] pt-2">
                    {detail.bedrooms > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Image src="/images/icons/dashboard/tenant-properties/bed-white.png" alt="" width={18} height={14} className="shrink-0" />
                        <span className="text-xs font-semibold" style={{ color: "rgba(50,52,60,0.8)" }}>{detail.bedrooms} Beds</span>
                      </div>
                    )}
                    {detail.bathrooms > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Image src="/images/icons/dashboard/tenant-properties/bath-white.png" alt="" width={16} height={14} className="shrink-0" />
                        <span className="text-xs font-semibold" style={{ color: "rgba(50,52,60,0.8)" }}>{detail.bathrooms} Baths</span>
                      </div>
                    )}
                    {detail.unitArea && (
                      <div className="flex items-center gap-1.5">
                        <Image src="/images/icons/dashboard/tenant-properties/area-white.png" alt="" width={14} height={14} className="shrink-0" />
                        <span className="text-xs font-semibold" style={{ color: "rgba(50,52,60,0.8)" }}>{detail.unitArea} {detail.unitAreaUnit}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Loading PI */}
            {loadingPI && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
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
                  paymentIntentId={paymentIntentId}
                  baseAmount={parseFloat(String(detail.visitRequestPrice).replace(/,/g, "")) || 0}
                  detail={detail}
                  requestData={requestData}
                  tenantId={tenantId}
                  onBack={onBack}
                  onSuccess={() => setSucceeded(true)}
                />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  );
}

