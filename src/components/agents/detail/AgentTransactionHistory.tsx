"use client";

import { useTranslations } from "next-intl";

type TxStatus = "pending" | "paid" | "rejected";

interface Transaction {
  id: string;
  invoiceId: string;
  date: string;
  amount: string;
  status: TxStatus;
  slipUrl: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", invoiceId: "Invoice#1232", date: "23-Jan-2025", amount: "$454", status: "pending",  slipUrl: "#" },
  { id: "2", invoiceId: "Invoice#1232", date: "23-Jan-2025", amount: "$454", status: "rejected", slipUrl: "#" },
  { id: "3", invoiceId: "Invoice#1232", date: "23-Jan-2025", amount: "$454", status: "paid",     slipUrl: "#" },
  { id: "4", invoiceId: "Invoice#1232", date: "23-Jan-2025", amount: "$454", status: "pending",  slipUrl: "#" },
  { id: "5", invoiceId: "Invoice#1232", date: "23-Jan-2025", amount: "$454", status: "paid",     slipUrl: "#" },
];

const STATUS_CONFIG: Record<TxStatus, { color: string; bg?: string; key: string }> = {
  pending:  { color: "#FF9500", key: "statusPending" },
  rejected: { color: "#E35454", key: "statusRejected" },
  paid:     { color: "#39DA4C", bg: "rgba(52,233,73,0.10)", key: "statusPaid" },
};

function StatusLabel({ status, label }: { status: TxStatus; label: string }) {
  const cfg = STATUS_CONFIG[status];
  if (cfg.bg) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-[4px] px-[10px] py-[3px] text-[14px] font-semibold leading-[16px]"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {label}
      </span>
    );
  }
  return (
    <span className="text-[14px] font-semibold leading-[16px]" style={{ color: cfg.color }}>
      {label}
    </span>
  );
}

export default function AgentTransactionHistory() {
  const t = useTranslations("Dashboard.agents.detailPage");

  return (
    <div
      className="rounded-[14px] bg-white px-[25px] py-[20px]"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* Title */}
      <h2 className="mb-[18px] text-[18px] font-semibold leading-[21px] tracking-[0.05em] text-[#32343C]">
        {t("transactionHistory")}
      </h2>

      {/* ══════════════════════════════════════════
          MOBILE layout — stacked cards  (< lg)
          ══════════════════════════════════════════ */}
      <div className="flex flex-col gap-[12px] lg:hidden">
        {MOCK_TRANSACTIONS.map((tx) => {
          const cfg = STATUS_CONFIG[tx.status];
          return (
            <div
              key={tx.id}
              className="flex flex-col gap-[10px] rounded-[8px] border border-dashed border-[rgba(57,93,140,0.3)] p-[14px]"
            >
              {/* Invoice ID + View link */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold leading-[18px] text-[#32343C]">
                  {tx.invoiceId}
                </span>
                <a
                  href={tx.slipUrl}
                  className="text-[14px] font-semibold leading-[16px] text-[#0245A5] underline"
                >
                  {t("view")}
                </a>
              </div>

              {/* Date + Amount + Status */}
              <div className="grid grid-cols-3 gap-[8px] border-t border-dashed border-[rgba(57,93,140,0.3)] pt-[10px]">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[11px] font-semibold text-[#969696]">{t("colDate")}</span>
                  <span className="text-[13px] font-semibold text-[#32343C]">{tx.date}</span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[11px] font-semibold text-[#969696]">{t("colAmount")}</span>
                  <span className="text-[13px] font-bold text-[#32343C]">{tx.amount}</span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[11px] font-semibold text-[#969696]">{t("colPaymentStatus")}</span>
                  <StatusLabel
                    status={tx.status}
                    label={t(cfg.key as Parameters<typeof t>[0])}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP layout — table  (lg+)
          ══════════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* Column headers */}
        <div className="flex items-center gap-[16px] pb-[0px]">
          {/* Invoice ID — blue + underline indicator */}
          <div className="min-w-0 flex-1">
            <div className="inline-block">
              <span className="text-[14px] font-semibold leading-[16px] tracking-[0.05em] text-[#0245A5]">
                {t("colInvoiceId")}
              </span>
              <div className="mt-[6px]" style={{ height: "2px", background: "#0245A5", borderRadius: "2px" }} />
            </div>
          </div>
          {[t("colDate"), t("colAmount"), t("colPaymentStatus"), t("colSlip")].map((label) => (
            <span
              key={label}
              className="w-[130px] shrink-0 text-center text-[14px] font-semibold leading-[16px] tracking-[0.05em] text-[#969696]"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Header divider */}
        <div className="mt-[0px]" style={{ borderBottom: "1px solid rgba(57, 93, 140, 0.4)" }} />

        {/* Data rows */}
        {MOCK_TRANSACTIONS.map((tx, idx) => {
          const cfg = STATUS_CONFIG[tx.status];
          return (
            <div key={tx.id}>
              <div className="flex items-center gap-[16px] py-[16px]">
                {/* Invoice ID */}
                <span className="min-w-0 flex-1 text-[14px] font-normal leading-[16px] tracking-[0.05em] text-[#32343C]">
                  {tx.invoiceId}
                </span>

                {/* Date */}
                <span className="w-[130px] shrink-0 text-center text-[14px] font-normal leading-[16px] tracking-[0.05em] text-[#32343C]">
                  {tx.date}
                </span>

                {/* Amount */}
                <span className="w-[130px] shrink-0 text-center text-[14px] font-bold leading-[16px] tracking-[0.05em] text-[#32343C]">
                  {tx.amount}
                </span>

                {/* Payment Status */}
                <div className="flex w-[130px] shrink-0 justify-center">
                  <StatusLabel
                    status={tx.status}
                    label={t(cfg.key as Parameters<typeof t>[0])}
                  />
                </div>

                {/* Slip */}
                <div className="flex w-[130px] shrink-0 justify-center">
                  <a
                    href={tx.slipUrl}
                    className="text-[14px] font-semibold leading-[16px] tracking-[0.05em] text-[#0245A5] underline"
                  >
                    {t("view")}
                  </a>
                </div>
              </div>

              {/* Dashed row divider */}
              {idx < MOCK_TRANSACTIONS.length - 1 && (
                <div style={{ borderBottom: "1px dashed rgba(57, 93, 140, 0.4)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
