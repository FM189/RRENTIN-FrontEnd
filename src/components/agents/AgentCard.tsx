"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export interface AgentData {
  id: string;
  name: string;
  photo: string;
  rating: string;
  propertyName: string;
  task: string;
  bookmarked: boolean;
}

export default function AgentCard({ agent }: { agent: AgentData }) {
  const t = useTranslations("Dashboard.agents");

  return (
    <div
      className="relative h-[185px] w-full overflow-hidden rounded-[6px]"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* Background photo */}
      <Image
        src={agent.photo}
        alt={agent.name}
        fill
        className="object-cover object-top"
      />

      {/* ── Top overlay ─────────────────────────────────────────────── */}
      <div className="absolute left-[6px] right-[6px] top-[6px] flex h-[21px] items-center justify-between">

        {/* Rating badge: 51×16px; white; radius 3px */}
        <div className="flex h-[16px] w-[51px] items-center gap-[2px] rounded-[3px] bg-white px-[3px] py-[1px]">
          {/* Star icon: 12×12px */}
          <Image
            src="/images/icons/dashboard/property/star.png"
            alt=""
            width={12}
            height={12}
            className="shrink-0"
          />
          {/* Rating text: 12px; #969696 */}
          <span className="text-[12px] leading-[14px] tracking-[0.05em] text-[#969696]">
            {agent.rating}
          </span>
        </div>

        {/* Share button: 22×21px; white; radius 40px */}
        <div className="flex h-[21px] w-[22px] shrink-0 items-center justify-center rounded-full bg-white px-[3px] py-[4px]">
          <Image
            src="/images/icons/dashboard/agents/share.png"
            alt=""
            width={16}
            height={13}
          />
        </div>
      </div>

      {/* ── Bottom info panel ────────────────────────────────────────
          Card is 185px tall. Panel starts at 100px → 81px of photo visible above.
          Panel grows with content; bottom gap ≈ 4px.                             */}
      <div
        className="absolute left-[6px] right-[6px] top-[100px] flex flex-col items-center justify-center gap-[4px] rounded-[4px] bg-white px-[10px] pb-[2px] pt-[5px]"
        style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
      >
        {/* Inner content group: flex-col; items-start; w-full */}
        <div className="flex w-full flex-col items-start gap-[4px]">

          {/* Name row: justify-between; 13px font */}
          <div className="flex w-full items-center justify-between gap-[7px]">
            <span className="truncate text-[13px] font-semibold leading-[15px] tracking-[0.05em] text-[#32343C]">
              {agent.name}
            </span>
            {/* Bookmark button: 18×18px; #E9F2FF; radius 2px */}
            <div
              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px]"
              style={{ background: "#E9F2FF" }}
            >
              <Image
                src="/images/icons/dashboard/property/detail/bookmark.png"
                alt=""
                width={9}
                height={12}
                style={{ opacity: agent.bookmarked ? 1 : 0.5 }}
              />
            </div>
          </div>

          {/* Property row: 11px font; #0245A5 */}
          <div className="flex items-center gap-[4px]">
            <Image
              src="/images/icons/dashboard/tenant/house.png"
              alt=""
              width={11}
              height={10}
              className="shrink-0"
            />
            <span className="truncate text-[11px] leading-[13px] tracking-[0.05em] text-[#0245A5]">
              {agent.propertyName}
            </span>
          </div>

          {/* Task row: justify-between; 11px font */}
          <div className="flex w-full items-center justify-between gap-[2px]">
            <span className="text-[11px] leading-[13px] tracking-[0.05em] text-[#32343C]">
              {t("task")}
            </span>
            <span className="text-[11px] font-semibold leading-[13px] tracking-[0.05em] text-[#32343C]">
              {agent.task}
            </span>
          </div>
        </div>

        {/* Divider: zero height, 0.4px top border */}
        <div className="h-0 w-full border-t-[0.4px] border-[#BCBCBC]" />

        {/* View Details button: 68×17px; #0245A5; radius 2px; centered via parent items-center */}
        <button
          type="button"
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
        </button>
      </div>
    </div>
  );
}
