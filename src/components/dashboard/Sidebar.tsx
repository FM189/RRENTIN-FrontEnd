"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { Logo } from "@/components/ui";

interface MenuItem {
  labelKey: string;
  href: string;
  icon?: string;
}

const ownerMenu: MenuItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: "dashboard-circle" },
  { labelKey: "properties", href: "/dashboard/owner/properties", icon: "properties" },
  { labelKey: "tenants", href: "/dashboard/owner/tenants", icon:"tenants", },
  { labelKey: "agents", href: "/dashboard/owner/agents", icon:"agents" },
  { labelKey: "onDemandService", href: "/dashboard/owner/on-demand-service" },
  { labelKey: "payments", href: "/dashboard/owner/payments" },
  { labelKey: "insights", href: "/dashboard/owner/insights" },
  { labelKey: "membership", href: "/dashboard/owner/membership" },
  { labelKey: "proposals", href: "/dashboard/owner/proposals", icon:"proposals" },
  { labelKey: "notification", href: "/dashboard/owner/notification", icon:"notification" },
  { labelKey: "messages", href: "/dashboard/owner/messages" },
];

const tenantMenu: MenuItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: "dashboard-circle" },
  { labelKey: "browse-properties", href: "/dashboard/tenant/properties", icon: "browse-properties" },
  { labelKey: "myRentals", href: "/dashboard/tenant/rentals" },
  { labelKey: "proposals", href: "/dashboard/tenant/proposals" ,icon:"proposals" },
  { labelKey: "favorites", href: "/dashboard/tenant/favorites" },
  { labelKey: "payments", href: "/dashboard/tenant/payments" },
  { labelKey: "notification", href: "/dashboard/tenant/notification" ,icon:"notification" },
  { labelKey: "messages", href: "/dashboard/tenant/messages" },
  { labelKey: "profile", href: "/dashboard/tenant/profile" },
];

const serviceProviderMenu: MenuItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: "dashboard-circle" },
  { labelKey: "jobs", href: "/dashboard/service-provider/jobs" },
  { labelKey: "availability", href: "/dashboard/service-provider/availability" },
  { labelKey: "payments", href: "/dashboard/service-provider/payments" },
  { labelKey: "notification", href: "/dashboard/service-provider/notification" },
  { labelKey: "messages", href: "/dashboard/service-provider/messages" },
  { labelKey: "profile", href: "/dashboard/service-provider/profile" },
];

const adminMenu: MenuItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: "dashboard-circle" },
  { labelKey: "users", href: "/dashboard/admin/users" },
  { labelKey: "properties", href: "/dashboard/admin/properties", icon: "properties" },
  { labelKey: "payments", href: "/dashboard/admin/payments" },
  { labelKey: "settings", href: "/dashboard/admin/settings" },
];

const menuByRole: Record<string, MenuItem[]> = {
  owner: ownerMenu,
  tenant: tenantMenu,
  service_provider: serviceProviderMenu,
  admin: adminMenu,
};

export default function Sidebar() {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role ?? "tenant";
  const menuItems = menuByRole[role] ?? menuByRole.tenant;
  const unreadCount = useUnreadCount();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className={`relative shrink-0 transition-[width] duration-200 ${collapsed ? "w-[68px]" : "w-[246px]"}`}>
      {/* Collapse toggle button — outside aside so it's not clipped */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-[#0245A5] rounded-full flex items-center justify-center z-10"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
        >
          <path d="M10 4L6 8L10 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <aside className="h-full bg-white flex flex-col overflow-hidden shadow-[0px_4px_14px_rgba(53,130,231,0.16)]">

      {/* Logo */}
      <div className={`flex items-center py-3.5 ${collapsed ? "justify-center px-2" : "justify-center px-4"}`}>
        <Logo size="sm" showText={!collapsed} />
      </div>

      {/* Menu label */}
      {!collapsed && (
        <div className="px-5 pt-3 pb-1.5">
          <span className="text-xs font-bold text-[#545454] leading-[18px]">
            {t("menuLabel")}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-1.5" : "px-[11px]"}`}>
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const iconName = item.icon
              ? active ? `${item.icon}-active` : item.icon
              : null;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-[#E8F2FF] text-[#0245A5] font-medium"
                      : "text-[#1F1F1F] font-normal hover:bg-gray-50"
                  } ${collapsed ? "justify-center p-[10px]" : "gap-3 px-[13px] py-[10px]"}`}
                  title={collapsed ? t(`menu.${item.labelKey}`) : undefined}
                >
                  {iconName ? (
                    <img
                      src={`/images/icons/dashboard/${iconName}.png`}
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5 shrink-0 min-w-[20px] min-h-[20px]"
                    />
                  ) : (
                    <span
                      className={`w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border-[1.5px] shrink-0 ${
                        active ? "border-[#0245A5]" : "border-[#141B34]"
                      }`}
                    />
                  )}
                  {!collapsed && (
                    <span className="leading-[22px] whitespace-nowrap flex-1">
                      {t(`menu.${item.labelKey}`)}
                    </span>
                  )}
                  {!collapsed && item.labelKey === "notification" && unreadCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 bg-[#EE1D52] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile at bottom */}
      <div className={`pb-5 pt-4 border-t border-[#EBEBEB] mt-auto ${collapsed ? "px-1.5" : "px-[11px]"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          <div className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-[#D9D9D9] shrink-0" />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1F1F1F] leading-[17px] truncate">
                  {user?.firstName ?? ""}
                </p>
                <p className="text-[10px] text-[#545454] leading-[14px] truncate">
                  {user?.email ?? ""}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-4 h-4 shrink-0 text-[#141B34] hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <svg viewBox="0 0 16 16" fill="none">
                  <circle cx="4" cy="8" r="1.25" fill="currentColor" />
                  <circle cx="8" cy="8" r="1.25" fill="currentColor" />
                  <circle cx="12" cy="8" r="1.25" fill="currentColor" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      </aside>
    </div>
  );
}
