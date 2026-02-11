import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Provider Onboarding | Rrentin",
  description:
    "Complete your service provider profile on Rrentin. Set up your basic information, service area, and commission details.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
