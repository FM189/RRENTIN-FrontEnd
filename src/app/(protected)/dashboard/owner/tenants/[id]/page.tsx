"use client";

import Image from "next/image";
import { use } from "react";
import { useTranslations } from "next-intl";
import TenantDetailPanel from "@/components/tenants/TenantDetailPanel";
import {
  RentPaymentTrendChart,
  ContractRenewalTrendChart,
  TenantFeedbackChart,
} from "@/components/tenants/TenantCharts";

const MOCK_TENANT = {
  id: "1",
  name: "John Doe",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  propertyName: "Luxury Apartment - 5th Avenue, NY",
  phone: "(123)-453-092",
  email: "jhon@doegmail.com",
};

export default function TenantProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Dashboard.tenants");

  const tenant = MOCK_TENANT;

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Page heading */}
      <h1 className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-heading">
        {t("profilePage.tenantProfile")}
      </h1>

      {/* Outer white card — section 2 (profile) + section 3 (details + charts) */}
      <div
        className="rounded-[10px] bg-white px-6 py-6 sm:px-10 lg:px-16 lg:py-8"
        style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
      >
        {/* ── Section 2: Profile ── */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="h-[171px] w-[171px] shrink-0 overflow-hidden rounded-full border-[5px] border-white shadow-[0_0_0_1px_rgba(53,130,231,0.12)]">
            <Image
              src={tenant.avatar}
              alt={tenant.name}
              width={171}
              height={171}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-[14px]">
              <h2 className="truncate text-[30px] font-semibold leading-[26px] text-[#1F242F]">
                {tenant.name}
              </h2>
              <div className="flex flex-col gap-[9px]">
                <div className="flex items-center gap-[5.7px]">
                  <Image src="/images/icons/dashboard/tenant/house.png" alt="" width={29} height={27} className="shrink-0" />
                  <span className="text-[20px] font-medium leading-[23px] tracking-[0.05em] text-[#0245A5]">
                    {tenant.propertyName}
                  </span>
                </div>
                <div className="flex items-center gap-[5.2px]">
                  <Image src="/images/icons/dashboard/tenant/phone.png" alt="" width={24} height={24} className="shrink-0" />
                  <span className="text-[20px] font-medium leading-[23px] text-[#32343C]">
                    {tenant.phone}
                  </span>
                </div>
                <div className="flex items-center gap-[5.2px]">
                  <Image src="/images/icons/dashboard/tenant/email.png" alt="" width={28} height={19} className="shrink-0" />
                  <span className="text-[20px] font-medium leading-[23px] text-[#32343C]">
                    {tenant.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-[18px]">
              <button type="button" className="flex h-[37px] w-[37px] items-center justify-center rounded-[4px] bg-[#E9F2FF]">
                <Image src="/images/icons/dashboard/tenant/chat.png" alt="" width={24} height={21} />
              </button>
              <button type="button" className="flex h-[37px] w-[37px] items-center justify-center rounded-[4px] bg-[#E9F2FF]">
                <Image src="/images/icons/dashboard/property/detail/bookmark.png" alt="" width={19} height={25} />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-b border-[#F0F0F0]" />

        {/* ── Section 3: Details + Charts ── */}
        <div className="flex flex-col gap-6 xl:flex-row xl:gap-[18px]">
          {/* Left: each detail section is its own inner card */}
          <div className="min-w-0 flex-1">
            <TenantDetailPanel />
          </div>

          {/* Right: each chart is its own inner card */}
          <div className="flex flex-col gap-4 xl:w-[360px] xl:shrink-0">
            <RentPaymentTrendChart />
            <ContractRenewalTrendChart />
            <TenantFeedbackChart />
          </div>
        </div>
      </div>
    </div>
  );
}
