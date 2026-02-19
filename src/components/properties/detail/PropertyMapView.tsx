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
      <button
        type="button"
        onClick={onClick}
        className={`-translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[12px] font-medium shadow-md ${
          isSelected
            ? "bg-[#0245A5] text-white"
            : "bg-white text-heading"
        }`}
      >
        {property.priceLabel}
      </button>
    </OverlayView>
  );
}

function PropertyPopup({ property }: { property: MapProperty }) {
  const t = useTranslations("Dashboard.properties.detailPage");

  return (
    <OverlayView
      position={{ lat: property.lat, lng: property.lng }}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      <div
        className="-translate-x-1/2 -translate-y-full mb-3 flex w-[320px] overflow-hidden rounded-[6px] bg-white"
        style={{ boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.15)" }}
      >
        {/* Image */}
        <div className="relative h-[100px] w-[120px] shrink-0">
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-2">
          {property.isMostDemanded && (
            <span className="text-[8px] font-bold leading-[10px] tracking-[0.02em] text-[#FDAC3B]">
              {t("mostDemanded")}
            </span>
          )}
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-[13px] font-semibold leading-[16px] text-heading">
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
          <div className="flex items-center gap-1">
            <Image
              src="/images/icons/dashboard/property/location-pin.png"
              alt=""
              width={5}
              height={6}
              className="shrink-0"
            />
            <span className="truncate text-[8px] leading-[10px] text-[#969696]">
              {property.address}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold leading-[16px] text-heading">
              ${property.price.toFixed(2)}
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
        onClick={() => setSelectedId(null)}
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
            onClick={() => setSelectedId(property.id)}
          />
        ))}

        {selectedProperty && <PropertyPopup property={selectedProperty} />}
      </GoogleMap>
    </div>
  );
}
