"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getRentPaymentHistory } from "@/actions/rent-booking";
import type { RentPaymentEntry } from "@/actions/rent-booking";
import { formatPrice } from "@/lib/format";

interface Props {
  bookingId: string;
  role:      "tenant" | "owner";
}

interface EntryGroup {
  stripeRef: string;
  date:      string;
  entries:   RentPaymentEntry[];
  total:     number;
}

function groupByStripeRef(entries: RentPaymentEntry[]): EntryGroup[] {
  const map = new Map<string, EntryGroup>();
  for (const entry of entries) {
    const key = entry.stripeRef || entry.id;
    if (!map.has(key)) {
      map.set(key, { stripeRef: key, date: entry.date, entries: [], total: 0 });
    }
    const group = map.get(key)!;
    group.entries.push(entry);
    group.total += entry.amount;
  }
  return Array.from(map.values());
}

export default function RentPaymentHistorySection({ bookingId, role }: Props) {
  const t = useTranslations("Dashboard.rentPaymentHistory");
  const [entries, setEntries] = useState<RentPaymentEntry[] | null>(null);

  useEffect(() => {
    getRentPaymentHistory(bookingId, role).then(setEntries);
  }, [bookingId, role]);

  if (entries === null) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0245A5] border-t-transparent" />
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const groups = groupByStripeRef(entries);
  const grandTotal = role === "owner"
    ? entries.filter(e => e.type === "owner_payout").reduce((sum, e) => sum + e.amount, 0)
    : entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="rounded-[6px] border border-[rgba(102,102,102,0.12)] p-4">
      <p className="mb-3 text-sm font-bold text-[#32343C]">{t("title")}</p>

      {entries.length === 0 ? (
        <p className="text-xs text-[#969696]">{t("noPayments")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group, gIdx) => {
            const borderClass = gIdx < groups.length - 1 ? "border-b border-[rgba(65,65,65,0.06)] pb-3 mb-1" : "";

            /* ── Owner: full deduction breakdown ── */
            if (role === "owner") {
              const payout     = group.entries.find(e => e.type === "owner_payout");
              const deductions = group.entries.filter(e => e.isDeduction);
              const gross      = (payout?.amount ?? 0) + deductions.reduce((s, e) => s + e.amount, 0);

              return (
                <div key={group.stripeRef} className={borderClass}>
                  <p className="mb-1.5 text-[11px] font-semibold text-[#545454]">{formatDate(group.date)}</p>

                  {deductions.length > 0 && (
                    <div className="rounded-[4px] border border-[rgba(65,65,65,0.08)] bg-[#FAFAFA] p-2">
                      {/* Gross income */}
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#969696]">{t("grossIncome")}</span>
                        <span className="font-medium text-[#32343C]">{formatPrice(gross)}</span>
                      </div>

                      {/* Deduction lines */}
                      {deductions.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between py-[3px] pl-2 text-xs">
                          <span className="text-[#969696]">{entry.description}</span>
                          <span className="font-medium text-[#E35454]">−{formatPrice(entry.amount)}</span>
                        </div>
                      ))}

                      {/* You received */}
                      <div className="mt-1.5 flex items-center justify-between border-t border-[rgba(65,65,65,0.08)] pt-1.5">
                        <span className="pl-2 text-[11px] font-semibold text-[#32343C]">{t("youReceived")}</span>
                        <span className="text-xs font-bold text-[#0245A5]">{formatPrice(payout?.amount ?? 0)}</span>
                      </div>
                    </div>
                  )}

                  {/* Fallback: no deductions stored (legacy / payout-only) */}
                  {deductions.length === 0 && payout && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#32343C]">{payout.description}</span>
                      <span className="font-semibold text-[#0245A5]">{formatPrice(payout.amount)}</span>
                    </div>
                  )}
                </div>
              );
            }

            /* ── Tenant: existing layout ── */
            const isMulti = group.entries.length > 1;
            return (
              <div
                key={group.stripeRef}
                className={`${isMulti ? "rounded-[4px] border border-[rgba(65,65,65,0.08)] bg-[#FAFAFA] p-2" : borderClass}`}
              >
                {!isMulti && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="w-[44%] font-medium text-[#32343C]">{group.entries[0].description}</span>
                    <span className="w-[28%] text-center text-[#969696]">{formatDate(group.date)}</span>
                    <span className="w-[28%] text-right font-semibold text-[#0245A5]">{formatPrice(group.total)}</span>
                  </div>
                )}

                {isMulti && (
                  <>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#545454]">{formatDate(group.date)}</span>
                    </div>
                    {group.entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between py-1 pl-2 text-xs">
                        <span className={`w-[60%] ${entry.type === "late_fee" ? "text-[#E35454]" : "text-[#32343C]"} font-medium`}>
                          {entry.description}
                        </span>
                        <span className={`w-[40%] text-right font-semibold ${entry.type === "late_fee" ? "text-[#E35454]" : "text-[#0245A5]"}`}>
                          {formatPrice(entry.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="mt-1.5 flex items-center justify-between border-t border-[rgba(65,65,65,0.08)] pt-1.5">
                      <span className="pl-2 text-[11px] font-semibold text-[#32343C]">{t("groupTotal")}</span>
                      <span className="text-xs font-bold text-[#0245A5]">{formatPrice(group.total)}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Grand total */}
          <div className="flex items-center justify-between border-t border-[rgba(65,65,65,0.1)] pt-2">
            <span className="text-xs font-bold text-[#32343C]">
              {role === "owner" ? t("totalReceived") : t("totalPaid")}
            </span>
            <span className="text-sm font-bold text-[#0245A5]">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
