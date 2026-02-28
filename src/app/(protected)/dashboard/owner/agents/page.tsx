import type { Metadata } from "next";
import AgentsHeader from "@/components/agents/AgentsHeader";
import AgentStatsCards from "@/components/agents/AgentStatsCards";
import AgentGrid from "@/components/agents/AgentGrid";
import { getAgents } from "@/actions/agents";

export const metadata: Metadata = {
  title: "Agents | Rrentin",
};

export default async function OwnerAgentsPage() {
  const { agents } = await getAgents({ limit: 50 });

  return (
    <div className="space-y-6">
      <AgentsHeader />
      <AgentStatsCards />
      <AgentGrid agents={agents} />
    </div>
  );
}
