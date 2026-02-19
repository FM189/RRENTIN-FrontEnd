"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import TenantCard, { TenantData } from "./TenantCard";

const MOCK_TENANTS: TenantData[] = [
  {
    id: "1",
    name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&h=300&fit=crop",
    propertyName: "Luxury Apartment #12",
    phone: "(123)-453-092",
    agentName: "Agent name",
    lease: { startDate: "23/Jan/2025", endDate: "23/Feb/2025", progress: 30, color: "blue" },
    rent: "$765",
  },
  {
    id: "2",
    name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=300&fit=crop",
    propertyName: "Luxury Apartment #12",
    phone: "(123)-453-092",
    agentName: "Agent name",
    lease: { startDate: "23/Jan/2025", endDate: "23/Feb/2025", progress: 85, color: "orange" },
    rent: "$765",
  },
  {
    id: "3",
    name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=300&fit=crop",
    propertyName: "Luxury Apartment #12",
    phone: "(123)-453-092",
    agentName: "Agent name",
    lease: { startDate: "23/Jan/2025", endDate: "23/Feb/2025", progress: 97, color: "red" },
    rent: "$765",
  },
  {
    id: "4",
    name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=300&fit=crop",
    propertyName: "Luxury Apartment #12",
    phone: "(123)-453-092",
    agentName: "Agent name",
    lease: { startDate: "23/Jan/2025", endDate: "23/Feb/2025", progress: 85, color: "orange" },
    rent: "$765",
  },
  {
    id: "5",
    name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=300&fit=crop",
    propertyName: "Luxury Apartment #12",
    phone: "(123)-453-092",
    agentName: "Agent name",
    lease: { startDate: "23/Jan/2025", endDate: "23/Feb/2025", progress: 97, color: "red" },
    rent: "$765",
  },
  {
    id: "6",
    name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=300&fit=crop",
    propertyName: "Luxury Apartment #12",
    phone: "(123)-453-092",
    agentName: "Agent name",
    lease: { startDate: "23/Jan/2025", endDate: "23/Feb/2025", progress: 45, color: "blue" },
    rent: "$765",
  },
];

export default function TenantGrid() {
  const t = useTranslations("Dashboard.tenants");
  const [search, setSearch] = useState("");

  const filtered = MOCK_TENANTS.filter((tenant) =>
    tenant.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="rounded-[12px] bg-white"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* Section header */}
      <div className="px-[29px] pt-[14px]">
        <div className="flex items-center justify-between gap-6 h-[40px]">
          {/* Left: icon + My Tenants */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="flex h-[30px] w-[32px] shrink-0 items-center justify-center rounded-[3px]"
              style={{
                background: "#F7FAFE",
                border: "0.2px solid rgba(53, 130, 231, 0.02)",
              }}
            >
              <Image
                src="/images/icons/dashboard/property/properties-2.png"
                alt=""
                width={14}
                height={18}
              />
            </div>
            <span className="text-[14px] font-semibold leading-[16px] tracking-[0.05em] text-[#32343C] whitespace-nowrap">
              {t("myTenants")}
            </span>
          </div>

          {/* Center: search */}
          <div
            className="flex flex-1 max-w-[440px] items-center gap-2.5 rounded-[4px] border border-[rgba(220,220,220,0.3)] bg-white px-[18px] h-[40px]"
            style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.06)" }}
          >
            <Image
              src="/images/icons/dashboard/property/search.png"
              alt=""
              width={14}
              height={14}
              className="shrink-0"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-transparent text-[14px] leading-[16px] tracking-[0.05em] text-[rgba(150,150,150,0.7)] outline-none placeholder:text-[rgba(150,150,150,0.7)]"
            />
          </div>

          {/* Right: Status dropdown */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-[4px] border border-[rgba(220,220,220,0.3)] bg-white px-5 h-[40px] shrink-0"
            style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.06)" }}
          >
            <span className="text-[14px] leading-[16px] tracking-[0.05em] text-[#969696]">
              {t("statusFilter")}
            </span>
            <Image
              src="/images/icons/dashboard/property/chevron-down.png"
              alt=""
              width={11}
              height={6}
              className="shrink-0"
            />
          </button>
        </div>

        {/* Divider */}
        <div
          className="mt-[18px]"
          style={{ borderBottom: "0.6px solid rgba(57, 93, 140, 0.4)" }}
        />
      </div>

      {/* Cards grid */}
      <div
        className="px-[29px] py-[14px] overflow-y-auto"
        style={{
          maxHeight: "690px",
          scrollbarWidth: "thin",
          scrollbarColor: "#0245A5 rgba(214, 227, 244, 0.8)",
        }}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      </div>
    </div>
  );
}
