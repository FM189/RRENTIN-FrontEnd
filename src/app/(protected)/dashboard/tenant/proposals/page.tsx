import type { Metadata } from "next";
import { Suspense } from "react";
import { getTenantVisitRequests } from "@/actions/visit-requests";
import { getTenantRentBookings } from "@/actions/rent-booking";
import ProposalsTable from "@/components/proposals/ProposalsTable";

export const metadata: Metadata = {
  title: "My Proposals | Rrentin",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TenantProposalsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = Math.max(1, Number(params.page) || 1);

  const [visitData, rentData] = await Promise.all([
    getTenantVisitRequests(page),
    getTenantRentBookings(page),
  ]);

  return (
    <Suspense>
      <ProposalsTable
        requests={visitData.requests}
        rentBookings={rentData.bookings}
        total={visitData.total}
        totalPages={visitData.totalPages}
        page={page}
        role="tenant"
        basePath="/dashboard/tenant/proposals"
      />
    </Suspense>
  );
}
