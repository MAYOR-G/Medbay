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
  title: "MedBay — Family Medical Vault",
  description:
    "Encrypted family medical vault with plain-English AI summaries, profile-isolated RAG, and one-click expiring shares.",
  manifest: "/manifest.json",
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
