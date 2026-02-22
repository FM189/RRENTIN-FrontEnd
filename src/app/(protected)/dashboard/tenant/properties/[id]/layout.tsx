import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Details | Rrentin - Tenant Dashboard",
  description:
    "View detailed property information, photos, amenities, and rental details on Rrentin.",
  keywords: [
    "property details",
    "rental property",
    "tenant dashboard",
    "Rrentin",
    "rent now",
    "real estate",
  ],
  openGraph: {
    title: "Property Details | Rrentin - Tenant Dashboard",
    description:
      "View detailed property information, photos, amenities, and rental details on Rrentin.",
    type: "website",
    siteName: "Rrentin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Details | Rrentin - Tenant Dashboard",
    description:
      "View detailed property information, photos, amenities, and rental details on Rrentin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TenantPropertyDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
