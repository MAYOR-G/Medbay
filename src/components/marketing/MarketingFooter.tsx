import Link from "next/link";
import { ArrowUpRight, Lock, ShieldCheck } from "lucide-react";
import { MedBayLogo } from "@/components/ui";

const PRODUCT_LINKS = [
  { href: "/#vault-showcase", label: "Family Medical Vault" },
  { href: "/#how-it-works", label: "How MedBay Works" },
  { href: "/#security-faq", label: "Security & FAQ" },
  { href: "/login", label: "Sign In to Vault" },
] as const;

const COMPANY_LINKS = [
  { href: "/about", label: "About MedBay", external: false },
  { href: "/blog", label: "Clinical Journal", external: false },
  { href: "/contact", label: "Contact Us", external: false },
  { href: "https://github.com/MAYOR-G/Medbay", label: "GitHub Repository", external: true },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/llms.txt", label: "AI Reference (llms.txt)" },
  { href: "/brand/medbay-logo.svg", label: "Brand Logo SVG" },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#064E3B] text-white">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-12 sm:px-8 lg:pt-20">
        {/* Top Row: Brand Identity & Columns */}
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Link href="/" aria-label="MedBay Home" className="inline-block">
              <MedBayLogo
                size="lg"
                variant="light"
                showTagline
                tagline="Medical AI & Document Hub"
              />
            </Link>
            <p className="max-w-md text-base leading-relaxed text-[#D1FAE5] text-pretty">
              An encrypted family medical vault engineered for plain English clarity, profile
              isolated clinical AI, and one click expiring doctor share links.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#047857] px-3 py-2 text-sm font-medium text-[#ECFDF5]">
                <Lock className="h-4 w-4 shrink-0 text-[#6EE7B7]" aria-hidden="true" />
                <span>AES 256 Encrypted Storage</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#047857] px-3 py-2 text-sm font-medium text-[#ECFDF5]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#6EE7B7]" aria-hidden="true" />
                <span>WHO · NHS · CDC Grounded</span>
              </span>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h2 className="font-heading text-base font-semibold text-white">Product</h2>
              <ul className="mt-4 space-y-3 text-sm text-[#D1FAE5]">
                {PRODUCT_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 transition-colors duration-300 hover:text-white"
                    >
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-base font-semibold text-white">Company</h2>
              <ul className="mt-4 space-y-3 text-sm text-[#D1FAE5]">
                {COMPANY_LINKS.map((item) => (
                  <li key={item.href}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 transition-colors duration-300 hover:text-white"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1 transition-colors duration-300 hover:text-white"
                      >
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-base font-semibold text-white">
                Legal &amp; Brand
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-[#D1FAE5]">
                {LEGAL_LINKS.map((item) => {
                  const isStaticFile =
                    item.href.startsWith("/brand/") || item.href.endsWith(".txt");
                  return (
                    <li key={item.href}>
                      {isStaticFile ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 transition-colors duration-300 hover:text-white"
                        >
                          <span>{item.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1 transition-colors duration-300 hover:text-white"
                        >
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Full-Width Editorial Wordmark Close */}
        <div
          aria-hidden="true"
          className="mt-14 select-none overflow-hidden pt-6"
        >
          <p className="font-heading text-5xl leading-none font-bold tracking-[-0.04em] text-white/15 sm:text-7xl lg:text-8xl">
            MedBay Family Vault
          </p>
        </div>

        {/* Bottom Legal & Medical Disclaimer Strip */}
        <div className="mt-8 flex flex-col justify-between gap-4 pt-6 text-sm text-[#A7F3D0] lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>© {year} MedBay. All rights reserved.</span>
            <Link href="/privacy" className="underline-offset-4 hover:text-white hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="underline-offset-4 hover:text-white hover:underline">
              Terms of Service
            </Link>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[#D1FAE5]/90">
            MedBay AI provides plain-English explanations for informational purposes only and is not
            a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
