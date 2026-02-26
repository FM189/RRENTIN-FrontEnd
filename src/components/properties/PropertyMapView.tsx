"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from "@react-google-maps/api";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { PropertyMapItem } from "@/actions/properties";

interface PropertyMapViewProps {
  properties: PropertyMapItem[];
  isLoading?: boolean;
}

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "620px",
  borderRadius: "8px",
};

const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 }; // Bangkok

const MARKER_ICONS: Record<PropertyMapItem["propertyStatus"], string> = {
  available:   "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  rented:      "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  unavailable: "http://maps.google.com/mapfiles/ms/icons/grey-dot.png",
};

const STATUS_LABELS: Record<PropertyMapItem["propertyStatus"], string> = {
  available:   "Available",
  rented:      "Rented",
  unavailable: "Unavailable",
};

const STATUS_COLORS: Record<PropertyMapItem["propertyStatus"], string> = {
  available:   "#34C759",
  rented:      "#0245A5",
  unavailable: "#969696",
};

const STATUS_BG: Record<PropertyMapItem["propertyStatus"], string> = {
  available:   "rgba(52,199,89,0.11)",
  rented:      "rgba(53,130,231,0.19)",
  unavailable: "rgba(150,150,150,0.15)",
};

// ── Popup (same horizontal design as detail page map) ─────────────────────────
function PropertyPopup({
  property,
  onClose,
}: {
  property: PropertyMapItem;
  onClose: () => void;
}) {
  const [lng, lat] = property.coordinates;

  return (
    <OverlayView
      position={{ lat, lng }}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      <Link
        href={`/dashboard/owner/properties/${property.id}`}
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

            {/* Title + status badge */}
            <div className="flex items-start gap-1 pr-5">
              <h4
                className="text-[13px] font-semibold leading-[16px] text-heading"
                style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
              >
                {property.title}
              </h4>
              <span
                className="shrink-0 rounded-[2px] px-1.5 py-[2px] text-[9px] font-semibold leading-[11px]"
                style={{
                  background: STATUS_BG[property.propertyStatus],
                  color: STATUS_COLORS[property.propertyStatus],
                }}
              >
                {STATUS_LABELS[property.propertyStatus]}
              </span>
            </div>

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
            <span className="text-[13px] font-semibold leading-[16px] text-heading">
              {formatPrice(property.price)}
              <span className="text-[8px] font-normal text-[#969696]">/month</span>
            </span>
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

export default function PropertyMapView({ properties, isLoading }: PropertyMapViewProps) {
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
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {(["available", "rented", "unavailable"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: STATUS_COLORS[s] }}
            />
            <span className="text-[12px] text-[#969696]">{STATUS_LABELS[s]}</span>
          </div>
        ))}
        <span className="ml-auto text-[12px] text-[#969696]">
          {properties.length} propert{properties.length === 1 ? "y" : "ies"} on map
        </span>
      </div>

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
        {/* Colored status markers */}
        {properties.map(({ id, title, coordinates: [lng, lat], propertyStatus }) => (
          <Marker
            key={id}
            position={{ lat, lng }}
            icon={MARKER_ICONS[propertyStatus]}
            title={title}
            onClick={() => setSelectedId(id === selectedId ? null : id)}
          />
        ))}

        {/* Popup */}
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
