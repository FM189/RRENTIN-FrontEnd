import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Property | Rrentin - Owner Dashboard",
  description:
    "List a new property on Rrentin. Add property details, photos, amenities, pricing, and set showing schedules for potential tenants.",
  keywords: [
    "add property",
    "list property",
    "owner dashboard",
    "Rrentin",
    "rental listing",
    "property management",
    "landlord",
  ],
  openGraph: {
    title: "Add Property | Rrentin - Owner Dashboard",
    description:
      "List a new property on Rrentin. Add property details, photos, amenities, and pricing.",
    type: "website",
    siteName: "Rrentin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Property | Rrentin - Owner Dashboard",
    description:
      "List a new property on Rrentin. Add property details, photos, amenities, and pricing.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
