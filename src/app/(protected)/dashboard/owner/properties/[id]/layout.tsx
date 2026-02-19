import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Details | Rrentin - Owner Dashboard",
  description:
    "View detailed property information, photos, amenities, and manage your listing on Rrentin.",
  keywords: [
    "property details",
    "property listing",
    "owner dashboard",
    "Rrentin",
    "rental property",
    "real estate",
  ],
  openGraph: {
    title: "Property Details | Rrentin - Owner Dashboard",
    description:
      "View detailed property information, photos, amenities, and manage your listing on Rrentin.",
    type: "website",
    siteName: "Rrentin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Details | Rrentin - Owner Dashboard",
    description:
      "View detailed property information, photos, amenities, and manage your listing on Rrentin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PropertyDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
