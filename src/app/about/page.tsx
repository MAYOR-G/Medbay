import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  ExpiringShareDiagram,
  FamilyIsolationDiagram,
  MarketingFooter,
  MarketingHeader,
  ScrollReveal,
} from "@/components/marketing";
import { MedBayLogo } from "@/components/ui";
import { ARCHITECTURE_PILLARS } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "About MedBay",
  description:
    "Learn why MedBay was built as an encrypted family medical vault with plain English clinical summaries, verified WHO and NHS citations, and strict profile isolation.",
};

const DESIGN_PRINCIPLES = [
  {
    icon: Users,
    title: "Built around real family caregiving",
    description:
      "Health decisions rarely belong to one individual alone. MedBay gives parents and adult caregivers a single calm workspace for self, spouse, children, and aging parents without juggling extra logins.",
  },
  {
    icon: Sparkles,
    title: "Honest, source grounded clinical AI",
    description:
      "Every plain English summary visually separates facts retrieved from your private vault from verified medical authorities such as WHO, NHS, CDC, NIH, and Mayo Clinic.",
  },
  {
    icon: Lock,
    title: "Privacy enforced by architecture, not promises",
    description:
      "Profile isolation lives inside PostgreSQL Row Level Security and scoped vector retrieval. Public doctor share links strip away AI commentary and expire automatically.",
  },
] as const;

const TRUSTED_AUTHORITIES = [
  { name: "World Health Organization", domain: "who.int" },
  { name: "National Health Service (UK)", domain: "nhs.uk" },
  { name: "Centers for Disease Control", domain: "cdc.gov" },
  { name: "National Institutes of Health", domain: "nih.gov" },
  { name: "MedlinePlus Library", domain: "medlineplus.gov" },
  { name: "Mayo Clinic", domain: "mayoclinic.org" },
  { name: "Cleveland Clinic", domain: "clevelandclinic.org" },
  { name: "MSD Manuals", domain: "msdmanuals.com" },
] as const;

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#0F172A]">
      <MarketingHeader />

      <main id="main-content" className="flex-1">
        {/* Top Hero */}
        <section className="bg-[#F5F5F0] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#065F46] hover:text-[#047857]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>

            <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-7">
                <h1 className="max-w-[680px] font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-[#0F172A] text-balance sm:text-5xl">
                  A quiet digital vault for the records your family relies on most.
                </h1>
                <p className="max-w-[680px] text-lg leading-relaxed text-[#475569] text-pretty">
                  MedBay exists because understanding a loved one&apos;s lab report or sharing a
                  pediatric action plan in an urgent care room should never require digging through
                  five disconnected portals.
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-[#DCE2DF] bg-white p-6">
                  <p className="font-heading text-base font-semibold text-[#0F172A]">
                    Our clinical boundary
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                    MedBay prepares families for better conversations with licensed clinicians. Our
                    AI translates terminology, flags reference ranges, and surfaces verified medical
                    literature—it never diagnoses or replaces professional medical care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <ScrollReveal>
            <div className="max-w-2xl space-y-3">
              <h2 className="font-heading text-3xl font-semibold tracking-[-0.025em] text-[#0F172A] sm:text-4xl text-balance">
                Three principles guiding every line of code
              </h2>
              <p className="text-base leading-relaxed text-[#475569] sm:text-lg text-pretty">
                We design MedBay like a private health atelier: calm surfaces, zero clutter, and
                uncompromising database boundaries.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {DESIGN_PRINCIPLES.map((principle, idx) => {
              const Icon = principle.icon;
              return (
                <ScrollReveal key={principle.title} delayMs={idx * 70}>
                  <div className="h-full rounded-2xl border border-[#DCE2DF] bg-white p-7">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-heading text-xl font-semibold text-[#0F172A] text-balance">
                      {principle.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-[#475569] text-pretty">
                      {principle.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Visual Architecture Deep Dive */}
        <section className="bg-[#F8FAFC] py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="max-w-2xl space-y-3">
                <h2 className="font-heading text-3xl font-semibold tracking-[-0.025em] text-[#0F172A] sm:text-4xl text-balance">
                  How MedBay protects every household record
                </h2>
                <p className="text-base leading-relaxed text-[#475569] sm:text-lg">
                  Two architectural guarantees sit underneath every document upload and shared link.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <ScrollReveal>
                <div className="space-y-4">
                  <FamilyIsolationDiagram className="w-full rounded-2xl border border-[#DCE2DF]" />
                  <h3 className="font-heading text-xl font-semibold text-[#0F172A]">
                    Row level family profile isolation
                  </h3>
                  <p className="text-base leading-relaxed text-[#475569]">
                    Every document chunk and summary is pinned to both your account ID and the
                    specific family member profile ID so AI chat never crosses household boundaries.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delayMs={80}>
                <div className="space-y-4">
                  <ExpiringShareDiagram className="w-full rounded-2xl" />
                  <h3 className="font-heading text-xl font-semibold text-[#0F172A]">
                    Zero leak expiring doctor links
                  </h3>
                  <p className="text-base leading-relaxed text-[#475569]">
                    Visiting clinicians see only the clean original PDF via a short lived signed
                    stream—never your AI chat history, personal notes, or other family profiles.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ARCHITECTURE_PILLARS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#DCE2DF] bg-white p-5"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#059669]" aria-hidden="true" />
                  <h3 className="mt-3 font-heading text-base font-semibold text-[#0F172A]">
                    {item.label}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verified Medical Evidence Sources */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <ScrollReveal>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                <h2 className="font-heading text-3xl font-semibold tracking-[-0.025em] text-[#0F172A] text-balance">
                  Grounded exclusively in trusted clinical authorities
                </h2>
                <p className="text-base leading-relaxed text-[#475569] text-pretty">
                  When MedBay enriches a lab summary or answers a clinical context question,
                  external search is restricted to eight authoritative medical institutions rather
                  than unverified consumer forums.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
                {TRUSTED_AUTHORITIES.map((authority) => (
                  <div
                    key={authority.domain}
                    className="flex items-center justify-between rounded-xl border border-[#DCE2DF] bg-white px-4 py-3.5"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-semibold text-[#0F172A]">
                      <ShieldCheck className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                      <span>{authority.name}</span>
                    </span>
                    <span className="font-mono text-xs text-[#64748B]">{authority.domain}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Brand SVG Identity Showcase */}
        <section className="bg-[#F5F5F0] py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-8 rounded-2xl border border-[#DCE2DF] bg-white p-8 sm:p-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <h2 className="font-heading text-2xl font-semibold text-[#0F172A] sm:text-3xl">
                  The MedBay emblem &amp; vector brand assets
                </h2>
                <p className="text-base leading-relaxed text-[#475569] text-pretty">
                  Our vector mark combines a protective clinical shield, an open medical dossier, a
                  precision cross, and neural insight pathways—representing secure document custody
                  paired with clear clinical understanding.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href="/brand/medbay-logo.svg"
                    download
                    className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[#DCE2DF] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#059669]"
                  >
                    <Download className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                    <span>Download Full Logo SVG</span>
                  </a>
                  <a
                    href="/brand/medbay-mark.svg"
                    download
                    className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[#DCE2DF] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#059669]"
                  >
                    <Download className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                    <span>Download Emblem Mark SVG</span>
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-6 rounded-xl bg-[#064E3B] p-8 lg:col-span-5">
                <MedBayLogo
                  size="xl"
                  variant="light"
                  showTagline
                  tagline="Medical AI & Document Hub"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="flex flex-col justify-between gap-6 rounded-2xl bg-[#ECFDF5] p-8 sm:p-10 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A] sm:text-3xl">
                Ready to organize your family&apos;s medical vault?
              </h2>
              <p className="text-base text-[#065F46]">
                Start free with encrypted storage, plain English summaries, and expiring doctor
                links.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#059669] px-6 text-base font-semibold text-white transition-colors hover:bg-[#047857]"
              >
                <span>Open Encrypted Vault</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-[10px] border border-[#064E3B] bg-white px-6 text-base font-semibold text-[#064E3B] transition-colors hover:bg-[#F8FAFC]"
              >
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
