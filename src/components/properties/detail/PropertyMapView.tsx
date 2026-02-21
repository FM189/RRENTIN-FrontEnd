"use client";

import { useCallback, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
  Marker,
} from "@react-google-maps/api";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface MapProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  priceLabel: string;
  rating: number;
  image: string;
  status: "rent" | "free";
  isMostDemanded?: boolean;
  lat: number;
  lng: number;
}

interface PropertyMapViewProps {
  center: { lat: number; lng: number };
  properties: MapProperty[];
}

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
};

function PriceMarker({
  property,
  isSelected,
  onClick,
}: {
  property: MapProperty;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <OverlayView
      position={{ lat: property.lat, lng: property.lng }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      {/* Bubble + downward pointer so it looks like a map pin */}
      <div
        className="-translate-x-1/2 flex cursor-pointer flex-col items-center"
        style={{ transform: "translateX(-50%) translateY(-100%)" }}
        onClick={onClick}
      >
        <button
          type="button"
          className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[12px] font-semibold shadow-md transition-colors ${
            isSelected
              ? "bg-[#0245A5] text-white"
              : "bg-white text-heading hover:bg-[#0245A5] hover:text-white"
          }`}
        >
          {property.priceLabel}
        </button>
        {/* Triangle pointer */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: isSelected ? "8px solid #0245A5" : "8px solid white",
          }}
        />
      </div>
    </OverlayView>
  );
}

function PropertyPopup({
  property,
  onClose,
}: {
  property: MapProperty;
  onClose: () => void;
}) {
  const t = useTranslations("Dashboard.properties.detailPage");

  return (
    <OverlayView
      position={{ lat: property.lat, lng: property.lng }}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      <div
        className="-translate-x-1/2 -translate-y-full mb-3 flex w-[300px] overflow-hidden rounded-[6px] bg-white"
        style={{ boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.15)" }}
      >
        {/* Image */}
        <div className="relative h-[100px] w-[110px] shrink-0">
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
        </div>

        {/* Info */}
        <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#f0f0f0] text-[10px] text-[#969696] hover:bg-[#e0e0e0]"
          >
            ✕
          </button>

          {property.isMostDemanded && (
            <span className="text-[8px] font-bold leading-[10px] tracking-[0.02em] text-[#FDAC3B]">
              {t("mostDemanded")}
            </span>
          )}
          <div className="flex items-start gap-1 pr-5">
            <h4
              className="text-[13px] font-semibold leading-[16px] text-heading"
              style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
            >
              {property.title}
            </h4>
            <span
              className={`shrink-0 rounded-[2px] px-1.5 py-[2px] text-[9px] font-semibold leading-[11px] ${
                property.status === "rent"
                  ? "bg-[rgba(53,130,231,0.19)] text-[#0245A5]"
                  : "bg-[rgba(52,199,89,0.11)] text-[#34C759]"
              }`}
            >
              {property.status === "rent" ? "Rent" : "Free"}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <Image
              src="/images/icons/dashboard/property/location-pin.png"
              alt=""
              width={5}
              height={6}
              className="shrink-0"
            />
            <span
              className="text-[8px] leading-[10px] text-[#969696]"
              style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
            >
              {property.address}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold leading-[16px] text-heading">
              {property.priceLabel}
              <span className="text-[8px] font-normal text-[#969696]">
                /month
              </span>
            </span>
            <div className="flex items-center gap-1">
              <Image
                src="/images/icons/dashboard/property/star.png"
                alt=""
                width={12}
                height={12}
              />
              <span className="text-[8px] leading-[10px] text-[#969696]">
                {property.rating}/5
              </span>
            </div>
          </div>
        </div>
      </div>
    </OverlayView>
  );
}

export default function PropertyMapView({
  center,
  properties,
}: PropertyMapViewProps) {
  const t = useTranslations("Dashboard.properties.detailPage");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [, setMap] = useState<google.maps.Map | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    properties[0]?.id ?? null
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const selectedProperty = properties.find((p) => p.id === selectedId);

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-3.5">
        <h3 className="text-[18px] font-semibold leading-[21px] tracking-[0.05em] text-heading">
          {t("mapView")}
        </h3>
        <div
          className="h-px w-full"
          style={{ borderBottom: "0.6px solid rgba(57, 93, 140, 0.4)" }}
        />
        <div className="flex h-[400px] w-full items-center justify-center rounded-[8px] bg-gray-100">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Header */}
      <h3 className="text-[18px] font-semibold leading-[21px] tracking-[0.05em] text-heading">
        {t("mapView")}
      </h3>
      <div
        className="h-px w-full"
        style={{ borderBottom: "0.6px solid rgba(57, 93, 140, 0.4)" }}
      />

      {/* Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          zoomControlOptions: { position: 5 },
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {properties.map((property) => (
          <PriceMarker
            key={property.id}
            property={property}
            isSelected={property.id === selectedId}
            onClick={() =>
              setSelectedId(property.id === selectedId ? null : property.id)
            }
          />
        ))}

        {/* Invisible Marker at exact pin point so click target is precise */}
        {properties.map((property) => (
          <Marker
            key={`pin-${property.id}`}
            position={{ lat: property.lat, lng: property.lng }}
            opacity={0}
            onClick={() =>
              setSelectedId(property.id === selectedId ? null : property.id)
            }
          />
        ))}

        {selectedProperty && (
          <PropertyPopup
            property={selectedProperty}
            onClose={() => setSelectedId(null)}
          />
        )}
      </GoogleMap>
    </div>
  );
}
