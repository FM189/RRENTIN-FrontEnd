"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface Review {
  avatar: string;
  name: string;
  date: string;
  rating: number;
  text: string;
}

interface ReviewsSectionProps {
  averageRating: number;
  reviews: Review[];
  currentPage: number;
  totalPages: number;
}

function StarRating({
  rating,
  size = 19.2,
  gap = 3.2,
}: {
  rating: number;
  size?: number;
  gap?: number;
}) {
  return (
    <div className="flex items-center" style={{ gap }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Image
          key={i}
          src={
            i < rating
              ? "/images/icons/dashboard/property/detail/star-filled.png"
              : "/images/icons/dashboard/property/detail/star-empty.png"
          }
          alt=""
          width={size}
          height={size}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({
  averageRating,
  reviews,
  currentPage,
  totalPages,
}: ReviewsSectionProps) {
  const t = useTranslations("Dashboard.properties.detailPage");

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Reviews Title */}
      <h3 className="w-full text-[18px] font-semibold leading-[21px] tracking-[0.05em] text-heading">
        {t("reviews")}
      </h3>

      {/* Average Rating Card */}
      <div
        className="flex w-full flex-col items-center gap-3 rounded-[8px] bg-white px-4 py-4"
        style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.07)" }}
      >
        <h4 className="text-[22px] font-medium leading-[33px] text-[#323232]">
          {t("averageRating")}
        </h4>
        <div className="flex items-center gap-3.5">
          <span className="text-[42px] font-medium leading-[63px] text-[#323232]">
            {averageRating.toFixed(1)}
          </span>
          <StarRating rating={Math.round(averageRating)} size={28.8} gap={4.8} />
        </div>
        <span className="text-[12px] leading-[18px] text-[#323232]">
          {t("avgRatingYear")}
        </span>
      </div>

      {/* Review Cards */}
      {reviews.map((review, i) => (
        <div
          key={i}
          className="flex w-full flex-col gap-4 rounded-[8px] bg-white p-4"
          style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.07)" }}
        >
          {/* Header: avatar + name + date + stars */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src={review.avatar} alt="" fill className="object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium leading-[21px] text-[#323232]">
                  {review.name}
                </span>
                <span className="h-0.5 w-0.5 rounded-full bg-[#323232]" />
                <span className="text-[14px] leading-[21px] text-[#323232]">
                  {review.date}
                </span>
              </div>
            </div>
            <StarRating rating={review.rating} size={19.2} gap={3.2} />
          </div>

          {/* Review text */}
          <div className="flex flex-col gap-4">
            <p className="line-clamp-3 text-[12px] leading-[18px] text-[#323232]">
              {review.text}
            </p>
            <span className="text-right text-[14px] font-medium leading-[21px] text-[#0245A5]">
              {t("readMore")}
            </span>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex items-center gap-2">
        {/* First */}
        <PaginationButton>&laquo;</PaginationButton>
        {/* Prev */}
        <PaginationButton>&lsaquo;</PaginationButton>
        {/* Pages */}
        {[1, 2].map((page) => (
          <PaginationButton key={page} active={page === currentPage}>
            {page}
          </PaginationButton>
        ))}
        <PaginationButton>...</PaginationButton>
        <PaginationButton>{totalPages}</PaginationButton>
        {/* Next */}
        <PaginationButton>&rsaquo;</PaginationButton>
        {/* Last */}
        <PaginationButton>&raquo;</PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-[12px] font-bold leading-[18px] ${
        active
          ? "bg-[#0245A5] text-white shadow-[0px_-0.86px_8.63px_rgba(0,0,0,0.1)]"
          : "border border-[#F1F1F1] bg-white text-[#545454] shadow-[0px_-0.86px_8.63px_rgba(0,0,0,0.1)]"
      }`}
    >
      {children}
    </button>
  );
}
