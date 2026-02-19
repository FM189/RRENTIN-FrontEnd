"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export type LeaseColor = "blue" | "orange" | "red";

export interface TenantData {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  propertyName: string;
  phone: string;
  agentName: string;
  lease: {
    startDate: string;
    endDate: string;
    progress: number; // 0–100
    color: LeaseColor;
  };
  rent: string;
}

const LEASE_COLORS: Record<LeaseColor, string> = {
  blue: "#0245A5",
  orange: "#FDAC3B",
  red: "#E35454",
};

const RENT_COLORS: Record<LeaseColor, string> = {
  blue: "#1F242F",
  orange: "#FDAC3B",
  red: "#E35454",
};

function LeaseProgressBar({
  progress,
  color,
}: {
  progress: number;
  color: LeaseColor;
}) {
  const fill = LEASE_COLORS[color];

  return (
    <div className="relative h-[6px] w-full">
      {/* Track */}
      <div
        className="absolute left-[3px] right-[3px] top-[2px] h-[2px] rounded-full"
        style={{ background: "rgba(83, 144, 224, 0.2)" }}
      />
      {/* Fill */}
      <div
        className="absolute left-[3px] top-[2px] h-[2px] rounded-full"
        style={{ width: `${progress}%`, background: fill }}
      />
      {/* Left dot */}
      <div
        className="absolute left-0 top-0 h-[6px] w-[6px] rounded-full"
        style={{ background: fill }}
      />
      {/* Right dot */}
      <div
        className="absolute right-0 top-0 h-[6px] w-[6px] rounded-full"
        style={{ background: "#D8E6F9" }}
      />
    </div>
  );
}

export default function TenantCard({ tenant }: { tenant: TenantData }) {
  const t = useTranslations("Dashboard.tenants");
  const rentColor = RENT_COLORS[tenant.lease.color];

  return (
    <div
      className="relative rounded-[8px] border border-[#D5E0F6] bg-white overflow-hidden"
      style={{ boxShadow: "2px 2px 4px rgba(174, 191, 237, 0.25)" }}
    >
      {/* Cover image */}
      <div className="mx-2.5 mt-1.5 h-[107px] overflow-hidden rounded-[6px] relative">
        <Image src={tenant.coverImage} alt="" fill className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(218.93deg, rgba(45,49,60,0.55) 3.57%, rgba(29,31,38,0.75) 90.42%)",
          }}
        />
      </div>

      {/* Avatar — overlaps cover */}
      <div className="absolute left-[26px] top-[50px] h-[86px] w-[86px] overflow-hidden rounded-full border-4 border-white">
        <Image src={tenant.avatar} alt={tenant.name} fill className="object-cover" />
      </div>

      {/* Card body */}
      <div className="px-[22px] pt-[34px] pb-[14px] flex flex-col gap-3">
        {/* Name + View Profile */}
        <div className="flex items-start justify-between gap-2">
          {/* Left: name + property + phone + agent */}
          <div className="flex flex-col gap-[3px] min-w-0">
            <h3 className="text-[16px] font-semibold leading-[20px] text-[#1F242F] truncate">
              {tenant.name}
            </h3>

            {/* Property */}
            <div className="flex items-center gap-[4.4px]">
              <Image
                src="/images/icons/dashboard/tenant/house.png"
                alt=""
                width={14}
                height={13}
                className="shrink-0"
              />
              <span className="truncate text-[12px] font-medium leading-[14px] tracking-[0.05em] text-[#0245A5]">
                {tenant.propertyName}
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-[4px]">
              <Image
                src="/images/icons/dashboard/tenant/phone.png"
                alt=""
                width={13}
                height={13}
                className="shrink-0"
              />
              <span className="text-[12px] font-medium leading-[14px] text-[#32343C]">
                {tenant.phone}
              </span>
            </div>

            {/* Agent */}
            <div className="flex items-center gap-[4px]">
              <Image
                src="/images/icons/dashboard/tenant/agent.png"
                alt=""
                width={12}
                height={13}
                className="shrink-0"
              />
              <span className="text-[12px] font-medium leading-[14px] tracking-[0.05em] text-[#0245A5]">
                {tenant.agentName}
              </span>
            </div>
          </div>

          {/* View Profile button */}
          <Link
            href={`/dashboard/owner/tenants/${tenant.id}`}
            className="shrink-0 flex items-center gap-1.5 rounded-[4px] bg-[#0571ED] px-3 h-6 text-white"
          >
            <span className="text-[12px] font-medium leading-6 whitespace-nowrap">
              {t("viewProfile")}
            </span>
            <Image
              src="/images/icons/dashboard/tenant/arrow-out.png"
              alt=""
              width={9}
              height={9}
              className="shrink-0"
            />
          </Link>
        </div>

        {/* Lease Duration card */}
        <div
          className="rounded-[4.4px] border border-[#F0F0F0] px-2 py-1"
          style={{ boxShadow: "0px 2.2px 13.2px rgba(53, 130, 231, 0.1)" }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-full text-center text-[10px] font-medium leading-[12px] tracking-[0.05em] text-[#32343C]">
              {t("leaseDuration")}
            </span>

            <LeaseProgressBar progress={tenant.lease.progress} color={tenant.lease.color} />

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium leading-[12px] tracking-[0.05em] text-[#32343C]">
                  {t("startDate")}
                </span>
                <span className="text-[8px] font-medium leading-[9px] tracking-[0.05em] text-[rgba(50,52,60,0.8)]">
                  {tenant.lease.startDate}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium leading-[12px] tracking-[0.05em] text-[#32343C]">
                  {t("endDate")}
                </span>
                <span className="text-[8px] font-medium leading-[9px] tracking-[0.05em] text-[rgba(50,52,60,0.8)]">
                  {tenant.lease.endDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rent row */}
        <div className="flex items-center gap-6">
          <span className="text-[16px] font-semibold uppercase tracking-wide text-[#1F242F]">
            {t("rent")}
          </span>
          <span className="text-[18px] font-semibold leading-[20px]" style={{ color: rentColor }}>
            {tenant.rent}
            <span className="ml-1 text-[10px] font-normal text-[#969696]">
              {t("perMonth")}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
