"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSocket } from "@/lib/socket/SocketProvider";
import Pagination from "@/components/ui/Pagination";
import {
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/actions/notifications";

const TYPE_ICON: Record<string, { bg: string; emoji: string }> = {
  PROPOSAL_RECEIVED:    { bg: "#EBF2FF", emoji: "📋" },
  PROPOSAL_ACCEPTED:    { bg: "#ECFDF5", emoji: "✅" },
  PROPOSAL_REJECTED:    { bg: "#FEF2F2", emoji: "❌" },
  NEW_MESSAGE:          { bg: "#F5F3FF", emoji: "💬" },
  PAYMENT_RECEIVED:     { bg: "#ECFDF5", emoji: "💰" },
  PROPERTY_APPROVED:    { bg: "#EBF2FF", emoji: "🏠" },
  PROPERTY_REJECTED:    { bg: "#FEF2F2", emoji: "🚫" },
  SHOWING_SCHEDULED:    { bg: "#FFF7ED", emoji: "📅" },
  INSPECTION_SCHEDULED: { bg: "#FFFBEB", emoji: "🔍" },
};

type TimeAgoResult =
  | { key: "justNow" }
  | { key: "minutesAgo"; count: number }
  | { key: "hoursAgo"; count: number }
  | { key: "daysAgo"; count: number };

function getTimeAgo(createdAt: string): TimeAgoResult {
  const minutes = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 60000
  );
  if (minutes < 1)   return { key: "justNow" };
  if (minutes < 60)  return { key: "minutesAgo", count: minutes };
  if (minutes < 1440) return { key: "hoursAgo", count: Math.floor(minutes / 60) };
  return { key: "daysAgo", count: Math.floor(minutes / 1440) };
}

type T = ReturnType<typeof useTranslations<"Notifications">>;

function getTimeStr(createdAt: string, t: T): string {
  const ago = getTimeAgo(createdAt);
  return ago.key === "justNow" ? t("justNow") : t(ago.key, { count: ago.count });
}

interface Group {
  label: string;
  items: NotificationItem[];
}

function groupNotifications(items: NotificationItem[], t: T, locale: string): Group[] {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);

  const map = new Map<string, NotificationItem[]>();

  for (const n of items) {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    let key: string;
    if (d.getTime() === todayDate.getTime()) key = "__today__";
    else if (d.getTime() === yesterdayDate.getTime()) key = "__yesterday__";
    else key = d.toISOString();

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }

  const groups: Group[] = [];
  for (const [key, groupItems] of map) {
    let label: string;
    if (key === "__today__") label = t("today");
    else if (key === "__yesterday__") label = t("yesterday");
    else
      label = new Date(key).toLocaleDateString(
        locale === "th" ? "th-TH" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      );
    groups.push({ label, items: groupItems });
  }

  return groups;
}

interface Props {
  initialData: NotificationItem[];
  initialTotal: number;
  initialTotalPages: number;
  initialUnreadCount: number;
  initialPage: number;
  basePath: string;
}

export default function NotificationPageContent({
  initialData,
  initialTotalPages,
  initialUnreadCount,
  initialPage,
  basePath,
}: Props) {
  const t = useTranslations("Notifications");
  const locale = useLocale();
  const router = useRouter();
  const { socket } = useSocket();

  const [items, setItems] = useState<NotificationItem[]>(initialData);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  // Sync when server re-fetches new page data (props change on navigation)
  useEffect(() => {
    setItems(initialData);
    setTotalPages(initialTotalPages);
    setUnreadCount(initialUnreadCount);
    setCurrentPage(initialPage);
  }, [initialData, initialTotalPages, initialUnreadCount, initialPage]);

  // Real-time: prepend new notification on page 1
  useEffect(() => {
    if (!socket) return;
    const handler = (n: NotificationItem) => {
      setUnreadCount((prev) => prev + 1);
      if (currentPage === 1) {
        setItems((prev) => [n, ...prev.slice(0, 9)]);
      }
    };
    socket.on("notification:new", handler);
    return () => { socket.off("notification:new", handler); };
  }, [socket, currentPage]);

  const handlePageChange = (page: number) => {
    router.push(`${basePath}?page=${page}`);
  };

  const handleMarkRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n._id === id && !n.isRead ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    markNotificationRead(id);
  };

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    markAllNotificationsRead();
  };

  const groups = groupNotifications(items, t, locale);

  return (
    <div className="flex flex-col gap-[14px] py-[14px] px-[20px] bg-white rounded-[8px] shadow-[0px_2px_12px_rgba(53,130,231,0.1)]">

      {/* Header row */}
      <div className="flex items-center justify-between w-full">
        <h2 className="font-semibold text-[20px] leading-[23px] text-[#32343C]">
          {t("title")}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[13px] font-medium text-[#0245A5] hover:underline transition-opacity hover:opacity-80"
          >
            {t("markAllRead")}
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <p className="text-sm text-[#969696] text-center py-8 w-full">
          {t("noNotifications")}
        </p>
      ) : (
        <>
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-[14px] w-full">
              {/* Section label */}
              <p className="font-medium text-[16px] leading-[19px] text-[#32343C]">
                {group.label}
              </p>

              {/* Notification rows */}
              <div className="flex flex-col w-full">
                {group.items.map((n, idx) => {
                  const icon = TYPE_ICON[n.type] ?? { bg: "#F3F4F6", emoji: "🔔" };
                  const timeStr = getTimeStr(n.createdAt, t);

                  return (
                    <div key={n._id} className="flex flex-col w-full">
                      <Link
                        href={n.href}
                        onClick={() => { if (!n.isRead) handleMarkRead(n._id); }}
                        className={`flex flex-row items-center justify-between gap-[14px] w-full min-h-[50px] py-[8px] px-[10px] transition-colors rounded-[6px] ${n.isRead ? "bg-white hover:bg-gray-50" : "bg-[#EBF2FF] hover:bg-[#deeaff]"}`}
                      >
                        {/* Icon */}
                        <div className="flex items-center gap-[14px] flex-1 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                            style={{ background: icon.bg }}
                          >
                            {icon.emoji}
                          </div>

                          {/* Text */}
                          <p className="font-medium text-[14px] leading-[16px] text-[#5F5F5F] line-clamp-2 flex-1 min-w-0">
                            {n.title} – {n.message}
                          </p>
                        </div>

                        {/* Time — right side */}
                        <p className="text-[12px] leading-[14px] text-[rgba(95,95,95,0.6)] whitespace-nowrap flex-shrink-0 ml-3">
                          {timeStr}
                        </p>
                      </Link>

                      {idx < group.items.length - 1 && (
                        <hr className="w-full border-0 border-t border-[rgba(95,95,95,0.2)]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
