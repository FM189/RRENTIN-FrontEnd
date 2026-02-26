"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import OwnerVisitRequestCard from "./OwnerVisitRequestCard";
import Pagination from "@/components/ui/Pagination";
import type { VisitRequestSummary } from "@/actions/visit-requests";

const STATUS_FILTERS = [
  "all",
  "payment_confirmed",
  "accepted",
  "completed",
  "cancelled",
] as const;

interface Props {
  requests:   VisitRequestSummary[];
  total:      number;
  totalPages: number;
  page:       number;
  status:     string;
}

export default function OwnerVisitRequestsClient({
  requests, total, totalPages, page, status,
}: Props) {
  const t      = useTranslations("Dashboard.ownerVisitRequests");
  const router = useRouter();
  const [, setRefreshKey] = useState(0);

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      all:               t("statusAll"),
      payment_confirmed: t("statusPaymentConfirmed"),
      accepted:          t("statusAccepted"),
      completed:         t("statusCompleted"),
      cancelled:         t("statusCancelled"),
    };
    return map[s] ?? s;
  };

  const navigate = (newPage: number, newStatus: string) => {
    const params = new URLSearchParams();
    if (newStatus !== "all") params.set("status", newStatus);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/dashboard/owner/visit-requests${params.toString() ? `?${params}` : ""}`);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => navigate(1, s)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              status === s
                ? "bg-[#0245A5] text-white"
                : "bg-white text-[#969696] hover:bg-[#E8F2FF] hover:text-[#0245A5]"
            }`}
            style={status !== s ? { boxShadow: "0px 1px 4px rgba(53,130,231,0.12)" } : undefined}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>

      {/* Results count */}
      {total > 0 && (
        <p className="text-xs text-[#969696]">
          {total} request{total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Cards */}
      {requests.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-[10px] bg-white py-16 text-center"
          style={{ boxShadow: "0px 2px 12px rgba(53,130,231,0.1)" }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F2FF]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#5390E0]">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-[#32343C]">{t("noRequests")}</p>
            <p className="mt-1 text-sm text-[#969696]">{t("noRequestsDesc")}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <OwnerVisitRequestCard key={req.id} request={req} onRefresh={handleRefresh} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center pt-2">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => navigate(p, status)}
        />
      </div>
    </div>
  );
}
