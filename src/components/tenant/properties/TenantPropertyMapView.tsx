"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from "@react-google-maps/api";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { TenantPropertyMapItem } from "@/actions/tenant-properties";

interface TenantPropertyMapViewProps {
  properties: TenantPropertyMapItem[];
  isLoading?: boolean;
}

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "620px",
  borderRadius: "8px",
};

const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 }; // Bangkok

const MARKER_ICON = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

// ── Popup card ────────────────────────────────────────────────────────────────

function PropertyPopup({
  property,
  onClose,
}: {
  property: TenantPropertyMapItem;
  onClose: () => void;
}) {
  const [lng, lat] = property.coordinates;

  return (
    <OverlayView
      position={{ lat, lng }}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      <Link
        href={`/dashboard/tenant/properties/${property.id}`}
        className="no-underline"
        style={{ display: "block", transform: "translateX(-50%) translateY(calc(-100% - 14px))" }}
      >
        <div
          className="flex w-[300px] overflow-hidden rounded-[6px] bg-white"
          style={{ boxShadow: "0px 2px 16px rgba(0, 0, 0, 0.18)" }}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#f0f0f0] text-[10px] text-[#969696] hover:bg-[#e0e0e0]"
            >
              ✕
            </button>

            {/* Title */}
            <h4
              className="pr-5 text-[13px] font-semibold leading-[16px] text-heading"
              style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
            >
              {property.title}
            </h4>

            {/* Address */}
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

            {/* Price */}
            {property.minRentPrice > 0 && (
              <span className="text-[13px] font-semibold leading-[16px] text-heading">
                {formatPrice(property.minRentPrice)}
                <span className="text-[8px] font-normal text-[#969696]">/month</span>
              </span>
            )}
          </div>
        </div>

        {/* Downward triangle pointer */}
        <div
          className="mx-auto"
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid white",
            filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.12))",
          }}
        />
      </Link>
    </OverlayView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TenantPropertyMapView({ properties, isLoading }: TenantPropertyMapViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (properties.length === 0) return;

      if (properties.length === 1) {
        const [lng, lat] = properties[0].coordinates;
        map.setCenter({ lat, lng });
        map.setZoom(15);
        return;
      }

      const bounds = new window.google.maps.LatLngBounds();
      properties.forEach(({ coordinates: [lng, lat] }) => {
        bounds.extend({ lat, lng });
      });
      map.fitBounds(bounds);
    },
    [properties],
  );

  const selected = properties.find((p) => p.id === selectedId);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex h-[620px] w-full items-center justify-center rounded-lg bg-[#F7FAFE]">
        <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Property count */}
      <span className="text-[12px] text-[#969696]">
        {properties.length} propert{properties.length === 1 ? "y" : "ies"} on map
      </span>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_CENTER}
        zoom={11}
        onLoad={onLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {properties.map(({ id, title, coordinates: [lng, lat] }) => (
          <Marker
            key={id}
            position={{ lat, lng }}
            icon={MARKER_ICON}
            title={title}
            onClick={() => setSelectedId(id === selectedId ? null : id)}
          />
        ))}

        {selected && (
          <PropertyPopup
            property={selected}
            onClose={() => setSelectedId(null)}
          />
        )}
      </GoogleMap>
    </div>
  );
}
