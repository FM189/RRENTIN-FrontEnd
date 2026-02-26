"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import { getAvailableAgents, ownerAcceptRequest } from "@/actions/visit-requests";
import type { AgentSummary } from "@/actions/visit-requests";

interface Props {
  requestId: string;
  action: "hire_new_agent" | "hire_existing_agent";
  onClose: () => void;
  onSuccess: () => void;
}

export default function AgentPickerModal({ requestId, action, onClose, onSuccess }: Props) {
  const t = useTranslations("Dashboard.ownerVisitRequests");
  const [agents, setAgents]       = useState<AgentSummary[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAvailableAgents().then((data) => {
      const filtered =
        action === "hire_existing_agent"
          ? data.filter((a) => a.isPreviouslyUsed)
          : data;
      setAgents(filtered);
      setLoading(false);
    });
  }, [action]);

  const handleConfirm = () => {
    if (!selectedId) return;
    startTransition(async () => {
      await ownerAcceptRequest(requestId, action, selectedId);
      onSuccess();
    });
  };

  const experienceLabel: Record<string, string> = {
    entry:  "Entry",
    mid:    "Mid",
    senior: "Senior",
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
      <div
        className="flex w-full max-w-[480px] flex-col gap-4 rounded-[12px] bg-white p-6"
        style={{ boxShadow: "0px 4px 24px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#32343C]">{t("agentPickerTitle")}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="#969696" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Agent list */}
        <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0245A5] border-t-transparent" />
            </div>
          ) : agents.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#969696]">{t("agentPickerNoAgents")}</p>
          ) : (
            agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedId(agent.id)}
                className={`flex items-center gap-3 rounded-[8px] border p-3 text-left transition-colors ${
                  selectedId === agent.id
                    ? "border-[#0245A5] bg-[#E8F2FF]"
                    : "border-[rgba(65,65,65,0.15)] hover:border-[#0245A5] hover:bg-[#F7FAFE]"
                }`}
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9E8FF] text-sm font-semibold text-[#0245A5]">
                  {agent.firstName[0]}{agent.lastName[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#32343C]">
                    {agent.firstName} {agent.lastName}
                  </p>
                  <p className="text-xs text-[#969696]">
                    {experienceLabel[agent.experienceLevel] ?? agent.experienceLevel} level
                    {agent.isPreviouslyUsed && (
                      <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        {t("previouslyUsed")}
                      </span>
                    )}
                  </p>
                </div>

                {/* Price */}
                <p className="shrink-0 text-sm font-semibold text-[#0245A5]">
                  {formatPrice(agent.basePrice)}
                  <span className="text-xs font-normal text-[#969696]"> {t("perVisit")}</span>
                </p>

                {/* Radio */}
                <div className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                  selectedId === agent.id ? "border-[#0245A5] bg-[#0245A5]" : "border-[#C0C0C0]"
                }`} />
              </button>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-[rgba(65,65,65,0.08)] pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-[6px] border border-[rgba(65,65,65,0.2)] px-5 py-2 text-sm font-semibold text-[#32343C] hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId || isPending}
            className="flex items-center gap-2 rounded-[6px] bg-[#0245A5] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#01357A] disabled:opacity-50"
          >
            {isPending && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {t("selectAgent")}
          </button>
        </div>
      </div>
    </div>
  );
}
