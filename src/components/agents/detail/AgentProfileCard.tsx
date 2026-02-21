"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const MOCK_AGENT = {
  name: "John Doe",
  role: "Certified Inspection Officer",
  address: "123 Sukhumvit Rd, Bangkok, Thailand",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  coverImage:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=500&fit=crop",
  workingHours: "9 AM - 6 PM",
};

const DAYS = [
  { label: "M", active: true },
  { label: "T", active: true },
  { label: "W", active: true },
  { label: "T", active: true },
  { label: "F", active: true },
  { label: "S", active: false },
  { label: "S", active: false },
];

function DayPills() {
  return (
    <div className="flex items-center gap-[8px]">
      {DAYS.map((day, idx) => (
        <div
          key={idx}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px]"
          style={{
            background: day.active ? "#0245A5" : "#FFFFFF",
            boxShadow: "0px -0.86px 8.63px rgba(0, 0, 0, 0.1)",
          }}
        >
          <span
            className="text-[12px] font-bold leading-[18px]"
            style={{ color: day.active ? "#FFFFFF" : "#545454" }}
          >
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AgentProfileCard() {
  const t = useTranslations("Dashboard.agents.detailPage");
  const agent = MOCK_AGENT;

  return (
    <div
      className="relative rounded-[14px] bg-white"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* ── Cover image — shorter on mobile, full height on desktop ── */}
      <div className="relative mx-[14px] mt-[14px] h-[160px] overflow-hidden rounded-[8px] lg:h-[255px]">
        <Image src={agent.coverImage} alt="" fill className="object-cover" />
      </div>

      {/* ── Avatar — centered + small on mobile, left + large on desktop ── */}
      {/* Mobile: top-[110px] → overlaps 64px into cover (174-110), extends 36px below */}
      {/* Desktop: top-[212px] → overlaps 57px into cover (269-212), extends 170px below */}
      <div
        className="absolute left-1/2 top-[110px] z-10 h-[100px] w-[100px] -translate-x-1/2 overflow-hidden rounded-full border-[3px] border-white lg:left-[70px] lg:top-[212px] lg:h-[227px] lg:w-[227px] lg:translate-x-0 lg:border-[5px]"
        style={{ boxShadow: "0 0 0 1px rgba(53, 130, 231, 0.12)" }}
      >
        <Image
          src={agent.avatar}
          alt={agent.name}
          fill
          className="object-cover"
        />
      </div>

      {/* ════════════════════════════════════════
          MOBILE layout  (hidden on lg+)
          ════════════════════════════════════════ */}
      <div className="px-[14px] pb-[16px] lg:hidden">
        {/* pt-[52px] = 36px (avatar below cover) + 16px breathing room */}
        <div className="flex flex-col gap-[14px] pt-[52px]">

          {/* Info: centered */}
          <div className="flex flex-col items-center gap-[8px] text-center">
            <span className="text-[22px] font-semibold leading-[26px] text-[#1F242F]">
              {agent.name}
            </span>
            <div className="flex items-center gap-[6px]">
              <span className="text-[14px] font-medium leading-[17px] text-[#32343C]">
                {agent.role}
              </span>
              <Image
                src="/images/icons/dashboard/agents/certified.png"
                alt=""
                width={14}
                height={14}
                className="shrink-0"
              />
            </div>
            <div className="flex items-center gap-[6px]">
              <Image
                src="/images/icons/dashboard/tenant/house.png"
                alt=""
                width={18}
                height={16}
                className="shrink-0"
              />
              <span className="text-[14px] font-medium leading-[20px] tracking-[0.05em] text-[#0245A5]">
                {agent.address}
              </span>
            </div>
          </div>

          {/* Actions row: Message (left) + Chat/Bookmark (right) */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex h-[36px] items-center gap-[8px] rounded-[4px] px-[16px]"
              style={{ background: "#0245A5" }}
            >
              <span className="text-[13px] font-medium leading-[21px] text-white">
                {t("message")}
              </span>
              <Image
                src="/images/icons/dashboard/agents/chat.png"
                alt=""
                width={12}
                height={11}
              />
            </button>
            <div className="flex items-center gap-[12px]">
              <button
                type="button"
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[4px]"
                style={{ background: "#E9F2FF" }}
              >
                <Image
                  src="/images/icons/dashboard/tenant/chat.png"
                  alt=""
                  width={22}
                  height={19}
                />
              </button>
              <button
                type="button"
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[4px]"
                style={{ background: "#E9F2FF" }}
              >
                <Image
                  src="/images/icons/dashboard/property/detail/bookmark.png"
                  alt=""
                  width={17}
                  height={22}
                />
              </button>
            </div>
          </div>

          {/* Hours + day pills: right-aligned */}
          <div className="flex flex-col items-end gap-[8px]">
            <span className="text-[13px] font-bold leading-[29px] text-[#0245A5]">
              {agent.workingHours}
            </span>
            <DayPills />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP layout  (hidden below lg)
          ════════════════════════════════════════ */}
      <div className="hidden px-[14px] pb-[10px] lg:block">
        {/* ml-[316px] = avatar left(70) + avatar width(227) + gap(~34) - px(14) */}
        <div className="ml-[316px] flex items-stretch justify-between pt-[19px]">

          {/* Left: name / role / address + message button */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-[15px]">
              <span className="text-[34px] font-semibold leading-[26px] text-[#1F242F]">
                {agent.name}
              </span>
              <div className="flex items-center gap-[6px]">
                <span className="text-[16px] font-medium leading-[19px] text-[#32343C]">
                  {agent.role}
                </span>
                <Image
                  src="/images/icons/dashboard/agents/certified.png"
                  alt=""
                  width={16}
                  height={16}
                  className="shrink-0"
                />
              </div>
              <div className="flex items-start gap-[6px]">
                <Image
                  src="/images/icons/dashboard/tenant/house.png"
                  alt=""
                  width={29}
                  height={27}
                  className="mt-[1px] shrink-0"
                />
                <span className="max-w-[293px] text-[20px] font-medium leading-[23px] tracking-[0.05em] text-[#0245A5]">
                  {agent.address}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="mt-[29px] flex h-[38px] w-[120px] items-center gap-[9px] rounded-[4px] px-[20px]"
              style={{ background: "#0245A5" }}
            >
              <span className="text-[14px] font-medium leading-[21px] text-white">
                {t("message")}
              </span>
              <Image
                src="/images/icons/dashboard/agents/chat.png"
                alt=""
                width={13}
                height={12}
              />
            </button>
          </div>

          {/* Right: chat/bookmark (top) + hours/days (bottom) */}
          <div className="flex flex-col items-end justify-between pb-[10px]">
            <div className="flex items-center gap-[18px]">
              <button
                type="button"
                className="flex h-[37px] w-[37px] items-center justify-center rounded-[4px]"
                style={{ background: "#E9F2FF" }}
              >
                <Image
                  src="/images/icons/dashboard/tenant/chat.png"
                  alt=""
                  width={24}
                  height={21}
                />
              </button>
              <button
                type="button"
                className="flex h-[37px] w-[37px] items-center justify-center rounded-[4px]"
                style={{ background: "#E9F2FF" }}
              >
                <Image
                  src="/images/icons/dashboard/property/detail/bookmark.png"
                  alt=""
                  width={19}
                  height={25}
                />
              </button>
            </div>
            <div className="flex flex-col items-end gap-[11px]">
              <span className="text-[14px] font-bold leading-[29px] text-[#0245A5]">
                {agent.workingHours}
              </span>
              <DayPills />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
