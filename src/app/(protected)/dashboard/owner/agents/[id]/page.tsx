"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import AgentProfileCard from "@/components/agents/detail/AgentProfileCard";
import AgentDetailTabs, { AgentTab } from "@/components/agents/detail/AgentDetailTabs";
import AgentExperienceCard from "@/components/agents/detail/AgentExperienceCard";
import AgentReviewsCard from "@/components/agents/detail/AgentReviewsCard";
import AgentLinkedBuildings from "@/components/agents/detail/AgentLinkedBuildings";
import AgentTransactionHistory from "@/components/agents/detail/AgentTransactionHistory";

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Dashboard.agents.detailPage");
  const [activeTab, setActiveTab] = useState<AgentTab>("basicDetails");

  void id;

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Section 1: Page heading */}
      <h1 className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-heading">
        {t("agentProfile")}
      </h1>

      {/* Section 2: Tab navigation */}
      <AgentDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Section 3 + 4: Basic Details tab content */}
      {activeTab === "basicDetails" && (
        <>
          <AgentProfileCard />
          <div className="flex flex-col gap-[18px] xl:flex-row">
            <div className="min-w-0 flex-1">
              <AgentExperienceCard />
            </div>
            <div className="xl:w-[426px] xl:shrink-0">
              <AgentReviewsCard />
            </div>
          </div>
        </>
      )}

      {activeTab === "linkedBuildings" && <AgentLinkedBuildings />}

      {activeTab === "transaction" && <AgentTransactionHistory />}
    </div>
  );
}
