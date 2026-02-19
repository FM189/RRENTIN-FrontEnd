"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AgentCard, { AgentData } from "./AgentCard";

const MOCK_AGENTS: AgentData[] = [
  {
    id: "1",
    name: "John Doe",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Luxury Apartment #12",
    task: "Inspection",
    bookmarked: true,
  },
  {
    id: "2",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: false,
  },
  {
    id: "3",
    name: "Mike Johnson",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Sunset Villa #3",
    task: "Maintenance",
    bookmarked: true,
  },
  {
    id: "4",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: false,
  },
  {
    id: "5",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: true,
  },
  {
    id: "6",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: false,
  },
  {
    id: "7",
    name: "John Doe",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Luxury Apartment #12",
    task: "Inspection",
    bookmarked: true,
  },
  {
    id: "8",
    name: "Mike Johnson",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Sunset Villa #3",
    task: "Maintenance",
    bookmarked: false,
  },
  {
    id: "9",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: true,
  },
  {
    id: "10",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: false,
  },
  {
    id: "11",
    name: "John Doe",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Luxury Apartment #12",
    task: "Inspection",
    bookmarked: true,
  },
  {
    id: "12",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&crop=face",
    rating: "4.0/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: false,
  },
  {
    id: "13",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: true,
  },
  {
    id: "14",
    name: "Sarah Smith",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face",
    rating: "4.9/5",
    propertyName: "Green Valley Townhouse",
    task: "Lease Handling",
    bookmarked: false,
  },
  {
    id: "15",
    name: "Mike Johnson",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
    rating: "4.0/5",
    propertyName: "Sunset Villa #3",
    task: "Maintenance",
    bookmarked: true,
  },
];

export default function AgentGrid() {
  const t = useTranslations("Dashboard.agents");
  const [search, setSearch] = useState("");

  const filtered = MOCK_AGENTS.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

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
            className="flex h-[40px] flex-1 items-center gap-[10px] rounded-[4px] border border-[rgba(220,220,220,0.3)] bg-white px-[18px]"
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
        <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
