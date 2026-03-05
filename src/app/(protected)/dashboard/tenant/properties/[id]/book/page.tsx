import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBookingProperty } from "@/actions/tenant-properties";
import RentBookingClient from "@/components/tenant/properties/RentBookingClient";

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getTenantBookingProperty(id);
  return {
    title: property ? `Book ${property.title} | Rrentin` : "Book Property | Rrentin",
    description: property
      ? `Complete your booking for ${property.title} located at ${property.address}.`
      : "Complete your rental booking on Rrentin.",
  };
}

export default async function RentBookingPage({ params }: BookingPageProps) {
  const { id } = await params;
  const property = await getTenantBookingProperty(id);

  if (!property) notFound();

  return <RentBookingClient property={property} />;
}
