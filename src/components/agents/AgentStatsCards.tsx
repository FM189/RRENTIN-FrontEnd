"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface StatItem {
  titleKey: string;
  count: string;
  labelKey: string;
  descKey: string;
  icon: string;
  iconBg: string;
  iconBorder: string;
  highlight?: boolean;
}

const STATS: StatItem[] = [
  {
    titleKey: "agentsAvailable",
    count: "342",
    labelKey: "available",
    descKey: "availableDesc",
    icon: "/images/icons/dashboard/property/dollar.png",
    iconBg: "#F1F7FF",
    iconBorder: "rgba(53, 130, 231, 0.03)",
  },
  {
    titleKey: "hiredAgents",
    count: "09",
    labelKey: "hired",
    descKey: "hiredDesc",
    icon: "/images/icons/dashboard/property/dollar.png",
    iconBg: "#F1F7FF",
    iconBorder: "rgba(53, 130, 231, 0.03)",
  },
  {
    titleKey: "agentsDues",
    count: "03",
    labelKey: "dues",
    descKey: "duesDesc",
    icon: "/images/icons/dashboard/property/dollar.png",
    iconBg: "#F1F7FF",
    iconBorder: "rgba(53, 130, 231, 0.03)",
  },
  {
    titleKey: "pendingRequests",
    count: "02",
    labelKey: "pending",
    descKey: "pendingDesc",
    icon: "/images/icons/dashboard/property/dollar.png",
    iconBg: "#F1F7FF",
    iconBorder: "rgba(53, 130, 231, 0.03)",
  },
  {
    titleKey: "propertyViews",
    count: "4,474",
    labelKey: "views",
    descKey: "viewsDesc",
    icon: "/images/icons/dashboard/property/view-blue.png",
    iconBg: "#F7FAFE",
    iconBorder: "rgba(53, 130, 231, 0.02)",
    highlight: true,
  },
];

export default function AgentStatsCards() {
  const t = useTranslations("Dashboard.agents.stats");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
      {STATS.map((stat) => (
        <div
          key={stat.titleKey}
          className="flex h-28 flex-col justify-center overflow-hidden rounded-lg bg-white px-5"
          style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
        >
          <div className="flex flex-col gap-1">
            {/* Icon + Title */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-[26px] w-[28px] shrink-0 items-center justify-center rounded-[3px]"
                style={{
                  background: stat.iconBg,
                  border: `0.2px solid ${stat.iconBorder}`,
                }}
              >
                <Image src={stat.icon} alt="" width={15} height={17} />
              </div>
              <span className="truncate font-medium text-[15px] leading-[18px] tracking-[0.05em] text-heading">
                {t(stat.titleKey)}
              </span>
            </div>

            {/* Count + Description */}
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-medium text-[22px] leading-[26px] tracking-[0.05em] text-heading">
                {stat.count}{" "}
                <span className="text-[15px] leading-[18px]">
                  {t(stat.labelKey)}
                </span>
              </span>

              <p className="text-[12px] leading-[16px] tracking-[0.05em] text-[#969696]">
                {stat.highlight
                  ? t.rich(stat.descKey, {
                      percentage: (chunks) => (
                        <span className="font-medium text-[#34C759]">
                          {chunks}
                        </span>
                      ),
                    })
                  : t(stat.descKey)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
