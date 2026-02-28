"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AgentCard from "./AgentCard";
import type { AgentListItem } from "@/actions/agents";

interface Props {
  agents: AgentListItem[];
}

export default function AgentGrid({ agents }: Props) {
  const t = useTranslations("Dashboard.agents");
  const [search, setSearch] = useState("");

  const filtered = agents.filter((agent) => {
    const full = `${agent.firstName} ${agent.lastName}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  return (
    <div
      className="rounded-[12px] bg-white"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* Section header */}
      <div className="px-[25px] pt-[14px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-[30px]">
          {/* Left: icon + title */}
          <div className="flex shrink-0 items-center gap-[10px]">
            <div
              className="flex h-[30px] w-[32px] shrink-0 items-center justify-center rounded-[3px]"
              style={{
                background: "#F7FAFE",
                border: "0.2px solid rgba(53, 130, 231, 0.02)",
              }}
            >
              <Image
                src="/images/icons/dashboard/property/properties-2.png"
                alt=""
                width={14}
                height={18}
              />
            </div>
            <span className="whitespace-nowrap text-[14px] font-semibold leading-[16px] tracking-[0.05em] text-[#32343C]">
              {t("myAgents")}
            </span>
          </div>

          {/* Center: search */}
          <div
            className="flex h-[40px] w-full items-center gap-[10px] rounded-[4px] border border-[rgba(220,220,220,0.3)] bg-white px-[18px] sm:flex-1"
            style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.06)" }}
          >
            <Image
              src="/images/icons/dashboard/property/search.png"
              alt=""
              width={14}
              height={14}
              className="shrink-0"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-transparent text-[14px] leading-[16px] tracking-[0.05em] text-[rgba(150,150,150,0.7)] outline-none placeholder:text-[rgba(150,150,150,0.7)]"
            />
          </div>

          {/* Right: filter buttons */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-6">
            {/* Favorite */}
            <button
              type="button"
              className="flex h-[40px] flex-1 items-center justify-center gap-[6px] rounded-[4px] border border-[rgba(220,220,220,0.3)] bg-white px-5 sm:flex-none"
              style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.06)" }}
            >
              <span className="text-[14px] leading-[16px] tracking-[0.05em] text-[#969696]">
                {t("favoriteFilter")}
              </span>
            </button>

            {/* Type */}
            <button
              type="button"
              className="flex h-[40px] flex-1 items-center justify-center gap-[6px] rounded-[4px] border border-[rgba(220,220,220,0.3)] bg-white px-5 sm:flex-none"
              style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.06)" }}
            >
              <span className="text-[14px] leading-[16px] tracking-[0.05em] text-[#969696]">
                {t("typeFilter")}
              </span>
              <Image
                src="/images/icons/dashboard/property/chevron-down.png"
                alt=""
                width={11}
                height={6}
                className="shrink-0"
              />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-[14px]"
          style={{ borderBottom: "0.6px solid rgba(57, 93, 140, 0.4)" }}
        />
      </div>

      {/* Cards grid */}
      <div
        className="overflow-y-auto px-[25px] py-[14px]"
        style={{
          maxHeight: "630px",
          scrollbarWidth: "thin",
          scrollbarColor: "#0245A5 rgba(214, 227, 244, 0.8)",
        }}
      >
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-[#969696]">
            {search ? t("noResults") : t("noAgents")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
