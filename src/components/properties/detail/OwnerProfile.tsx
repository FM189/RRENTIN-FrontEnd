"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface OwnerProfileProps {
  name: string;
  address: string;
  avatar: string;
  coverImage: string;
  buildingCount: number;
  buildingImages: string[];
}

export default function OwnerProfile({
  name,
  address,
  avatar,
  coverImage,
  buildingCount,
  buildingImages,
}: OwnerProfileProps) {
  const t = useTranslations("Dashboard.properties.detailPage");

  return (
    <div
      className="relative w-full overflow-hidden rounded-[7px] bg-white"
      style={{
        border: "0.88px solid #D5E0F6",
        boxShadow: "1.75px 1.75px 3.5px rgba(174, 191, 237, 0.25)",
      }}
    >
      {/* Cover Image */}
      <div className="relative h-[94px] w-full">
        <Image src={coverImage} alt="" fill className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(218.93deg, #2D313C 3.57%, #1D1F26 90.42%)",
            opacity: 0.6,
          }}
        />
      </div>

      {/* Avatar - overlapping cover */}
      <div className="flex justify-center">
        <div
          className="-mt-[52px] relative h-[103px] w-[103px] overflow-hidden rounded-full"
          style={{ border: "3.5px solid #FFFFFF" }}
        >
          <Image src={avatar} alt={name} fill className="object-cover" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-3 px-4 pb-5 pt-3">
        {/* Name + Bookmark */}
        <div className="flex w-full items-start gap-1">
          <div className="flex min-w-0 flex-1 flex-col gap-[3.5px]">
            <h4 className="text-[16px] font-semibold leading-[18px] text-[#1F242F]">
              {name}
            </h4>
            <div className="flex items-start gap-1">
              <Image
                src="/images/icons/dashboard/property/detail/location-blue.png"
                alt=""
                width={12}
                height={11}
                className="mt-0.5 shrink-0"
              />
              <span className="text-[10.5px] font-medium leading-[12px] tracking-[0.05em] text-[#0245A5]">
                {address}
              </span>
            </div>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3.5px] bg-[#E9F2FF]">
            <Image
              src="/images/icons/dashboard/property/detail/bookmark.png"
              alt=""
              width={16}
              height={21}
            />
          </div>
        </div>

        {/* Buildings */}
        <div className="flex w-full flex-col gap-1">
          <h5 className="text-[14px] font-semibold leading-[18px] text-[#1F242F]">
            {t("buildings")}
          </h5>
          <span className="text-[10px] font-medium leading-[12px] tracking-[0.05em] text-[#0245A5]">
            {buildingCount} {t("buildings")}
          </span>
          <div className="flex gap-3">
            {buildingImages.slice(0, 3).map((img, i) => (
              <div
                key={i}
                className="relative h-[43px] w-[78px] overflow-hidden rounded-[2px]"
              >
                <Image src={img} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
