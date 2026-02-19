"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface PropertyTabsProps {
  propertyId: string;
}

export default function PropertyTabs({ propertyId }: PropertyTabsProps) {
  const t = useTranslations("Dashboard.properties.detailPage");

  return (
    <div className="flex flex-wrap items-start gap-6">
      {/* Edit Button */}
      <Link
        href={`/dashboard/owner/properties/${propertyId}/edit`}
        className="flex h-10 items-center gap-1.5 rounded-[6px] bg-[#0245A5] px-5"
      >
        <Image
          src="/images/icons/dashboard/property/edit.png"
          alt=""
          width={16}
          height={16}
          className="shrink-0"
        />
        <span className="text-[14px] font-semibold leading-[16px] tracking-[0.18px] text-white">
          {t("edit")}
        </span>
      </Link>

    </div>
  );
}
