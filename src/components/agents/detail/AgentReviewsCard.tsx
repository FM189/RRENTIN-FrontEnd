"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Michael",
    date: "22 Jul",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    rating: 4,
    text: "I really liked the location of this rental property. The market and public transport were nearby. The house was clean, and the lan...",
  },
];

const OVERALL_RATING = 4.0;
const TOTAL_PAGES = 10;

function Stars({
  count,
  total = 5,
  size,
  gap,
}: {
  count: number;
  total?: number;
  size: number;
  gap: number;
}) {
  return (
    <div className="flex items-center" style={{ gap: `${gap}px` }}>
      {Array.from({ length: total }).map((_, i) => (
        <Image
          key={i}
          src="/images/icons/dashboard/property/star.png"
          alt=""
          width={size}
          height={size}
          className={i < count ? "" : "grayscale opacity-40"}
        />
      ))}
    </div>
  );
}

export default function AgentReviewsCard() {
  const t = useTranslations("Dashboard.agents.detailPage");
  const [currentPage, setCurrentPage] = useState(1);

  const pages = [1, 2, "...", TOTAL_PAGES];

  return (
    <div
      className="flex flex-col gap-[20px] rounded-[8px] bg-white px-[24px] py-[14px]"
      style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
    >
      {/* ── Header: Reviews title + overall rating ── */}
      <div className="flex items-center justify-between gap-[20px]">
        <span className="text-[18px] font-semibold leading-[21px] tracking-[0.05em] text-[#32343C]">
          {t("reviews")}
        </span>
        <div className="flex items-center gap-[14px]">
          <span className="text-[20px] font-medium leading-[30px] text-[#323232]">
            {OVERALL_RATING.toFixed(1)}
          </span>
          <Stars count={5} size={17} gap={4.8} />
        </div>
      </div>

      {/* ── Review cards ── */}
      <div className="flex flex-col gap-[18px]">
        {MOCK_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="flex flex-col gap-[16px] rounded-[8px] bg-white p-[16px]"
            style={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.07)" }}
          >
            {/* Top row: avatar + name + date | stars */}
            <div className="flex items-center justify-between gap-[8px]">
              {/* Left: avatar + name + dot + date */}
              <div className="flex items-center gap-[8px]">
                <div className="h-[32px] w-[32px] shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-[8px]">
                  <span className="text-[14px] font-medium leading-[21px] text-[#323232]">
                    {review.name}
                  </span>
                  <span className="h-[2px] w-[2px] rounded-full bg-[#323232]" />
                  <span className="text-[14px] font-normal leading-[21px] text-[#323232]">
                    {review.date}
                  </span>
                </div>
              </div>

              {/* Right: per-review stars */}
              <Stars count={review.rating} size={19} gap={3.2} />
            </div>

            {/* Review text + Read More */}
            <div className="flex flex-col gap-[16px]">
              <p className="text-[12px] font-normal leading-[18px] text-[#323232]">
                {review.text}
              </p>
              <span className="text-right text-[14px] font-medium leading-[21px] text-[#0245A5]">
                {t("readMore")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-center gap-[8px]">
        {/* First */}
        <button
          type="button"
          onClick={() => setCurrentPage(1)}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#F1F1F1] bg-white text-[13px] font-semibold text-[#545454]"
        >
          «
        </button>

        {/* Prev */}
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#F1F1F1] bg-white text-[13px] font-semibold text-[#545454]"
        >
          ‹
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) => {
          const isActive = page === currentPage;
          const isEllipsis = page === "...";
          return (
            <button
              key={idx}
              type="button"
              disabled={isEllipsis}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[12px] font-bold leading-[18px]"
              style={{
                background: isActive ? "#0245A5" : "#FFFFFF",
                color: isActive ? "#FFFFFF" : "#545454",
                boxShadow: isEllipsis
                  ? undefined
                  : "0px -0.86px 8.63px rgba(0, 0, 0, 0.1)",
              }}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#F1F1F1] bg-white text-[13px] font-semibold text-[#545454]"
        >
          ›
        </button>

        {/* Last */}
        <button
          type="button"
          onClick={() => setCurrentPage(TOTAL_PAGES)}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#F1F1F1] bg-white text-[13px] font-semibold text-[#545454]"
        >
          »
        </button>
      </div>
    </div>
  );
}
