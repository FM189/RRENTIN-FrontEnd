"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAccessToken } from "@/actions/cookie";
import dbConnect from "@/lib/mongodb";
import { NotificationType } from "@/types/notifications";
import Notification from "@/models/Notification";

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  href: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// GET notifications for the current user (newest first, last 50)
export async function getNotifications(): Promise<{
  data: NotificationItem[];
  unreadCount: number;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { data: [], unreadCount: 0 };

    await dbConnect();

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ userId: session.user.id, isRead: false }),
    ]);

    const data: NotificationItem[] = notifications.map((n) => ({
      _id: String(n._id),
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      href: n.href,
      isRead: n.isRead,
      data: n.data,
      createdAt: n.createdAt.toISOString(),
    }));

    return { data, unreadCount };
  } catch {
    return { data: [], unreadCount: 0 };
  }
}

// Mark a single notification as read
export async function markNotificationRead(id: string): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    await dbConnect();
    await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { isRead: true }
    );
  } catch {
    // silent
  }
}

export interface CreateNotificationParams {
  userId: string;          // recipient's userId
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  data?: Record<string, unknown>;
}

// Send a notification to any user — saves to DB and emits real-time socket event via backend
export async function createNotification(
  params: CreateNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "Unauthenticated" };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      console.error("[createNotification] Backend error:", res.status, json);
      return { success: false, error: json.error ?? "Failed to send notification" };
    }

    return { success: true };
  } catch (err) {
    console.error("[createNotification] Network error:", err);
    return { success: false, error: "Network error" };
  }
}

const PAGE_SIZE = 10;

// GET paginated notifications for the current user
export async function getNotificationsPage(page: number): Promise<{
  data: NotificationItem[];
  total: number;
  totalPages: number;
  unreadCount: number;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { data: [], total: 0, totalPages: 0, unreadCount: 0 };

    await dbConnect();

    const skip = (page - 1) * PAGE_SIZE;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Notification.countDocuments({ userId: session.user.id }),
      Notification.countDocuments({ userId: session.user.id, isRead: false }),
    ]);

    const data: NotificationItem[] = notifications.map((n) => ({
      _id: String(n._id),
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      href: n.href,
      isRead: n.isRead,
      data: n.data,
      createdAt: n.createdAt.toISOString(),
    }));

    return { data, total, totalPages: Math.ceil(total / PAGE_SIZE), unreadCount };
  } catch {
    return { data: [], total: 0, totalPages: 0, unreadCount: 0 };
  }
}

// GET only the unread count (lightweight — used by Sidebar badge)
export async function getUnreadCount(): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return 0;

    await dbConnect();
    return await Notification.countDocuments({ userId: session.user.id, isRead: false });
  } catch {
    return 0;
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead(): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    await dbConnect();
    await Notification.updateMany(
      { userId: session.user.id, isRead: false },
      { isRead: true }
    );
  } catch {
    // silent
  }
}
