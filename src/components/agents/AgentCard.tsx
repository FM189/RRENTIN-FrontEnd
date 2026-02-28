"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { AgentListItem } from "@/actions/agents";

export type AgentData = AgentListItem;

export default function AgentCard({ agent }: { agent: AgentData }) {
  const t        = useTranslations("Dashboard.agents");
  const fullName = `${agent.firstName} ${agent.lastName}`;
  const location = [agent.city, agent.stateProvince].filter(Boolean).join(", ");
  const taskLabel = agent.serviceType === "showing_agent"
    ? t("serviceShowing")
    : agent.serviceType === "property_inspection"
      ? t("serviceInspection")
      : agent.serviceType;

  return (
    <div
      className="relative h-[240px] w-full overflow-hidden rounded-[6px] sm:h-[185px]"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* Background photo / initials fallback */}
      {agent.profileImage ? (
        <Image
          src={agent.profileImage}
          alt={fullName}
          fill
          className="object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#A8C8F0] to-[#5390E0]">
          <span className="text-3xl font-bold text-white">
            {agent.firstName[0]}{agent.lastName[0]}
          </span>
        </div>
      )}

      {/* ── Top overlay ──────────────────────────────────────────────── */}
      <div className="absolute left-[6px] right-[6px] top-[6px] flex h-[21px] items-center justify-between">
        {/* Experience badge */}
        <div className="flex h-[16px] items-center gap-[2px] rounded-[3px] bg-white px-[5px] py-[1px]">
          <span className="text-[11px] leading-[14px] tracking-[0.05em] text-[#969696] capitalize">
            {agent.experienceLevel || t("entry")}
          </span>
        </div>

        {/* Share button */}
        <div className="flex h-[21px] w-[22px] shrink-0 items-center justify-center rounded-full bg-white px-[3px] py-[4px]">
          <Image
            src="/images/icons/dashboard/agents/share.png"
            alt=""
            width={16}
            height={13}
          />
        </div>
      </div>

      {/* ── Bottom info panel ─────────────────────────────────────────── */}
      <div
        className="absolute left-[6px] right-[6px] top-[145px] flex flex-col items-center justify-center gap-[4px] rounded-[4px] bg-white px-[10px] pb-[2px] pt-[5px] sm:top-[100px]"
        style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
      >
        <div className="flex w-full flex-col items-start gap-[4px]">
          {/* Name row */}
          <div className="flex w-full items-center justify-between gap-[7px]">
            <span className="truncate text-[13px] font-semibold leading-[15px] tracking-[0.05em] text-[#32343C]">
              {fullName}
            </span>
            <div
              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px]"
              style={{ background: "#E9F2FF" }}
            >
              <Image
                src="/images/icons/dashboard/property/detail/bookmark.png"
                alt=""
                width={9}
                height={12}
                style={{ opacity: 0.5 }}
              />
            </div>
          </div>

          {/* Location row */}
          {location && (
            <div className="flex items-center gap-[4px]">
              <Image
                src="/images/icons/dashboard/tenant/house.png"
                alt=""
                width={11}
                height={10}
                className="shrink-0"
              />
              <span className="truncate text-[11px] leading-[13px] tracking-[0.05em] text-[#0245A5]">
                {location}
              </span>
            </div>
          )}

          {/* Service type row */}
          <div className="flex w-full items-center justify-between gap-[2px]">
            <span className="text-[11px] leading-[13px] tracking-[0.05em] text-[#32343C]">
              {t("task")}
            </span>
            <span className="text-[11px] font-semibold leading-[13px] tracking-[0.05em] text-[#32343C]">
              {taskLabel}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-0 w-full border-t-[0.4px] border-[#BCBCBC]" />

        {/* View Details button */}
        <Link
          href={`/dashboard/owner/agents/${agent.id}`}
          className="flex h-[17px] w-[68px] items-center justify-center gap-[2px] rounded-[2px] px-[4px] py-[3px]"
          style={{ background: "#0245A5" }}
        >
          <span className="whitespace-nowrap text-[9px] font-medium leading-[10px] tracking-[0.18px] text-white">
            {t("viewDetails")}
          </span>
          <Image
            src="/images/icons/dashboard/tenant/arrow-out.png"
            alt=""
            width={8}
            height={8}
          />
        </Link>
      </div>
    </div>
  );
}
