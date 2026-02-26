"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import { cancelVisitRequest } from "@/actions/visit-requests";
import type { VisitRequestSummary } from "@/actions/visit-requests";
import QRCodeDisplay from "@/components/ui/QRCodeDisplay";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  payment_pending:   { bg: "bg-amber-50",   text: "text-amber-700"   },
  payment_confirmed: { bg: "bg-blue-50",    text: "text-blue-700"    },
  owner_review:      { bg: "bg-purple-50",  text: "text-purple-700"  },
  accepted:          { bg: "bg-green-50",   text: "text-green-700"   },
  completed:         { bg: "bg-gray-100",   text: "text-gray-600"    },
  cancelled:         { bg: "bg-red-50",     text: "text-red-600"     },
};

const CANCELLABLE = new Set(["payment_pending", "payment_confirmed", "accepted"]);

interface Props {
  request:   VisitRequestSummary;
  onRefresh: () => void;
}

export default function VisitRequestCard({ request, onRefresh }: Props) {
  const t  = useTranslations("Dashboard.tenantVisitRequests");
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const style      = STATUS_STYLES[request.status] ?? STATUS_STYLES.payment_pending;
  const canCancel  = CANCELLABLE.has(request.status);
  const isAccepted = request.status === "accepted";

  const statusLabel = (() => {
    const map: Record<string, string> = {
      payment_pending:   t("statusPaymentPending"),
      payment_confirmed: t("statusPaymentConfirmed"),
      owner_review:      t("statusOwnerReview"),
      accepted:          t("statusAccepted"),
      completed:         t("statusCompleted"),
      cancelled:         t("statusCancelled"),
    };
    return map[request.status] ?? request.status;
  })();

  const handleCancel = () => {
    startTransition(async () => {
      await cancelVisitRequest(request.id);
      setShowConfirm(false);
      onRefresh();
    });
  };

  return (
    <div
      className="overflow-hidden rounded-[10px] bg-white"
      style={{ boxShadow: "0px 2px 12px rgba(53,130,231,0.1)" }}
    >
      {/* Main row */}
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Property image */}
        <div className="relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-[8px] bg-[#F7FAFE] sm:h-[110px] sm:w-[110px]">
          {request.propertyImage ? (
            <Image src={request.propertyImage} alt={request.propertyTitle} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#C0D4EF]">
                <path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          {/* Title + status */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold leading-tight text-[#32343C]">
                {request.propertyTitle || "—"}
              </h3>
              <p className="text-xs text-[#969696]">
                {t("requestedOn")}: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
              {statusLabel}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#5390E0]">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 9H21M8 2V6M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-xs text-[#32343C]">
                <span className="text-[#969696]">{t("preferredDate")}: </span>
                {request.preferredDate || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#5390E0]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-xs text-[#32343C]">
                <span className="text-[#969696]">{t("preferredTime")}: </span>
                {request.preferredTime || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#5390E0]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 6V8M12 16V18M8.5 12H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-xs text-[#32343C]">
                <span className="text-[#969696]">{t("fee")}: </span>
                <span className="font-semibold">{formatPrice(request.total)}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/tenant/properties/${request.propertyId}`}
              className="rounded-[4px] border border-[#0245A5] px-3 py-1 text-xs font-semibold text-[#0245A5] transition-colors hover:bg-[#E8F2FF]"
            >
              {t("viewProperty")}
            </Link>
            {canCancel && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isPending}
                className="rounded-[4px] border border-[#E35454] px-3 py-1 text-xs font-semibold text-[#E35454] transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {isPending ? t("cancelling") : t("cancelRequest")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code — only when accepted */}
      {isAccepted && request.qrToken && (
        <div className="border-t border-[rgba(65,65,65,0.08)] px-4 pb-5 pt-4">
          <p className="mb-3 text-sm font-semibold text-[#32343C]">{t("yourQRCode")}</p>
          <QRCodeDisplay token={request.qrToken} instruction={t("qrInstruction")} />
        </div>
      )}

      {/* Cancel confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
          <div
            className="flex w-full max-w-[400px] flex-col gap-4 rounded-[10px] bg-white p-6"
            style={{ boxShadow: "0px 2px 14px rgba(0,0,0,0.15)" }}
          >
            <h3 className="text-[18px] font-semibold text-[#32343C]">{t("cancelConfirmTitle")}</h3>
            <p className="text-sm leading-relaxed text-[#969696]">{t("cancelConfirmMsg")}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="rounded-[4px] border border-[rgba(65,65,65,0.2)] px-5 py-2 text-sm font-semibold text-[#32343C] hover:bg-gray-50 disabled:opacity-50"
              >
                {t("cancelConfirmNo")}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="flex items-center gap-2 rounded-[4px] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "#E35454" }}
              >
                {isPending && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {t("cancelConfirmYes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
