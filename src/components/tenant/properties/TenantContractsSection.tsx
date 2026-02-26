"use client";

import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";

interface Contract {
  months: number;
  rentPrice: string;
  securityDeposit: string;
}

interface TenantContractsSectionProps {
  contracts: Contract[];
}

function parseRent(price: string): number {
  return parseFloat(price.replace(/,/g, "")) || 0;
}

function durationLabel(months: number, t: ReturnType<typeof useTranslations>) {
  if (months % 12 === 0 && months >= 12) {
    const yrs = months / 12;
    return `${yrs} ${yrs === 1 ? t("year") : t("years")}`;
  }
  return `${months} ${t("months")}`;
}

export default function TenantContractsSection({ contracts }: TenantContractsSectionProps) {
  const t = useTranslations("Dashboard.tenantProperties.detailPage");

  if (contracts.length === 0) return null;

  return (
    <div
      className="w-full rounded-[6px] bg-white px-5 py-5"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      <h3 className="mb-4 text-[20px] font-bold leading-[24px] tracking-[0.05em] text-[#32343C]">
        {t("availableContracts")}
      </h3>

      <div className="flex flex-col">
        {contracts.map((contract, index) => {
          const rent = parseRent(contract.rentPrice);
          const prevRent = index > 0 ? parseRent(contracts[index - 1].rentPrice) : 0;
          // Benefit = how much cheaper this deal is vs the previous deal (0 if more expensive)
          const benefit =
            index > 0 && prevRent > 0
              ? Math.max(0, Math.round(((prevRent - rent) / prevRent) * 100))
              : null; // null = don't show benefit column at all (Deal 1)

          return (
            <div key={index}>
              {/* ── Desktop: 3-column grid so prices are always aligned ── */}
              <div className="hidden py-4 sm:grid sm:grid-cols-[180px_1fr_auto] sm:items-center sm:gap-x-4">
                {/* Col 1: Deal name */}
                <span className="text-[15px] font-bold leading-[18px] tracking-[0.05em] text-primary">
                  {t("deal")} {index + 1}
                </span>

                {/* Col 2: Price */}
                <span className="text-[20px] font-bold leading-[24px] tracking-[0.05em] text-primary">
                  {formatPrice(contract.rentPrice)}
                </span>

                {/* Col 3: Meta */}
                <div className="flex items-center gap-3 text-[13px] leading-[16px] tracking-[0.04em] text-[#969696]">
                  <span>{durationLabel(contract.months, t)}</span>
                  {benefit !== null && (
                    <span>{benefit}% {t("benefits")}</span>
                  )}
                  <span>
                    {formatPrice(contract.securityDeposit)}{" "}
                    <span className="font-bold text-[#32343C]">{t("advance")}</span>
                  </span>
                </div>
              </div>

              {/* ── Mobile: stacked layout ── */}
              <div className="flex flex-col gap-1.5 py-4 sm:hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-bold leading-[18px] tracking-[0.05em] text-primary">
                    {t("deal")} {index + 1}
                  </span>
                  <span className="text-[18px] font-bold leading-[22px] tracking-[0.05em] text-primary">
                    {formatPrice(contract.rentPrice)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] leading-[15px] tracking-[0.04em] text-[#969696]">
                  <span>{durationLabel(contract.months, t)}</span>
                  {benefit !== null && (
                    <span>{benefit}% {t("benefits")}</span>
                  )}
                  <span>
                    {formatPrice(contract.securityDeposit)}{" "}
                    <span className="font-bold text-[#32343C]">{t("advance")}</span>
                  </span>
                </div>
              </div>

              {/* Divider */}
              {index < contracts.length - 1 && (
                <div style={{ borderBottom: "1px solid rgba(95, 95, 95, 0.15)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
