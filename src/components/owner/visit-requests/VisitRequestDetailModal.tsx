"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import {
  getOwnerVisitRequestDetail,
  ownerAcceptRequest,
  ownerRejectRequest,
} from "@/actions/visit-requests";
import type { VisitRequestDetail } from "@/actions/visit-requests";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/types/notifications";
import AgentPickerModal from "./AgentPickerModal";
import AgentShowingModal from "./AgentShowingModal";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "review" | "who-shows" | "accepted";
type WhoShows = "show_self" | "hire_existing_agent" | "hire_new_agent";
type AgentPickerAction = "hire_new_agent" | "hire_existing_agent";

interface Props {
  requestId: string;
  onClose:   () => void;
  onRefresh: () => void;
}



// ── Component ─────────────────────────────────────────────────────────────────

export default function VisitRequestDetailModal({ requestId, onClose, onRefresh }: Props) {
  const t = useTranslations("Dashboard.ownerVisitRequests");

  const [step, setStep]              = useState<Step>("review");
  const [detail, setDetail]          = useState<VisitRequestDetail | null>(null);
  const [loading, setLoading]        = useState(true);
  const [imgIndex, setImgIndex]      = useState(0);
  const [agentModal, setAgentModal]  = useState<AgentPickerAction | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rejectConfirm, setRejectConfirm] = useState(false);

  // Who-shows step state
  const [whoShows, setWhoShows] = useState<WhoShows>("show_self");

  useEffect(() => {
    getOwnerVisitRequestDetail(requestId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [requestId]);

  // ── Reject ────────────────────────────────────────────────────────────────
  const confirmReject = () => {
    startTransition(async () => {
      await ownerRejectRequest(requestId);
      if (detail?.tenantId) {
        await createNotification({
          userId:  detail.tenantId,
          type:    NotificationType.PROPOSAL_REJECTED,
          title:   "Visit Request Rejected",
          message: `Your visit request for ${detail.propertyTitle} has been rejected.`,
          href:    "/dashboard/tenant/proposals",
        });
      }
      onRefresh();
      onClose();
    });
  };

  const [showAgentGrid, setShowAgentGrid] = useState(false);

  // ── Close — refresh list when dismissing from accepted step ─────────────
  const handleClose = () => {
    if (step === "accepted") onRefresh();
    onClose();
  };

  // ── Confirm who-shows selection ───────────────────────────────────────────
  const handleConfirmSelection = () => {
    if (whoShows === "show_self") {
      startTransition(async () => {
        await ownerAcceptRequest(requestId, "show_self");
        if (detail?.tenantId) {
          await createNotification({
            userId:  detail.tenantId,
            type:    NotificationType.PROPOSAL_ACCEPTED,
            title:   "Visit Request Accepted",
            message: `Your visit request for ${detail.propertyTitle} has been accepted.`,
            href:    "/dashboard/tenant/proposals",
          });
        }
        setStep("accepted");
      });
    } else if (whoShows === "hire_new_agent") {
      setShowAgentGrid(true);
    } else {
      // Existing agent — use old picker
      setAgentModal(whoShows);
    }
  };

  // ── Agent accept ──────────────────────────────────────────────────────────
  const handleAgentSuccess = () => {
    setAgentModal(null);
    onRefresh();
    onClose();
  };

  const isPendingReview   = detail?.status === "payment_confirmed";
  const isAlreadyAccepted = detail?.status === "accepted";
  const isCompleted       = detail?.status === "completed";

  // ── Property card (shared between steps) ──────────────────────────────────
  const PropertyCard = detail ? (
    <div className="flex flex-col gap-2">
      <p className="text-base font-medium text-[#32343C]">{t("property")}</p>
      <div className="overflow-hidden rounded-[4px]" style={{ boxShadow: "0px 1.6px 19.2px rgba(0,0,0,0.1)" }}>
        {/* Image */}
        <div className="relative h-44 w-full overflow-hidden bg-[#A3A3A3]">
          {detail.propertyImages.length > 0 ? (
            <Image src={detail.propertyImages[imgIndex]} alt={detail.propertyTitle} fill className="object-cover brightness-90" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#D9E8FF]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#C0D4EF]">
                <path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-[2px] bg-white px-2 py-0.5 text-[11px] font-bold text-[#0245A5]">
            {detail.propertyType}
          </span>
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E9F2FF]">
            <svg width="9" height="11" viewBox="0 0 9 11" fill="none"><path d="M1 1H8V10L4.5 7.5L1 10V1Z" fill="#0345A5"/></svg>
          </div>
          {detail.propertyImages.length > 1 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <button type="button" onClick={() => setImgIndex((i) => Math.max(0, i - 1))} disabled={imgIndex === 0} className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 disabled:opacity-30">
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M5 1L2 3.5L5 6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </button>
              <span className="rounded-full bg-[rgba(50,52,60,0.5)] px-2 py-0.5 text-[11px] font-semibold text-white">
                {imgIndex + 1}/{detail.propertyImages.length}
              </span>
              <button type="button" onClick={() => setImgIndex((i) => Math.min(detail.propertyImages.length - 1, i + 1))} disabled={imgIndex === detail.propertyImages.length - 1} className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 disabled:opacity-30">
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M2 1L5 3.5L2 6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2.5 bg-white px-4 py-3" style={{ boxShadow: "0px 1px 6.5px rgba(53,130,231,0.1)" }}>
          <p className="text-xs tracking-[0.05em] text-[#969696]">{detail.propertyAddress || "—"}</p>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold tracking-[0.05em] text-[#32343C]">
                {detail.rentPrice ? formatPrice(detail?.rentPrice) : "—"}
              </p>
              <p className="text-[13px] text-[#545454]">{detail.propertyTitle}</p>
            </div>
            <p className="text-sm font-semibold tracking-[0.05em] text-[#32343C]">
              {detail.rentPrice ? formatPrice(detail?.rentPrice) : ""}
              <span className="text-xs font-normal text-[#969696]">{t("perMonth")}</span>
            </p>
          </div>
          <div className="border-t border-[#D8D8D8]" />
          <div className="flex flex-wrap items-center gap-3">
            {detail.bedrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Image src="/images/icons/dashboard/tenant-properties/bed-white.png" alt="" width={18} height={14} className="shrink-0" />
                <span className="text-xs font-semibold leading-4 tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                  {detail.bedrooms} {t("beds")}
                </span>
              </div>
            )}
            {detail.bathrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Image src="/images/icons/dashboard/tenant-properties/bath-white.png" alt="" width={16} height={14} className="shrink-0" />
                <span className="text-xs font-semibold leading-4 tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                  {detail.bathrooms} {t("baths")}
                </span>
              </div>
            )}
            {detail.unitArea && (
              <div className="flex items-center gap-1.5">
                <Image src="/images/icons/dashboard/tenant-properties/area-white.png" alt="" width={14} height={14} className="shrink-0" />
                <span className="text-xs font-semibold leading-4 tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                  {detail.unitArea} {detail.unitAreaUnit}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <div
          className="relative flex w-full max-w-[771px] flex-col gap-5 overflow-y-auto rounded-[8px] bg-white p-6"
          style={{ boxShadow: "0px 2px 14px rgba(0,0,0,0.11)", maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold leading-[26px] text-[#32343C]">
              {isCompleted
                ? t("ownerCompletedTitle")
                : step === "who-shows"
                ? t("whoWillShow")
                : step === "accepted"
                ? t("acceptedTitle")
                : t("modalTitle")}
            </h2>
            <button type="button" onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(50,52,60,0.44)] hover:bg-[rgba(50,52,60,0.6)]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {loading && (
            <div className="flex h-64 items-center justify-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#0245A5] border-t-transparent" />
            </div>
          )}

          {detail && (
            <>
              {/* ══ COMPLETED STATE ══ */}
              {isCompleted && (() => {
                const { visitFee, feeBreakdown } = detail;
                const ownerPayout = visitFee - feeBreakdown.platformFee - feeBreakdown.vat - feeBreakdown.stripeFee;
                const pct = (amt: number) =>
                  visitFee > 0 ? `${((amt / visitFee) * 100).toFixed(1)}%` : "0%";
                return (
                  <div className="flex flex-col gap-5">
                    {/* Success banner */}
                    <div className="flex flex-col items-center gap-3 py-2 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[#32343C]">{t("ownerCompletedTitle")}</p>
                        <p className="mt-1 text-sm text-[#969696]">{t("ownerCompletedDesc")}</p>
                      </div>
                    </div>

                    {/* Property + date/time summary */}
                    <div className="rounded-[8px] border border-[rgba(65,65,65,0.1)] bg-[#F7FAFE] p-4">
                      <p className="text-sm font-semibold text-[#32343C]">{detail.propertyTitle}</p>
                      {detail.propertyAddress && (
                        <p className="mt-0.5 text-xs text-[#969696]">{detail.propertyAddress}</p>
                      )}
                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[rgba(65,65,65,0.08)] pt-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#969696]">{t("fieldVisitDate")}</p>
                          <p className="text-sm font-medium text-[#32343C]">{detail.preferredDate || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#969696]">{t("fieldVisitTime")}</p>
                          <p className="text-sm font-medium text-[#32343C]">{detail.preferredTime || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#969696]">{t("fieldFullName")}</p>
                          <p className="text-sm font-medium text-[#32343C]">{detail.tenantName || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Fee breakdown */}
                    <div className="flex flex-col gap-3 rounded-[8px] border border-[rgba(65,65,65,0.1)] bg-white p-4">
                      <p className="text-sm font-bold text-[#32343C]">{t("feeBreakdownTitle")}</p>

                      <div className="flex flex-col gap-2">
                        {/* Visit fee */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#545454]">{t("visitFeeLabel")}</span>
                          <span className="font-semibold text-[#32343C]">{formatPrice(visitFee)}</span>
                        </div>

                        <div className="border-t border-[rgba(65,65,65,0.08)]" />

                        {/* Deductions */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-[#969696]">
                            {t("platformFeeLabel")}
                            <span className="rounded-full bg-[#F0F4FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#0245A5]">{pct(feeBreakdown.platformFee)}</span>
                          </span>
                          <span className="text-[#E35454]">-{formatPrice(feeBreakdown.platformFee)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-[#969696]">
                            {t("vatLabel")}
                            <span className="rounded-full bg-[#F0F4FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#0245A5]">{pct(feeBreakdown.vat)}</span>
                          </span>
                          <span className="text-[#E35454]">-{formatPrice(feeBreakdown.vat)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-[#969696]">
                            {t("stripeFeeLabel")}
                            <span className="rounded-full bg-[#F0F4FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#0245A5]">{pct(feeBreakdown.stripeFee)}</span>
                          </span>
                          <span className="text-[#E35454]">-{formatPrice(feeBreakdown.stripeFee)}</span>
                        </div>

                        <div className="border-t border-[rgba(65,65,65,0.12)]" />

                        {/* Owner receives */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#32343C]">{t("ownerReceivesLabel")}</span>
                          <span className="text-base font-bold text-[#0245A5]">{formatPrice(Math.max(0, ownerPayout))}</span>
                        </div>
                      </div>

                      {/* Pending release note */}
                      <p className="rounded-[4px] bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-700">
                        {t("pendingReleaseNote")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-[2px] bg-[#0245A5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#01357A]"
                      >
                        {t("downloadSlip")}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {!isCompleted && PropertyCard}

              {/* ══ STEP 1: Review ══ */}
              {!isCompleted && step === "review" && (
                <>
                  <div className="flex flex-col">
                    <FieldRow cols={[{ label: t("fieldFullName"), value: detail.tenantName }]} />
                    <FieldRow cols={[
                      { label: t("fieldVisitDate"), value: detail.preferredDate },
                      { label: t("fieldVisitTime"), value: detail.preferredTime },
                    ]} />
                    <FieldRow cols={[
                      { label: t("fieldNationality"), value: detail.nationality },
                      { label: t("fieldOccupants"),   value: detail.numberOfOccupants },
                    ]} />
                    <FieldRow last cols={[
                      { label: t("fieldPurpose"), value: detail.purposeOfRental },
                      {
                        label: t("fieldMoveInOut"),
                        value: detail.moveInDate && detail.moveOutDate ? `${detail.moveInDate} – ${detail.moveOutDate}` : "—",
                        withCalendarIcon: true,
                      },
                    ]} />
                  </div>

                  {isAlreadyAccepted && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setStep("accepted")}
                        className="flex items-center gap-2 rounded-[2px] bg-[#0245A5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#01357A]"
                      >
                        {t("viewAcceptanceDetails")}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}

                  {isPendingReview && (
                    <div className="flex justify-end gap-3 pt-1">
                      {rejectConfirm ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-[#969696]">{t("rejectConfirmQuestion")}</span>
                          <button type="button" onClick={() => setRejectConfirm(false)} className="rounded-[2px] border border-[rgba(65,65,65,0.2)] px-5 py-2 text-sm font-semibold text-[#32343C] hover:bg-gray-50">
                            {t("cancel")}
                          </button>
                          <button type="button" onClick={confirmReject} disabled={isPending} className="flex items-center gap-1.5 rounded-[2px] bg-[#E35454] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C93D3D] disabled:opacity-50">
                            {isPending && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                            {t("confirmReject")}
                          </button>
                        </div>
                      ) : (
                        <>
                          <button type="button" onClick={() => setRejectConfirm(true)} className="rounded-[2px] bg-[#E35454] px-5 py-2 text-sm font-semibold tracking-[0.02em] text-white hover:bg-[#C93D3D]">
                            {t("reject")}
                          </button>
                          <button type="button" onClick={() => setStep("who-shows")} className="rounded-[2px] bg-[#0245A5] px-5 py-2 text-sm font-semibold tracking-[0.02em] text-white hover:bg-[#01357A]">
                            {t("accept")}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ══ STEP 2: Who will show ══ */}
              {!isCompleted && step === "who-shows" && (
                <>
                  {/* Sub-title */}
                  <p className="text-sm text-[#969696]">{t("whoWillShowDesc")}</p>

                  {/* Radio options */}
                  <div className="flex flex-col gap-2">
                    <p className="text-base font-semibold text-[#32343C]">{t("selectOneWhoShows")}</p>

                    {(
                      [
                        { value: "show_self",            label: t("showByMyself"),  desc: t("showBySelfDesc")   },
                        // { value: "hire_existing_agent",  label: t("existingAgent"), desc: t("existingAgentDesc") },
                        // { value: "hire_new_agent",       label: t("newAgent"),      desc: t("newAgentDesc")      },
                      ] as { value: WhoShows; label: string; desc: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWhoShows(opt.value)}
                        className="flex items-center gap-3 rounded-[6px] px-2 py-3 text-left transition-colors hover:bg-[#F7FAFE]"
                      >
                        {/* Radio circle */}
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          whoShows === opt.value ? "border-[#0245A5]" : "border-[#C0C0C0]"
                        }`}>
                          {whoShows === opt.value && (
                            <div className="h-2.5 w-2.5 rounded-full bg-[#0245A5]" />
                          )}
                        </div>
                        <span className="text-base font-medium text-[#32343C]">
                          {opt.label}
                          <span className="font-normal text-[#969696]"> → {opt.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep("review")}
                      className="rounded-[2px] border border-[rgba(65,65,65,0.2)] px-5 py-2 text-sm font-semibold text-[#32343C] hover:bg-gray-50"
                    >
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSelection}
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-[2px] bg-[#0245A5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#01357A] disabled:opacity-50"
                    >
                      {isPending && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                      {t("confirmSelection")}
                    </button>
                  </div>
                </>
              )}

              {/* ══ STEP 3: Accepted ══ */}
              {!isCompleted && step === "accepted" && (
                <>
                  {/* Sub-title */}
                  <p className="text-sm text-[#545454]">{t("acceptedDesc")}</p>

                  {/* Tenant section */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <p className="text-base font-semibold text-[#32343C]">{t("tenantLabel")}</p>

                    {/* Avatar */}
                    <div className="relative h-[120px] w-[120px] overflow-hidden rounded-[6px] bg-[#D9E8FF]">
                      {detail.tenantProfileImage ? (
                        <Image
                          src={detail.tenantProfileImage}
                          alt={detail.tenantName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#A8C8F0] to-[#5390E0]">
                          <span className="text-3xl font-bold text-white">
                            {detail.tenantName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <p className="text-2xl font-bold text-[#32343C]">{detail.tenantName}</p>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4 border-t border-[rgba(55,65,81,0.1)] pt-4">
                    <div>
                      <p className="text-sm font-medium text-[#32343C]">{t("fieldVisitDate")}</p>
                      <p className="mt-1 text-sm text-[#969696]">{detail.preferredDate || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#32343C]">{t("fieldVisitTime")}</p>
                      <p className="mt-1 text-sm text-[#969696]">{detail.preferredTime || "—"}</p>
                    </div>
                  </div>

                  {/* Important Guidelines */}
                  <div className="rounded-[6px] bg-[#F7FAFE] p-4">
                    <p className="mb-2 text-sm font-bold text-[#32343C]">{t("guidelinesTitle")}</p>
                    <ul className="flex flex-col gap-1.5">
                      {(["guidelineItem1", "guidelineItem2", "guidelineItem3", "guidelineItem4"] as const).map((key) => (
                        <li key={key} className="flex items-start gap-2 text-sm text-[#545454]">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#545454]" />
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Download Slip */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      className="rounded-[2px] bg-[#0245A5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#01357A]"
                    >
                      {t("downloadSlip")}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {agentModal && (
        <AgentPickerModal
          requestId={requestId}
          action={agentModal}
          onClose={() => setAgentModal(null)}
          onSuccess={handleAgentSuccess}
        />
      )}

      {showAgentGrid && (
        <AgentShowingModal onClose={() => setShowAgentGrid(false)} />
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface FieldCol {
  label: string;
  value: string;
  withCalendarIcon?: boolean;
}

function FieldRow({ cols, last }: { cols: FieldCol[]; last?: boolean }) {
  const isTwoCol = cols.length === 2;
  return (
    <div className="flex flex-col pt-4">
      <div className={`grid ${isTwoCol ? "grid-cols-2" : "grid-cols-1"} gap-x-4`}>
        {cols.map((col) => (
          <p key={col.label} className="text-base font-medium text-[#32343C]">{col.label}</p>
        ))}
      </div>
      <div className={`mt-2 grid ${isTwoCol ? "grid-cols-2" : "grid-cols-1"} gap-x-4 pb-3 ${!last ? "border-b border-[rgba(55,65,81,0.1)]" : ""}`}>
        {cols.map((col) => (
          <div key={col.label} className="flex items-center gap-2">
            {col.withCalendarIcon && (
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" className="shrink-0 text-[rgba(65,65,65,0.8)]">
                <rect x="1" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1 8H21M7 1V5M15 1V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
            <p className="text-base font-medium text-[rgba(55,65,81,0.6)]">{col.value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
