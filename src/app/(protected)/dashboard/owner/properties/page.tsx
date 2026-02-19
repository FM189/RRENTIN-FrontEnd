"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import StatsCards from "@/components/properties/StatsCards";
import PropertyFilters from "@/components/properties/PropertyFilters";
import PropertyGrid from "@/components/properties/PropertyGrid";

export default function OwnerPropertiesPage() {
  const t = useTranslations("Dashboard.properties");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <button
            type="button"
            className="flex h-7.5 items-center gap-1.5 rounded-[4px] bg-primary px-2 text-white transition-colors hover:bg-primary-hover"
          >
            <Image
              src="/images/icons/dashboard/property/view.png"
              alt=""
              width={16}
              height={14}
              className="h-3.5 w-4 shrink-0"
            />
            <span className="whitespace-nowrap text-xs font-medium leading-3.5 tracking-[0.18px]">
              {t("viewsAndInterestedTenants")}
            </span>
          </button>
          <Link
            href="/dashboard/owner/properties/add"
            className="flex h-7.5 items-center gap-1.5 rounded-[4px] bg-primary px-2 text-white transition-colors hover:bg-primary-hover"
          >
            <Image
              src="/images/icons/dashboard/property/add.png"
              alt=""
              width={10}
              height={12}
              className="h-3 w-2.5 shrink-0"
            />
            <span className="whitespace-nowrap text-xs font-medium leading-3.5 tracking-[0.18px]">
              {t("addProperty")}
            </span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* My Properties Section */}
      <div
        className="rounded-xl bg-white p-5"
        style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
      >
        <PropertyFilters viewMode={viewMode} onViewModeChange={setViewMode} />
        <div
          className="mt-6 overflow-y-auto"
          style={{
            maxHeight: "690px",
            scrollbarWidth: "thin",
            scrollbarColor: "#0245A5 rgba(214, 227, 244, 0.8)",
          }}
        >
          <PropertyGrid />
        </div>
      </div>
    </div>
  );
}
