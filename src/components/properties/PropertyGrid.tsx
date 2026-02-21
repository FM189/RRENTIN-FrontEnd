"use client";

import { useTranslations } from "next-intl";
import PropertyCard, { type Property } from "./PropertyCard";

interface PropertyGridProps {
  properties: Property[];
}

export default function PropertyGrid({ properties }: PropertyGridProps) {
  const t = useTranslations("Dashboard.properties");

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[16px] font-medium text-heading">{t("noProperties")}</p>
        <p className="mt-1 text-[13px] text-[#969696]">{t("noPropertiesDesc")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
