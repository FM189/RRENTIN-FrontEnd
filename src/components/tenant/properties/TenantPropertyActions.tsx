"use client";

import { useTranslations } from "next-intl";

export default function TenantPropertyActions() {
  const t = useTranslations("Dashboard.tenantProperties.detailPage");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="flex h-10 cursor-pointer items-center rounded-[6px] bg-[#5390E0] px-5"
        >
          <span className="text-[14px] font-semibold leading-[16px] tracking-[0.18px] text-white">
            {t("rentNow")}
          </span>
        </button>
        <button
          type="button"
          className="flex h-10 cursor-pointer items-center rounded-[6px] bg-[#0245A5] px-5"
        >
          <span className="text-[14px] font-semibold leading-[16px] tracking-[0.18px] text-white">
            {t("contactOwner")}
          </span>
        </button>
      </div>
      <button
        type="button"
        className="flex h-10 items-center rounded-[6px] bg-[#0245A5] px-5"
      >
        <span className="text-[14px] font-semibold leading-[16px] tracking-[0.18px] text-white">
          {t("viewRequest")}
        </span>
      </button>
    </div>
  );
}
