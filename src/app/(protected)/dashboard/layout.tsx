"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

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
    <div className="min-h-screen flex bg-[#F5F7FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-2 pb-0">
          <DashboardHeader />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
