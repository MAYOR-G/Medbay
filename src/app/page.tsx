import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  FolderLock,
  Lock,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PwaInstallButton } from "@/components/layout";
import { MedBayLogo } from "@/components/ui";

const FAMILY_PROFILES_DEMO = [
  { label: "All Family", active: false },
  { label: "Self", active: true },
  { label: "Maya (Child)", active: false },
  { label: "David (Parent)", active: false },
] as const;

const CAPABILITY_CARDS = [
  {
    icon: Users,
    title: "Family-Isolated Medical Vault",
    description:
      "Manage your spouse, children, and aging parents under one account with strict row-level profile isolation and zero cross-profile mixing.",
    highlights: ["Up to 5 dependent profiles", "Automatic patient name matching"],
  },
  {
    icon: Sparkles,
    title: "Plain-English AI Summaries & Citations",
    description:
      "Translates dense lab panels, radiology impressions, and discharge notes into clear language backed by verified WHO, NHS, and CDC clinical references.",
    highlights: ["Flagged biomarker explanations", "Tailored questions for your doctor"],
  },
  {
    icon: CalendarClock,
    title: "One-Click Expiring Links & Calendar Sync",
    description:
      "Generate 24h, 7d, or 30d zero-PIN links for visiting physicians, receive 24-hour Gmail medical alerts, and book Google Calendar follow-ups from chat.",
    highlights: ["Instant link revocation", "Read-only 24h Gmail lab scanner"],
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: "Step 1",
    title: "Upload or import any medical record",
    description:
      "Drop a PDF lab report, snap a photo of a prescription, or import an attachment straight from our 24-hour Gmail medical scanner.",
  },
  {
    step: "Step 2",
    title: "Read your plain-English clinical report",
    description:
      "MedBay extracts every biomarker, flags borderline or critical values, and links directly to trusted WHO, NHS, and CDC guidelines.",
  },
  {
    step: "Step 3",
    title: "Share with your doctor or schedule a follow-up",
    description:
      "Send a 24-hour expiring link to the original document with zero recipient login, or ask MedBay AI to book your next appointment on Google Calendar.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0F172A]">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
          <Link href="/" aria-label="MedBay Home" className="shrink-0">
            <MedBayLogo size="md" />
          </Link>

          <nav
            aria-label="Landing Page Navigation"
            className="hidden items-center gap-8 text-[15px] font-medium text-[#475569] md:flex"
          >
            <a href="#how-it-works" className="transition-colors hover:text-[#0F172A]">
              How It Works
            </a>
            <a href="#family-vault" className="transition-colors hover:text-[#0F172A]">
              Family Vault
            </a>
            <a href="#ai-summaries" className="transition-colors hover:text-[#0F172A]">
              AI Clinical Summaries
            </a>
            <a href="#security" className="transition-colors hover:text-[#0F172A]">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-4 text-[15px] font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              <span>Sign In</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-4 text-[15px] font-semibold text-white shadow-xs transition-colors hover:bg-[#047857] active:bg-[#065F46]"
            >
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left 6 Columns: Narrative & Actions */}
            <div className="space-y-6 lg:col-span-6">
              <div className="inline-flex flex-row items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3.5 py-1.5 text-[13px] font-semibold text-[#065F46]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#059669]" strokeWidth={2} aria-hidden="true" />
                <span>AES-256 Encrypted Family Health Vault</span>
              </div>

              <h1 className="font-heading text-4xl leading-[1.12] font-bold tracking-[-0.025em] text-[#0F172A] sm:text-5xl lg:text-[52px]">
                Your family&apos;s medical records, understood and ready anywhere.
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-[#475569]">
                Store encrypted lab results, prescriptions, and scans for you and your children. Get
                instant plain-English AI summaries backed by WHO &amp; NHS guidelines, and share
                originals with doctors in one click.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/login"
                  className="inline-flex h-12 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-6 text-base font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 hover:bg-[#047857] active:bg-[#065F46] active:scale-[0.985]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
                </Link>
                <PwaInstallButton />
              </div>

              {/* Micro-proof Strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-[14px] font-medium text-[#475569]">
                <span className="inline-flex flex-row items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" strokeWidth={2} aria-hidden="true" />
                  <span>No separate logins for kids</span>
                </span>
                <span className="inline-flex flex-row items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" strokeWidth={2} aria-hidden="true" />
                  <span>1-click expiring doctor links</span>
                </span>
                <span className="inline-flex flex-row items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" strokeWidth={2} aria-hidden="true" />
                  <span>Google Calendar &amp; Gmail sync</span>
                </span>
              </div>
            </div>

            {/* Right 6 Columns: Layered Interactive-Style Product Mockup Card */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)] sm:p-6">
                {/* Floating Active Share Link Pill */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" aria-hidden="true" />
                    <span className="font-heading text-[14px] font-bold text-[#0F172A]">
                      Family Clinical Vault
                    </span>
                  </div>
                  <span className="inline-flex flex-row items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 font-mono text-xs font-semibold text-[#065F46] shadow-2xs">
                    <Share2 className="h-3.5 w-3.5 shrink-0 text-[#059669]" aria-hidden="true" />
                    <span>24h Doctor Share Link Active</span>
                  </span>
                </div>

                {/* Family Profile Switcher Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pb-4">
                  {FAMILY_PROFILES_DEMO.map((pill) => (
                    <span
                      key={pill.label}
                      className={
                        pill.active
                          ? "inline-flex h-8 flex-row items-center rounded-full border border-[#059669] bg-[#059669] px-3 text-xs font-semibold text-white shadow-2xs"
                          : "inline-flex h-8 flex-row items-center rounded-full border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#475569]"
                      }
                    >
                      {pill.label}
                    </span>
                  ))}
                </div>

                {/* Floating White Document Card */}
                <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
                  {/* Sample Lab Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
                        <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="font-heading text-[16px] font-bold text-[#0F172A]">
                          Comprehensive Metabolic Panel
                        </h2>
                        <p className="text-xs text-[#64748B]">
                          Self · Lab Result · Oct 14, 2026 · PDF (1.4 MB)
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex flex-row items-center gap-1.5 rounded-[6px] border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 font-mono text-xs font-semibold text-[#065F46]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#059669]" aria-hidden="true" />
                      <span>Ready</span>
                    </span>
                  </div>

                  {/* Highlighted Plain-English Clinical Summary Callout */}
                  <div
                    id="ai-summaries"
                    className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex flex-row items-center gap-1.5 text-[13px] font-bold text-[#0F172A]">
                        <Sparkles className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                        <span>Plain-English Clinical Summary</span>
                      </span>
                      <span className="inline-flex flex-row items-center rounded-[6px] border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#92400E]">
                        Attention · 6.1% HbA1c
                      </span>
                    </div>

                    <p className="text-[14px] leading-relaxed text-[#0F172A]">
                      Hemoglobin A1c is <strong>6.1% (borderline)</strong>. Kidney and liver
                      electrolytes are within normal reference limits. Here are 3 questions to ask
                      your doctor:
                    </p>

                    <ol className="list-decimal space-y-1 pl-5 text-[13px] text-[#475569]">
                      <li>Should we repeat a fasting glucose &amp; HbA1c panel in 3 months?</li>
                      <li>What dietary adjustments can bring HbA1c below 5.7%?</li>
                      <li>Do any current medications affect my blood sugar readings?</li>
                    </ol>

                    {/* Clickable WHO & NHS Citation Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href="https://www.who.int"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-row items-center gap-1.5 rounded-[6px] border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 font-mono text-xs font-medium text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE]"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>WHO Guideline</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </a>
                        <a
                          href="https://www.nhs.uk"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-row items-center gap-1.5 rounded-[6px] border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 font-mono text-xs font-medium text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE]"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>NHS Reference</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </a>
                      </div>

                      <span className="inline-flex flex-row items-center gap-1 font-mono text-[11px] text-[#64748B]">
                        <Lock className="h-3 w-3 shrink-0 text-[#059669]" aria-hidden="true" />
                        <span>Profile-isolated RAG</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Column Core Capabilities Section */}
        <section id="family-vault" className="border-y border-[#E2E8F0] bg-[#F8FAFC] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex flex-row items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#065F46]">
                Clinical-Grade Architecture
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-[#0F172A] sm:text-4xl">
                Built for the entire household, engineered for clinical clarity.
              </h2>
              <p className="text-[16px] leading-relaxed text-[#475569]">
                Every record stays organized by family member with instant plain-English decoding
                and zero-friction physician sharing.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {CAPABILITY_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]"
                  >
                    <div className="space-y-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
                        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <h3 className="font-heading text-[20px] font-bold tracking-[-0.015em] text-[#0F172A]">
                        {card.title}
                      </h3>
                      <p className="text-[15px] leading-relaxed text-[#475569]">
                        {card.description}
                      </p>
                    </div>

                    <ul className="mt-6 space-y-2 border-t border-[#E2E8F0] pt-4 text-[13px] font-medium text-[#0F172A]">
                      {card.highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-[#059669]"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-bold tracking-wider text-[#059669] uppercase">
                How MedBay Works
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-[#0F172A]">
                From raw medical PDF to prepared doctor visit in under 30 seconds.
              </h2>
            </div>
            <Link
              href="/login"
              className="inline-flex h-11 flex-row items-center justify-center gap-2 self-start whitespace-nowrap rounded-[10px] bg-[#059669] px-5 text-[15px] font-semibold text-white shadow-xs transition-colors hover:bg-[#047857] lg:self-auto"
            >
              <span>Create Your Family Vault</span>
              <ArrowRight className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]"
              >
                <span className="inline-flex rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 font-mono text-xs font-semibold text-[#065F46]">
                  {item.step}
                </span>
                <h3 className="mt-4 font-heading text-[18px] font-bold text-[#0F172A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#475569]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Privacy Banner */}
        <section id="security" className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-8 sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-8">
                <div className="inline-flex flex-row items-center gap-2 text-[14px] font-bold text-[#065F46]">
                  <FolderLock className="h-5 w-5 shrink-0 text-[#059669]" aria-hidden="true" />
                  <span>Zero-Trust Medical Storage &amp; Signed URLs</span>
                </div>
                <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A] sm:text-3xl">
                  Your family&apos;s health history stays private, isolated, and under your control.
                </h2>
                <p className="text-[15px] leading-relaxed text-[#475569]">
                  Files are stored in private encrypted buckets accessed exclusively via short-lived
                  signed URLs. Shared physician links expose only the original document you choose
                  and never reveal your AI chat history or other family members.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
                <Link
                  href="/login"
                  className="inline-flex h-12 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#047857]"
                >
                  <span>Open Encrypted Vault</span>
                  <ArrowRight className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <MedBayLogo size="sm" />
            <span className="text-[13px] text-[#64748B]">
              © {new Date().getFullYear()} MedBay. Encrypted Family Health Vault.
            </span>
          </div>
          <p className="max-w-xl text-[13px] text-[#64748B]">
            MedBay AI provides plain-English explanations for informational purposes only and is not
            a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
