"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Country } from "country-state-city";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatPrice } from "@/lib/format";
import { createRentBooking } from "@/actions/rent-booking";
import type { TenantBookingProperty } from "@/actions/tenant-properties";

const ALL_COUNTRIES = Country.getAllCountries().map((c) => c.name);

interface BookingFormData {
  fullName: string;
  currentCountry: string;
  nationality: string;
  guestsStaying: string;
  occupation: string;
  primaryReason: string;
  designation: string;
  visaType: string;
  moveInDate: string;
  moveOutDate: string;
  arrivalTime: string;
  specialRequests: string;
}

const GUESTS_OPTIONS = [
  { value: "1", label: "1 (Solo)" },
  { value: "2", label: "2 (Couple)" },
  { value: "3-5", label: "3-5 (Family/Small Group)" },
  { value: "5+", label: "5+ (Custom)" },
];

const REASON_OPTIONS = [
  { value: "vacation", label: "Vacation/Holiday" },
  { value: "remote_work", label: "Remote Work (Digital Nomad)" },
  { value: "business", label: "Business/Working Assignment" },
  { value: "retirement", label: "Retirement/Long-Term Stay" },
  { value: "other", label: "Other (Specify:)" },
];

const VISA_OPTIONS = [
  { value: "tr", label: "Tourist Visa (TR)" },
  { value: "voa", label: "Visa on Arrival (VoA)" },
  { value: "work_permit", label: "Work Permit" },
  { value: "dtv", label: "Digital Nomad Visa (DTV) (New!)" },
  { value: "retirement", label: "Retirement Visa (O-A/O-X)" },
  { value: "education", label: "Education Visa (ED)" },
  { value: "other", label: "Other (Specify:)" },
];

const ARRIVAL_TIMES = [
  "12:00 AM - 01:00 AM",
  "01:00 AM - 02:00 AM",
  "02:00 AM - 03:00 AM",
  "06:00 AM - 08:00 AM",
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
  "08:00 PM - 10:00 PM",
  "10:00 PM - 12:00 AM",
];

function parsePriceNum(val: string | number): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
}


function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
  inline = false,
  required,
  error,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  inline?: boolean;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-[#32343C]">
        {label}
        {required && <span className="ml-0.5 text-[#EE1D52]">*</span>}
      </label>
      <div className={inline ? "flex flex-wrap gap-x-6 gap-y-3" : "flex flex-col gap-3"}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-[#32343C]"
          >
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-[#EE1D52]">{error}</p>}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#32343C]">
        {label}
        {required && <span className="ml-0.5 text-[#EE1D52]">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-[6px] border px-3 text-sm text-[#32343C] placeholder:text-[rgba(102,102,102,0.6)] focus:border-primary focus:ring-0 transition-colors ${
          error ? "border-[#EE1D52]" : "border-[rgba(102,102,102,0.35)]"
        }`}
      />
      {error && <p className="text-xs text-[#EE1D52]">{error}</p>}
    </div>
  );
}

export default function RentBookingClient({ property }: { property: TenantBookingProperty }) {
  const t = useTranslations("Dashboard.tenantProperties.rentBooking");
  const router = useRouter();
  const { user } = useCurrentUser();

  const [form, setForm] = useState<BookingFormData>({
    fullName: user?.name ?? "",
    currentCountry: "",
    nationality: "",
    guestsStaying: "",
    occupation: "",
    primaryReason: "",
    designation: "",
    visaType: "",
    moveInDate: "",
    moveOutDate: "",
    arrivalTime: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const set = (field: keyof BookingFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const stayDays = useMemo(() => {
    if (!form.moveInDate || !form.moveOutDate) return 0;
    const diff = new Date(form.moveOutDate).getTime() - new Date(form.moveInDate).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [form.moveInDate, form.moveOutDate]);

  const sortedContracts = useMemo(
    () => [...property.contracts].sort((a, b) => a.months - b.months),
    [property.contracts],
  );

  const estimatedMonths = stayDays > 0 ? Math.max(1, Math.round(stayDays / 30)) : 0;

  const matchedContractIndex = useMemo(() => {
    if (!sortedContracts.length || estimatedMonths === 0) return -1;
    const idx = sortedContracts.findIndex((c) => c.months >= estimatedMonths);
    return idx === -1 ? sortedContracts.length - 1 : idx;
  }, [sortedContracts, estimatedMonths]);

  const matchedContract  = matchedContractIndex >= 0 ? sortedContracts[matchedContractIndex] : null;
  const rentalAmount     = matchedContract ? parsePriceNum(matchedContract.rentPrice)       : 0;
  const securityAmount   = matchedContract ? parsePriceNum(matchedContract.securityDeposit) : 0;
  const dailyRate        = rentalAmount > 0 ? rentalAmount / 30 : 0;
  const fullMonths       = stayDays > 0 ? Math.floor(stayDays / 30) : 0;
  const remainderDays    = stayDays > 0 ? stayDays % 30 : 0;
  const billingCycles    = fullMonths + (remainderDays > 0 ? 1 : 0);
  const partialMonthCost = remainderDays > 0 ? dailyRate * remainderDays : 0;
  const totalContractValue = (fullMonths * rentalAmount) + partialMonthCost;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};
    const required = t("required");

    if (!form.fullName.trim())    newErrors.fullName     = required;
    if (!form.currentCountry)  newErrors.currentCountry  = required;
    if (!form.nationality)  newErrors.nationality  = required;
    if (!form.guestsStaying)      newErrors.guestsStaying = required;
    if (!form.occupation.trim())  newErrors.occupation   = required;
    if (!form.designation.trim()) newErrors.designation  = required;
    if (!form.primaryReason)      newErrors.primaryReason = required;
    if (!form.visaType)           newErrors.visaType     = required;
    if (!form.moveInDate)         newErrors.moveInDate   = required;
    if (!form.moveOutDate)        newErrors.moveOutDate  = required;
    if (!form.arrivalTime)        newErrors.arrivalTime  = required;

    if (form.moveInDate && form.moveOutDate && form.moveOutDate <= form.moveInDate) {
      newErrors.moveOutDate = t("moveOutAfterMoveIn");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!matchedContract) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await createRentBooking({
        propertyId:      property.id,
        fullName:        form.fullName,
        currentCountry:     form.currentCountry,
        nationality:     form.nationality,
        occupation:      form.occupation,
        designation:     form.designation,
        moveInDate:      form.moveInDate,
        moveOutDate:     form.moveOutDate,
        arrivalTime:     form.arrivalTime,
        stayDays,
        guestsStaying:   form.guestsStaying,
        primaryReason:   form.primaryReason,
        visaType:        form.visaType,
        specialRequests: form.specialRequests,
        contractMonths:  billingCycles,
      });

      if (!result.success) {
        setSubmitError(result.error ?? t("submitError"));
        return;
      }

      router.push("/dashboard/tenant/proposals");
    } finally {
      setSubmitting(false);
    }
  };

  const stats: { icon: string; label: string }[] = [];
  if (property.bedrooms > 0)
    stats.push({ icon: "/images/icons/dashboard/tenant-properties/bed-white.png", label: `${property.bedrooms} ${t("beds")}` });
  if (property.bathrooms > 0)
    stats.push({ icon: "/images/icons/dashboard/tenant-properties/bath-white.png", label: `${property.bathrooms} ${t("baths")}` });
  if (property.unitArea)
    stats.push({ icon: "/images/icons/dashboard/tenant-properties/area-white.png", label: `${property.unitArea} ${property.unitAreaUnit}` });

  return (
    <div className="min-h-screen bg-white">
      {/* Content — full width, no centering */}
      <div className="flex flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:gap-8 lg:px-8">

        {/* Left panel */}
        <div className="flex w-full flex-col gap-5 lg:w-[340px] lg:shrink-0">

          {/* Property image */}
          <div className="relative overflow-hidden rounded-[10px] bg-[#F7FAFE]">
            <div className="relative h-[200px] w-full sm:h-[240px]">
              {property.photos[currentImageIndex] && (
                <Image
                  src={property.photos[currentImageIndex]}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Type badge */}
            <div className="absolute left-3 top-3 rounded-[4px] bg-white px-2 py-1 text-xs font-semibold text-[#32343C] shadow-sm">
              {property.type}
            </div>

            {/* Bookmark */}
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <Image src="/images/icons/dashboard/property/detail/bookmark.png" alt="" width={14} height={14} />
            </div>

            {/* Image counter */}
            {property.photos.length > 1 && (
              <div className="absolute bottom-3 right-3 rounded-[4px] bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
                {currentImageIndex + 1}/{property.photos.length}
              </div>
            )}

            {/* Navigation dots */}
            {property.photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                {property.photos.slice(0, 10).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentImageIndex(i)}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      i === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Property info */}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-[#969696]">
              {[property.address, property.province].filter(Boolean).join(", ")}
            </p>
            <div className="flex items-baseline justify-between gap-2">
              {matchedContract && stayDays > 0 ? (
                <>
                  <span className="text-xl font-bold text-[#32343C]">
                    {formatPrice(totalContractValue)}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-[#32343C]">
                    {formatPrice(rentalAmount)}
                    <span className="text-xs font-normal text-[#969696]">/month</span>
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-[#32343C]">
                  {formatPrice(parsePriceNum(sortedContracts[0]?.rentPrice ?? 0))}
                  <span className="text-xs font-normal text-[#969696]">/month</span>
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-[#32343C]">{property.title}</p>
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex items-center gap-0 border-t border-b border-[rgba(102,102,102,0.12)] py-3">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center">
                  {i > 0 && <span className="mx-3 text-[rgba(102,102,102,0.3)]">|</span>}
                  <div className="flex items-center gap-1.5">
                    <Image src={s.icon} alt="" width={16} height={16} className="shrink-0 opacity-50" />
                    <span className="text-xs text-[#32343C]">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking details */}
          {(form.moveInDate || form.moveOutDate) && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#32343C]">{t("yourBookingDetails")}</p>
              <div className="flex gap-4">
                {form.moveInDate && (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-[#969696]">{t("moveIn")}</p>
                    <p className="text-sm font-semibold text-[#32343C]">
                      {formatDateDisplay(form.moveInDate)}
                    </p>
                    {form.arrivalTime && (
                      <p className="text-xs text-[#969696]">{form.arrivalTime}</p>
                    )}
                  </div>
                )}
                {form.moveOutDate && (
                  <>
                    <div className="self-stretch w-px bg-[rgba(102,102,102,0.2)]" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-medium text-[#969696]">{t("moveOut")}</p>
                      <p className="text-sm font-semibold text-[#32343C]">
                        {formatDateDisplay(form.moveOutDate)}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {stayDays > 0 && (
                <div>
                  <p className="text-xs text-[#969696]">{t("totalLengthOfStay")}</p>
                  <p className="text-sm font-semibold text-[#32343C]">
                    {stayDays} {stayDays === 1 ? t("day") : t("days")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Available contracts */}
          {sortedContracts.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-[#32343C]">{t("availableContracts")}</p>
              <div className="flex flex-col gap-2">
                {sortedContracts.map((c, i) => {
                  const isActive = i === matchedContractIndex;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-[6px] border px-3 py-2 transition-colors ${
                        isActive
                          ? "border-primary bg-[rgba(2,69,165,0.06)]"
                          : "border-[rgba(102,102,102,0.2)] bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className={`text-xs font-semibold ${isActive ? "text-primary" : "text-[#32343C]"}`}>
                          {t("deal")} {i + 1} · {c.months} {c.months === 1 ? t("month") : t("months")}
                        </p>
                        <p className="text-xs text-[#969696]">
                          {t("advance")}: {formatPrice(parsePriceNum(c.securityDeposit))}
                        </p>
                      </div>
                      <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-[#32343C]"}`}>
                        {formatPrice(parsePriceNum(c.rentPrice))}
                        <span className="text-xs font-normal text-[#969696]">/mo</span>
                      </p>
                    </div>
                  );
                })}
              </div>
              {stayDays === 0 && (
                <p className="text-xs text-[#969696]">{t("selectDatesToSeeContract")}</p>
              )}
            </div>
          )}

          {/* Price summary */}
          {matchedContract && stayDays > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#32343C]">{t("yourPriceSummary")}</p>
              <div className="flex flex-col gap-2">
                {/* Daily rate */}
                <div className="flex items-center justify-between rounded-[4px] bg-[#F7FAFE] px-2.5 py-1.5">
                  <p className="text-xs font-medium text-[#545454]">{t("dailyRate")}</p>
                  <p className="text-xs font-semibold text-primary">{formatPrice(dailyRate)}{t("perDay")}</p>
                </div>
                {/* Full months */}
                {fullMonths > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#32343C]">
                      {fullMonths} {fullMonths === 1 ? t("month") : t("months")} × {formatPrice(rentalAmount)}
                    </p>
                    <p className="text-xs font-semibold text-[#32343C]">{formatPrice(fullMonths * rentalAmount)}</p>
                  </div>
                )}
                {/* Partial month */}
                {remainderDays > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#32343C]">
                      {remainderDays} {remainderDays === 1 ? t("day") : t("days")} × {formatPrice(dailyRate)}
                    </p>
                    <p className="text-xs font-semibold text-[#32343C]">{formatPrice(partialMonthCost)}</p>
                  </div>
                )}
                {/* Security deposit */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#32343C]">{t("securityAmount")}</p>
                    <p className="text-xs font-semibold text-[#32343C]">{formatPrice(securityAmount)}</p>
                  </div>
                  <p className="text-xs text-[#969696]">{t("securityNote")}</p>
                </div>
                {/* Total contract value */}
                <div className="border-t border-[rgba(102,102,102,0.2)] pt-2 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#969696]">{t("totalContractValue")}</p>
                    <p className="text-xs font-semibold text-[#969696]">{formatPrice(totalContractValue)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#32343C]">{t("chargedToday")}</p>
                    <p className="text-base font-bold text-primary">{formatPrice(rentalAmount)}</p>
                  </div>
                  <p className="text-xs text-[#969696]">{t("chargedTodayNote")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right panel (form) */}
        <div className="flex min-w-0 flex-1 flex-col gap-8">

          {/* Signed-in banner */}
          {user && (
            <div className="flex items-center gap-3 rounded-[8px] bg-[#F5F5F5] px-4 py-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? ""}
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[#32343C]">{t("youAreSignedIn")}</p>
                <p className="text-xs text-[#969696]">{user.email}</p>
              </div>
            </div>
          )}

          {/* ── Section 1: Personal Information ─────────────────────────── */}
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold text-[#32343C]">{t("sectionPersonal")}</h2>
              <div className="mt-1 h-px bg-[rgba(102,102,102,0.15)]" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                label={t("fullName")}
                value={form.fullName}
                onChange={(v) => set("fullName", v)}
                placeholder={t("fullNamePlaceholder")}
                required
                error={errors.fullName}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#32343C]">
                  {t("currentCountry")}<span className="ml-0.5 text-[#EE1D52]">*</span>
                </label>
                <select
                  value={form.currentCountry}
                  onChange={(e) => set("currentCountry", e.target.value)}
                  className={`h-11 w-full rounded-[6px] border px-3 text-sm focus:border-primary focus:outline-none transition-colors ${
                    errors.currentCountry ? "border-[#EE1D52]" : "border-[rgba(102,102,102,0.35)]"
                  } ${!form.currentCountry ? "text-[rgba(102,102,102,0.6)]" : "text-[#32343C]"}`}
                >
                  <option value="">{t("currentCountryPlaceholder")}</option>
                  {ALL_COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.currentCountry && <p className="text-xs text-[#EE1D52]">{errors.currentCountry}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#32343C]">
                  {t("nationality")}<span className="ml-0.5 text-[#EE1D52]">*</span>
                </label>
                <select
                  value={form.nationality}
                  onChange={(e) => set("nationality", e.target.value)}
                  className={`h-11 w-full rounded-[6px] border px-3 text-sm focus:border-primary focus:outline-none transition-colors ${
                    errors.nationality ? "border-[#EE1D52]" : "border-[rgba(102,102,102,0.35)]"
                  } ${!form.nationality ? "text-[rgba(102,102,102,0.6)]" : "text-[#32343C]"}`}
                >
                  <option value="">{t("nationalityPlaceholder")}</option>
                  {ALL_COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.nationality && <p className="text-xs text-[#EE1D52]">{errors.nationality}</p>}
              </div>
              <FormInput
                label={t("occupation")}
                value={form.occupation}
                onChange={(v) => set("occupation", v)}
                placeholder={t("occupationPlaceholder")}
                required
                error={errors.occupation}
              />
              <FormInput
                label={t("designation")}
                value={form.designation}
                onChange={(v) => set("designation", v)}
                placeholder={t("designationPlaceholder")}
                required
                error={errors.designation}
              />
            </div>
          </section>

          {/* ── Section 2: Stay Details ──────────────────────────────────── */}
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold text-[#32343C]">{t("sectionStay")}</h2>
              <div className="mt-1 h-px bg-[rgba(102,102,102,0.15)]" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Move In / Move Out */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#32343C]">
                  {t("moveInMoveOut")}
                  <span className="ml-0.5 text-[#EE1D52]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className={`relative flex h-11 flex-1 items-center overflow-hidden rounded-[6px] border px-3 transition-colors ${
                      errors.moveInDate ? "border-[#EE1D52]" : "border-[rgba(102,102,102,0.35)]"
                    }`}
                  >
                    <Image
                      src="/images/icons/global/calender.png"
                      alt=""
                      width={16}
                      height={16}
                      className="mr-2 shrink-0 opacity-50"
                    />
                    <input
                      type="date"
                      value={form.moveInDate}
                      onChange={(e) => set("moveInDate", e.target.value)}
                      className="w-full bg-transparent text-sm text-[#32343C] focus:outline-none"
                    />
                  </div>
                  <span className="shrink-0 text-sm text-[#969696]">—</span>
                  <div
                    className={`relative flex h-11 flex-1 items-center overflow-hidden rounded-[6px] border px-3 transition-colors ${
                      errors.moveOutDate ? "border-[#EE1D52]" : "border-[rgba(102,102,102,0.35)]"
                    }`}
                  >
                    <input
                      type="date"
                      value={form.moveOutDate}
                      onChange={(e) => set("moveOutDate", e.target.value)}
                      min={form.moveInDate || undefined}
                      className="w-full bg-transparent text-sm text-[#32343C] focus:outline-none"
                    />
                  </div>
                </div>
                {(errors.moveInDate || errors.moveOutDate) && (
                  <p className="text-xs text-[#EE1D52]">{errors.moveInDate ?? errors.moveOutDate}</p>
                )}
              </div>

              {/* Arrival Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#32343C]">
                  {t("arrivalTime")}
                  <span className="ml-0.5 text-[#EE1D52]">*</span>
                </label>
                <div
                  className={`relative flex h-11 items-center overflow-hidden rounded-[6px] border px-3 transition-colors ${
                    errors.arrivalTime ? "border-[#EE1D52]" : "border-[rgba(102,102,102,0.35)]"
                  }`}
                >
                  <Image
                    src="/images/icons/global/clock.png"
                    alt=""
                    width={16}
                    height={16}
                    className="mr-2 shrink-0 opacity-50"
                  />
                  <select
                    value={form.arrivalTime}
                    onChange={(e) => set("arrivalTime", e.target.value)}
                    className={`w-full appearance-none bg-transparent text-sm focus:outline-none ${!form.arrivalTime ? "text-[rgba(102,102,102,0.6)]" : "text-[#32343C]"}`}
                  >
                    <option value="">{t("selectArrivalTime")}</option>
                    {ARRIVAL_TIMES.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <Image
                    src="/images/icons/chevron-down.png"
                    alt=""
                    width={12}
                    height={12}
                    className="pointer-events-none ml-2 shrink-0 opacity-50"
                  />
                </div>
                {errors.arrivalTime && <p className="text-xs text-[#EE1D52]">{errors.arrivalTime}</p>}
              </div>
            </div>
          </section>

          {/* ── Section 3: Preferences ───────────────────────────────────── */}
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold text-[#32343C]">{t("sectionPreferences")}</h2>
              <div className="mt-1 h-px bg-[rgba(102,102,102,0.15)]" />
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <RadioGroup
                label={t("guestsStaying")}
                options={GUESTS_OPTIONS.map((o) => ({ value: o.value, label: t(`guests.${o.value.replace("+", "plus").replace("-", "_")}`) }))}
                value={form.guestsStaying}
                onChange={(v) => set("guestsStaying", v)}
                required
                error={errors.guestsStaying}
              />
              <RadioGroup
                label={t("primaryReason")}
                options={REASON_OPTIONS.map((o) => ({ value: o.value, label: t(`reasons.${o.value}`) }))}
                value={form.primaryReason}
                onChange={(v) => set("primaryReason", v)}
                required
                error={errors.primaryReason}
              />
            </div>
            <RadioGroup
              label={t("visaType")}
              options={VISA_OPTIONS.map((o) => ({ value: o.value, label: t(`visas.${o.value}`) }))}
              value={form.visaType}
              onChange={(v) => set("visaType", v)}
              inline
              required
              error={errors.visaType}
            />
          </section>

          {/* ── Section 4: Special Requests ─────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#32343C]">{t("specialRequests")}</h2>
              <div className="mt-1 h-px bg-[rgba(102,102,102,0.15)]" />
            </div>
            <p className="text-sm text-[#969696]">{t("specialRequestsNote")}</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#32343C]">
                {t("specialRequestsLabel")}
                <span className="ml-1 text-xs font-normal text-[#969696]">({t("optional")})</span>
              </label>
              <textarea
                value={form.specialRequests}
                onChange={(e) => set("specialRequests", e.target.value)}
                rows={5}
                className="w-full resize-y rounded-[6px] border border-[rgba(102,102,102,0.35)] px-3 py-2.5 text-sm text-[#32343C] placeholder:text-[rgba(102,102,102,0.6)] focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-[rgba(102,102,102,0.15)] pt-5">
            {submitError && (
              <p className="text-sm text-[#EE1D52]">{submitError}</p>
            )}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="rounded-[8px] bg-[#EE1D52] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-[8px] bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? t("sending") : t("sendBookingRequest")}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
