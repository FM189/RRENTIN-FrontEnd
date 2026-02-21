import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import StatsCards from "@/components/properties/StatsCards";
import PropertiesContent from "@/components/properties/PropertiesContent";
import { getOwnerPropertyStats, getOwnerProperties } from "@/actions/properties";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function OwnerPropertiesPage({ searchParams }: PageProps) {
  const t = await getTranslations("Dashboard.properties");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search ?? "";
  const status = params.status ?? "";
  const type = params.type ?? "";

  const [stats, result] = await Promise.all([
    getOwnerPropertyStats(),
    getOwnerProperties({ page, search, status, type }),
  ]);

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
      <StatsCards stats={stats} />

      {/* My Properties Section */}
      <Suspense>
        <PropertiesContent
          properties={result.properties}
          totalPages={result.totalPages}
          currentPage={result.page}
          total={result.total}
          currentSearch={search}
          currentStatus={status}
          currentType={type}
        />
      </Suspense>
    </div>
  );
}
