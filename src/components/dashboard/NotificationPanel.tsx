"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { NotificationItem } from "@/actions/notifications";

interface Props {
  todayNotifications: NotificationItem[];
  yesterdayNotifications: NotificationItem[];
  roleRoute: string;
  onMarkRead: (id: string) => void;
}

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
  | { key: "hoursAgo"; count: number };

function getTimeAgo(createdAt: string): TimeAgoResult {
  const minutes = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 60000
  );
  if (minutes < 1) return { key: "justNow" };
  if (minutes < 60) return { key: "minutesAgo", count: minutes };
  return { key: "hoursAgo", count: Math.floor(minutes / 60) };
}

interface RowProps {
  notification: NotificationItem;
  showDivider: boolean;
  onMarkRead: (id: string) => void;
  t: ReturnType<typeof useTranslations<"Notifications">>;
}

function NotificationRow({ notification, showDivider, onMarkRead, t }: RowProps) {
  const ago = getTimeAgo(notification.createdAt);
  const timeStr =
    ago.key === "justNow" ? t("justNow") : t(ago.key, { count: ago.count });

  return (
    <div className="flex flex-col items-start gap-[10px] w-full">
      <Link
        href={notification.href}
        onClick={() => { if (!notification.isRead) onMarkRead(notification._id); }}
        className="flex flex-row items-center gap-[14px] w-full min-h-[50px] hover:opacity-75 transition-opacity"
      >
        {/* Notification type icon */}
        {(() => {
          const icon = TYPE_ICON[notification.type] ?? { bg: "#F3F4F6", emoji: "🔔" };
          return (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: icon.bg }}
            >
              {icon.emoji}
            </div>
          );
        })()}

        {/* Text */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="font-medium text-[14px] leading-[16px] text-[#5F5F5F] line-clamp-2">
            {notification.title} – {notification.message}
          </p>
          <p className="text-[12px] leading-[14px] text-[rgba(95,95,95,0.6)]">
            {timeStr}
          </p>
        </div>
      </Link>

      {showDivider && (
        <hr className="w-full border-0 border-t border-[rgba(95,95,95,0.2)]" />
      )}
    </div>
  );
}

export default function NotificationPanel({
  todayNotifications,
  yesterdayNotifications,
  roleRoute,
  onMarkRead,
}: Props) {
  const t = useTranslations("Notifications");

  // Cap to match design: 3 today, 2 yesterday
  const todayItems = todayNotifications.slice(0, 3);
  const yesterdayItems = yesterdayNotifications.slice(0, 2);
  const hasAny = todayItems.length > 0 || yesterdayItems.length > 0;

  return (
    <div className="absolute right-0 top-full mt-2 z-50 flex flex-col items-center gap-[14px] py-[14px] px-[20px] w-[406px] max-w-[calc(100vw-32px)] bg-white shadow-[0px_2px_12px_rgba(53,130,231,0.1)] rounded-[8px]">

      {/* Title */}
      <h2 className="w-full font-semibold text-[20px] leading-[23px] text-[#32343C]">
        {t("title")}
      </h2>

      {!hasAny ? (
        <p className="text-sm text-[#969696] text-center py-4 w-full">
          {t("noNotifications")}
        </p>
      ) : (
        <>
          {/* Today section */}
          {todayItems.length > 0 && (
            <>
              <p className="w-full font-medium text-[16px] leading-[19px] text-[#32343C]">
                {t("today")}
              </p>
              <div className="flex flex-col items-start gap-[14px] w-full">
                {todayItems.map((n, idx) => (
                  <NotificationRow
                    key={n._id}
                    notification={n}
                    t={t}
                    onMarkRead={onMarkRead}
                    showDivider={
                      yesterdayItems.length > 0
                        ? true
                        : idx < todayItems.length - 1
                    }
                  />
                ))}
              </div>
            </>
          )}

          {/* Yesterday section */}
          {yesterdayItems.length > 0 && (
            <>
              <p className="w-full font-medium text-[16px] leading-[19px] text-[#32343C]">
                {t("yesterday")}
              </p>
              <div className="flex flex-col items-start gap-[14px] w-full">
                {yesterdayItems.map((n, idx) => (
                  <NotificationRow
                    key={n._id}
                    notification={n}
                    t={t}
                    onMarkRead={onMarkRead}
                    showDivider={idx < yesterdayItems.length - 1}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* View more button */}
      <Link
        href={`/dashboard/${roleRoute}/notification`}
        className="flex flex-row justify-center items-center gap-[6px] px-[8px] py-[6px] bg-[#0245A5] hover:bg-[#023a8a] rounded-[4px] transition-colors"
      >
        <span className="font-medium text-[14px] leading-[17px] tracking-[0.18px] text-white whitespace-nowrap">
          {t("viewMore")}
        </span>
        <img src="/images/icons/dashboard/tenant/arrow-out.png" alt="" width={10} height={10} />
      </Link>
    </div>
  );
}
