"use client";

import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#32343C]">
        {t("welcome", { name: user?.firstName ?? "" })}
      </h1>
      <p className="mt-2 text-[#666666]">
        {t(`roles.${user?.role ?? "tenant"}`)}
      </p>
    </div>
  );
}
