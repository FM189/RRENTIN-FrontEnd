"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";

export interface Property {
  id: string;
  title: string;
  type: string;
  address: string;
  price: string;
  image: string;
  propertyStatus: "available" | "rented" | "unavailable";
  approvalStatus: "pending" | "approved" | "rejected";
  rating?: number;
  isMostDemanded?: boolean;
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const t = useTranslations("Dashboard.properties");
  const router = useRouter();

  const statusStyles = {
    available: "bg-[rgba(52,199,89,0.11)] text-[#34C759]",
    rented: "bg-[rgba(53,130,231,0.19)] text-[#0245A5]",
    unavailable: "bg-[rgba(150,150,150,0.15)] text-[#969696]",
  };

  const statusLabels = {
    available: t("statusAvailable"),
    rented: t("statusRented"),
    unavailable: t("statusUnavailable"),
  };

  const rating = property.rating ?? 4.9;

  return (
    <Link
      href={`/dashboard/owner/properties/${property.id}`}
      className="relative block rounded-[5.5px]"
      style={{ boxShadow: "0px 1.4px 16px rgba(53, 130, 231, 0.12)" }}
    >
      {/* Image Section */}
      <div className="relative aspect-[270/226] bg-[#A3A3A3]">
        <div className="absolute inset-0 overflow-hidden rounded-[5.5px]">
          {property.image ? (
            <Image
              src={property.image}
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[#D6E3F4]" />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Type badge - top left */}
        <span
          className="absolute left-0 top-0 rounded-br-[2px] bg-white px-2 py-1 text-[8.5px] font-semibold leading-[10px] tracking-[0.05em] text-[#3582E7]"
          style={{ backdropFilter: "blur(11px)" }}
        >
          {property.type}
        </span>

        {/* Edit icon - top right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/dashboard/owner/properties/${property.id}/edit`);
          }}
          className="absolute right-2.5 top-2.5 flex h-[18px] w-[18px] cursor-pointer items-center justify-center"
        >
          <Image
            src="/images/icons/dashboard/property/edit.png"
            alt=""
            width={18}
            height={18}
          />
        </button>

        {/* Content Panel - positioned inside image */}
        <div
          className="absolute bottom-3 left-[14px] right-[14px] flex flex-col gap-[5px] rounded-[5.5px] bg-white px-3.5 py-3"
          style={{ boxShadow: "0px 1.4px 8.4px rgba(53, 130, 231, 0.1)" }}
        >
          {/* Most Demanded + Title Row */}
          <div className="flex flex-col">
            {property.isMostDemanded && (
              <span className="-mt-0.5 mb-0 text-[9px] font-bold leading-[11px] tracking-[0.02em] text-[#FDAC3B]">
                {t("mostDemanded")}
              </span>
            )}
            <div className="flex items-start justify-between gap-1">
              <h4 className="truncate text-[15px] font-semibold leading-[18px] tracking-[0.05em] text-heading">
                {property.title}
              </h4>
              <span
                className={`shrink-0 rounded-[2px] px-1.5 py-[3px] text-[10px] font-semibold leading-[12px] tracking-[0.05em] ${statusStyles[property.propertyStatus]}`}
              >
                {statusLabels[property.propertyStatus]}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-[3px]">
            <Image
              src="/images/icons/dashboard/property/location-pin.png"
              alt=""
              width={5}
              height={6}
              className="shrink-0"
            />
            <span className="truncate text-[8.5px] leading-[10px] tracking-[0.05em] text-[#969696]">
              {property.address}
            </span>
          </div>

          {/* Divider */}
          <div style={{ borderBottom: "0.7px solid #D8D8D8" }} />

          {/* Price + Rating */}
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold leading-[18px] tracking-[0.05em] text-heading">
              {formatPrice(property.price)}
              <span className="text-[8.5px] font-normal leading-[10px] text-[#969696]">
                /{t("perMonth")}
              </span>
            </span>
            <div className="flex items-center gap-[3.5px]">
              <Image
                src="/images/icons/dashboard/property/star.png"
                alt=""
                width={13}
                height={13}
                className="shrink-0"
              />
              <span className="text-[8.5px] leading-[10px] tracking-[0.05em] text-[#969696]">
                {rating}/5
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
