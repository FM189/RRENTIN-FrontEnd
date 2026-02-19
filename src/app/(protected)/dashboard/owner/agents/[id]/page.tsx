"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import AgentProfileCard from "@/components/agents/detail/AgentProfileCard";
import AgentDetailTabs from "@/components/agents/detail/AgentDetailTabs";

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Dashboard.agents.detailPage");

  void id;

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Section 1: Page heading */}
      <h1 className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-heading">
        {t("agentProfile")}
      </h1>

      {/* Section 2: Tab navigation */}
      <AgentDetailTabs />

      {/* Section 3: Agent profile card (cover + avatar + info) */}
      <AgentProfileCard />
    </div>
  );
}
