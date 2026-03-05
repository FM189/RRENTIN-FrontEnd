"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getRentBookingDetail, ownerDecideRentBooking } from "@/actions/rent-booking";
import type { RentBookingDetail } from "@/actions/rent-booking";
import { formatPrice } from "@/lib/format";

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

  const [isPending,    startTransition] = useTransition();
  const [rejectNote,   setRejectNote]   = useState("");
  const [showReject,   setShowReject]   = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);

  useEffect(() => {
    getRentBookingDetail(bookingId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [bookingId]);

  const handleAccept = () => {
    startTransition(async () => {
      await ownerDecideRentBooking(bookingId, "accepted");
      onRefresh();
    });
  };

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
                  <Field label={t("fieldCurrentCity")} value={detail.tenantInfo.currentCity} />
                  <Field label={t("fieldOccupation")}  value={detail.tenantInfo.occupation} />
                  <Field label={t("fieldDesignation")} value={detail.tenantInfo.designation} />
                </Section>

                {/* Stay details */}
                <Section title={t("sectionStay")}>
                  <Field label={t("fieldMoveIn")}     value={formatDate(detail.moveInDate)} />
                  <Field label={t("fieldMoveOut")}    value={formatDate(detail.moveOutDate)} />
                  <Field label={t("fieldArrival")}    value={detail.arrivalTime} />
                  <Field label={t("fieldStayDays")}   value={`${detail.stayDays} ${t("days")}`} />
                  <Field label={t("fieldContract")}   value={`${detail.contractMonths} ${detail.contractMonths === 1 ? t("month") : t("months")}`} />
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

                {/* Price summary */}
                <Section title={t("sectionPrice")}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#545454]">{t("fieldRental")}</span>
                      <span className="font-medium text-[#32343C]">{formatPrice(detail.rentalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#545454]">{t("fieldDeposit")}</span>
                      <span className="font-medium text-[#32343C]">{formatPrice(detail.securityDeposit)}</span>
                    </div>
                    <div className="border-t border-[rgba(65,65,65,0.1)] pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#32343C]">{t("fieldTotal")}</span>
                        <span className="text-base font-bold text-[#0245A5]">{formatPrice(detail.totalUpfront)}</span>
                      </div>
                    </div>
                  </div>
                </Section>
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
                      onClick={handleAccept}
                      disabled={isPending}
                      className="flex items-center gap-1.5 rounded-[4px] bg-[#0245A5] px-6 py-2 text-sm font-semibold text-white hover:bg-[#01357A] disabled:opacity-50"
                    >
                      {isPending && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
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
