"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface KeyValueItem {
  labelKey: string;
  value: string;
}

interface AmenityItem {
  icon: string;
  label: string;
}

interface PropertyDescriptionProps {
  description: string;
  rentalDetails: KeyValueItem[];
  paymentHistory: KeyValueItem[];
  amenities: AmenityItem[];
  furnishing: AmenityItem[];
  security: AmenityItem[];
  views: AmenityItem[];
}

function KeyValueRow({ items }: { items: KeyValueItem[] }) {
  const t = useTranslations("Dashboard.properties.detailPage");

  return (
    <div className="grid grid-cols-1 gap-[6px] sm:grid-cols-2 sm:gap-x-5">
      {items.map((item) => (
        <div key={item.labelKey} className="flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2.5">
            <span className="text-[13px] leading-[15px] text-[#5F5F5F]">
              {t(item.labelKey)}
            </span>
            <span className="shrink-0 text-[13px] font-medium leading-[15px] text-[#5F5F5F]">
              {item.value}
            </span>
          </div>
          <div style={{ borderBottom: "1px solid rgba(95, 95, 95, 0.2)" }} />
        </div>
      ))}
    </div>
  );
}

function AmenityGrid({
  items,
  columns = 4,
}: {
  items: AmenityItem[];
  columns?: number;
}) {
  const colClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-[8px] gap-x-5 ${colClass}`}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Image
              src={item.icon}
              alt=""
              width={12}
              height={12}
              className="shrink-0"
            />
            <span className="text-[13px] leading-[15px] text-[#5F5F5F]">
              {item.label}
            </span>
          </div>
          <div style={{ borderBottom: "1px solid rgba(95, 95, 95, 0.2)" }} />
        </div>
      ))}
    </div>
  );
}

export default function PropertyDescription({
  description,
  rentalDetails,
  paymentHistory,
  amenities,
  furnishing,
  security,
  views,
}: PropertyDescriptionProps) {
  const t = useTranslations("Dashboard.properties.detailPage");

  return (
    <div
      className="flex flex-col gap-[14px] rounded-[6px] bg-white px-5 pb-12 pt-3.5"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* Description Header */}
      <h3 className="text-[24px] font-semibold leading-[28px] tracking-[0.05em] text-heading">
        {t("description")}
      </h3>

      {/* Description Text */}
      <p className="text-[16px] leading-[23px] tracking-[0.04em] text-[rgba(95,95,95,0.8)]">
        {description}
      </p>

      {/* Key Features label */}
      <p className="mb-2 text-[24px] font-semibold leading-[28px] tracking-[0.05em] text-heading">
        🏡 {t("keyFeatures")}
      </p>

      {/* Detailed Sections - with left padding */}
      <div className="flex flex-col gap-2.5 px-0 sm:px-5">
        {/* Rental Agreement Details */}
        <Section title={t("rentalAgreement")}>
          <KeyValueRow items={rentalDetails} />
        </Section>

        {/* Payment History & Dues */}
        <Section title={t("paymentHistory")}>
          <KeyValueRow items={paymentHistory} />
        </Section>

        {/* Amenities */}
        <Section title={t("amenities")}>
          <AmenityGrid items={amenities} columns={4} />
        </Section>

        {/* Furnishing */}
        <Section title={t("furnishing")}>
          <AmenityGrid items={furnishing} columns={4} />
        </Section>

        {/* Security and Safety */}
        <Section title={t("securitySafety")}>
          <AmenityGrid items={security} columns={3} />
        </Section>

        {/* Views and Direction */}
        <Section title={t("viewsDirection")}>
          <AmenityGrid items={views} columns={4} />
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[14px]">
      <h4 className="text-[15px] font-semibold leading-[18px] tracking-[0.05em] text-heading">
        {title}
      </h4>
      {children}
    </div>
  );
}
