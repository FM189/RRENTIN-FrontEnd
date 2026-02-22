"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import TenantPropertyCard from "./TenantPropertyCard";
import Pagination from "@/components/ui/Pagination";
import { SORT_OPTIONS } from "@/types/tenant-properties";
import type { SortOption } from "@/types/tenant-properties";
import type { TenantPropertiesResult } from "@/actions/tenant-properties";

interface TenantPropertiesSectionProps {
  propertiesResult: TenantPropertiesResult;
  currentSort: SortOption | string;
  perPage: number;
  onCardClick: (id: string) => void;
}

export default function TenantPropertiesSection({
  propertiesResult,
  currentSort,
  perPage,
  onCardClick,
}: TenantPropertiesSectionProps) {
  const t = useTranslations("Dashboard.tenantProperties");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pushParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortSelect = (value: SortOption) => {
    pushParam("sort", value);
    setSortOpen(false);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const { properties, total, totalPages, page } = propertiesResult;

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  return (
    <div
      className="rounded-lg bg-white px-6 py-5"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: icon + title + count */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/icons/dashboard/property/properties-2.png"
            alt=""
            width={24}
            height={24}
            className="shrink-0"
          />
          <div>
            <h3 className="text-base font-semibold leading-5 text-heading">
              {t("properties")}
            </h3>
            {total > 0 && (
              <p className="text-xs leading-4 text-[#969696]">
                {t("showing", { from, to, total })}
              </p>
            )}
          </div>
        </div>

        {/* Right: Sort button + dropdown */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen((prev) => !prev)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-white transition-colors"
            style={{ background: "#0245A5" }}
          >
            <Image
              src="/images/icons/dashboard/tenant-properties/sort.png"
              alt=""
              width={14}
              height={12}
              className="shrink-0"
            />
            <span className="text-sm font-medium leading-4">
              {t("sort")}
            </span>
            <Image
              src="/images/icons/dashboard/property/chevron-down.png"
              alt=""
              width={8}
              height={5}
              className={`shrink-0 transition-transform ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {sortOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg bg-white py-1"
              style={{ boxShadow: "0px 4px 16px rgba(53, 130, 231, 0.15)" }}
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSortSelect(option.value)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#F0F7FF] ${
                    currentSort === option.value
                      ? "font-semibold text-primary"
                      : "font-normal text-text"
                  }`}
                >
                  {t(option.labelKey as Parameters<typeof t>[0])}
                  {currentSort === option.value && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="mt-4 border-t border-[#F2F2F2]" />

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="mt-5">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-base font-semibold text-heading">{t("noProperties")}</p>
            <p className="mt-1 text-sm text-[#969696]">{t("noPropertiesDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {properties.map((property) => (
              <TenantPropertyCard key={property.id} property={property} onCardClick={onCardClick} />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-[#969696]">
            {t("showing", { from, to, total })}
          </span>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
