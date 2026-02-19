import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agents | Rrentin - Owner Dashboard",
  description:
    "Manage your agents on Rrentin. Hire new agents and view agent details for your properties.",
  keywords: [
    "agents",
    "agent management",
    "owner dashboard",
    "Rrentin",
    "hire agent",
    "real estate agent",
    "landlord",
  ],
  openGraph: {
    title: "Agents | Rrentin - Owner Dashboard",
    description:
      "Manage your agents on Rrentin. Hire new agents and view agent details for your properties.",
    type: "website",
    siteName: "Rrentin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agents | Rrentin - Owner Dashboard",
    description:
      "Manage your agents on Rrentin. Hire new agents and view agent details for your properties.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
