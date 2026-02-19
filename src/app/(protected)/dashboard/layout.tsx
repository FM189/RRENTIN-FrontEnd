"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SocketProvider } from "@/lib/socket";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="h-screen flex bg-[#F5F7FA] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-3 pb-0 shrink-0">
            <DashboardHeader />
          </div>
          <main className="flex-1 sm:p-3 p-2">{children}</main>
        </div>
      </div>
    </SocketProvider>
  );
}
