"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";

interface PropertyFeature {
  icon: string;
  value: string | number;
  labelKey: string;
}

interface PropertyInfoProps {
  title: string;
  address: string;
  price: number;
  features: PropertyFeature[];
}

export default function PropertyInfo({
  title,
  address,
  price,
  features,
}: PropertyInfoProps) {
  const t = useTranslations("Dashboard.properties.detailPage");

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      {/* Left: Title, Address, Price */}
      <div className="flex flex-col gap-[10px]">
        {/* Title + Address */}
        <div className="flex flex-col gap-[5.85px]">
          <h2 className="text-[20px] font-semibold leading-[23px] tracking-[0.05em] text-heading">
            {title}
          </h2>
          <p className="text-[19.5px] leading-[23px] tracking-[0.05em] text-heading opacity-50">
            {address}
          </p>
        </div>

        {/* Price */}
        <p className="text-[43px] font-semibold leading-[51px] tracking-[0.05em] text-heading">
          ฿{formatPrice(price)}
          <span className="text-[19.5px] font-normal leading-[23px]">
            {t("perMonth")}
          </span>
        </p>
      </div>

      {/* Right: Feature icons */}
      <div className="flex items-center gap-5">
        {features.map((feature) => (
          <div
            key={feature.labelKey}
            className="flex w-16 flex-col items-center gap-1"
          >
            {/* Icon circle */}
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[rgba(200,224,255,0.3)]">
              <Image
                src={feature.icon}
                alt=""
                width={24}
                height={24}
              />
            </div>
            {/* Value + Label */}
            <div className="text-center text-[14px] leading-[16px] text-[#0245A5]">
              <span>{feature.value}</span>
              <br />
              <span>{t(feature.labelKey)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
