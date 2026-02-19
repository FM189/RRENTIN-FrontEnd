"use client";

import { useTranslations } from "next-intl";
import { use } from "react";
import PropertyImageGallery from "@/components/properties/detail/PropertyImageGallery";
import PropertyInfo from "@/components/properties/detail/PropertyInfo";
import PropertyTabs from "@/components/properties/detail/PropertyTabs";
import PropertyDescription from "@/components/properties/detail/PropertyDescription";
import OwnerProfile from "@/components/properties/detail/OwnerProfile";
import ReviewsSection from "@/components/properties/detail/ReviewsSection";
import PropertyMapView from "@/components/properties/detail/PropertyMapView";

const MOCK_PROPERTY = {
  id: "1",
  title: "The Crest Sukhumvit 34, Bangkok",
  address: "778 Sukhumvit Road, Khong Tan, Khlong Toei, Bangkok",
  price: 243,
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&h=900&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=700&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=700&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=700&fit=crop",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=700&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=700&fit=crop",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=700&fit=crop",
  ],
  features: [
    {
      icon: "/images/icons/dashboard/property/detail/bed.png",
      value: 2,
      labelKey: "bed" as const,
    },
    {
      icon: "/images/icons/dashboard/property/detail/bath.png",
      value: 2,
      labelKey: "baths" as const,
    },
    {
      icon: "/images/icons/dashboard/property/detail/area.png",
      value: 223,
      labelKey: "sqm" as const,
    },
    {
      icon: "/images/icons/dashboard/property/detail/floors.png",
      value: "04",
      labelKey: "floors" as const,
    },
  ],
  description:
    "Experience unparalleled luxury and sophistication at The Crest Sukhumvit 34, located in one of Bangkok's most sought-after neighborhoods. This exceptional residence effortlessly blends contemporary design with timeless elegance, offering a lifestyle of comfort and refinement in the heart of the city.",
  rentalDetails: [
    { labelKey: "monthlyRent", value: "$1,500" },
    { labelKey: "minLeaseDuration", value: "1 Month" },
    { labelKey: "securityDeposit", value: "$3,000" },
    { labelKey: "renewalOption", value: "Yes" },
    { labelKey: "renewalNotice", value: "7 Days" },
  ],
  paymentHistory: [
    { labelKey: "lastPaymentDate", value: "5th Jan 2024" },
    { labelKey: "nextDueDate", value: "5th Feb 2024" },
    { labelKey: "totalAmountPaid", value: "$9,000" },
    { labelKey: "pendingAmount", value: "$0" },
  ],
  amenities: [
    { icon: "/images/icons/dashboard/property/detail/amenity-balcony.png", label: "Balcony" },
    { icon: "/images/icons/dashboard/property/detail/amenity-balcony.png", label: "Big Balcony" },
    { icon: "/images/icons/dashboard/property/detail/amenity-parking.png", label: "Parking" },
    { icon: "/images/icons/dashboard/property/detail/amenity-garden.png", label: "Garden" },
    { icon: "/images/icons/dashboard/property/detail/amenity-gym.png", label: "Gym" },
    { icon: "/images/icons/dashboard/property/detail/amenity-maid.png", label: "Maids Room" },
    { icon: "/images/icons/dashboard/property/detail/amenity-pool.png", label: "Swimming Pool" },
    { icon: "/images/icons/dashboard/property/detail/amenity-internet.png", label: "Hi Speed Internet" },
    { icon: "/images/icons/dashboard/property/detail/amenity-garden.png", label: "Private Garden" },
    { icon: "/images/icons/dashboard/property/detail/amenity-study.png", label: "Study Room" },
    { icon: "/images/icons/dashboard/property/detail/amenity-bathtub.png", label: "Bathtub" },
    { icon: "/images/icons/dashboard/property/detail/amenity-barbeque.png", label: "Barbeque Area" },
  ],
  furnishing: [
    { icon: "/images/icons/dashboard/property/detail/furnish-wardrobe.png", label: "Built in Wardrobe" },
    { icon: "/images/icons/dashboard/property/detail/furnish-furnished.png", label: "Fully Furnished" },
    { icon: "/images/icons/dashboard/property/detail/furnish-renovated.png", label: "Renovated" },
    { icon: "/images/icons/dashboard/property/detail/furnish-tv.png", label: "TV/Home Theatre" },
  ],
  security: [
    { icon: "/images/icons/dashboard/property/detail/security-guard.png", label: "Security Guard" },
    { icon: "/images/icons/dashboard/property/detail/security-24h.png", label: "24-hour Security" },
    { icon: "/images/icons/dashboard/property/detail/security-cctv.png", label: "CCTV" },
  ],
  views: [
    { icon: "/images/icons/dashboard/property/detail/view-canal.png", label: "Canal View" },
    { icon: "/images/icons/dashboard/property/detail/view-city.png", label: "City View" },
    { icon: "/images/icons/dashboard/property/detail/view-garden.png", label: "Garden View" },
    { icon: "/images/icons/dashboard/property/detail/view-green.png", label: "Green View" },
  ],
  owner: {
    name: "John Doe",
    address: "123 Sukhumvit Rd, Bangkok, Thailand",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=100&fit=crop",
    buildingCount: 5,
    buildingImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&h=60&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=60&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=100&h=60&fit=crop",
    ],
  },
  reviews: {
    averageRating: 4.0,
    items: [
      {
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
        name: "Michael",
        date: "22 Jul",
        rating: 4,
        text: "I really liked the location of this rental property. The market and public transport were nearby. The house was clean, and the landlord took care of maintenance on time. The only issue was that the internet speed was a bit slow, but overall, it was a good experience!",
      },
    ],
    currentPage: 1,
    totalPages: 10,
  },
  mapProperties: [
    {
      id: "1",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "155K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop",
      status: "free" as const,
      isMostDemanded: true,
      lat: 14.98,
      lng: 102.1,
    },
    {
      id: "2",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "150K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&h=150&fit=crop",
      status: "rent" as const,
      lat: 15.01,
      lng: 102.12,
    },
    {
      id: "3",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "87K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=150&fit=crop",
      status: "rent" as const,
      lat: 15.0,
      lng: 102.15,
    },
    {
      id: "4",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "198K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=150&fit=crop",
      status: "free" as const,
      lat: 14.97,
      lng: 102.08,
    },
    {
      id: "5",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "144K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&h=150&fit=crop",
      status: "rent" as const,
      lat: 14.95,
      lng: 102.09,
    },
    {
      id: "6",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "130K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=200&h=150&fit=crop",
      status: "free" as const,
      lat: 14.96,
      lng: 102.13,
    },
    {
      id: "7",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "119K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=200&h=150&fit=crop",
      status: "rent" as const,
      lat: 14.965,
      lng: 102.14,
    },
    {
      id: "8",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "165K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&h=150&fit=crop",
      status: "free" as const,
      lat: 14.945,
      lng: 102.1,
    },
    {
      id: "9",
      title: "Dream House",
      address: "Evergreen 15 Jakarta, Thailand",
      price: 388.0,
      priceLabel: "120K",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=200&h=150&fit=crop",
      status: "rent" as const,
      lat: 14.955,
      lng: 102.15,
    },
  ],
};

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Dashboard.properties.detailPage");

  const property = MOCK_PROPERTY;

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <h1 className="text-[22px] font-semibold leading-[26px] tracking-[0.05em] text-heading">
        {t("propertyDetails")}
      </h1>

      {/* Section 1: Image Gallery + Info + Edit */}
      <div
        className="rounded-[10px] bg-white px-2.5 py-6"
        style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
      >
        <div className="mx-auto flex w-full flex-col gap-[18px] px-4 lg:px-6">
          <PropertyImageGallery images={property.images} />
          <PropertyInfo
            title={property.title}
            address={property.address}
            price={property.price}
            features={property.features}
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
            rentalDetails={property.rentalDetails}
            paymentHistory={property.paymentHistory}
            amenities={property.amenities}
            furnishing={property.furnishing}
            security={property.security}
            views={property.views}
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
              address={property.owner.address}
              avatar={property.owner.avatar}
              coverImage={property.owner.coverImage}
              buildingCount={property.owner.buildingCount}
              buildingImages={property.owner.buildingImages}
            />
            <ReviewsSection
              averageRating={property.reviews.averageRating}
              reviews={property.reviews.items}
              currentPage={property.reviews.currentPage}
              totalPages={property.reviews.totalPages}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Map View */}
      <div
        className="rounded-[10px] bg-white px-5 py-6"
        style={{ boxShadow: "0px 2px 12px rgba(53, 130, 231, 0.1)" }}
      >
        <PropertyMapView
          center={{ lat: 14.97, lng: 102.11 }}
          properties={property.mapProperties}
        />
      </div>
    </div>
  );
}
