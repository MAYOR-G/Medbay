"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MedBayLogo } from "@/components/ui";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export function MarketingHeader() {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = React.useState<string | null>(null);
  const menuOpen = openForPath === pathname;

  React.useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenForPath(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[10px] focus:bg-[#064E3B] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-[#FFFFFF]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            aria-label="MedBay Home"
            className="shrink-0 rounded-[10px] py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#059669]"
          >
            <MedBayLogo size="md" />
          </Link>

          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "rounded-[10px] bg-[#ECFDF5] px-4 py-2 text-[15px] font-semibold text-[#065F46] transition-colors duration-300"
                      : "rounded-[10px] px-4 py-2 text-[15px] font-medium text-[#475569] transition-colors duration-300 hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-[10px] px-4 text-[15px] font-semibold whitespace-nowrap text-[#475569] transition-colors duration-300 hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#059669] px-5 text-[15px] font-semibold whitespace-nowrap text-white transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#047857] active:scale-[0.98]"
            >
              <span>Open Vault</span>
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#059669] px-3.5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-300 hover:bg-[#047857]"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setOpenForPath(menuOpen ? null : pathname)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-white text-[#0F172A] transition-colors duration-300 hover:bg-[#F8FAFC]"
            >
              <span className="relative flex h-4 w-5 flex-col justify-between" aria-hidden="true">
                <span
                  className="block h-0.5 w-full rounded-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="block h-0.5 w-full rounded-full bg-current transition-opacity duration-300"
                  style={{
                    opacity: menuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="block h-0.5 w-full rounded-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Height Mobile Navigation Panel */}
      <div
        id="mobile-navigation-drawer"
        aria-hidden={!menuOpen}
        className={`fixed inset-x-0 top-[76px] bottom-0 z-30 bg-[#FFFFFF]/98 backdrop-blur-xl transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col justify-between px-6 py-8">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-2">
            {NAV_LINKS.map((link, index) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  style={{
                    transitionDelay: menuOpen ? `${index * 60}ms` : "0ms",
                    transform: menuOpen ? "translateY(0)" : "translateY(24px)",
                    opacity: menuOpen ? 1 : 0,
                  }}
                  className={`flex min-h-[52px] items-center justify-between rounded-xl px-4 font-heading text-2xl font-semibold transition-[transform,opacity,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    active
                      ? "bg-[#ECFDF5] text-[#065F46]"
                      : "text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-5 w-5 text-[#059669]" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4 border-t border-[#E2E8F0] pt-6">
            <div className="flex flex-wrap gap-4 text-sm font-medium text-[#475569]">
              <Link href="/privacy" tabIndex={menuOpen ? 0 : -1} className="hover:text-[#0F172A]">
                Privacy Policy
              </Link>
              <Link href="/terms" tabIndex={menuOpen ? 0 : -1} className="hover:text-[#0F172A]">
                Terms of Service
              </Link>
            </div>
            <Link
              href="/login"
              tabIndex={menuOpen ? 0 : -1}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#059669] px-5 text-base font-semibold text-white transition-colors duration-300 hover:bg-[#047857]"
            >
              <span>Create Your Family Vault</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
