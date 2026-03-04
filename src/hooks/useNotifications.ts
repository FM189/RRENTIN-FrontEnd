"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/lib/socket/SocketProvider";
import { getNotifications, markNotificationRead, type NotificationItem } from "@/actions/notifications";

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export function useNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    getNotifications().then(({ data, unreadCount }) => {
      setNotifications(data);
      setUnreadCount(unreadCount);
      setLoading(false);
    });
  }, []);

  // Real-time listener
  useEffect(() => {
    if (!socket) return;

    const handler = (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:new", handler);
    return () => {
      socket.off("notification:new", handler);
    };
  }, [socket]);

  const todayNotifications = notifications.filter((n) =>
    isToday(new Date(n.createdAt))
  );
  const yesterdayNotifications = notifications.filter((n) =>
    isYesterday(new Date(n.createdAt))
  );

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id && !n.isRead ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    markNotificationRead(id);
  };

  return { todayNotifications, yesterdayNotifications, unreadCount, loading, markRead };
}
