import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import PropertyImageGallery from "@/components/properties/detail/PropertyImageGallery";
import PropertyInfo from "@/components/properties/detail/PropertyInfo";
import PropertyTabs from "@/components/properties/detail/PropertyTabs";
import PropertyDescription from "@/components/properties/detail/PropertyDescription";
import OwnerProfile from "@/components/properties/detail/OwnerProfile";
import ReviewsSection from "@/components/properties/detail/ReviewsSection";
import PropertyMapView from "@/components/properties/detail/PropertyMapView";
import { getPropertyDetail } from "@/actions/properties";
import { formatPrice } from "@/lib/format";
import {
  getAmenityIcon,
  getFurnishIcon,
  getSecurityIcon,
  getViewIcon,
  getRentalIcon,
  featureLabel,
} from "@/lib/propertyIcons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("Dashboard.properties.detailPage");

  const property = await getPropertyDetail(id);
  if (!property) notFound();

  // ── Feature rows (bed / bath / sqm / floor) ──────────────────────────────
  const features = [
    {
      icon: "/images/icons/dashboard/property/detail/bed.png",
      value: property.bedrooms,
      labelKey: "bed" as const,
    },
    {
      icon: "/images/icons/dashboard/property/detail/bath.png",
      value: property.bathrooms,
      labelKey: "baths" as const,
    },
    {
      icon: "/images/icons/dashboard/property/detail/area.png",
      value: property.unitArea || "—",
      labelKey: property.unitAreaUnit || "sqm",
    },
    {
      icon: "/images/icons/dashboard/property/detail/floors.png",
      value: String(property.floor).padStart(2, "0"),
      labelKey: "floors" as const,
    },
  ];

  // ── Rental details from first contract ────────────────────────────────────
  const firstContract = property.contracts[0];
  const rentalDetails = firstContract
    ? [
        { labelKey: "monthlyRent",     value: `${formatPrice(firstContract.rentPrice)}` },
        { labelKey: "minLeaseDuration", value: `${firstContract.months} Month${firstContract.months > 1 ? "s" : ""}` },
        { labelKey: "securityDeposit", value: `${formatPrice(firstContract.securityDeposit)}` },
        { labelKey: "renewalOption",   value: "Yes" },
        { labelKey: "renewalNotice",   value: "7 Days" },
      ]
    : [
        { labelKey: "monthlyRent",     value: `${formatPrice(property.price)}` },
        { labelKey: "minLeaseDuration", value: "—" },
        { labelKey: "securityDeposit", value: "—" },
        { labelKey: "renewalOption",   value: "—" },
        { labelKey: "renewalNotice",   value: "—" },
      ];

  // ── Payment history (placeholder until payment system is built) ───────────
  const paymentHistory = [
    { labelKey: "lastPaymentDate", value: "—" },
    { labelKey: "nextDueDate",     value: "—" },
    { labelKey: "totalAmountPaid", value: "—" },
    { labelKey: "pendingAmount",   value: "—" },
  ];

  // ── Amenity / feature lists ───────────────────────────────────────────────
  const amenities = [...property.amenities, ...property.customAmenities].map((a) => ({
    icon: getAmenityIcon(a),
    label: featureLabel(a),
  }));

  const furnishing = [...property.propertyFeatures, ...property.customFeatures].map((f) => ({
    icon: getFurnishIcon(f),
    label: featureLabel(f),
  }));

  const security = [...property.securityFeatures, ...property.customSecurity].map((s) => ({
    icon: getSecurityIcon(s),
    label: featureLabel(s),
  }));

  const views = [...property.propertyViews, ...property.customViews].map((v) => ({
    icon: getViewIcon(v),
    label: featureLabel(v),
  }));

  const rentalFeatures = [...property.rentalFeatures, ...property.customRentalFeatures].map((r) => ({
    icon: getRentalIcon(r),
    label: featureLabel(r),
  }));

  // ── Map data ─────────────────────────────────────────────────────────────
  const [propLng, propLat] = property.coordinates;
  const hasCoords = propLng !== 0 || propLat !== 0;

  const mapCenter = hasCoords
    ? { lat: propLat, lng: propLng }
    : { lat: 13.7563, lng: 100.5018 };

  // Current property as map item
  const currentMapProp = {
    id: property.id,
    title: property.title,
    address: property.address,
    price: property.priceNum,
    priceLabel: `${formatPrice(property.price)}`,
    rating: 4.9,
    image: property.images[0] ?? "",
    status: property.propertyStatus === "rented" ? "rent" : "free" as "rent" | "free",
    isMostDemanded: false,
    lat: propLat,
    lng: propLng,
  };

  const mapProperties = hasCoords ? [currentMapProp] : [];

  // ── Owner profile ─────────────────────────────────────────────────────────
  const allPropImages = [
    property.images[0],
    ...property.owner.otherProperties.map((p) => p.image),
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <h1 className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-heading">
        {t("propertyDetails")}
      </h1>

      {/* Section 1: Image Gallery + Info + Tabs */}
      <div
        className="rounded-[10px] bg-white px-2.5 py-6"
        style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
      >
        <div className="mx-auto flex w-full flex-col gap-[18px] px-4 lg:px-6">
          <PropertyImageGallery images={property.images} />
          <PropertyInfo
            title={property.title}
            address={property.address}
            price={firstContract ? (parseFloat(String(firstContract.rentPrice).replace(/,/g, "")) || 0) : property.priceNum}
            features={features}
          />
        </div>
        <div className="mt-[14px] px-4 lg:px-6">
          <PropertyTabs propertyId={id} />
        </div>
      </div>

      {/* Section 2: Description (left) + Owner/Reviews (right) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left Column */}
        <div className="lg:w-[63%]">
          <PropertyDescription
            description={property.description}
            rentalDetails={rentalDetails}
            paymentHistory={paymentHistory}
            amenities={amenities}
            furnishing={furnishing}
            rentalFeatures={rentalFeatures}
            security={security}
            views={views}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5 lg:w-[37%]">
          <div
            className="flex w-full flex-col gap-5 rounded-[8px] bg-white px-6 py-3.5"
            style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
          >
            <OwnerProfile
              name={property.owner.name}
              address={property.owner.location}
              avatar={property.owner.avatar}
              coverImage=""
              buildingCount={property.owner.otherProperties.length + 1}
              buildingImages={allPropImages.slice(0, 5)}
            />
            <ReviewsSection
              averageRating={0}
              reviews={[]}
              currentPage={1}
              totalPages={1}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Map View */}
      <div
        className="rounded-[10px] bg-white px-5 py-6"
        style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
      >
        <PropertyMapView center={mapCenter} properties={mapProperties} />
      </div>
    </div>
  );
}
