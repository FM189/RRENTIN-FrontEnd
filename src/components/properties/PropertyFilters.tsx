"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface PropertyFiltersProps {
  viewMode: "grid" | "map";
  onViewModeChange: (mode: "grid" | "map") => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  typeValue: string;
  onTypeChange: (value: string) => void;
}

const SELECT_BASE =
  "h-10 shrink-0 cursor-pointer appearance-none rounded-[4px] bg-white pl-5 pr-9 text-[14px] leading-4 tracking-[0.05em] focus:outline-none";

const SELECT_STYLE = {
  border: "1px solid rgba(220, 220, 220, 0.3)",
  boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.06)",
  backgroundImage: "url('/images/icons/dashboard/property/chevron-down.png')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "calc(100% - 10px) center",
  backgroundSize: "11px 6px",
};

export default function PropertyFilters({
  viewMode,
  onViewModeChange,
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  typeValue,
  onTypeChange,
}: PropertyFiltersProps) {
  const t = useTranslations("Dashboard.properties");
  const tTypes = useTranslations("Dashboard.properties.addPropertyPage.propertyTypes");

  return (
    <div>
      {/* Filter Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-7">
        {/* Left: Icon + Title */}
        <div className="flex shrink-0 items-center gap-2.5">
          <div
            className="flex h-7.5 w-8 shrink-0 items-center justify-center rounded-[3px]"
            style={{
              background: "#F7FAFE",
              border: "0.2px solid rgba(53, 130, 231, 0.02)",
            }}
          >
            <Image
              src="/images/icons/dashboard/property/properties-2.png"
              alt=""
              width={16}
              height={20}
            />
          </div>
          <span className="whitespace-nowrap text-[14px] font-semibold leading-4 tracking-[0.05em] text-heading">
            {t("myProperties")}
          </span>
        </div>

        {/* Center: Search + Status + Type */}
        <div className="flex flex-wrap items-center gap-3 lg:gap-6">
          {/* Search Input */}
          <div
            className="flex h-10 w-full items-center gap-2.5 rounded-[4px] bg-white px-[18px] sm:w-[440px]"
            style={{
              border: "1px solid rgba(220, 220, 220, 0.3)",
              boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.06)",
            }}
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
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchProperties")}
              className="w-full border-none bg-transparent text-[14px] leading-4 tracking-[0.05em] text-text shadow-none placeholder:text-[rgba(150,150,150,0.7)] focus:ring-0 focus:[outline:none] focus-visible:[outline:none]"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            className={`${SELECT_BASE} text-[#969696]`}
            style={SELECT_STYLE}
          >
            <option value="">{t("allStatuses")}</option>
            <option value="available">{t("statusAvailable")}</option>
            <option value="rented">{t("statusRented")}</option>
            <option value="unavailable">{t("statusUnavailable")}</option>
          </select>

          {/* Type Dropdown */}
          <select
            value={typeValue}
            onChange={(e) => onTypeChange(e.target.value)}
            className={`${SELECT_BASE} text-[#969696]`}
            style={SELECT_STYLE}
          >
            <option value="">{t("allTypes")}</option>
            <option value="house">{tTypes("house")}</option>
            <option value="villa">{tTypes("villa")}</option>
            <option value="condo">{tTypes("condo")}</option>
            <option value="apartment">{tTypes("apartment")}</option>
            <option value="townhouse">{tTypes("townhouse")}</option>
            <option value="retail_space">{tTypes("retail_space")}</option>
            <option value="office">{tTypes("office")}</option>
          </select>
        </div>

        {/* Right: View Toggle */}
        <div className="flex shrink-0 items-center gap-3.5">
          <button
            type="button"
            onClick={() => onViewModeChange("map")}
            className={`flex h-7.5 items-center gap-1.5 rounded-[4px] px-2 ${
              viewMode === "map"
                ? "bg-primary"
                : "bg-[rgba(124,132,141,0.7)]"
            }`}
          >
            <Image
              src="/images/icons/dashboard/property/map-view.png"
              alt=""
              width={12}
              height={11}
              className="shrink-0"
            />
            <span className="whitespace-nowrap text-xs font-medium leading-3.5 tracking-[0.18px] text-white">
              {t("mapView")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`flex h-7.5 items-center gap-1.5 rounded-[4px] px-2 ${
              viewMode === "grid"
                ? "bg-primary"
                : "bg-[rgba(124,132,141,0.7)]"
            }`}
          >
            <Image
              src="/images/icons/dashboard/property/grid-view.png"
              alt=""
              width={10}
              height={8}
              className="shrink-0"
            />
            <span className="whitespace-nowrap text-xs font-medium leading-3.5 tracking-[0.18px] text-white">
              {t("gridView")}
            </span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mt-3.5"
        style={{ borderBottom: "0.6px solid rgba(57, 93, 140, 0.4)" }}
      />
    </div>
  );
}
