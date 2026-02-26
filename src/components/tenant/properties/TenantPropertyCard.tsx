"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import type { TenantPropertyListItem } from "@/actions/tenant-properties";

interface TenantPropertyCardProps {
  property: TenantPropertyListItem;
  onCardClick: (id: string) => void;
}

export default function TenantPropertyCard({ property, onCardClick }: TenantPropertyCardProps) {
  const t = useTranslations("Dashboard.tenantProperties");

  const typeLabel = property.type
    ? property.type.charAt(0).toUpperCase() + property.type.slice(1)
    : "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(property.id)}
      onKeyDown={(e) => e.key === "Enter" && onCardClick(property.id)}
      className="block w-full cursor-pointer overflow-hidden rounded-lg bg-white text-left"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* ── Image ──────────────────────────────────────────────────────────── */}
      <div className="relative h-[180px] bg-[#A3A3A3]">
        {property.image && (
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />

        {/* Type badge — top left */}
        {typeLabel && (
          <span className="absolute left-3 top-3 rounded-[3px] bg-white px-[6px] py-[2px] text-[12px] font-bold leading-[14px] text-[#0245A5]">
            {typeLabel}
          </span>
        )}

        {/* Bookmark — top right */}
        <button
          type="button"
          aria-label="Bookmark"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute right-3 top-3 flex h-[30px] w-[30px] items-center justify-center rounded-full"
          style={{ background: "#E9F2FF" }}
        >
          <Image
            src="/images/icons/dashboard/property/detail/bookmark.png"
            alt=""
            width={12}
            height={16}
            className="shrink-0"
          />
        </button>

        {/* Photo count — bottom right */}
        {property.photoCount > 0 && (
          <span
            className="absolute bottom-2.5 right-2.5 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-[14px] tracking-[0.05em] text-white"
            style={{ background: "rgba(50, 52, 60, 0.5)" }}
          >
            1/{property.photoCount}
          </span>
        )}
      </div>

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-5">
        {/* Location */}
        <p className="truncate text-sm leading-4 tracking-[0.05em] text-[#969696]">
          {[property.address, property.province].filter(Boolean).join(", ")}
        </p>

        {/* Prices + title */}
        <div className="flex flex-col gap-1.5">
          {/* Price row */}
          <div className="flex flex-wrap items-baseline justify-between gap-1">
            {property.propertyPrice && (
              <span className="text-lg font-semibold leading-[26px] tracking-[0.05em] text-[#32343C]">
                {formatPrice(property.propertyPrice)}
              </span>
            )}
            {property.minRentPrice > 0 && (
              <span className="text-base font-semibold leading-[23px] tracking-[0.05em] text-[#32343C]">
                {formatPrice(property.minRentPrice)}
                <span className="text-[11px] font-normal text-[#969696]">
                  {t("perMonth")}
                </span>
              </span>
            )}
          </div>
          {/* Title */}
          <p className="truncate text-sm leading-[21px] tracking-[0.05em] text-[#545454]">
            {property.title}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#D8D8D8]" />

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-3">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Image
                src="/images/icons/dashboard/tenant-properties/bed-white.png"
                alt=""
                width={18}
                height={14}
                className="shrink-0"
              />
              <span
                className="text-xs font-semibold leading-4 tracking-[0.05em]"
                style={{ color: "rgba(50, 52, 60, 0.8)" }}
              >
                {property.bedrooms} {t("beds")}
              </span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Image
                src="/images/icons/dashboard/tenant-properties/bath-white.png"
                alt=""
                width={16}
                height={14}
                className="shrink-0"
              />
              <span
                className="text-xs font-semibold leading-4 tracking-[0.05em]"
                style={{ color: "rgba(50, 52, 60, 0.8)" }}
              >
                {property.bathrooms} {t("baths")}
              </span>
            </div>
          )}
          {property.unitArea && (
            <div className="flex items-center gap-1.5">
              <Image
                src="/images/icons/dashboard/tenant-properties/area-white.png"
                alt=""
                width={14}
                height={14}
                className="shrink-0"
              />
              <span
                className="text-xs font-semibold leading-4 tracking-[0.05em]"
                style={{ color: "rgba(50, 52, 60, 0.8)" }}
              >
                {property.unitArea} {property.unitAreaUnit}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
