"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const TEST_USER_ID = "test-user-123";

export default function SocketTestPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      auth: { userId: TEST_USER_ID },
      withCredentials: true,
    });

    s.on("connect", () => {
      setIsConnected(true);
      addLog(`Connected — ID: ${s.id} (auto-joined room user:${TEST_USER_ID})`);
    });

    s.on("disconnect", (reason) => {
      setIsConnected(false);
      addLog(`Disconnected — ${reason}`);
    });

    s.on("chat:message", (data) => {
      addLog(`Chat message: ${JSON.stringify(data)}`);
    });

    s.on("notification:new", (data) => {
      addLog(`Notification received: ${JSON.stringify(data)}`);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const joinRoom = () => {
    socket?.emit("chat:join", "test-room");
    addLog("Joined chat room: test-room");
  };

  const sendMessage = () => {
    socket?.emit("chat:message", {
      roomId: "test-room",
      message: "Hello from frontend!",
      senderId: TEST_USER_ID,
    });
    addLog("Sent message to test-room");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-4">Socket.io Test</h1>

        <p className="mb-4">
          Status:{" "}
          <span className={`font-semibold ${isConnected ? "text-green-600" : "text-red-500"}`}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
        <p className="text-xs text-gray-500 mb-4">User ID: {TEST_USER_ID}</p>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={joinRoom} className="px-4 py-2 bg-blue-600 text-white text-sm rounded">
            Join Chat Room
          </button>
          <button onClick={sendMessage} className="px-4 py-2 bg-green-600 text-white text-sm rounded">
            Send Chat Message
          </button>
        </div>

        <div className="bg-gray-900 text-green-400 rounded p-4 text-xs font-mono max-h-80 overflow-y-auto">
          {logs.length === 0 && <p className="text-gray-500">Waiting for events...</p>}
          {logs.map((log, i) => (
            <p key={i}>{log}</p>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <p className="font-semibold mb-1">Test notification from backend:</p>
          <code>
            GET http://localhost:5000/api/test-notification/{TEST_USER_ID}
          </code>
        </div>
      </div>
    </div>
  );
}
