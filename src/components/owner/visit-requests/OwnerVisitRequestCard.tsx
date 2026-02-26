"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import { ownerAcceptRequest } from "@/actions/visit-requests";
import type { VisitRequestSummary } from "@/actions/visit-requests";
import AgentPickerModal from "./AgentPickerModal";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  payment_pending:   { bg: "bg-amber-50",   text: "text-amber-700"   },
  payment_confirmed: { bg: "bg-blue-50",    text: "text-blue-700"    },
  owner_review:      { bg: "bg-purple-50",  text: "text-purple-700"  },
  accepted:          { bg: "bg-green-50",   text: "text-green-700"   },
  completed:         { bg: "bg-gray-100",   text: "text-gray-600"    },
  cancelled:         { bg: "bg-red-50",     text: "text-red-600"     },
};

interface Props {
  request:   VisitRequestSummary;
  onRefresh: () => void;
}

type AgentPickerAction = "hire_new_agent" | "hire_existing_agent";

export default function OwnerVisitRequestCard({ request, onRefresh }: Props) {
  const t = useTranslations("Dashboard.ownerVisitRequests");
  const [isPending, startTransition] = useTransition();
  const [agentModal, setAgentModal]  = useState<AgentPickerAction | null>(null);

  const style       = STATUS_STYLES[request.status] ?? STATUS_STYLES.payment_pending;
  const isPendingReview = request.status === "payment_confirmed";

  const statusLabel = (() => {
    const map: Record<string, string> = {
      payment_pending:   t("statusAll"),
      payment_confirmed: t("statusPaymentConfirmed"),
      accepted:          t("statusAccepted"),
      completed:         t("statusCompleted"),
      cancelled:         t("statusCancelled"),
    };
    return map[request.status] ?? request.status;
  })();

  const handleShowSelf = () => {
    startTransition(async () => {
      await ownerAcceptRequest(request.id, "show_self");
      onRefresh();
    });
  };

  const handleAgentSuccess = () => {
    setAgentModal(null);
    onRefresh();
  };

  return (
    <>
      <div
        className="overflow-hidden rounded-[10px] bg-white"
        style={{ boxShadow: "0px 2px 12px rgba(53,130,231,0.1)" }}
      >
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

            {/* Details */}
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {/* Tenant */}
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#5390E0]">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-xs text-[#32343C]">
                  <span className="text-[#969696]">{t("tenant")}: </span>
                  {request.tenantName || "—"}
                </span>
              </div>

              {/* Preferred date */}
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

              {/* Preferred time */}
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

              {/* Fee */}
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

            {/* View property link */}
            <div className="mt-1">
              <Link
                href={`/dashboard/owner/properties/${request.propertyId}`}
                className="rounded-[4px] border border-[#0245A5] px-3 py-1 text-xs font-semibold text-[#0245A5] transition-colors hover:bg-[#E8F2FF]"
              >
                {t("viewProperty")}
              </Link>
            </div>
          </div>
        </div>

        {/* Action buttons — only when payment_confirmed (pending owner review) */}
        {isPendingReview && (
          <div className="border-t border-[rgba(65,65,65,0.08)] px-4 pb-4 pt-3">
            <p className="mb-2.5 text-xs font-semibold text-[#32343C]">How would you like to handle this visit?</p>
            <div className="flex flex-wrap gap-2">
              {/* Show myself */}
              <button
                type="button"
                onClick={handleShowSelf}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-[6px] bg-[#0245A5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#01357A] disabled:opacity-50"
              >
                {isPending && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {t("showSelf")}
              </button>

              {/* Hire platform agent */}
              <button
                type="button"
                onClick={() => setAgentModal("hire_new_agent")}
                disabled={isPending}
                className="rounded-[6px] border border-[#0245A5] px-4 py-2 text-xs font-semibold text-[#0245A5] transition-colors hover:bg-[#E8F2FF] disabled:opacity-50"
              >
                {t("hireNewAgent")}
              </button>

              {/* Hire existing agent */}
              <button
                type="button"
                onClick={() => setAgentModal("hire_existing_agent")}
                disabled={isPending}
                className="rounded-[6px] border border-[rgba(65,65,65,0.2)] px-4 py-2 text-xs font-semibold text-[#32343C] transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {t("hireExistingAgent")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Agent picker modal */}
      {agentModal && (
        <AgentPickerModal
          requestId={request.id}
          action={agentModal}
          onClose={() => setAgentModal(null)}
          onSuccess={handleAgentSuccess}
        />
      )}
    </>
  );
}
