"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import FilterDropdown, { type FilterDropdownOption } from "@/components/ui/FilterDropdown";
import Pagination from "@/components/ui/Pagination";
import { getShowingAgents, type ShowingAgentItem } from "@/actions/visit-requests";
import { formatPrice } from "@/lib/format";

interface Props {
  onClose: () => void;
}

export default function AgentShowingModal({ onClose }: Props) {
  const t = useTranslations("Dashboard.ownerVisitRequests");

  const [agents,      setAgents]      = useState<ShowingAgentItem[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);

  const [locationOptions,  setLocationOptions]  = useState<FilterDropdownOption[]>([]);
  const [priceRangeOptions, setPriceRangeOptions] = useState<FilterDropdownOption[]>([]);

  const [search,     setSearch]     = useState("");
  const [location,   setLocation]   = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [page,       setPage]       = useState(1);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShowingAgents({ page, search, location, priceRange });
      setAgents(res.agents);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      // Only update filter options on first load (page 1, no filters)
      if (page === 1 && !search && !location && !priceRange) {
        setLocationOptions(res.locationOptions);
        setPriceRangeOptions(res.priceRangeOptions);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, location, priceRange]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleLocation = (val: string) => { setLocation(val); setPage(1); };
  const handlePrice = (val: string) => { setPriceRange(val); setPage(1); };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-white overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-[rgba(65,65,65,0.1)] px-6 py-4">
        <h2 className="text-[22px] font-semibold text-[#32343C]">
          {t("onDemandShowingAgent")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(50,52,60,0.44)] hover:bg-[rgba(50,52,60,0.6)]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="border-b border-[rgba(65,65,65,0.1)] bg-white px-4 py-3 sm:px-6">

        {/* Row 1 (all screens): label + search centered + filters */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Label */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/icons/dashboard/property/properties-2.png"
              alt=""
              width={18}
              height={18}
              className="shrink-0"
            />
            <span className="whitespace-nowrap text-sm font-semibold text-[#32343C]">
              {t("availableAgents")}
              {!loading && (
                <span className="ml-1 font-normal text-[#969696]">({total})</span>
              )}
            </span>
          </div>

          {/* Search — flex-1 so it fills the row, min-width so it wraps cleanly */}
          <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-[#EBEBEB] bg-white px-4 py-2 sm:max-w-[340px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#969696]">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder={t("searchAgents")}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#32343C] outline-none placeholder:text-[#969696]"
            />
          </div>

          {/* Filters row — wraps below search on small screens */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Location */}
            <div className="w-[140px] sm:w-[160px]">
              <FilterDropdown
                value={location}
                placeholder={t("locationFilter")}
                options={locationOptions}
                onChange={handleLocation}
                buttonClassName="h-[38px] rounded-lg"
              />
            </div>

            {/* Price range */}
            <div className="w-[140px] sm:w-[160px]">
              <FilterDropdown
                value={priceRange}
                placeholder={t("priceRange")}
                options={priceRangeOptions}
                onChange={handlePrice}
                buttonClassName="h-[38px] rounded-lg"
              />
            </div>

            {/* Favorite — UI only */}
            <button
              type="button"
              className="flex h-[38px] items-center gap-1.5 rounded-lg border border-[#F2F2F2] bg-white px-4 text-sm text-[#32343C] hover:bg-[#F7FAFE]"
              style={{ boxShadow: "0px 0px 12px rgba(125,182,255,0.1)" }}
            >
              {t("favorite")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#0245A5] border-t-transparent" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <p className="text-base font-semibold text-[#32343C]">{t("agentPickerNoAgents")}</p>
            <p className="text-sm text-[#969696]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} t={t} />
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Agent Card ─────────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  t,
}: {
  agent: ShowingAgentItem;
  t:     ReturnType<typeof useTranslations<"Dashboard.ownerVisitRequests">>;
}) {
  const location = [agent.city, agent.stateProvince].filter(Boolean).join(", ");

  return (
    <div
      className="overflow-hidden rounded-[10px] bg-white"
      style={{ boxShadow: "0px 2px 16px rgba(53,130,231,0.14)" }}
    >
      {/* ── Cover + centered avatar ── */}
      <div className="relative h-[120px] w-full bg-gradient-to-br from-[#A8C8F0] to-[#5390E0]">
        {/* Cover image — fallback is the gradient above */}
        <Image
          src="/images/icons/dashboard/property/detailagent-card-cover.png"
          alt=""
          fill
          className="object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />

        {/* Avatar — centered, overlapping bottom of cover */}
        <div className="absolute -bottom-7 left-1/2 h-[56px] w-[56px] -translate-x-1/2 overflow-hidden rounded-full border-[3px] border-white bg-[#C0D4EF]">
          {agent.profileImage ? (
            <Image
              src={agent.profileImage}
              alt={`${agent.firstName} ${agent.lastName}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base font-bold text-[#0245A5]">
              {agent.firstName[0]}{agent.lastName[0]}
            </div>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="px-4 pb-4 pt-10">
        {/* Name + bookmark */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-bold leading-snug text-[#32343C]">
            {agent.firstName} {agent.lastName}
          </p>
          {/* Bookmark — UI only */}
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-[#E9F2FF] hover:bg-[#D0E4FF]"
          >
            {/* Place bookmark icon at /images/icons/dashboard/agents/bookmark.png */}
            <Image
              src="/images/icons/dashboard/property/detail/bookmark.png"
              alt=""
              width={12}
              height={15}
            />
          </button>
        </div>

        {/* Location */}
        {location && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {/* Place house icon at /images/icons/dashboard/agents/house.png */}
            <Image
              src="/images/icons/dashboard/tenant/house.png"
              alt=""
              width={14}
              height={13}
              className="shrink-0"
            />
            <p className="line-clamp-1 text-[12px] font-medium text-[#0245A5]">{location}</p>
          </div>
        )}

        {/* Service label */}
        <p className="mt-3 text-[13px] font-semibold text-[#32343C]">{t("propertyShowing")}</p>

        {/* Price */}
        <p className="mt-0.5 text-[20px] font-bold text-[#32343C]">
          {agent.showingBasePrice > 0 ? formatPrice(agent.showingBasePrice) : "—"}
        </p>

        {/* Send Contract — UI only, no action */}
        <button
          type="button"
          className="mt-4 flex w-full cursor-default items-center justify-center gap-2 rounded-[6px] bg-[#0245A5] py-2.5 text-[13px] font-semibold text-white"
        >
          {t("sendContract")}
          <Image
              src="/images/icons/dashboard/agents/send-file.png"
              alt=""
              width={14}
              height={13}
              className="shrink-0"
            />
        </button>
      </div>
    </div>
  );
}
