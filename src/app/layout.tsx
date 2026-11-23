import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";
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

export const metadata: Metadata = {
  title: {
    default: "MedBay — Encrypted Family Medical Vault & Clinical AI Hub",
    template: "%s | MedBay",
  },
  description:
    "Store encrypted family medical records, read plain-English AI clinical summaries backed by WHO, NHS, and CDC citations, and share originals with doctors in one click.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    siteName: "MedBay",
    title: "MedBay — Encrypted Family Medical Vault & Clinical AI Hub",
    description:
      "Plain-English AI clinical summaries backed by verified medical authorities, strict family profile isolation, and one-click expiring doctor links.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedBay — Encrypted Family Medical Vault",
    description:
      "Your family's medical records, understood and ready anywhere. AES-256 encrypted vault with verified WHO & NHS clinical references.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedBay",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
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
