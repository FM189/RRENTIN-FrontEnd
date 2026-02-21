"use client";

import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useTranslations } from "next-intl";

interface PropertyGoogleMapProps {
  location: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  onLocationChange: (location: { type: "Point"; coordinates: [number, number] }) => void;
}

const containerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018,
};

export default function PropertyGoogleMap({
  location,
  onLocationChange,
}: PropertyGoogleMapProps) {
  const [lng, lat] = location.coordinates;
  const hasCoords = lng !== 0 || lat !== 0;
  const t = useTranslations("Dashboard.properties.addPropertyPage");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onLocationChange({
        type: "Point",
        coordinates: [e.latLng.lng(), e.latLng.lat()],
      });
    }
  };

  const center = hasCoords ? { lat, lng } : defaultCenter;

  if (!isLoaded) {
    return (
      <div className="w-full h-[350px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <h3 className="text-base font-medium text-heading text-center">
        {t("map")}
      </h3>
      <p className="text-xs text-text-muted text-center">
        {t("mapClickHint")}
      </p>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={hasCoords ? 15 : 11}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleClick}
      >
        {hasCoords && (
          <Marker position={{ lat, lng }} />
        )}
      </GoogleMap>
    </div>
  );
}
