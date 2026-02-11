import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | Rrentin - Your Key to a Perfect Home",
  description:
    "Log in to your Rrentin account to continue your rental journey. Access your saved properties, manage listings, and more.",
  keywords: [
    "log in",
    "login",
    "sign in",
    "Rrentin",
    "real estate",
    "rental",
    "home",
    "property",
  ],
  openGraph: {
    title: "Log In | Rrentin - Your Key to a Perfect Home",
    description:
      "Log in to your Rrentin account to continue your rental journey.",
    type: "website",
    siteName: "Rrentin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Log In | Rrentin",
    description:
      "Log in to your Rrentin account to continue your rental journey.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
