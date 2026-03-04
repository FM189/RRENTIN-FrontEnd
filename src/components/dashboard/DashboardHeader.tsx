"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { LocaleSelect } from "@/components/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "./NotificationPanel";

const ROLE_ROUTE_MAP: Record<string, string> = {
  OWNER: "owner",
  TENANT: "tenant",
  SERVICE_PROVIDER: "service-provider",
  ADMIN: "admin",
};

export default function DashboardHeader() {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useCurrentUser();

  const [panelOpen, setPanelOpen] = useState(false);
  const bellContainerRef = useRef<HTMLDivElement>(null);

  const { todayNotifications, yesterdayNotifications, unreadCount, markRead } =
    useNotifications();

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        bellContainerRef.current &&
        !bellContainerRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  // Derive page title from pathname
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const skipSegments = new Set(["edit", "add"]);
  const lastSegment =
    [...segments].reverse().find(
      (s) =>
        !skipSegments.has(s) &&
        !/^\d+$/.test(s) &&
        !/^[0-9a-f-]{36}$/.test(s) &&
        !/^[0-9a-f]{24}$/.test(s)
    ) ?? "dashboard";

  const slugToKey: Record<string, string> = {
    "on-demand-service": "onDemandService",
    "my-rentals": "myRentals",
    "visit-requests": "visitRequests",
    "browse-properties": "browse-properties",
  };
  const menuKey = slugToKey[lastSegment] ?? lastSegment;

  let pageTitle: string;
  try {
    pageTitle = t(`menu.${menuKey}`);
  } catch {
    pageTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  const today = new Date();
  const dateString = today.toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  const roleRoute = ROLE_ROUTE_MAP[user?.role ?? ""] ?? "tenant";
  const badgeCount = unreadCount > 99 ? "99+" : unreadCount;

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
        <div className="relative" ref={bellContainerRef}>
          <button
            onClick={() => setPanelOpen((prev) => !prev)}
            className="relative w-9 h-9 bg-white shadow-[0px_1px_6px_rgba(0,0,0,0.08)] rounded-[5px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path
                d="M15 6.667a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM10.73 18.667a2 2 0 01-3.46 0"
                stroke={unreadCount > 0 ? "#0245A5" : "#A3B2C6"}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-[#EE1D52] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {badgeCount}
              </span>
            )}
          </button>

          {panelOpen && (
            <NotificationPanel
              todayNotifications={todayNotifications}
              yesterdayNotifications={yesterdayNotifications}
              roleRoute={roleRoute}
              onMarkRead={markRead}
            />
          )}
        </div>

        {/* Language selector */}
        <div className="bg-white shadow-[0px_1px_8px_rgba(0,0,0,0.08)] rounded-[5px]">
          <LocaleSelect className="text-xs" />
        </div>
      </div>
    </header>
  );
}
