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

export default function AgentProfileCard() {
  const t = useTranslations("Dashboard.agents.detailPage");
  const agent = MOCK_AGENT;

  return (
    <div
      className="relative rounded-[14px] bg-white"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* Cover image */}
      <div className="relative mx-[14px] mt-[14px] h-[255px] overflow-hidden rounded-[8px]">
        <Image
          src={agent.coverImage}
          alt=""
          fill
          className="object-cover"
        />
      </div>

      {/* Avatar — absolute relative to card, overlaps cover bottom by 57px */}
      <div
        className="absolute left-[70px] top-[212px] z-10 h-[227px] w-[227px] overflow-hidden rounded-full border-[5px] border-white"
        style={{ boxShadow: "0 0 0 1px rgba(53, 130, 231, 0.12)" }}
      >
        <Image
          src={agent.avatar}
          alt={agent.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Content area below cover */}
      <div className="px-[14px] pb-[10px]">
        {/* Main row: info (left) + action buttons/time/days (right) */}
        {/* ml-[316px] = avatar left(70) + avatar width(227) + gap(~34) - px(14) = 317px from content box */}
        <div className="ml-[316px] flex items-stretch justify-between pt-[19px]">

          {/* ── Left column: info + message button ──────────────────────── */}
          <div className="flex flex-col">
            {/* Info group: name, role, address */}
            <div className="flex flex-col gap-[15px]">
              {/* Name */}
              <span className="text-[34px] font-semibold leading-[26px] text-[#1F242F]">
                {agent.name}
              </span>

              {/* Role + gear icon */}
              <div className="flex items-center gap-[6px]">
                <span className="text-[16px] font-medium leading-[19px] text-[#32343C]">
                  {agent.role}
                </span>
                <Image
                  src="/images/icons/dashboard/agents/settings.png"
                  alt=""
                  width={16}
                  height={16}
                  className="shrink-0"
                />
              </div>

              {/* Address */}
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

            {/* Message button */}
            <button
              type="button"
              className="mt-[29px] flex h-[38px] w-[120px] items-center gap-[9px] rounded-[4px] px-[20px]"
              style={{ background: "#0245A5" }}
            >
              <span className="text-[14px] font-medium leading-[21px] text-white">
                {t("message")}
              </span>
              <Image
                src="/images/icons/dashboard/agents/message-icon.png"
                alt=""
                width={13}
                height={12}
              />
            </button>
          </div>

          {/* ── Right column: action buttons (top) + time/days (bottom) ── */}
          <div className="flex flex-col items-end justify-between pb-[10px]">
            {/* Chat + Bookmark */}
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

            {/* Working hours + day pills */}
            <div className="flex flex-col items-end gap-[11px]">
              {/* "9 AM - 6 PM" */}
              <span className="text-[14px] font-bold leading-[29px] text-[#0245A5]">
                {agent.workingHours}
              </span>

              {/* Day pills: M T W T F S S */}
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
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
