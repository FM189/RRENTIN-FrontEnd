"use client";

import AgentsHeader from "@/components/agents/AgentsHeader";
import AgentStatsCards from "@/components/agents/AgentStatsCards";
import AgentGrid from "@/components/agents/AgentGrid";

export default function OwnerAgentsPage() {
  return (
    <div className="space-y-6">
      <AgentsHeader />
      <AgentStatsCards />
      <AgentGrid />
    </div>
  );
}
