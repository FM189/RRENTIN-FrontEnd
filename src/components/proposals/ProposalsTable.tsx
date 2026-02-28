"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Pagination from "@/components/ui/Pagination";
import VisitRequestDetailModal from "@/components/owner/visit-requests/VisitRequestDetailModal";
import TenantVisitRequestDetailModal from "@/components/tenant/visit-requests/TenantVisitRequestDetailModal";
import type { VisitRequestSummary } from "@/actions/visit-requests";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { icon: string; labelKey: string; color: string }> = {
  payment_pending:   { icon: "⏳", labelKey: "statusPending",   color: "text-amber-600" },
  payment_confirmed: { icon: "⏳", labelKey: "statusPending",   color: "text-amber-600" },
  accepted:          { icon: "✅", labelKey: "statusAccepted",  color: "text-green-600" },
  completed:         { icon: "✅", labelKey: "statusCompleted", color: "text-green-600" },
  cancelled:         { icon: "❌", labelKey: "statusCancelled", color: "text-red-600"   },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  requests:   VisitRequestSummary[];
  total:      number;
  totalPages: number;
  page:       number;
  role:       "owner" | "tenant";
  basePath:   string;   // e.g. "/dashboard/owner/proposals"
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProposalsTable({
  requests, total, totalPages, page, role, basePath,
}: Props) {
  const t      = useTranslations("Dashboard.ownerVisitRequests");
  const router = useRouter();
  const [detailId,       setDetailId]       = useState<string | null>(null);
  const [tenantDetailId, setTenantDetailId] = useState<string | null>(null);

  const navigate = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`);
  };

  const handleRefresh = () => {
    router.refresh();
    setDetailId(null);
    setTenantDetailId(null);
  };

  const formatDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  const partyLabel = (req: VisitRequestSummary) => {
    const name = req.partyName || "—";
    const role = req.partyRole === "tenant" ? t("labelTenant") : t("labelOwner");
    return { name, role };
  };

  return (
    <>
      <div
        className="overflow-hidden rounded-[12px] bg-white"
        style={{ boxShadow: "0px 2px 12px rgba(53,130,231,0.1)" }}
      >
        {/* Title */}
        <div className="px-6 pb-3 pt-5">
          <h2 className="text-[18px] font-bold text-[#32343C]">{t("proposalSummary")}</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b-2 border-[#0245A5]">
                <th className="px-6 py-3 text-left text-sm font-bold text-[#0245A5] underline underline-offset-4">
                  {t("colProposalId")}
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#32343C]">{t("colProperty")}</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#32343C]">{t("colProposalType")}</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#32343C]">{t("colSentTo")}</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#32343C]">{t("colDateSent")}</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#32343C]">{t("colStatus")}</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#32343C]">{t("colPayment")}</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-[#32343C]">{t("colAction")}</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#969696]">
                    {t("noRequests")}
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const s           = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.payment_pending;
                  const date        = formatDate(req.createdAt);
                  const { name, role: roleLabel } = partyLabel(req);

                  return (
                    <tr
                      key={req.id}
                      className="border-b border-dashed border-[#E0E0E0] transition-colors hover:bg-[#F7FAFE]"
                    >
                      {/* Proposal ID — MongoDB ObjectId */}
                      <td className="px-6 py-4 font-mono text-xs text-[#32343C]">
                        {req.id}
                      </td>

                      {/* Property */}
                      <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                        {req.propertyTitle || "—"}
                      </td>

                      {/* Proposal Type */}
                      <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                        {t("typePropertyVisit")}
                      </td>

                      {/* Party */}
                      <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                        {name}{" "}
                        <span className="text-[#969696]">{roleLabel}</span>
                      </td>

                      {/* Date Sent */}
                      <td className="px-4 py-4 text-center text-sm text-[#32343C]">{date}</td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${s.color}`}>
                          <span>{s.icon}</span>
                          {t(s.labelKey)}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-4 text-center">
                        {req.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                            ✅ {t("paymentPaid")}
                          </span>
                        ) : req.paymentStatus === "refunded" ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-red-500">
                            ↩ {t("paymentRefunded")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                            ⏳ {t("paymentPending")}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => role === "owner" ? setDetailId(req.id) : setTenantDetailId(req.id)}
                          className="rounded-[4px] bg-[#0245A5] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#01357A]"
                        >
                          {t("view")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center py-5">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={navigate}
            />
          </div>
        )}
      </div>

      {/* Owner detail modal */}
      {role === "owner" && detailId && (
        <VisitRequestDetailModal
          requestId={detailId}
          onClose={() => setDetailId(null)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Tenant detail modal */}
      {role === "tenant" && tenantDetailId && (
        <TenantVisitRequestDetailModal
          requestId={tenantDetailId}
          onClose={() => setTenantDetailId(null)}
        />
      )}
    </>
  );
}
