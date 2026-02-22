import { Suspense } from "react";
import type { Metadata } from "next";
import { getTenantFilterOptions, getTenantProperties } from "@/actions/tenant-properties";
import TenantPropertiesClient from "@/components/tenant/properties/TenantPropertiesClient";

export const metadata: Metadata = {
  title: "Discover Properties | Rrentin",
  description: "Browse and discover rental properties tailored for you.",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    priceRange?: string;
    location?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function TenantPropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search     = params.search     ?? "";
  const type       = params.type       ?? "";
  const priceRange = params.priceRange ?? "";
  const location   = params.location   ?? "";
  const sort       = params.sort       ?? "newest";
  const page       = Math.max(1, Number(params.page) || 1);

  const [filterOptions, propertiesResult] = await Promise.all([
    getTenantFilterOptions(),
    getTenantProperties({ page, search, type, priceRange, location, sort }),
  ]);

  return (
    <div className="space-y-6">
      <Suspense>
        <TenantPropertiesClient
          filterOptions={filterOptions}
          propertiesResult={propertiesResult}
          currentSearch={search}
          currentType={type}
          currentPriceRange={priceRange}
          currentLocation={location}
          currentSort={sort}
        />
      </Suspense>
    </div>
  );
}
