import type { Metadata } from "next";
import { Suspense } from "react";
import { getOwnerVisitRequests } from "@/actions/visit-requests";
import ProposalsTable from "@/components/proposals/ProposalsTable";

export const metadata: Metadata = {
  title: "Proposals | Rrentin",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OwnerProposalsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = Math.max(1, Number(params.page) || 1);

  const { requests, total, totalPages } = await getOwnerVisitRequests(page);

  return (
    <Suspense>
      <ProposalsTable
        requests={requests}
        total={total}
        totalPages={totalPages}
        page={page}
        role="owner"
        basePath="/dashboard/owner/proposals"
      />
    </Suspense>
  );
}
