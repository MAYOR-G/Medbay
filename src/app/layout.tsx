import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";
import { getSiteUrl, INDEXABLE_ROBOTS, SITE_BRAND } from "@/lib/seo";
import "@/styles/tokens.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-sans-3",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.NEXT_PUBLIC_BING_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "MedBay — Encrypted Family Medical Vault & Clinical AI",
    template: "%s | MedBay",
  },
  description: SITE_BRAND.description,
  applicationName: SITE_BRAND.name,
  authors: [{ name: SITE_BRAND.name, url: getSiteUrl() }],
  creator: SITE_BRAND.name,
  publisher: SITE_BRAND.name,
  category: "health",
  manifest: "/site.webmanifest",
  robots: INDEXABLE_ROBOTS,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
  openGraph: {
    type: "website",
    url: getSiteUrl(),
    siteName: SITE_BRAND.name,
    locale: SITE_BRAND.locale,
    title: "MedBay — Encrypted Family Medical Vault & Clinical AI",
    description: SITE_BRAND.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MedBay — Encrypted Family Medical Vault & Plain-English Clinical AI Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedBay — Encrypted Family Medical Vault & Clinical AI",
    description: SITE_BRAND.description,
    images: ["/opengraph-image"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedBay",
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${sourceSans3.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-canvas font-body text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
