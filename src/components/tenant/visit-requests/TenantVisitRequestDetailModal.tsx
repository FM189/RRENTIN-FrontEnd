"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslations } from "next-intl";
import { getTenantVisitRequestDetail } from "@/actions/visit-requests";
import type { TenantVisitRequestDetail } from "@/actions/visit-requests";
import { formatPrice } from "@/lib/format";

interface Props {
  requestId: string;
  onClose:   () => void;
}

export default function TenantVisitRequestDetailModal({ requestId, onClose }: Props) {
  const t = useTranslations("Dashboard.ownerVisitRequests");

  const [detail,  setDetail]  = useState<TenantVisitRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx,  setImgIdx]  = useState(0);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    getTenantVisitRequestDetail(requestId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [requestId]);

  const qrUrl = detail?.qrToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/scan-qr/${detail.qrToken}`
    : null;

  const handleDownloadQR = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `visit-qr-${detail?.qrToken?.slice(0, 8) ?? "code"}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex w-full max-w-[589px] flex-col gap-6 overflow-y-auto rounded-[8px] bg-white p-6"
        style={{ boxShadow: "0px 2px 14px rgba(0,0,0,0.11)", maxHeight: "90vh" }}
      >
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-semibold leading-[26px] text-[#32343C]">
            {t("tenantModalTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(50,52,60,0.44)] hover:bg-[rgba(50,52,60,0.6)]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-sm leading-[16px] text-[#32343C]">
          {t("tenantModalDesc")}
        </p>

        {/* Loading */}
        {loading && (
          <div className="flex h-48 items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#0245A5] border-t-transparent" />
          </div>
        )}

        {/* ── Completed state ─────────────────────────────────────────────────── */}
        {detail && detail.status === "completed" && (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold text-[#32343C]">{t("visitCompletedTitle")}</p>
              <p className="text-sm leading-relaxed text-[#969696]">{t("visitCompletedDesc")}</p>
            </div>
            <div className="w-full rounded-[8px] border border-[rgba(65,65,65,0.1)] bg-[#F7FAFE] p-4 text-left">
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
              </div>
            </div>
            <div className="flex w-full items-center justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[2px] bg-[#E35454] px-8 py-2 text-sm font-semibold text-white hover:bg-[#C93D3D]"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="rounded-[2px] bg-[#0245A5] px-8 py-2 text-sm font-semibold text-white hover:bg-[#01357A]"
              >
                {t("downloadSlip")}
              </button>
            </div>
          </div>
        )}

        {detail && detail.status !== "completed" && (
          <>
            {/* ── Property ──────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-[10px]">
              <p className="text-base font-medium text-[#32343C]">{t("property")}</p>

              <div
                className="flex flex-col overflow-hidden rounded-[4px]"
                style={{ filter: "drop-shadow(0px 1.6px 19.2px rgba(0,0,0,0.1))" }}
              >
                {/* Image */}
                <div
                  className="relative flex items-end justify-end p-[5px] bg-[#A3A3A3]"
                  style={{ height: "129.59px", borderRadius: "4.34px 4.34px 0 0", boxShadow: "0 0 6.5px rgba(0,0,0,0.1)" }}
                >
                  {detail.propertyImages.length > 0 && (
                    <Image
                      src={detail.propertyImages[imgIdx]}
                      alt={detail.propertyTitle}
                      fill
                      className="object-cover brightness-[0.85]"
                    />
                  )}
                  {/* Type badge */}
                  {detail.propertyType && (
                    <span className="absolute left-[6.5px] top-[6.51px] z-10 rounded-[1.63px] bg-white px-[3.25px] py-[1.08px] text-[9px] font-bold text-[#0245A5]">
                      {detail.propertyType}
                    </span>
                  )}
                  {/* Bookmark */}
                  <div className="relative z-10 flex h-[16.27px] w-[16.27px] items-center justify-center rounded-full bg-[#E9F2FF]">
                    <svg width="6" height="9" viewBox="0 0 9 11" fill="none">
                      <path d="M1 1H8V10L4.5 7.5L1 10V1Z" fill="#0345A5"/>
                    </svg>
                  </div>
                  {/* Counter */}
                  {detail.propertyImages.length > 1 && (
                    <div className="relative z-10 ml-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                        disabled={imgIdx === 0}
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-black/40 disabled:opacity-30"
                      >
                        <svg width="5" height="5" viewBox="0 0 7 7" fill="none">
                          <path d="M5 1L2 3.5L5 6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <span
                        className="rounded-full px-[5.42px] py-[2.17px] text-[9px] font-semibold text-white"
                        style={{ background: "rgba(50,52,60,0.5)" }}
                      >
                        {imgIdx + 1}/{detail.propertyImages.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setImgIdx((i) => Math.min(detail.propertyImages.length - 1, i + 1))}
                        disabled={imgIdx === detail.propertyImages.length - 1}
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-black/40 disabled:opacity-30"
                      >
                        <svg width="5" height="5" viewBox="0 0 7 7" fill="none">
                          <path d="M2 1L5 3.5L2 6" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div
                  className="flex flex-col gap-[9.76px] bg-white px-[10.84px] py-[10.84px]"
                  style={{ boxShadow: "0px 1.08px 6.5px rgba(53,130,231,0.1)", borderRadius: "0 0 4.34px 4.34px" }}
                >
                  <p className="text-xs tracking-[0.05em] text-[#969696]">{detail.propertyAddress || "—"}</p>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold tracking-[0.05em] text-[#32343C]">
                        {detail.rentPrice ? formatPrice(detail.rentPrice) : "—"}
                      </p>
                      <p className="text-sm tracking-[0.05em] text-[#545454]">{detail.propertyTitle}</p>
                    </div>
                    <p className="text-sm font-semibold tracking-[0.05em] text-[#32343C]">
                      {detail.rentPrice ? formatPrice(detail.rentPrice) : ""}
                      <span className="text-xs font-normal text-[#969696]">/month</span>
                    </p>
                  </div>
                  <div className="border-t border-[#D8D8D8]" />
                  <div className="flex flex-wrap items-center gap-[10.3px]">
                    {detail.bedrooms > 0 && (
                      <div className="flex items-center gap-[3.25px]">
                        <Image src="/images/icons/dashboard/tenant-properties/bed-white.png" alt="" width={13} height={11} className="shrink-0" />
                        <span className="text-xs font-semibold tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                          {detail.bedrooms} Beds
                        </span>
                      </div>
                    )}
                    {detail.bathrooms > 0 && (
                      <div className="flex items-center gap-[3.25px]">
                        <Image src="/images/icons/dashboard/tenant-properties/bath-white.png" alt="" width={12} height={11} className="shrink-0" />
                        <span className="text-xs font-semibold tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                          {detail.bathrooms} Baths
                        </span>
                      </div>
                    )}
                    {detail.unitArea && (
                      <div className="flex items-center gap-[3.25px]">
                        <Image src="/images/icons/dashboard/tenant-properties/area-white.png" alt="" width={11} height={11} className="shrink-0" />
                        <span className="text-xs font-semibold tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                          {detail.unitArea} {detail.unitAreaUnit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Date & Time ───────────────────────────────────────────────── */}
            <div className="flex items-start gap-[14px]">
              <div className="flex flex-1 flex-col">
                <p className="text-base font-medium text-[#32343C]">{t("fieldVisitDate")}</p>
                <div className="border-b border-[rgba(55,65,81,0.1)] py-3">
                  <p className="text-base font-medium text-[rgba(55,65,81,0.6)]">{detail.preferredDate || "—"}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-base font-medium text-[#32343C]">{t("fieldVisitTime")}</p>
                <div className="border-b border-[rgba(55,65,81,0.1)] py-3">
                  <p className="text-base font-medium text-[rgba(55,65,81,0.6)]">{detail.preferredTime || "—"}</p>
                </div>
              </div>
            </div>

            {/* ── Showing Person + QR ───────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-[34px]">
              {/* Person */}
              <div className="flex w-full shrink-0 flex-col items-center gap-[10px] sm:w-[195px]">
                <p className="text-base font-bold text-[#32343C]">
                  {detail.isOwnerShowing ? t("showingOwnerLabel") : t("showingAgentLabel")}
                </p>

                {/* Photo */}
                <div
                  className="relative overflow-hidden rounded-[12px] bg-gradient-to-br from-[#A8C8F0] to-[#5390E0]"
                  style={{ width: 140, height: 142, border: "5px solid #FFFFFF", flexShrink: 0 }}
                >
                  {detail.showingPersonImage ? (
                    <Image
                      src={detail.showingPersonImage}
                      alt={detail.showingPersonName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {detail.showingPersonName.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="w-full text-center text-xl font-semibold text-[#1F242F]">
                  {detail.showingPersonName || "—"}
                </p>

                {/* Title */}
                <div className="flex items-center gap-[6px]">
                  <p className="text-base font-medium text-[#32343C]">{detail.showingPersonTitle}</p>
                  {!detail.isOwnerShowing && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="#0245A5"/>
                      <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-1 flex-col items-center gap-3">
                {qrUrl ? (
                  <>
                    <div
                      className="overflow-hidden rounded-[6px] bg-white"
                      style={{ border: "4px solid #FFFFFF", boxShadow: "0px 0px 25px rgba(51,51,51,0.3)" }}
                    >
                      <QRCodeCanvas
                        ref={qrCanvasRef}
                        value={qrUrl}
                        size={220}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                        marginSize={0}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      className="flex items-center gap-1.5 rounded-[2px] bg-[#0245A5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#01357A]"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1v7M3.5 5.5l3 3 3-3M1 10h11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t("downloadQR")}
                    </button>
                  </>
                ) : (
                  <div
                    className="flex w-full items-center justify-center rounded-[6px] bg-[#F3F4F6]"
                    style={{ minHeight: 220 }}
                  >
                    <p className="px-6 text-center text-sm text-[#969696]">{t("qrNotYetAvailable")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Guidelines ───────────────────────────────────────────────── */}
            <div className="flex flex-col gap-[9px]">
              <p className="text-base font-bold text-[#32343C]">{t("tenantGuidelinesTitle")}</p>
              <ul className="flex flex-col gap-1.5">
                {(["tenantGuidelineItem1","tenantGuidelineItem2","tenantGuidelineItem3","tenantGuidelineItem4"] as const).map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm font-medium leading-[16px] text-[#32343C]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#32343C]" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[2px] bg-[#E35454] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#C93D3D] sm:w-auto sm:py-2"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="w-full rounded-[2px] bg-[#0245A5] px-8 py-2.5 text-sm font-semibold tracking-[0.02em] text-white hover:bg-[#01357A] sm:w-auto sm:py-2"
              >
                {t("downloadSlip")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
