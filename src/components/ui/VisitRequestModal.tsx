"use client";

import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Country } from "country-state-city";
import type { TenantPropertyDetail } from "@/actions/tenant-properties";
import { formatPrice } from "@/lib/format";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_ABBR   = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDateStr(dateStr: string): Date {
  const clean = dateStr.slice(0, 10);
  const [y, m, d] = clean.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getSortedDates(showingDates: string[]): string[] {
  return [...showingDates].sort();
}

function isDatePast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDateStr(dateStr) < today;
}

function formatDayChip(dateStr: string): { day: string; date: string; } {
  const d = parseDateStr(dateStr);
  return {
    day:  DAY_ABBR[d.getDay()],
    date: `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`,
  };
}


// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisitRequestFormData {
  selectedDate: string;
  selectedTime: string;
  fullName: string;
  moveInDate: string;
  moveOutDate: string;
  nationality: string;
  numberOfOccupants: string;
  purposeOfRental: string;
}

interface VisitRequestModalProps {
  isOpen: boolean;
  detail: TenantPropertyDetail;
  onClose: () => void;
  onNext: (data: VisitRequestFormData) => void;
}

// ─── Reusable horizontal chip scroller ────────────────────────────────────────

function ChipScroller({
  children,
  scrollAmount = 110,
}: {
  children: ReactNode;
  scrollAmount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });

  return (
    <div className="flex items-center gap-2">
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-80"
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
          <path d="M6 1L1 6L6 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Scrollable row — min-w-0 bounds the flex-1 so overflow kicks in */}
      <div
        ref={ref}
        className="min-w-0 flex-1 overflow-x-scroll"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        <div className="flex w-max gap-2">
          {children}
        </div>
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-80"
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
          <path d="M1 1L6 6L1 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VisitRequestModal({
  isOpen,
  detail,
  onClose,
  onNext,
}: VisitRequestModalProps) {
  const t = useTranslations("Dashboard.tenantProperties.drawer.visitRequestModal");

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.name, label: c.name })),
    []
  );

  const [selectedDate, setSelectedDate]   = useState("");
  const [selectedTime, setSelectedTime]   = useState("");
  const [fullName,     setFullName]       = useState("");
  const [moveInDate,   setMoveInDate]     = useState("");
  const [moveOutDate,  setMoveOutDate]    = useState("");
  const [nationality,  setNationality]    = useState("");
  const [occupants,    setOccupants]      = useState("");
  const [purpose,      setPurpose]        = useState("");
  const [errors,       setErrors]         = useState<Record<string, string>>({});

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate("");
      setSelectedTime("");
      setFullName("");
      setMoveInDate("");
      setMoveOutDate("");
      setNationality("");
      setOccupants("");
      setPurpose("");
      setErrors({});
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const allDates = getSortedDates(detail.showingDates ?? []);

  // Single time window set by the owner (one from + one to = one chip)
  const from = detail.showingTimeFrom?.trim() ?? "";
  const to   = detail.showingTimeTo?.trim()   ?? "";
  const timeSlot = from && to
    ? `${from.replace(" ", "")} - ${to.replace(" ", "")}`
    : null;

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const req = t("required");
    if (!selectedDate)    next.selectedDate = t("selectDayRequired");
    if (!selectedTime)    next.selectedTime = t("selectTimeRequired");
    if (!fullName.trim()) next.fullName     = req;
    if (!moveInDate)      next.moveInDate   = req;
    if (!moveOutDate)     next.moveOutDate  = req;
    if (!nationality.trim()) next.nationality = req;
    if (!occupants.trim())   next.occupants  = req;
    if (!purpose.trim())     next.purpose    = req;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext({
      selectedDate,
      selectedTime,
      fullName,
      moveInDate,
      moveOutDate,
      nationality,
      numberOfOccupants: occupants,
      purposeOfRental:   purpose,
    });
  };

  if (!isOpen) return null;

  const inputCls = (field: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm text-[#32343C] placeholder-[#969696] outline-none transition-colors ${
      errors[field]
        ? "border-[#E35454] focus:border-[#E35454]"
        : "border-[rgba(65,65,65,0.2)] focus:border-primary"
    }`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[720px] flex-col gap-5 overflow-y-auto rounded-[8px] bg-white p-6"
        style={{ boxShadow: "0px 2px 14px rgba(0,0,0,0.11)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-req-title"
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2
            id="visit-req-title"
            className="text-[22px] font-semibold leading-[26px] text-[#32343C]"
          >
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: "rgba(50,52,60,0.44)" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="9" y2="9" stroke="#FFFFFF" strokeWidth="2.46" strokeLinecap="round" />
              <line x1="9" y1="1" x2="1" y2="9" stroke="#FFFFFF" strokeWidth="2.46" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Property card ───────────────────────────────────────────── */}
        <div>
          <p className="mb-2 text-sm font-semibold text-[#32343C]">{t("property")}</p>
          <div className="overflow-hidden rounded-lg border border-[rgba(65,65,65,0.16)]">
            {/* Image */}
            <div className="relative h-[160px] w-full bg-[#F7FAFE] sm:h-[200px]">
              {detail.photos[0] && (
                <Image
                  src={detail.photos[0]}
                  alt={detail.title}
                  fill
                  className="object-cover"
                />
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

            {/* Info */}
            <div className="flex flex-col gap-2 p-3">
              <p className="text-xs text-[#969696]">
                {[detail.address, detail.province].filter(Boolean).join(", ")}
              </p>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-lg font-bold leading-tight text-[#32343C]">
                    {formatPrice(detail.minRentPrice)}
                  </p>
                  <p className="text-sm text-[#32343C]">{detail.title}</p>
                </div>
                {detail.minRentPrice > 0 && (
                  <p className="shrink-0 text-xs text-[#969696]">
                    {formatPrice(detail.minRentPrice)}
                    <span>/month</span>
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(65,65,65,0.1)] pt-2">
                {detail.bedrooms > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/images/icons/dashboard/tenant-properties/bed-white.png"
                      alt=""
                      width={18}
                      height={14}
                      className="shrink-0"
                    />
                    <span className="text-xs font-semibold leading-4 tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                      {detail.bedrooms} {t("beds")}
                    </span>
                  </div>
                )}
                {detail.bathrooms > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/images/icons/dashboard/tenant-properties/bath-white.png"
                      alt=""
                      width={16}
                      height={14}
                      className="shrink-0"
                    />
                    <span className="text-xs font-semibold leading-4 tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                      {detail.bathrooms} {t("baths")}
                    </span>
                  </div>
                )}
                {detail.unitArea && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/images/icons/dashboard/tenant-properties/area-white.png"
                      alt=""
                      width={14}
                      height={14}
                      className="shrink-0"
                    />
                    <span className="text-xs font-semibold leading-4 tracking-[0.05em]" style={{ color: "rgba(50,52,60,0.8)" }}>
                      {detail.unitArea} {detail.unitAreaUnit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Preferred day picker ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-[#32343C]">{t("selectDay")}</p>
          {allDates.length === 0 ? (
            <p className="text-sm text-[#969696]">{t("noDates")}</p>
          ) : (
            <ChipScroller scrollAmount={110}>
              {allDates.map((dateStr) => {
                const { day, date } = formatDayChip(dateStr);
                const isSelected = selectedDate === dateStr;
                const isPast = isDatePast(dateStr);
                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isPast}
                    onClick={() => { if (!isPast) { setSelectedDate(dateStr); clearError("selectedDate"); } }}
                    className={`flex w-[90px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 py-3 transition-colors ${
                      isPast
                        ? "border-[#C2C2C2] bg-[#F5F5F5] text-[#C2C2C2] cursor-not-allowed"
                        : isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-primary bg-white text-primary hover:bg-primary/5"
                    }`}
                  >
                    <span className="text-sm font-bold">{day}</span>
                    <span className="text-xs font-medium">{date}</span>
                  </button>
                );
              })}
            </ChipScroller>
          )}
          {errors.selectedDate && (
            <p className="text-xs text-[#E35454]">{errors.selectedDate}</p>
          )}
        </div>

        {/* ── Preferred time picker ────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-[#32343C]">{t("selectTime")}</p>
          {!timeSlot ? (
            <p className="text-sm text-[#969696]">{t("noTimes")}</p>
          ) : (
            <button
              type="button"
              onClick={() => { setSelectedTime(timeSlot); clearError("selectedTime"); }}
              className={`inline-flex w-fit items-center justify-center whitespace-nowrap rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                selectedTime === timeSlot
                  ? "border-primary bg-primary text-white"
                  : "border-primary bg-white text-primary hover:bg-primary/5"
              }`}
            >
              {timeSlot}
            </button>
          )}
          {errors.selectedTime && (
            <p className="text-xs text-[#E35454]">{errors.selectedTime}</p>
          )}
        </div>

        {/* ── Form fields ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#32343C]">{t("fullName")}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }}
              placeholder={t("fullNamePlaceholder")}
              className={inputCls("fullName")}
            />
            {errors.fullName && <p className="text-xs text-[#E35454]">{errors.fullName}</p>}
          </div>

          {/* Move In – Move Out + Nationality */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#32343C]">{t("moveInOut")}</label>
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors focus-within:border-primary ${
                  errors.moveInDate || errors.moveOutDate
                    ? "border-[#E35454]"
                    : "border-[rgba(65,65,65,0.2)]"
                }`}
              >
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => { setMoveInDate(e.target.value); clearError("moveInDate"); }}
                  className="flex-1 text-sm text-[#32343C] outline-none [color-scheme:light]"
                />
                <span className="shrink-0 text-[#969696]">–</span>
                <input
                  type="date"
                  value={moveOutDate}
                  onChange={(e) => { setMoveOutDate(e.target.value); clearError("moveOutDate"); }}
                  className="flex-1 text-sm text-[#32343C] outline-none [color-scheme:light]"
                />
              </div>
              {(errors.moveInDate || errors.moveOutDate) && (
                <p className="text-xs text-[#E35454]">{t("required")}</p>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#32343C]">{t("nationality")}</label>
              <div className="relative">
                <select
                  value={nationality}
                  onChange={(e) => { setNationality(e.target.value); clearError("nationality"); }}
                  className={`w-full appearance-none rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${
                    errors.nationality
                      ? "border-[#E35454] focus:border-[#E35454]"
                      : "border-[rgba(65,65,65,0.2)] focus:border-primary"
                  } ${!nationality ? "text-[#969696]" : "text-[#32343C]"}`}
                >
                  <option value="" disabled>{t("nationalityPlaceholder")}</option>
                  {countryOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="12" height="7" viewBox="0 0 14 8" fill="none">
                    <path d="M1 1L7 7L13 1" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {errors.nationality && <p className="text-xs text-[#E35454]">{errors.nationality}</p>}
            </div>
          </div>

          {/* Number of Occupants + Purpose of Rental */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#32343C]">{t("occupants")}</label>
              <input
                type="number"
                min={1}
                value={occupants}
                onChange={(e) => { setOccupants(e.target.value); clearError("occupants"); }}
                placeholder={t("occupantsPlaceholder")}
                className={inputCls("occupants")}
              />
              {errors.occupants && <p className="text-xs text-[#E35454]">{errors.occupants}</p>}
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#32343C]">{t("purpose")}</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => { setPurpose(e.target.value); clearError("purpose"); }}
                placeholder={t("purposePlaceholder")}
                className={inputCls("purpose")}
              />
              {errors.purpose && <p className="text-xs text-[#E35454]">{errors.purpose}</p>}
            </div>
          </div>
        </div>

        {/* ── Footer buttons ───────────────────────────────────────────── */}
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
            onClick={handleNext}
            className="flex items-center justify-center rounded-[2px] px-5 py-2 text-sm font-semibold leading-4 tracking-[0.02em] text-white transition-opacity hover:opacity-90"
            style={{ background: "#0245A5" }}
          >
            {t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
