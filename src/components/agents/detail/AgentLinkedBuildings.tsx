"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

type PaymentStatus = "pending" | "paid" | "rejected";

interface LinkedProperty {
  id: string;
  image: string;
  name: string;
  address: string;
  pricePerMonth: string;
  monthlyRent: string;
  startEnd: string;
  role: string;
  commission: string;
  status: PaymentStatus;
}

const MOCK_PROPERTIES: LinkedProperty[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
    name: "Charming Homes in Thailand",
    address: "123 Sunset Road, Phuket, Thailand",
    pricePerMonth: "$243",
    monthlyRent: "$45,000",
    startEnd: "5-jan-24\n5-Feb-24",
    role: "Inspection",
    commission: "$250",
    status: "pending",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
    name: "Charming Homes in Thailand",
    address: "123 Sunset Road, Phuket, Thailand",
    pricePerMonth: "$243",
    monthlyRent: "$45,000",
    startEnd: "5-jan-24\n5-Feb-24",
    role: "Inspection",
    commission: "$250",
    status: "paid",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop",
    name: "Charming Homes in Thailand",
    address: "123 Sunset Road, Phuket, Thailand",
    pricePerMonth: "$243",
    monthlyRent: "$45,000",
    startEnd: "5-jan-24\n5-Feb-24",
    role: "Inspection",
    commission: "$250",
    status: "pending",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=250&fit=crop",
    name: "Charming Homes in Thailand",
    address: "123 Sunset Road, Phuket, Thailand",
    pricePerMonth: "$243",
    monthlyRent: "$45,000",
    startEnd: "5-jan-24\n5-Feb-24",
    role: "Inspection",
    commission: "$250",
    status: "rejected",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=250&fit=crop",
    name: "Charming Homes in Thailand",
    address: "123 Sunset Road, Phuket, Thailand",
    pricePerMonth: "$243",
    monthlyRent: "$45,000",
    startEnd: "5-jan-24\n5-Feb-24",
    role: "Inspection",
    commission: "$250",
    status: "pending",
  },
];

const STATUS_STYLES: Record<PaymentStatus, { bg: string; color: string; key: string }> = {
  pending:  { bg: "rgba(233,158,52,0.15)", color: "#FF9500",  key: "statusPending"  },
  paid:     { bg: "rgba(52,233,73,0.07)",  color: "#39DA4C",  key: "statusPaid"     },
  rejected: { bg: "rgba(227,84,84,0.13)",  color: "#E35454",  key: "statusRejected" },
};

function StatusBadge({ status, label }: { status: PaymentStatus; label: string }) {
  const st = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center justify-center rounded-[4px] px-[6px] py-[3px] text-[14px] font-semibold leading-[16px] tracking-[0.05em]"
      style={{ background: st.bg, color: st.color }}
    >
      {label}
    </span>
  );
}

const COL_CLASS = "w-[100px] shrink-0 text-center text-[14px] font-semibold leading-[16px] tracking-[0.05em] text-[#32343C]";

export default function AgentLinkedBuildings() {
  const t = useTranslations("Dashboard.agents.detailPage");

  return (
    <div
      className="rounded-[14px] bg-white px-[25px] py-[14px]"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* Header: icon + title */}
      <div className="mb-[20px] flex items-center gap-[10px]">
        <div
          className="flex h-[30px] w-[32px] shrink-0 items-center justify-center rounded-[3px]"
          style={{ background: "#F7FAFE", border: "0.2px solid rgba(53, 130, 231, 0.02)" }}
        >
          <Image src="/images/icons/dashboard/property/properties-2.png" alt="" width={14} height={18} />
        </div>
        <span className="text-[14px] font-semibold leading-[16px] tracking-[0.05em] text-[#32343C]">
          {t("linkedPropertiesTitle")}
        </span>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE layout — stacked cards  (< md)
          ══════════════════════════════════════════ */}
      <div className="flex flex-col gap-[14px] lg:hidden">
        {MOCK_PROPERTIES.map((prop) => {
          const st = STATUS_STYLES[prop.status];
          return (
            <div
              key={prop.id}
              className="overflow-hidden rounded-[8px] border border-[rgba(57,93,140,0.15)]"
            >
              {/* Property image */}
              <div className="relative h-[160px] w-full bg-[#ECECEC]">
                <Image src={prop.image} alt={prop.name} fill className="object-cover" />
                {/* Badge */}
                <div
                  className="absolute left-0 top-0 px-[4px] py-[3px]"
                  style={{ background: "#FFFFFF", backdropFilter: "blur(16px)", borderRadius: "0 0 4px 0" }}
                >
                  <span className="text-[8px] font-semibold leading-[9px] tracking-[0.05em] text-[#FDAC3B]">
                    {t("mostDemanding")}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-[10px] p-[14px]">
                {/* Name + address + price */}
                <div className="flex items-start justify-between gap-[8px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[15px] font-medium leading-[18px] tracking-[0.05em] text-[#32343C]">
                      {prop.name}
                    </span>
                    <span className="text-[12px] font-normal leading-[14px] tracking-[0.05em] text-[#969696]">
                      {prop.address}
                    </span>
                    <div className="flex items-baseline gap-[2px]">
                      <span className="text-[15px] font-semibold leading-[18px] tracking-[0.05em] text-[#32343C]">
                        {prop.pricePerMonth}
                      </span>
                      <span className="text-[10px] text-[#32343C]">{t("perMonth")}</span>
                    </div>
                  </div>
                  <StatusBadge status={prop.status} label={t(st.key as Parameters<typeof t>[0])} />
                </div>

                {/* Data grid: 2×2 */}
                <div className="grid grid-cols-2 gap-[8px] border-t border-[rgba(57,93,140,0.15)] pt-[10px]">
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[11px] font-semibold text-[#969696]">{t("colMonthlyRent")}</span>
                    <span className="text-[13px] font-semibold text-[#32343C]">{prop.monthlyRent}</span>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[11px] font-semibold text-[#969696]">{t("colStartEnd")}</span>
                    <span className="whitespace-pre-line text-[13px] font-semibold text-[#32343C]">{prop.startEnd}</span>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[11px] font-semibold text-[#969696]">{t("colRole")}</span>
                    <span className="text-[13px] font-semibold text-[#32343C]">{prop.role}</span>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[11px] font-semibold text-[#969696]">{t("colCommission")}</span>
                    <span className="text-[13px] font-semibold text-[#32343C]">{prop.commission}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP layout — table  (md+)
          ══════════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* Column headers */}
        <div className="flex items-center gap-[14px] pb-[10px]">
          <div className="min-w-0 flex-1">
            <span className="text-[14px] font-semibold leading-[16px] tracking-[0.05em] text-[#32343C]">
              {t("colProperties")}
            </span>
          </div>
          {[t("colMonthlyRent"), t("colStartEnd"), t("colRole"), t("colCommission"), t("colPaymentStatus")].map(
            (label) => (
              <span key={label} className={COL_CLASS}>
                {label}
              </span>
            )
          )}
        </div>

        {/* Header divider */}
        <div style={{ borderBottom: "1px solid rgba(57, 93, 140, 0.4)" }} />

        {/* Data rows */}
        {MOCK_PROPERTIES.map((prop, idx) => {
          const st = STATUS_STYLES[prop.status];
          return (
            <div key={prop.id}>
              <div className="flex items-center gap-[14px] py-[10px]">

                {/* Property cell */}
                <div className="flex min-w-0 flex-1 items-center gap-[14px]">
                  <div className="relative h-[100px] w-[182px] shrink-0 overflow-hidden rounded-[4px] bg-[#ECECEC]">
                    <Image src={prop.image} alt={prop.name} fill className="object-cover" />
                    <div
                      className="absolute left-0 top-0 px-[4px] py-[3px]"
                      style={{ background: "#FFFFFF", backdropFilter: "blur(16px)", borderRadius: "0 0 4px 0" }}
                    >
                      <span className="text-[8px] font-semibold leading-[9px] tracking-[0.05em] text-[#FDAC3B]">
                        {t("mostDemanding")}
                      </span>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col gap-[10px]">
                    <div className="flex flex-col gap-[8px]">
                      <span className="text-[16px] font-medium leading-[19px] tracking-[0.05em] text-[#32343C]">
                        {prop.name}
                      </span>
                      <span className="text-[12px] font-normal leading-[14px] tracking-[0.05em] text-[#969696]">
                        {prop.address}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-[2px]">
                      <span className="text-[16px] font-semibold leading-[19px] tracking-[0.05em] text-[#32343C]">
                        {prop.pricePerMonth}
                      </span>
                      <span className="text-[10px] text-[#32343C]">{t("perMonth")}</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Rent */}
                <span className={COL_CLASS}>{prop.monthlyRent}</span>

                {/* Start - End */}
                <span className={`${COL_CLASS} whitespace-pre-line`}>{prop.startEnd}</span>

                {/* Role */}
                <span className={COL_CLASS}>{prop.role}</span>

                {/* Commission */}
                <span className={COL_CLASS}>{prop.commission}</span>

                {/* Status */}
                <div className="flex w-[100px] shrink-0 justify-center">
                  <StatusBadge status={prop.status} label={t(st.key as Parameters<typeof t>[0])} />
                </div>
              </div>

              {/* Row divider */}
              {idx < MOCK_PROPERTIES.length - 1 && (
                <div style={{ borderBottom: "1px solid rgba(57, 93, 140, 0.4)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
