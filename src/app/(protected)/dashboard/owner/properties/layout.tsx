import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties | Rrentin - Owner Dashboard",
  description:
    "Manage your property listings on Rrentin. View property details, track views and interested tenants, and add new properties.",
  keywords: [
    "properties",
    "property management",
    "owner dashboard",
    "Rrentin",
    "rental listings",
    "real estate",
    "landlord",
  ],
  openGraph: {
    title: "Properties | Rrentin - Owner Dashboard",
    description:
      "Manage your property listings on Rrentin. View property details, track views and interested tenants.",
    type: "website",
    siteName: "Rrentin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Properties | Rrentin - Owner Dashboard",
    description:
      "Manage your property listings on Rrentin. View property details, track views and interested tenants.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
