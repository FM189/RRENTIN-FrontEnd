"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import { hasActiveVisitRequest } from "@/actions/visit-requests";

interface VisitConfirmationModalProps {
  isOpen: boolean;
  visitFee: string;
  propertyId: string;
  tenantId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function VisitConfirmationModal({
  isOpen,
  visitFee,
  propertyId,
  tenantId,
  onClose,
  onConfirm,
}: VisitConfirmationModalProps) {
  const t = useTranslations("Dashboard.tenantProperties.drawer.visitModal");
  const tDrawer = useTranslations("Dashboard.tenantProperties.drawer");

  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) setErrorMsg(null);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleProceed = async () => {
    setErrorMsg(null);
    setChecking(true);
    try {
      const blocked = await hasActiveVisitRequest(propertyId, tenantId);
      if (blocked) {
        setErrorMsg(tDrawer("activeVisitRequestExists"));
        return;
      }
      onConfirm();
    } finally {
      setChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative flex w-full max-w-[589px] flex-col gap-5 rounded-[8px] bg-white p-6"
        style={{ boxShadow: "0px 2px 14px rgba(0, 0, 0, 0.11)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-modal-title"
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2.5">
          <h2
            id="visit-modal-title"
            className="text-[22px] font-semibold leading-[26px] text-[#32343C]"
          >
            {t("title")}
          </h2>

          {/* Close (X) button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: "rgba(50, 52, 60, 0.44)" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="9" y2="9" stroke="#FFFFFF" strokeWidth="2.46" strokeLinecap="round" />
              <line x1="9" y1="1" x2="1" y2="9" stroke="#FFFFFF" strokeWidth="2.46" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-sm leading-[16px] text-[#32343C]">
          {t("description")}
        </p>

        {/* Visit fee */}
        <p className="text-[18px] font-bold leading-[21px] text-[#32343C]">
          {t("visitFee")} {formatPrice(visitFee)}{" "}
          <span className="text-sm font-normal">{t("nonRefundable")}</span>
        </p>

        {/* Error message */}
        {errorMsg && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {errorMsg}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-[2px] px-5 py-2 text-sm font-semibold leading-4 tracking-[0.02em] text-white transition-opacity hover:opacity-90"
            style={{ background: "#E35454" }}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleProceed}
            disabled={checking}
            className="flex items-center justify-center rounded-[2px] px-5 py-2 text-sm font-semibold leading-4 tracking-[0.02em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#0245A5" }}
          >
            {checking ? "..." : t("proceed")}
          </button>
        </div>
      </div>
    </div>
  );
}
