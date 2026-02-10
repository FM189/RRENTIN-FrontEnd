import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Rrentin - Your Key to a Perfect Home",
  description:
    "Create your Rrentin account and explore a world of exclusive benefits. Find your dream home effortlessly - sign up in just a few steps!",
  keywords: [
    "sign up",
    "register",
    "create account",
    "Rrentin",
    "real estate",
    "rental",
    "home",
    "property",
  ],
  openGraph: {
    title: "Sign Up | Rrentin - Your Key to a Perfect Home",
    description:
      "Create your Rrentin account and explore a world of exclusive benefits. Find your dream home effortlessly!",
    type: "website",
    siteName: "Rrentin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | Rrentin",
    description:
      "Create your Rrentin account and find your dream home effortlessly!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
