"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getRentBookingDetail, cancelRentBooking } from "@/actions/rent-booking";
import type { RentBookingDetail } from "@/actions/rent-booking";
import { formatPrice } from "@/lib/format";
import RentPaymentHistorySection from "@/components/shared/RentPaymentHistorySection";
import RentPaymentModal from "./RentPaymentModal";
import OverduePaymentModal from "./OverduePaymentModal";
import TenantAgreementModal from "./TenantAgreementModal";

interface Props {
  bookingId: string;
  onClose:   () => void;
  onRefresh?: () => void;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending:         { label: "Pending Review",   color: "text-amber-700", bg: "bg-amber-50"  },
  accepted:        { label: "Accepted",         color: "text-green-700", bg: "bg-green-50"  },
  rejected:        { label: "Rejected",         color: "text-red-700",   bg: "bg-red-50"    },
  payment_pending: { label: "Payment Pending",  color: "text-amber-700", bg: "bg-amber-50"  },
  active:          { label: "Active",           color: "text-blue-700",  bg: "bg-blue-50"   },
  completed:       { label: "Completed",        color: "text-green-700", bg: "bg-green-50"  },
  cancelled:       { label: "Cancelled",        color: "text-red-700",   bg: "bg-red-50"    },
};

export default function TenantRentBookingDetailModal({ bookingId, onClose, onRefresh }: Props) {
  const t = useTranslations("Dashboard.tenantRentBookings");

  const [detail,        setDetail]        = useState<RentBookingDetail | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [imgIndex,      setImgIndex]      = useState(0);
  const [activeTab,      setActiveTab]      = useState<"price" | "history">("price");
  const [cancelConfirm,  setCancelConfirm]  = useState(false);
  const [showAgreement,  setShowAgreement]  = useState(false);
  const [showPayment,    setShowPayment]    = useState(false);
  const [showOverdue,    setShowOverdue]    = useState(false);
  const [isPending,      startTransition]  = useTransition();

  useEffect(() => {
    getRentBookingDetail(bookingId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [bookingId]);

  const handleCancel = () => {
    startTransition(async () => {
      await cancelRentBooking(bookingId);
      onRefresh?.();
      onClose();
    });
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const statusStyle = STATUS_STYLE[detail?.status ?? ""] ?? STATUS_STYLE.pending;

  return (
    <>
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex w-full max-w-[680px] flex-col gap-5 overflow-y-auto rounded-[8px] bg-white p-6"
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
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyle.color} ${statusStyle.bg}`}>
                {t(`status_${detail.status}`)}
              </span>
              <span className="text-sm text-[#969696]">
                {t("submittedOn")} {formatDate(detail.createdAt)}
              </span>
            </div>

            {/* Property card */}
            <div className="overflow-hidden rounded-[6px] border border-[rgba(102,102,102,0.15)]">
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
                </div>
              </div>
            </div>

            {/* Stay */}
            <div className="rounded-[6px] border border-[rgba(102,102,102,0.12)] p-4">
              <p className="mb-3 text-sm font-bold text-[#32343C]">{t("sectionStay")}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Row label={t("fieldMoveIn")}   value={formatDate(detail.moveInDate)} />
                <Row label={t("fieldMoveOut")}  value={formatDate(detail.moveOutDate)} />
                <Row label={t("fieldArrival")}  value={detail.arrivalTime} />
                <Row label={t("fieldStayDays")} value={`${detail.stayDays} ${t("days")}`} />
                <Row label={t("fieldContract")} value={`${detail.contractMonths} ${detail.contractMonths === 1 ? t("month") : t("months")}`} />
              </div>
            </div>

            {/* Tabs: Price Summary | Payment History */}
            <div>
              {/* Tab bar */}
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

              {/* Tab content */}
              <div className="pt-4">
                {activeTab === "price" && (() => {
                  const fullMonths      = Math.floor(detail.stayDays / 30);
                  const remainder       = detail.remainderDays ?? 0;
                  const fullCost        = fullMonths * detail.rentalAmount;
                  const partialCost     = Math.round(remainder * (detail.dailyRate ?? 0));
                  const totalRentAmount = fullCost + partialCost;
                  const contractFee     = detail.fees?.tenantContractFee    ?? 0;
                  const contractFeeVat  = detail.fees?.tenantContractFeeVat ?? 0;
                  const contractFeeRate = detail.fees?.tenantContractFeeRate ?? 0;
                  const vatRate         = detail.fees?.vatRate               ?? 0.07;
                  const totalContractValue = totalRentAmount + contractFee + contractFeeVat;
                  const chargedInAdvance   = detail.fees?.tenantTotalCharged || detail.totalUpfront;
                  return (
                    <div className="rounded-[6px] border border-[rgba(102,102,102,0.12)] p-4">
                      <div className="flex flex-col gap-0">
                        <div className="flex flex-col gap-1.5 pb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#545454]">{t("fieldRental")}</span>
                            <span className="font-medium text-[#32343C]">{formatPrice(detail.rentalAmount)} / {t("month")}</span>
                          </div>
                          {(detail.dailyRate ?? 0) > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#545454]">{t("fieldDailyRate")}</span>
                              <span className="font-medium text-[#32343C]">{formatPrice(detail.dailyRate ?? 0)} {t("perDay")}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 border-t border-[rgba(65,65,65,0.1)] py-3">
                          {fullMonths > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#545454]">{fullMonths} {fullMonths === 1 ? t("month") : t("months")} × {formatPrice(detail.rentalAmount)}</span>
                              <span className="font-medium text-[#32343C]">{formatPrice(fullCost)}</span>
                            </div>
                          )}
                          {remainder > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#545454]">{remainder} {t("days")} × {formatPrice(detail.dailyRate ?? 0)}</span>
                              <span className="font-medium text-[#32343C]">{formatPrice(partialCost)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 border-t border-[rgba(65,65,65,0.1)] py-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#545454]">{t("fieldTotalRentAmount")}</span>
                            <span className="font-medium text-[#32343C]">{formatPrice(totalRentAmount)}</span>
                          </div>
                          {contractFee > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#545454]">{t("fieldContractFee")} ({(contractFeeRate * 100).toFixed(0)}%)</span>
                              <span className="font-medium text-[#32343C]">{formatPrice(contractFee)}</span>
                            </div>
                          )}
                          {contractFeeVat > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#545454]">{t("fieldContractFeeVat")} ({(vatRate * 100).toFixed(0)}%)</span>
                              <span className="font-medium text-[#32343C]">{formatPrice(contractFeeVat)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#32343C]">{t("fieldTotalContractValue")}</span>
                            <span className="font-semibold text-[#32343C]">{formatPrice(totalContractValue)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-[rgba(65,65,65,0.1)] py-3 text-xs">
                          <span className="text-[#545454]">{t("fieldDeposit")}</span>
                          <span className="text-[#969696]">{formatPrice(detail.securityDeposit)} <span className="text-[11px]">({t("savedNotCharged")})</span></span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[rgba(65,65,65,0.1)] pt-3">
                          <span className="text-sm font-bold text-[#32343C]">{t("fieldTotal")}</span>
                          <span className="text-base font-bold text-[#0245A5]">{formatPrice(chargedInAdvance)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {activeTab === "history" && (
                  <RentPaymentHistorySection bookingId={bookingId} role="tenant" />
                )}
              </div>
            </div>

            {/* Owner rejection note */}
            {detail.status === "rejected" && detail.ownerNote && (
              <div className="rounded-[6px] border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-xs font-semibold text-red-600">{t("rejectionNote")}</p>
                <p className="mt-1 text-sm text-red-700">{detail.ownerNote}</p>
              </div>
            )}

            {/* Overdue balance banner */}
            {detail.status === "active" && (detail.overdueAmount ?? 0) > 0 && (
              <div className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-700">{t("overdueTitle")}</p>
                <p className="mt-1 text-sm text-red-600">
                  {detail.isRestricted
                    ? t("overdueDescRestricted", { amount: formatPrice(detail.overdueAmount ?? 0) })
                    : t("overdueDesc", { amount: formatPrice(detail.overdueAmount ?? 0) })}
                </p>
                <button
                  type="button"
                  onClick={() => setShowOverdue(true)}
                  className="mt-3 rounded-[4px] bg-[#E35454] px-6 py-2 text-sm font-semibold text-white hover:bg-[#C93D3D]"
                >
                  {t("payOverdue")}
                </button>
              </div>
            )}

            {/* Accepted: Pay Now */}
            {detail.status === "accepted" && (
              <div className="rounded-[6px] border border-green-100 bg-green-50 px-4 py-3">
                <p className="text-sm font-semibold text-green-700">{t("acceptedTitle")}</p>
                <p className="mt-1 text-sm text-green-600">{t("acceptedDesc")}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (detail.agreement?.tenantSignedAt) {
                      setShowPayment(true);
                    } else {
                      setShowAgreement(true);
                    }
                  }}
                  className="mt-3 rounded-[4px] bg-[#0245A5] px-6 py-2 text-sm font-semibold text-white hover:bg-[#01357A]"
                >
                  {detail.agreement?.tenantSignedAt ? t("payNow") : t("reviewAndSign")}
                </button>
              </div>
            )}

            {/* Cancel — only while pending */}
            {detail.status === "pending" && (
              <div className="border-t border-[rgba(65,65,65,0.1)] pt-4">
                {cancelConfirm ? (
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-sm text-[#969696]">{t("cancelConfirmQuestion")}</span>
                    <button
                      type="button"
                      onClick={() => setCancelConfirm(false)}
                      className="rounded-[4px] border border-[rgba(65,65,65,0.2)] px-5 py-2 text-sm font-semibold text-[#32343C] hover:bg-gray-50"
                    >
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isPending}
                      className="flex items-center gap-1.5 rounded-[4px] bg-[#E35454] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C93D3D] disabled:opacity-50"
                    >
                      {isPending && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                      {t("confirmCancel")}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCancelConfirm(true)}
                      className="rounded-[4px] bg-[#E35454] px-6 py-2 text-sm font-semibold text-white hover:bg-[#C93D3D]"
                    >
                      {t("cancelBooking")}
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
      <TenantAgreementModal
        detail={detail}
        onSigned={() => {
          setShowAgreement(false);
          setShowPayment(true);
        }}
        onClose={() => setShowAgreement(false)}
      />
    )}

    {showOverdue && detail && (
      <OverduePaymentModal
        bookingId={bookingId}
        detail={detail}
        onClose={() => setShowOverdue(false)}
        onSuccess={() => {
          setShowOverdue(false);
          onRefresh?.();
          onClose();
        }}
      />
    )}

    {/* Payment modal — rendered outside the detail modal so z-index stacks correctly */}
    {showPayment && detail && (
      <RentPaymentModal
        bookingId={bookingId}
        detail={detail}
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          onRefresh?.();
          onClose();
        }}
      />
    )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-[#969696]">{label}</span>
      <span className="text-right text-xs font-medium text-[#32343C]">{value || "—"}</span>
    </div>
  );
}
