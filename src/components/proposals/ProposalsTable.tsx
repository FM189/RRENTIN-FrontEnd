"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Pagination from "@/components/ui/Pagination";
import VisitRequestDetailModal from "@/components/owner/visit-requests/VisitRequestDetailModal";
import TenantVisitRequestDetailModal from "@/components/tenant/visit-requests/TenantVisitRequestDetailModal";
import OwnerRentBookingDetailModal from "@/components/owner/rent-bookings/OwnerRentBookingDetailModal";
import TenantRentBookingDetailModal from "@/components/tenant/rent-bookings/TenantRentBookingDetailModal";
import type { VisitRequestSummary } from "@/actions/visit-requests";
import type { RentBookingSummary } from "@/actions/rent-booking";

// ─── Status config ────────────────────────────────────────────────────────────

const VISIT_STATUS: Record<string, { icon: string; labelKey: string; color: string }> = {
  payment_pending:   { icon: "⏳", labelKey: "statusPending",   color: "text-amber-600" },
  payment_confirmed: { icon: "⏳", labelKey: "statusPending",   color: "text-amber-600" },
  accepted:          { icon: "✅", labelKey: "statusAccepted",  color: "text-green-600" },
  completed:         { icon: "✅", labelKey: "statusCompleted", color: "text-green-600" },
  cancelled:         { icon: "❌", labelKey: "statusCancelled", color: "text-red-600"   },
};

const RENT_STATUS: Record<string, { labelKey: string; color: string }> = {
  pending:         { labelKey: "rentStatusPending",        color: "text-amber-600"  },
  accepted:        { labelKey: "rentStatusAccepted",       color: "text-green-600"  },
  rejected:        { labelKey: "rentStatusRejected",       color: "text-red-600"    },
  payment_pending: { labelKey: "rentStatusPaymentPending", color: "text-amber-600"  },
  active:          { labelKey: "rentStatusActive",         color: "text-blue-600"   },
  completed:       { labelKey: "rentStatusCompleted",      color: "text-green-700"  },
  cancelled:       { labelKey: "rentStatusCancelled",      color: "text-red-600"    },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  requests:     VisitRequestSummary[];
  rentBookings: RentBookingSummary[];
  total:        number;
  totalPages:   number;
  page:         number;
  role:         "owner" | "tenant";
  basePath:     string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProposalsTable({
  requests, rentBookings, total, totalPages, page, role, basePath,
}: Props) {
  const t      = useTranslations("Dashboard.ownerVisitRequests");
  const router = useRouter();

  const [visitDetailId,      setVisitDetailId]      = useState<string | null>(null);
  const [tenantVisitDetailId, setTenantVisitDetailId] = useState<string | null>(null);
  const [rentDetailId,       setRentDetailId]       = useState<string | null>(null);

  const navigate = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`);
  };

  const handleRefresh = () => {
    router.refresh();
    setVisitDetailId(null);
    setTenantVisitDetailId(null);
    setRentDetailId(null);
  };

  const formatDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  const partyLabel = (req: VisitRequestSummary) => {
    const name = req.partyName || "—";
    const roleLabel = req.partyRole === "tenant" ? t("labelTenant") : t("labelOwner");
    return { name, roleLabel };
  };

  // ── Merge + sort newest first ──────────────────────────────────────────────
  type MergedRow =
    | { kind: "visit"; data: VisitRequestSummary }
    | { kind: "rent";  data: RentBookingSummary  };

  const mergedRows: MergedRow[] = [
    ...requests.map((r): MergedRow     => ({ kind: "visit", data: r })),
    ...rentBookings.map((b): MergedRow => ({ kind: "rent",  data: b })),
  ].sort((a, b) =>
    new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
  );

  const hasRows = mergedRows.length > 0;

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
              {!hasRows ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#969696]">
                    {t("noRequests")}
                  </td>
                </tr>
              ) : (
                <>
                  {mergedRows.map((row) => {
                    if (row.kind === "visit") {
                      const req = row.data;
                      const s = VISIT_STATUS[req.status] ?? VISIT_STATUS.payment_pending;
                      const { name, roleLabel } = partyLabel(req);
                      return (
                        <tr
                          key={`visit-${req.id}`}
                          className="border-b border-dashed border-[#E0E0E0] transition-colors hover:bg-[#F7FAFE]"
                        >
                          <td className="px-6 py-4 font-mono text-xs text-[#32343C]">{req.id}</td>

                          <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                            {req.propertyTitle || "—"}
                          </td>

                          <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                            {t("typePropertyVisit")}
                          </td>

                          <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                            {name}{" "}
                            <span className="text-[#969696]">{roleLabel}</span>
                          </td>

                          <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                            {formatDate(req.createdAt)}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${s.color}`}>
                              <span>{s.icon}</span>
                              {t(s.labelKey)}
                            </span>
                          </td>

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

                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                role === "owner"
                                  ? setVisitDetailId(req.id)
                                  : setTenantVisitDetailId(req.id)
                              }
                              className="rounded-[4px] bg-[#0245A5] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#01357A]"
                            >
                              {t("view")}
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    // ── Rent booking row ──
                    const b = row.data;
                    const s = RENT_STATUS[b.status] ?? RENT_STATUS.pending;
                    return (
                      <tr
                        key={`rent-${b.id}`}
                        className="border-b border-dashed border-[#E0E0E0] transition-colors hover:bg-[#F7FAFE]"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-[#32343C]">{b.id}</td>

                        <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                          {b.propertyTitle || "—"}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                          {t("typeRentBooking")}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                          {b.partyName || "—"}{" "}
                          <span className="text-[#969696]">
                            {role === "owner" ? t("labelTenant") : t("labelOwner")}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-[#32343C]">
                          {formatDate(b.createdAt)}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className={`text-sm font-medium ${s.color}`}>
                            {t(s.labelKey)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          {(b.status === "active" || b.status === "completed") ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                              ✅ {t("paymentPaid")}
                            </span>
                          ) : b.status === "payment_pending" ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                              ⏳ {t("paymentPending")}
                            </span>
                          ) : (
                            <span className="text-sm text-[#969696]">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setRentDetailId(b.id)}
                            className="rounded-[4px] bg-[#0245A5] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#01357A]"
                          >
                            {t("view")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </>
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

      {/* Owner visit request modal */}
      {role === "owner" && visitDetailId && (
        <VisitRequestDetailModal
          requestId={visitDetailId}
          onClose={() => setVisitDetailId(null)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Tenant visit request modal */}
      {role === "tenant" && tenantVisitDetailId && (
        <TenantVisitRequestDetailModal
          requestId={tenantVisitDetailId}
          onClose={() => setTenantVisitDetailId(null)}
        />
      )}

      {/* Owner rent booking modal */}
      {role === "owner" && rentDetailId && (
        <OwnerRentBookingDetailModal
          bookingId={rentDetailId}
          onClose={() => setRentDetailId(null)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Tenant rent booking modal */}
      {role === "tenant" && rentDetailId && (
        <TenantRentBookingDetailModal
          bookingId={rentDetailId}
          onClose={() => setRentDetailId(null)}
          onRefresh={handleRefresh}
        />
      )}
    </>
  );
}
