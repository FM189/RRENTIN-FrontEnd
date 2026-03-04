import type { Metadata } from "next";
import { getNotificationsPage } from "@/actions/notifications";
import NotificationPageContent from "@/components/dashboard/NotificationPageContent";

export const metadata: Metadata = {
  title: "Notifications | Rrentin",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TenantNotificationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { data, total, totalPages, unreadCount } = await getNotificationsPage(page);

  return (
    <NotificationPageContent
      initialData={data}
      initialTotal={total}
      initialTotalPages={totalPages}
      initialUnreadCount={unreadCount}
      initialPage={page}
      basePath="/dashboard/tenant/notification"
    />
  );
}
