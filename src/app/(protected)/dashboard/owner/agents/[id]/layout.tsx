import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Profile | Rrentin - Owner Dashboard",
  description: "View detailed agent profile, linked buildings and transaction history.",
  keywords: ["agent profile", "property agent", "rrentin", "owner dashboard"],
  robots: { index: false, follow: false },
  openGraph: {
    title: "Agent Profile | Rrentin",
    description: "View detailed agent profile, linked buildings and transaction history.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Agent Profile | Rrentin",
    description: "View detailed agent profile, linked buildings and transaction history.",
  },
};

export default function AgentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
