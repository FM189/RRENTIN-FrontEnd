import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBookingProperty } from "@/actions/tenant-properties";
import RentBookingClient from "@/components/tenant/properties/RentBookingClient";
import dbConnect from "@/lib/mongodb";
import PlatformFees from "@/models/PlatformFees";

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
  const [property] = await Promise.all([
    getTenantBookingProperty(id),
    dbConnect(),
  ]);

  if (!property) notFound();

  const fees = await PlatformFees.findOne({ isActive: true }).lean();

  return (
    <RentBookingClient
      property={property}
      tenantContractFeeEnabled={fees?.tenantContractFeeEnabled ?? true}
      tenantContractFeeRate={fees?.tenantContractFeeRate ?? 0.05}
      vatRate={fees?.vatRate ?? 0.07}
    />
  );
}
