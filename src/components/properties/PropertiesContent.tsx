"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PropertyFilters from "./PropertyFilters";
import PropertyGrid from "./PropertyGrid";
import PropertyMapView from "./PropertyMapView";
import Pagination from "@/components/ui/Pagination";
import { getOwnerPropertiesMap } from "@/actions/properties";
import type { Property } from "./PropertyCard";
import type { PropertyMapItem } from "@/actions/properties";

interface PropertiesContentProps {
  properties: Property[];
  totalPages: number;
  currentPage: number;
  total: number;
  currentSearch: string;
  currentStatus: string;
  currentType: string;
}

export default function PropertiesContent({
  properties,
  totalPages,
  currentPage,
  total,
  currentSearch,
  currentStatus,
  currentType,
}: PropertiesContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [mapProperties, setMapProperties] = useState<PropertyMapItem[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep search input in sync if URL changes externally (e.g. browser back)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Debounce search → push to URL (resets to page 1)
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

  // Fetch map data whenever map view is active (or filters change while on map)
  useEffect(() => {
    if (viewMode !== "map") return;

    setMapLoading(true);
    startTransition(async () => {
      const data = await getOwnerPropertiesMap({
        search: currentSearch,
        status: currentStatus,
        type: currentType,
      });
      setMapProperties(data);
      setMapLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, currentSearch, currentStatus, currentType]);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className="rounded-xl bg-white p-5"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      <PropertyFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        statusValue={currentStatus}
        onStatusChange={handleStatusChange}
        typeValue={currentType}
        onTypeChange={handleTypeChange}
      />

      <div className="mt-6">
        {viewMode === "grid" ? (
          <PropertyGrid properties={properties} />
        ) : (
          <PropertyMapView properties={mapProperties} isLoading={mapLoading} />
        )}
      </div>

      {viewMode === "grid" && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[12px] text-[#969696]">{total} properties</span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
