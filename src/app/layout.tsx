import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import "./globals.css";
import {NextIntlClientProvider} from 'next-intl';
 

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Rrentin - Your Key to a Perfect Home",
    template: "%s | Rrentin",
  },
  description:
    "Find your dream home effortlessly with Rrentin. Explore exclusive rental listings, connect with landlords, and discover the perfect property for you.",
  keywords: [
    "Rrentin",
    "real estate",
    "rental",
    "home",
    "property",
    "apartment",
    "house",
    "rent",
    "landlord",
    "tenant",
  ],
  authors: [{ name: "Rrentin" }],
  creator: "Rrentin",
  openGraph: {
    title: "Rrentin - Your Key to a Perfect Home",
    description:
      "Find your dream home effortlessly with Rrentin. Explore exclusive rental listings and discover the perfect property for you.",
    type: "website",
    siteName: "Rrentin",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rrentin - Your Key to a Perfect Home",
    description:
      "Find your dream home effortlessly with Rrentin. Explore exclusive rental listings.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} ${roboto.variable} ${poppins.variable} antialiased`}
      >
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
