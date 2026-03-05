"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from "@react-google-maps/api";
import { formatPrice } from "@/lib/format";
import { getTenantPropertyDetail } from "@/actions/tenant-properties";
import type { TenantPropertyDetail } from "@/actions/tenant-properties";
import { VisitConfirmationModal, VisitRequestModal, VisitPaymentModal } from "@/components/ui";
import type { VisitRequestFormData } from "@/components/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/types/notifications";

interface TenantPropertyDrawerProps {
  propertyId: string | null;
  onClose: () => void;
}

// ── Mini-map popup ────────────────────────────────────────────────────────────

function DrawerMapPopup({ detail }: { detail: TenantPropertyDetail }) {
  const [lng, lat] = detail.coordinates!;
  return (
    <OverlayView
      position={{ lat, lng }}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      <div style={{ transform: "translateX(-50%) translateY(calc(-100% - 16px))" }}>
        <div
          className="flex w-[260px] items-center gap-2.5 overflow-hidden rounded-lg bg-white p-2.5"
          style={{ boxShadow: "0px 2px 12px rgba(0,0,0,0.12)" }}
        >
          <div className="relative h-[38px] w-[56px] shrink-0 overflow-hidden rounded-md bg-[#D6E3F4]">
            {detail.photos[0] && (
              <Image src={detail.photos[0]} alt={detail.title} fill className="object-cover" />
            )}
          </div>
          <div className="min-w-0 flex flex-col gap-1">
            <p className="truncate text-sm font-semibold leading-[19px] tracking-[0.05em] text-[#32343C]">
              {detail.title}
            </p>
            <p className="truncate text-xs leading-[14px] tracking-[0.05em] text-[#969696]">
              {[detail.address, detail.province].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
        {/* Pointer triangle */}
        <div
          className="mx-auto"
          style={{
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "9px solid white",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.08))",
          }}
        />
      </div>
    </OverlayView>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

function StatChip({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-[6px] bg-white px-3.5 py-2"
      style={{ boxShadow: "0px 0px 2px rgba(0,0,0,0.2)" }}
    >
      <Image src={icon} alt="" width={16} height={16} className="shrink-0" />
      <span
        className="text-sm font-semibold leading-4 tracking-[0.05em]"
        style={{ color: "rgba(50,52,60,0.8)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Mini map ──────────────────────────────────────────────────────────────────

const MAP_STYLE = { width: "100%", height: "335px", borderRadius: "10px" };

function DrawerMap({ detail }: { detail: TenantPropertyDetail }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [lng, lat] = detail.coordinates!;

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setCenter({ lat, lng });
    map.setZoom(14);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-[335px] w-full items-center justify-center rounded-[10px] bg-[#EFEFEF]">
        <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_STYLE}
      center={{ lat, lng }}
      zoom={14}
      onLoad={onLoad}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      <Marker position={{ lat, lng }} />
      <DrawerMapPopup detail={detail} />
    </GoogleMap>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────

export default function TenantPropertyDrawer({ propertyId, onClose }: TenantPropertyDrawerProps) {
  const t = useTranslations("Dashboard.tenantProperties.drawer");
  const router = useRouter();
  const { user } = useCurrentUser();

  const [detail, setDetail] = useState<TenantPropertyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");
  const [visitModalOpen,        setVisitModalOpen]        = useState(false);
  const [visitRequestModalOpen, setVisitRequestModalOpen] = useState(false);
  const [visitPaymentModalOpen, setVisitPaymentModalOpen] = useState(false);
  const [visitFormData,         setVisitFormData]         = useState<VisitRequestFormData | null>(null);

  const isOpen = !!propertyId;

  // Fetch detail when a property is selected
  useEffect(() => {
    if (!propertyId) { setDetail(null); return; }
    setLoading(true);
    setActiveTab("overview");
    getTenantPropertyDetail(propertyId).then((data) => {
      setDetail(data);
      setLoading(false);
    });
  }, [propertyId]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const stats: { icon: string; label: string }[] = [];
  if (detail) {
    if (detail.bedrooms > 0)
      stats.push({ icon: "/images/icons/dashboard/tenant-properties/bed-white.png",  label: `${detail.bedrooms} ${t("overview") === "Overview" ? "Beds" : "ห้องนอน"}` });
    if (detail.bathrooms > 0)
      stats.push({ icon: "/images/icons/dashboard/tenant-properties/bath-white.png", label: `${detail.bathrooms} ${t("overview") === "Overview" ? "Baths" : "ห้องน้ำ"}` });
    if (detail.unitArea)
      stats.push({ icon: "/images/icons/dashboard/tenant-properties/area-white.png", label: `${detail.unitArea} ${detail.unitAreaUnit}` });
  }

  const handleVisitConfirm = () => {
    setVisitModalOpen(false);
    setVisitRequestModalOpen(true);
  };

  const handleVisitRequestNext = (data: VisitRequestFormData) => {
    setVisitRequestModalOpen(false);
    setVisitFormData(data);
    setVisitPaymentModalOpen(true);
  };

  const handlePaymentBack = () => {
    setVisitPaymentModalOpen(false);
    setVisitRequestModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setVisitPaymentModalOpen(false);
    setVisitFormData(null);
  };

  const handlePaymentConfirmed = async () => {
    const ownerId = detail?.ownerId;
    if (!ownerId) return;

    const result = await createNotification({
      userId: ownerId,
      type: NotificationType.SHOWING_SCHEDULED,
      title: "Visit Request Received",
      message: `A tenant has requested a visit for ${detail!.title}.`,
      href: "/dashboard/owner/proposals",
    });

    if (!result.success) {
      console.error("[handlePaymentConfirmed] Notification failed:", result.error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-[472px] overflow-y-auto bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: "0px 2px 12px rgba(53,130,231,0.1)" }}
      >
        <div className="flex flex-col gap-5 p-6">

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
              style={{ background: "rgba(53,130,231,0.1)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="1" y1="1" x2="13" y2="13" stroke="#32343C" strokeWidth="2" strokeLinecap="round" />
                <line x1="13" y1="1" x2="1" y2="13" stroke="#32343C" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Title */}
            <span className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-[#32343C]">
              {t("details")}
            </span>

            {/* Open full page button */}
            <button
              type="button"
              onClick={() => propertyId && router.push(`/dashboard/tenant/properties/${propertyId}`)}
              className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-primary"
            >
              <Image
                src="/images/icons/dashboard/tenant-properties/external-link.png"
                alt=""
                width={14}
                height={14}
                className="shrink-0"
              />
            </button>
          </div>

          {/* ── Loading state ─────────────────────────────────────────── */}
          {loading && (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
            </div>
          )}

          {/* ── Content ──────────────────────────────────────────────── */}
          {!loading && detail && (
            <>
              {/* Images */}
              <div className="flex gap-3.5">
                {/* Large image */}
                <div className="relative h-[216px] flex-1 overflow-hidden rounded-[10px] bg-[#F7FAFE]">
                  {detail.photos[0] && (
                    <Image src={detail.photos[0]} alt={detail.title} fill className="object-cover" />
                  )}
                </div>
                {/* 2 stacked small images */}
                <div className="flex w-[101px] shrink-0 flex-col gap-3.5">
                  {[1, 2].map((i) => (
                    <div key={i} className="relative h-[101px] w-full overflow-hidden rounded-[10px] bg-[#F7FAFE]">
                      {detail.photos[i] && (
                        <Image src={detail.photos[i]} alt="" fill className="object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Title + price */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-[#32343C]">
                    {detail.title}
                  </span>
                  {detail.minRentPrice > 0 && (
                    <span className="shrink-0 text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-[#32343C]">
                      {formatPrice(detail.minRentPrice)}
                      <span className="text-sm font-normal text-[#969696]">/month</span>
                    </span>
                  )}
                </div>
                {/* Location */}
                <div className="flex items-center gap-1">
                  <Image
                    src="/images/icons/dashboard/property/location-pin.png"
                    alt=""
                    width={9}
                    height={12}
                    className="shrink-0"
                  />
                  <span className="text-sm leading-4 tracking-[0.05em] text-[#969696]">
                    {[detail.address, detail.province].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex flex-1 items-center justify-center py-1.5 text-base font-semibold leading-[19px] tracking-[0.05em] transition-colors ${
                    activeTab === "overview"
                      ? "border-b-2 border-primary text-[#32343C]"
                      : "border-b border-[#C2C2C2] font-medium text-[#848A9C]"
                  }`}
                >
                  {t("overview")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`flex flex-1 items-center justify-center py-1.5 text-base leading-[19px] tracking-[0.05em] transition-colors ${
                    activeTab === "reviews"
                      ? "border-b-2 border-primary font-semibold text-[#32343C]"
                      : "border-b border-[#C2C2C2] font-medium text-[#848A9C]"
                  }`}
                >
                  {t("reviews")}
                </button>
              </div>

              {/* ── Overview tab ──────────────────────────────────────── */}
              {activeTab === "overview" && (
                <>
                  {/* Description */}
                  {detail.description && (
                    <div className="flex flex-col gap-2.5">
                      <p className="text-base font-semibold leading-[19px] tracking-[0.05em] text-[#32343C]">
                        {t("description")}
                      </p>
                      <p
                        className="text-sm leading-4 tracking-[0.05em] text-[#32343C]"
                        style={{ opacity: 0.6 }}
                      >
                        {detail.description}
                      </p>
                    </div>
                  )}

                  {/* Stats chips */}
                  {stats.length > 0 && (
                    <div className="flex flex-wrap gap-2.5">
                      {stats.map((s) => (
                        <StatChip key={s.label} icon={s.icon} label={s.label} />
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setVisitModalOpen(true)}
                      className="flex flex-1 items-center justify-center rounded-lg py-3 text-sm font-semibold leading-4 tracking-[0.05em] text-white transition-opacity hover:opacity-90"
                      style={{ background: "#5390E0", boxShadow: "0px 0px 2px rgba(0,0,0,0.25)" }}
                    >
                      {t("visitNow")}
                    </button>
                    <button
                      type="button"
                      onClick={() => propertyId && router.push(`/dashboard/tenant/properties/${propertyId}/book`)}
                      className="flex flex-1 items-center justify-center rounded-lg py-3 text-sm font-semibold leading-4 tracking-[0.05em] text-white transition-opacity hover:opacity-90"
                      style={{ background: "#0245A5", boxShadow: "0px 0px 2px rgba(0,0,0,0.25)" }}
                    >
                      {t("bookNow")}
                    </button>
                  </div>

                  {/* Map */}
                  {detail.coordinates && (
                    <div className="overflow-hidden rounded-[10px]">
                      <DrawerMap detail={detail} />
                    </div>
                  )}
                </>
              )}

              {/* ── Reviews tab ───────────────────────────────────────── */}
              {activeTab === "reviews" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-base font-semibold text-[#32343C]">{t("noReviews")}</p>
                  <p className="mt-1 text-sm text-[#969696]">{t("beTheFirst")}</p>
                </div>
              )}
            </>
          )}

          {/* Empty state if detail failed to load */}
          {!loading && !detail && propertyId && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-base font-semibold text-[#32343C]">Unable to load property</p>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Confirm visit fee */}
      <VisitConfirmationModal
        isOpen={visitModalOpen}
        visitFee={detail?.visitRequestPrice ?? ""}
        propertyId={detail?.id ?? ""}
        tenantId={user?.id ?? ""}
        onClose={() => setVisitModalOpen(false)}
        onConfirm={handleVisitConfirm}
      />

      {/* Step 2: Visit request form */}
      {detail && (
        <VisitRequestModal
          isOpen={visitRequestModalOpen}
          detail={detail}
          onClose={() => setVisitRequestModalOpen(false)}
          onNext={handleVisitRequestNext}
        />
      )}

      {/* Step 3: Payment */}
      {detail && visitFormData && (
        <VisitPaymentModal
          isOpen={visitPaymentModalOpen}
          detail={detail}
          requestData={visitFormData}
          tenantId={user?.id ?? ""}
          onClose={() => setVisitPaymentModalOpen(false)}
          onBack={handlePaymentBack}
          onSuccess={handlePaymentSuccess}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      )}
    </>
  );
}
