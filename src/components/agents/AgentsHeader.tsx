"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AgentsHeader() {
  const t = useTranslations("Dashboard.agents");

  return (
    <div className="flex flex-col items-start gap-3.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Page title */}
      <h1 className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-[#32343C]">
        {t("title")}
      </h1>

      {/* Actions */}
      <div className="flex items-center">
        <button
          type="button"
          className="flex h-7.5 items-center gap-1.5 rounded-[4px] bg-primary px-2 text-white transition-colors hover:bg-primary-hover"
        >
          <Image
            src="/images/icons/dashboard/agents/user-circle.png"
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5 shrink-0"
          />
          <span className="whitespace-nowrap text-xs font-medium leading-3.5 tracking-[0.18px]">
            {t("hireNewAgent")}
          </span>
        </button>
      </div>
    </div>
  );
}
