"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/lib/socket/SocketProvider";
import { getUnreadCount } from "@/actions/notifications";

export function useUnreadCount() {
  const { socket } = useSocket();
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then(setCount);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => setCount((prev) => prev + 1);
    socket.on("notification:new", handler);
    return () => { socket.off("notification:new", handler); };
  }, [socket]);

  return count;
}
