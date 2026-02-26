import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getOwnerVisitRequests } from "@/actions/visit-requests";
import OwnerVisitRequestsClient from "@/components/owner/visit-requests/OwnerVisitRequestsClient";

export const metadata: Metadata = {
  title: "Visit Requests | Rrentin",
};

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function OwnerVisitRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t      = await getTranslations("Dashboard.ownerVisitRequests");

  const page   = Math.max(1, Number(params.page) || 1);
  const status = params.status ?? "all";

  const { requests, total, totalPages } = await getOwnerVisitRequests(
    page,
    status !== "all" ? status : undefined,
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-heading">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-[#969696]">{t("pageDescription")}</p>
      </div>

      <Suspense>
        <OwnerVisitRequestsClient
          requests={requests}
          total={total}
          totalPages={totalPages}
          page={page}
          status={status}
        />
      </Suspense>
    </div>
  );
}
