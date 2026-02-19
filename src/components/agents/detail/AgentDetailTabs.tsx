"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Tab = "basicDetails" | "linkedBuildings" | "transaction";

export default function AgentDetailTabs() {
  const t = useTranslations("Dashboard.agents.detailPage");
  const [activeTab, setActiveTab] = useState<Tab>("basicDetails");

  const tabs: { key: Tab; label: string }[] = [
    { key: "basicDetails", label: t("basicDetails") },
    { key: "linkedBuildings", label: t("linkedBuildings") },
    { key: "transaction", label: t("transaction") },
  ];

  return (
    <div
      className="rounded-[10px] bg-white px-[20px] py-[16px]"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      <div className="flex items-center gap-[24px]">
        {tabs.map((tab) =>
          tab.key === activeTab ? (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="flex h-[44px] items-center rounded-[8px] px-[20px] text-[15px] font-semibold leading-[18px] tracking-[0.05em] text-white"
              style={{ background: "#0245A5" }}
            >
              {tab.label}
            </button>
          ) : (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="text-[15px] font-semibold leading-[18px] tracking-[0.05em] text-[#4B4B4B]"
            >
              {tab.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
