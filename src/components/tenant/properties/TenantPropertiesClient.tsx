"use client";

import { useState, useEffect, useTransition } from "react";
import TenantPropertiesHeader, { type ViewMode } from "./TenantPropertiesHeader";
import TenantPropertiesSection from "./TenantPropertiesSection";
import TenantPropertyMapView from "./TenantPropertyMapView";
import TenantPropertyDrawer from "./TenantPropertyDrawer";
import type { SortOption } from "@/types/tenant-properties";
import type {
  TenantFilterOptions,
  TenantPropertiesResult,
  TenantPropertyMapItem,
} from "@/actions/tenant-properties";
import { getTenantPropertiesMap } from "@/actions/tenant-properties";

const TENANT_PROPERTIES_PER_PAGE = 9;

interface TenantPropertiesClientProps {
  filterOptions: TenantFilterOptions;
  propertiesResult: TenantPropertiesResult;
  currentSearch: string;
  currentType: string;
  currentPriceRange: string;
  currentLocation: string;
  currentSort: SortOption | string;
}

export default function TenantPropertiesClient({
  filterOptions,
  propertiesResult,
  currentSearch,
  currentType,
  currentPriceRange,
  currentLocation,
  currentSort,
}: TenantPropertiesClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mapProperties, setMapProperties] = useState<TenantPropertyMapItem[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Fetch map data when map view is activated or filters change
  useEffect(() => {
    if (viewMode !== "map") return;

    setMapLoading(true);
    startTransition(async () => {
      const data = await getTenantPropertiesMap({
        search: currentSearch,
        type: currentType,
        priceRange: currentPriceRange,
        location: currentLocation,
      });
      setMapProperties(data);
      setMapLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, currentSearch, currentType, currentPriceRange, currentLocation]);

  return (
    <>
      <TenantPropertiesHeader
        filterOptions={filterOptions}
        currentSearch={currentSearch}
        currentType={currentType}
        currentPriceRange={currentPriceRange}
        currentLocation={currentLocation}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "list" ? (
        <TenantPropertiesSection
          propertiesResult={propertiesResult}
          currentSort={currentSort}
          perPage={TENANT_PROPERTIES_PER_PAGE}
          onCardClick={setSelectedPropertyId}
        />
      ) : (
        <div
          className="rounded-lg bg-white p-5"
          style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
        >
          <TenantPropertyMapView
            properties={mapProperties}
            isLoading={mapLoading}
          />
        </div>
      )}

      <TenantPropertyDrawer
        propertyId={selectedPropertyId}
        onClose={() => setSelectedPropertyId(null)}
      />
    </>
  );
}
