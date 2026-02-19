"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface PropertyImageGalleryProps {
  images: string[];
}

export default function PropertyImageGallery({
  images,
}: PropertyImageGalleryProps) {
  const t = useTranslations("Dashboard.properties.detailPage");
  const [activeIndex, setActiveIndex] = useState(0);

  const mainImage = images[activeIndex] || images[0];
  const thumbnails = images.slice(1, 5);
  const extraCount = images.length - 5;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:gap-[13.72px]">
      {/* Main Image */}
      <div
        className="relative w-full overflow-hidden rounded-[7.7px] bg-[#A3A3A3] lg:w-[62%]"
        style={{ boxShadow: "0px 1.3px 15px rgba(53, 130, 231, 0.12)" }}
      >
        <div className="relative aspect-[714/382]">
          <Image
            src={mainImage}
            alt=""
            fill
            className="object-cover"
          />
          {/* Gradient overlay - dark at bottom */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 0, 0, 0) 38.92%, rgba(0, 0, 0, 0.5) 100%)",
            }}
          />

          {/* Navigation arrows - vertically centered */}
          <div className="absolute left-6 right-6 top-1/2 flex -translate-y-1/2 items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-white"
            >
              <Image
                src="/images/icons/dashboard/property/detail/chevron-left.png"
                alt=""
                width={6}
                height={9}
              />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-white"
            >
              <Image
                src="/images/icons/dashboard/property/detail/chevron-right.png"
                alt=""
                width={6}
                height={9}
              />
            </button>
          </div>

          {/* Dot indicators at bottom */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-[3.6px]">
            {images.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className="h-[9.6px] w-[9.6px] rounded-full"
                style={{
                  background:
                    i === activeIndex
                      ? "#FFFFFF"
                      : "rgba(255, 255, 255, 0.6)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnail Grid - 2x2 */}
      <div
        className="grid grid-cols-2 gap-3 lg:w-[38%]"
        style={{ gap: "12px 11.5px" }}
      >
        {thumbnails.map((img, i) => (
          <div
            key={i}
            className="relative aspect-[211/185] overflow-hidden rounded-[3.8px] bg-[#D7D7D7]"
          >
            <Image src={img} alt="" fill className="object-cover" />
            {/* Dark overlay - darker on last if +N */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  i === 3 && extraCount > 0
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(0, 0, 0, 0.4)",
              }}
            />
            {/* +N count on last thumbnail */}
            {i === 3 && extraCount > 0 && (
              <span className="absolute inset-0 flex items-center justify-center text-[41px] font-medium leading-[48px] text-white">
                {t("morePhotos", { count: extraCount })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
