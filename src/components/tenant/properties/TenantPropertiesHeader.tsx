"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { TenantFilterOptions } from "@/actions/tenant-properties";
import FilterDropdown from "@/components/ui/FilterDropdown";

export type ViewMode = "list" | "map";

interface TenantPropertiesHeaderProps {
  filterOptions: TenantFilterOptions;
  currentSearch: string;
  currentType: string;
  currentPriceRange: string;
  currentLocation: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

const SEARCH_BOX_STYLE: React.CSSProperties = {
  border: "1px solid #F2F2F2",
  boxShadow: "0px 0px 12px rgba(125, 182, 255, 0.1)",
};

export default function TenantPropertiesHeader({
  filterOptions,
  currentSearch,
  currentType,
  currentPriceRange,
  currentLocation,
  viewMode,
  onViewModeChange,
}: TenantPropertiesHeaderProps) {
  const t = useTranslations("Dashboard.tenantProperties");
  const tDash = useTranslations("Dashboard");
  const tTypes = useTranslations("Dashboard.properties.addPropertyPage.propertyTypes");

  const { user } = useCurrentUser();
  const firstName = user?.name?.split(" ")[0] ?? "";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const pushParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilter = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const knownTypes = ["house", "villa", "condo", "apartment", "townhouse", "retail_space", "office"] as const;
  type KnownType = typeof knownTypes[number];

  const getTypeLabel = (type: string): string => {
    if (knownTypes.includes(type as KnownType)) return tTypes(type as KnownType);
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const typeOptions = filterOptions.types.map((type) => ({
    value: type,
    label: getTypeLabel(type),
  }));

  const priceOptions = filterOptions.priceRanges.map((range) => ({
    value: range.value,
    label: range.label,
  }));

  const locationOptions = filterOptions.locations.map((loc) => ({
    value: loc,
    label: loc,
  }));

  const hasActiveFilters =
    !!currentSearch || !!currentType || !!currentPriceRange || !!currentLocation;

  return (
    <div
      className="flex w-full flex-col gap-3.5 rounded-lg bg-white px-6 py-3.5"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* ── Row 1: Welcome heading + List / Map toggle ─────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold leading-4 text-heading">
            {tDash("welcome", { name: firstName })}
          </p>
          <h2 className="text-xl font-semibold leading-[18px] text-heading">
            {t("discoverProperty")}
          </h2>
        </div>

        <div className="flex items-center rounded-lg">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`flex h-11 items-center gap-1.5 rounded-lg px-4 transition-all ${
              viewMode === "list"
                ? "bg-[#C3DDFF] shadow-[0px_0px_6px_rgba(53,130,231,0.1)]"
                : ""
            }`}
          >
            <Image
              src="/images/icons/dashboard/tenant-properties/list.png"
              alt=""
              width={12}
              height={12}
              className="shrink-0"
            />
            <span className="text-sm font-medium leading-4 tracking-[0.18px] text-heading">
              {t("list")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("map")}
            className={`flex h-11 items-center gap-1.5 rounded-lg px-4 transition-all ${
              viewMode === "map"
                ? "bg-[#C3DDFF] shadow-[0px_0px_6px_rgba(53,130,231,0.1)]"
                : ""
            }`}
          >
            <Image
              src="/images/icons/dashboard/tenant-properties/map-pin.png"
              alt=""
              width={10}
              height={12}
              className="shrink-0"
            />
            <span className="text-sm font-medium leading-4 tracking-[0.18px] text-heading">
              {t("map")}
            </span>
          </button>
        </div>
      </div>

      {/* ── Row 2: Search + Filters ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:gap-6">
        {/* Search input */}
        <div
          className="flex h-11 w-full shrink-0 items-center gap-2.5 rounded-lg bg-white px-5 lg:w-[420px]"
          style={SEARCH_BOX_STYLE}
        >
          <Image
            src="/images/icons/dashboard/property/search.png"
            alt=""
            width={14}
            height={14}
            className="shrink-0"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("locationPlaceholder")}
            className="w-full border-none bg-transparent text-sm leading-4 tracking-[0.05em] text-text shadow-none outline-none placeholder:text-[#969696] focus:ring-0 focus:outline-none"
          />
        </div>

        {/* Custom dropdowns + Clear Filter */}
        <div className="flex flex-1 flex-wrap items-center gap-3.5">
          <FilterDropdown
            value={currentType}
            placeholder={t("allTypes")}
            options={typeOptions}
            onChange={(v) => pushParam("type", v)}
          />

          <FilterDropdown
            value={currentPriceRange}
            placeholder={t("priceRange")}
            options={priceOptions}
            onChange={(v) => pushParam("priceRange", v)}
          />

          <FilterDropdown
            value={currentLocation}
            placeholder={t("location")}
            options={locationOptions}
            onChange={(v) => pushParam("location", v)}
          />

          {/* Clear Filter */}
          <button
            type="button"
            onClick={handleClearFilter}
            disabled={!hasActiveFilters}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-5 text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Image
              src="/images/icons/dashboard/tenant-properties/filter.png"
              alt=""
              width={19}
              height={16}
              className="shrink-0"
            />
            <span className="text-sm font-medium leading-4 tracking-[0.18px]">
              {t("clearFilter")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
