"use client";

import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { LocaleSelect } from "@/components/ui";

export default function DashboardHeader() {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();
  const locale = useLocale();

  // Get the last meaningful segment of the path as the page title key
  // /dashboard → "dashboard", /dashboard/owner/properties → "properties"
  // Skip dynamic ID segments (numeric or UUID-like)
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  // Segments that are page actions, not meaningful titles
  const skipSegments = new Set(["edit", "add"]);

  const lastSegment =
    [...segments].reverse().find(
      (s) =>
        !skipSegments.has(s) &&        // skip action segments
        !/^\d+$/.test(s) &&            // skip pure numbers
        !/^[0-9a-f-]{36}$/.test(s) && // skip UUIDs
        !/^[0-9a-f]{24}$/.test(s)     // skip MongoDB ObjectIds
    ) ?? "dashboard";

  // Map hyphenated slugs to camelCase menu keys
  const slugToKey: Record<string, string> = {
    "on-demand-service": "onDemandService",
    "my-rentals": "myRentals",
    "visit-requests": "visitRequests",
    "browse-properties": "browse-properties",
  };
  const menuKey = slugToKey[lastSegment] ?? lastSegment;

  // Try to get the translated menu label, fall back to capitalizing the segment
  let pageTitle: string;
  try {
    pageTitle = t(`menu.${menuKey}`);
  } catch {
    pageTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  const today = new Date();
  const dateString = today.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white rounded-md shadow-[0px_2px_12px_rgba(53,130,231,0.1)] px-[18px] py-4 flex items-center justify-between">
      {/* Left — Title + Date */}
      <div>
        <h1 className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-[#32343C]">
          {pageTitle}
        </h1>
        <p className="text-xs leading-[14px] tracking-[0.05em] text-[#969696] mt-0.5">
          {dateString}
        </p>
      </div>

      {/* Right — Notification + Language */}
      <div className="flex items-center gap-3.5">
        {/* Notification bell */}
        <button className="w-9 h-9 bg-white shadow-[0px_1px_6px_rgba(0,0,0,0.08)] rounded-[5px] flex items-center justify-center">
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
            <path
              d="M15 6.667a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM10.73 18.667a2 2 0 01-3.46 0"
              stroke="#A3B2C6"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Language selector */}
        <div className="bg-white shadow-[0px_1px_8px_rgba(0,0,0,0.08)] rounded-[5px]">
          <LocaleSelect className="text-xs" />
        </div>
      </div>
    </header>
  );
}
