"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface StatItem {
  titleKey: string;
  count: string;
  labelKey: string;
  descKey: string;
  descParams?: Record<string, string | number>;
  icon: string;
  iconBg: string;
  highlight?: string;
}

const STATS: StatItem[] = [
  {
    titleKey: "totalProperties",
    count: "12",
    labelKey: "total",
    descKey: "totalDesc",
    descParams: { count: 12 },
    icon: "/images/icons/dashboard/property/dollar.png",
    iconBg: "#F1F7FF",
  },
  {
    titleKey: "freeProperty",
    count: "03",
    labelKey: "free",
    descKey: "freeDesc",
    descParams: { count: "03" },
    icon: "/images/icons/dashboard/property/dollar.png",
    iconBg: "#F1F7FF",
  },
  {
    titleKey: "rentedProperty",
    count: "09",
    labelKey: "rented",
    descKey: "rentedDesc",
    descParams: { count: "09" },
    icon: "/images/icons/dashboard/property/dollar.png",
    iconBg: "#F1F7FF",
  },
  {
    titleKey: "pendingApprovals",
    count: "09",
    labelKey: "pending",
    descKey: "pendingDesc",
    icon: "/images/icons/dashboard/property/dollar.png",
    iconBg: "#F1F7FF",
  },
  {
    titleKey: "propertyViews",
    count: "4,474",
    labelKey: "views",
    descKey: "viewsDesc",
    descParams: { percentage: "+$43.14" },
    icon: "/images/icons/dashboard/property/view-blue.png",
    iconBg: "#F7FAFE",
    highlight: "+$43.14",
  },
];

export default function StatsCards() {
  const t = useTranslations("Dashboard.properties.stats");

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
                  border: "0.2px solid rgba(53, 130, 231, 0.03)",
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
                        <span className="font-medium text-success">
                          {chunks}
                        </span>
                      ),
                    })
                  : t(stat.descKey, stat.descParams)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
