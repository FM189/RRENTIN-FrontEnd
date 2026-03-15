"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getRentBookingDetail, ownerDecideRentBooking } from "@/actions/rent-booking";
import type { RentBookingDetail } from "@/actions/rent-booking";
import { formatPrice } from "@/lib/format";
import RentPaymentHistorySection from "@/components/shared/RentPaymentHistorySection";
import OwnerAgreementModal from "./OwnerAgreementModal";

interface Props {
  bookingId: string;
  onClose:   () => void;
  onRefresh: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  pending:         "text-amber-600 bg-amber-50",
  accepted:        "text-green-700 bg-green-50",
  rejected:        "text-red-600 bg-red-50",
  payment_pending: "text-amber-600 bg-amber-50",
  active:          "text-blue-700 bg-blue-50",
  completed:       "text-green-700 bg-green-50",
  cancelled:       "text-red-600 bg-red-50",
};

export default function OwnerRentBookingDetailModal({ bookingId, onClose, onRefresh }: Props) {
  const t = useTranslations("Dashboard.ownerRentBookings");

  const [detail,   setDetail]   = useState<RentBookingDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  const [activeTab,     setActiveTab]     = useState<"price" | "history">("price");
  const [isPending,     startTransition]  = useTransition();
  const [rejectNote,    setRejectNote]    = useState("");
  const [showReject,    setShowReject]    = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  useEffect(() => {
    getRentBookingDetail(bookingId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [bookingId]);

  const handleReject = () => {
    startTransition(async () => {
      await ownerDecideRentBooking(bookingId, "rejected", rejectNote);
      onRefresh();
    });
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const isPending_ = detail?.status === "pending";
  const statusColor = STATUS_COLOR[detail?.status ?? ""] ?? "text-[#969696] bg-gray-50";

  return (
    <>
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex w-full max-w-[780px] flex-col gap-5 overflow-y-auto rounded-[8px] bg-white p-6"
        style={{ boxShadow: "0px 2px 14px rgba(0,0,0,0.11)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-semibold text-[#32343C]">{t("modalTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(50,52,60,0.44)] hover:bg-[rgba(50,52,60,0.6)]"
          >
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
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
                {t(`status_${detail.status}`)}
              </span>
              <span className="text-sm text-[#969696]">{t("submittedOn")} {formatDate(detail.createdAt)}</span>
            </div>

            {/* Property card */}
            <div>
              <p className="mb-2 text-sm font-semibold text-[#32343C]">{t("property")}</p>
              <div className="overflow-hidden rounded-[6px] border border-[rgba(102,102,102,0.15)]">
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden bg-[#D9E8FF]">
                  {detail.propertyImages.length > 0 ? (
                    <Image
                      src={detail.propertyImages[imgIndex]}
                      alt={detail.propertyTitle}
                      fill
                      className="object-cover brightness-90"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#A3C4E8]">
                        <path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                  )}
                  {detail.propertyType && (
                    <span className="absolute left-2 top-2 rounded-[2px] bg-white px-2 py-0.5 text-[11px] font-bold text-[#0245A5]">
                      {detail.propertyType}
                    </span>
                  )}
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
                <div className="flex items-center justify-between bg-white px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-[#32343C]">{detail.propertyTitle}</p>
                    {detail.propertyAddress && (
                      <p className="text-xs text-[#969696]">{detail.propertyAddress}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#545454]">
                    {detail.bedrooms > 0 && <span>{detail.bedrooms} {t("beds")}</span>}
                    {detail.bathrooms > 0 && <span>{detail.bathrooms} {t("baths")}</span>}
                    {detail.unitArea && <span>{detail.unitArea} {detail.unitAreaUnit}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Left: Tenant info + Stay details */}
              <div className="flex flex-col gap-4">
                {/* Tenant info */}
                <Section title={t("sectionTenant")}>
                  <Field label={t("fieldFullName")}    value={detail.tenantInfo.fullName} />
                  <Field label={t("fieldNationality")} value={detail.tenantInfo.nationality} />
                  <Field label={t("fieldCurrentCountry")} value={detail.tenantInfo.currentCountry} />
                  <Field label={t("fieldOccupation")}  value={detail.tenantInfo.occupation} />
                  <Field label={t("fieldDesignation")} value={detail.tenantInfo.designation} />
                </Section>

                {/* Stay details */}
                <Section title={t("sectionStay")}>
                  <Field label={t("fieldMoveIn")}     value={formatDate(detail.moveInDate)} />
                  <Field label={t("fieldMoveOut")}    value={formatDate(detail.moveOutDate)} />
                  <Field label={t("fieldArrival")}    value={detail.arrivalTime} />
                  <Field label={t("fieldStayDays")}   value={`${detail.stayDays} ${t("days")}`} />
                  <Field label={t("fieldContract")}   value={`${detail.stayDays} ${t("days")}`} />
                </Section>
              </div>

              {/* Right: Preferences + Price summary */}
              <div className="flex flex-col gap-4">
                {/* Preferences */}
                <Section title={t("sectionPreferences")}>
                  <Field label={t("fieldGuests")}      value={detail.guestsStaying} />
                  <Field label={t("fieldReason")}      value={detail.primaryReason} />
                  <Field label={t("fieldVisa")}        value={detail.visaType} />
                  {detail.specialRequests && (
                    <Field label={t("fieldSpecial")}   value={detail.specialRequests} />
                  )}
                </Section>

                {/* Tabs: Price Summary | Payment History */}
                <div>
                  <div className="flex border-b border-[rgba(65,65,65,0.12)]">
                    <button
                      type="button"
                      onClick={() => setActiveTab("price")}
                      className={`px-4 py-2 text-sm font-semibold transition-colors ${
                        activeTab === "price"
                          ? "border-b-2 border-[#0245A5] text-[#0245A5]"
                          : "text-[#969696] hover:text-[#32343C]"
                      }`}
                    >
                      {t("tabPrice")}
                    </button>
                    {(detail.status === "active" || detail.status === "completed") && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("history")}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${
                          activeTab === "history"
                            ? "border-b-2 border-[#0245A5] text-[#0245A5]"
                            : "text-[#969696] hover:text-[#32343C]"
                        }`}
                      >
                        {t("tabHistory")}
                      </button>
                    )}
                  </div>
                  <div className="pt-4">
                    {activeTab === "price" && (() => {
                      const fullMonths           = Math.floor(detail.stayDays / 30);
                      const remainder            = detail.remainderDays ?? 0;
                      const billingCycles        = fullMonths + (remainder > 0 ? 1 : 0);
                      const fullCost             = fullMonths * detail.rentalAmount;
                      const partialCost          = Math.round(remainder * (detail.dailyRate ?? 0));
                      const baseTotal            = fullCost + partialCost;
                      const monthlyFees          = detail.monthlyFees ?? 0;
                      const customFees           = detail.customFeesSnapshot ?? [];
                      const totalMonthlyFees     = monthlyFees * billingCycles;
                      const grossTotal           = baseTotal + totalMonthlyFees;
                      const ownerContractFee     = detail.fees?.ownerContractFee     ?? 0;
                      const ownerContractFeeVat  = detail.fees?.ownerContractFeeVat  ?? 0;
                      const ownerContractFeeRate = detail.fees?.ownerContractFeeRate  ?? 0;
                      const platformFeeRate      = detail.fees?.platformFeeRate       ?? 0.09;
                      const vatRate              = detail.fees?.vatRate               ?? 0.07;
                      const stripeFeePercent     = detail.fees?.stripeFeePercent      ?? 0.034;
                      const stripeFeeFixed       = detail.fees?.stripeFeeFixed        ?? 10;
                      const tenantTotalCharged   = detail.fees?.tenantTotalCharged ?? (detail.rentalAmount + monthlyFees);
                      const perMonthPlatform     = Math.round(platformFeeRate * detail.rentalAmount);
                      const perMonthVat          = Math.round(vatRate * perMonthPlatform);
                      const lastMonthPlatform    = remainder > 0 ? Math.round(platformFeeRate * partialCost) : 0;
                      const lastMonthVat         = remainder > 0 ? Math.round(vatRate * lastMonthPlatform) : 0;
                      const totalPlatformFee     = fullMonths * perMonthPlatform + lastMonthPlatform;
                      const totalVatOnPlatform   = fullMonths * perMonthVat + lastMonthVat;
                      const firstMonthStripe     = Math.round(stripeFeePercent * tenantTotalCharged + stripeFeeFixed);
                      const normalMonthStripe    = Math.round(stripeFeePercent * (detail.rentalAmount + monthlyFees) + stripeFeeFixed);
                      const lastMonthStripe      = remainder > 0 ? Math.round(stripeFeePercent * (partialCost + monthlyFees) + stripeFeeFixed) : 0;
                      const otherFullMonths      = Math.max(0, fullMonths - 1);
                      const totalStripeFee       = firstMonthStripe + otherFullMonths * normalMonthStripe + lastMonthStripe;
                      const totalDeductions      = ownerContractFee + ownerContractFeeVat + totalPlatformFee + totalVatOnPlatform + totalStripeFee;
                      const ownerNet             = grossTotal - totalDeductions;
                      return (
                        <div className="flex flex-col gap-3">

                          {/* ── Monthly rates ── */}
                          <div className="rounded-[6px] bg-[#F7FAFE] px-3 py-2.5 flex flex-col gap-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0245A5]">{t("sectionRates")}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#545454]">{t("fieldRental")}</span>
                              <span className="font-semibold text-[#32343C]">{formatPrice(detail.rentalAmount)} / {t("month")}</span>
                            </div>
                            {customFees.map((fee, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-[#545454]">{fee.name}</span>
                                <span className="font-semibold text-[#32343C]">{formatPrice(fee.amount)} / {t("month")}</span>
                              </div>
                            ))}
                            {(detail.dailyRate ?? 0) > 0 && remainder > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#545454]">{t("fieldDailyRate")}</span>
                                <span className="font-semibold text-[#32343C]">{formatPrice(detail.dailyRate ?? 0)} {t("perDay")}</span>
                              </div>
                            )}
                          </div>

                          {/* ── Gross income breakdown ── */}
                          <div className="rounded-[6px] border border-[rgba(65,65,65,0.1)] px-3 py-2.5 flex flex-col gap-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#545454]">{t("sectionGross")}</p>
                            {fullMonths > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#969696]">{fullMonths} {fullMonths === 1 ? t("month") : t("months")} × {formatPrice(detail.rentalAmount)}</span>
                                <span className="text-[#32343C]">{formatPrice(fullCost)}</span>
                              </div>
                            )}
                            {remainder > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#969696]">{remainder} {t("days")} × {formatPrice(detail.dailyRate ?? 0)}</span>
                                <span className="text-[#32343C]">{formatPrice(partialCost)}</span>
                              </div>
                            )}
                            {totalMonthlyFees > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#969696]">{t("fieldMonthlyFees")} ({billingCycles}×)</span>
                                <span className="text-[#32343C]">{formatPrice(totalMonthlyFees)}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between border-t border-[rgba(65,65,65,0.1)] pt-1.5 text-xs">
                              <span className="font-semibold text-[#32343C]">{t("fieldGrossTotal")}</span>
                              <span className="font-semibold text-[#32343C]">{formatPrice(grossTotal)}</span>
                            </div>
                          </div>

                          {/* ── Platform deductions ── */}
                          <div className="rounded-[6px] border border-[rgba(227,84,84,0.15)] bg-[#FFF8F8] px-3 py-2.5 flex flex-col gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#E35454]">{t("sectionDeductions")}</p>

                            {/* One-time */}
                            {ownerContractFee > 0 && (
                              <div className="flex flex-col gap-1">
                                <p className="text-[10px] text-[#969696] font-medium">{t("deductionOneTime")}</p>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#969696]">{t("fieldOwnerContractFee", { rate: (ownerContractFeeRate * 100).toFixed(0) })}</span>
                                  <span className="font-medium text-[#E35454]">−{formatPrice(ownerContractFee)}</span>
                                </div>
                                {ownerContractFeeVat > 0 && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#969696]">{t("fieldVatOnContractFee", { rate: (vatRate * 100).toFixed(0) })}</span>
                                    <span className="font-medium text-[#E35454]">−{formatPrice(ownerContractFeeVat)}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Recurring */}
                            <div className="flex flex-col gap-1">
                              <p className="text-[10px] text-[#969696] font-medium">{t("deductionRecurring", { count: billingCycles })}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#969696]">{t("fieldPlatformFee", { rate: (platformFeeRate * 100).toFixed(0) })}</span>
                                <span className="font-medium text-[#E35454]">−{formatPrice(totalPlatformFee)}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#969696]">{t("fieldVatOnPlatformFee", { rate: (vatRate * 100).toFixed(0) })}</span>
                                <span className="font-medium text-[#E35454]">−{formatPrice(totalVatOnPlatform)}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#969696]">{t("fieldProcessingFee")}</span>
                                <span className="font-medium text-[#E35454]">−{formatPrice(totalStripeFee)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-[rgba(227,84,84,0.15)] pt-1.5 text-xs">
                              <span className="font-semibold text-[#E35454]">{t("fieldTotalDeductions")}</span>
                              <span className="font-semibold text-[#E35454]">−{formatPrice(totalDeductions)}</span>
                            </div>
                          </div>

                          {/* ── Net income ── */}
                          <div className="rounded-[6px] bg-[#0245A5] px-3 py-3 flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{t("fieldOwnerNet")}</span>
                            <span className="text-base font-bold text-white">{formatPrice(ownerNet)}</span>
                          </div>
                        </div>
                      );
                    })()}
                    {activeTab === "history" && (
                      <RentPaymentHistorySection bookingId={bookingId} role="owner" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Owner note (if rejected) */}
            {detail.status === "rejected" && detail.ownerNote && (
              <div className="rounded-[6px] border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-xs font-semibold text-red-600">{t("yourNote")}</p>
                <p className="mt-1 text-sm text-red-700">{detail.ownerNote}</p>
              </div>
            )}

            {/* Actions — only for pending */}
            {isPending_ && (
              <div className="border-t border-[rgba(65,65,65,0.1)] pt-4">
                {showReject ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-[#32343C]">{t("rejectNoteLabel")}</p>
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder={t("rejectNotePlaceholder")}
                      rows={3}
                      className="w-full rounded-[6px] border border-[rgba(102,102,102,0.35)] px-3 py-2 text-sm text-[#32343C] focus:border-[#0245A5] focus:outline-none"
                    />
                    {rejectConfirm ? (
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm text-[#969696]">{t("rejectConfirmQuestion")}</span>
                        <button
                          type="button"
                          onClick={() => setRejectConfirm(false)}
                          className="rounded-[4px] border border-[rgba(65,65,65,0.2)] px-5 py-2 text-sm font-semibold text-[#32343C] hover:bg-gray-50"
                        >
                          {t("cancel")}
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isPending}
                          className="flex items-center gap-1.5 rounded-[4px] bg-[#E35454] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C93D3D] disabled:opacity-50"
                        >
                          {isPending && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                          {t("confirmReject")}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowReject(false)}
                          className="rounded-[4px] border border-[rgba(65,65,65,0.2)] px-5 py-2 text-sm font-semibold text-[#32343C] hover:bg-gray-50"
                        >
                          {t("back")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectConfirm(true)}
                          className="rounded-[4px] bg-[#E35454] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C93D3D]"
                        >
                          {t("reject")}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReject(true)}
                      className="rounded-[4px] bg-[#E35454] px-6 py-2 text-sm font-semibold text-white hover:bg-[#C93D3D]"
                    >
                      {t("reject")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAgreement(true)}
                      className="rounded-[4px] bg-[#0245A5] px-6 py-2 text-sm font-semibold text-white hover:bg-[#01357A]"
                    >
                      {t("accept")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {showAgreement && detail && (
      <OwnerAgreementModal
        detail={detail}
        onSigned={() => {
          setShowAgreement(false);
          onRefresh();
          onClose();
        }}
        onClose={() => setShowAgreement(false)}
      />
    )}
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[6px] border border-[rgba(102,102,102,0.12)] p-4">
      <p className="mb-3 text-sm font-bold text-[#32343C]">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-[#969696]">{label}</span>
      <span className="text-right text-xs font-medium text-[#32343C]">{value || "—"}</span>
    </div>
  );
}
