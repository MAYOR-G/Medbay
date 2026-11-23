import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileSearch,
  Lock,
  Mail,
  Share2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react";
import { PwaInstallButton } from "@/components/layout";
import {
  BlogCoverIllustration,
  ContactForm,
  ExpiringShareDiagram,
  FamilyIsolationDiagram,
  FaqAccordion,
  HeroVaultInteractive,
  MarketingFooter,
  MarketingHeader,
  ScrollReveal,
  TaglineReveal,
} from "@/components/marketing";
import { MedBayLogo } from "@/components/ui";
import {
  ARCHITECTURE_PILLARS,
  BLOG_ARTICLES,
  FAQ_ITEMS,
} from "@/lib/marketing-content";

const WORKFLOW_STAGES = [
  {
    icon: UploadCloud,
    title: "Upload or import any medical record",
    description:
      "Drop a multi page lab PDF, photograph a handwritten prescription, or import clinic attachments detected by the 24 hour Gmail medical scanner.",
    meta: "PDF, JPEG, PNG, WebP, DOCX, TXT up to 25 MB",
  },
  {
    icon: FileSearch,
    title: "Read your plain English clinical report",
    description:
      "MedBay extracts every biomarker, flags borderline or critical results, writes tailored questions for your doctor, and links directly to WHO, NHS, and CDC references.",
    meta: "Structured Overview, Findings, and Doctor Questions",
  },
  {
    icon: Share2,
    title: "Share with doctors or book follow ups",
    description:
      "Create a 24 hour, 7 day, or 30 day link to the original document with zero recipient login, or ask MedBay AI to schedule your follow up on Google Calendar.",
    meta: "One tap revocation · Zero recipient sign up",
  },
] as const;

const AUTHORITY_SOURCES = [
  "World Health Organization",
  "NHS Clinical Guidelines",
  "CDC Health Topics",
  "NIH MedlinePlus",
  "Mayo Clinic",
  "Cleveland Clinic",
] as const;

export default function LandingPage() {
  const [featuredPost, ...secondaryPosts] = BLOG_ARTICLES;

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#0F172A]">
      <MarketingHeader />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-5 pt-12 pb-20 sm:px-8 sm:pt-16 lg:pt-20 lg:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Narrative & Primary CTA */}
            <div className="space-y-6 lg:col-span-5">
              <h1 className="max-w-[680px] font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-[#0F172A] text-balance sm:text-5xl">
                Your family&apos;s medical records, understood and ready anywhere.
              </h1>

              <p className="max-w-[680px] text-lg leading-relaxed text-[#475569] text-pretty">
                Store encrypted lab results, prescriptions, and pediatric plans for up to five
                dependents. Read instant plain English AI summaries grounded in WHO and NHS
                guidelines, and share originals with doctors in one click.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#059669] px-6 text-base font-semibold whitespace-nowrap text-white transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#047857] active:scale-[0.98]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                </Link>
                <PwaInstallButton />
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <div className="flex items-start gap-2.5 text-sm font-medium text-[#475569]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]"
                    aria-hidden="true"
                  />
                  <span>No separate logins for children or parents</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm font-medium text-[#475569]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]"
                    aria-hidden="true"
                  />
                  <span>Expiring 24h doctor links with instant revoke</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm font-medium text-[#475569]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]"
                    aria-hidden="true"
                  />
                  <span>AES 256 private vault &amp; signed URLs</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm font-medium text-[#475569]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]"
                    aria-hidden="true"
                  />
                  <span>24 hour Gmail scan &amp; Calendar booking</span>
                </div>
              </div>
            </div>

            {/* Right Column: Large Interactive Live Vault Object */}
            <div className="lg:col-span-7">
              <HeroVaultInteractive />
            </div>
          </div>

          {/* Grounded Medical Authorities Strip */}
          <div className="mt-16 rounded-2xl bg-[#F8FAFC] px-6 py-6 sm:px-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <p className="text-sm font-semibold text-[#0F172A]">
                Clinical explanations cite verified medical authorities
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#475569]">
                {AUTHORITY_SOURCES.map((source) => (
                  <span key={source} className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                    <span>{source}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mandatory Word-by-Word Scroll Reveal Statement */}
        <TaglineReveal
          text="Every blood panel, prescription, and pediatric note organized for the appointment that matters most."
          caption="Built as a calm family health archive where clinical precision replaces scattered clinic portals, camera roll screenshots, and late night symptom searches."
        />

        {/* Core Product Capabilities Showcase (Asymmetric Editorial Splits) */}
        <section id="vault-showcase" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <ScrollReveal>
            <div className="max-w-2xl space-y-4">
              <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl lg:text-5xl">
                Built for the whole household, engineered for clinical clarity.
              </h2>
              <p className="text-lg leading-relaxed text-[#475569] text-pretty">
                MedBay separates each family member at the database layer while turning raw scans
                into cited, plain English briefings you can carry into any consultation.
              </p>
            </div>
          </ScrollReveal>

          {/* Split 1: Family Profile Isolation */}
          <ScrollReveal delayMs={60} className="mt-16 lg:mt-20">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="space-y-5 lg:col-span-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                  <Users className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-3xl text-balance">
                  Strict family isolation without extra logins
                </h3>
                <p className="text-base leading-relaxed text-[#475569] text-pretty">
                  Manage records for yourself, your children, and aging parents under one encrypted
                  vault. Automatic patient name matching assigns incoming lab reports to the right
                  person, and scoped RAG chat guarantees one family member&apos;s prescription never
                  leaks into another&apos;s conversation.
                </p>
                <ul className="space-y-3 pt-2 text-base text-[#0F172A]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                    <span>Up to five managed dependent profiles with color coded identity pills</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                    <span>Profile scoped vector search enforced inside PostgreSQL RLS</span>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-7">
                <FamilyIsolationDiagram className="w-full rounded-2xl border border-[#DCE2DF]" />
              </div>
            </div>
          </ScrollReveal>

          {/* Split 2: Expiring Doctor Share Links & Google Workspace Sync */}
          <ScrollReveal delayMs={100} className="mt-20 lg:mt-28">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="order-2 lg:order-1 lg:col-span-7">
                <ExpiringShareDiagram className="w-full rounded-2xl" />
              </div>
              <div className="order-1 space-y-5 lg:order-2 lg:col-span-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                  <CalendarClock className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-3xl text-balance">
                  One click doctor links and calm workspace sync
                </h3>
                <p className="text-base leading-relaxed text-[#475569] text-pretty">
                  Hand any specialist a clean 24 hour, 7 day, or 30 day view of the original PDF
                  with zero recipient sign up. Connect Google Workspace so MedBay watches Gmail once
                  daily for new lab alerts and books follow ups directly on Google Calendar.
                </p>
                <ul className="space-y-3 pt-2 text-base text-[#0F172A]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                    <span>Shared links hide your AI chat, questions, and all other family profiles</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                    <span>Read only 24 hour Gmail medical scanner with Web Push alerts</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* How MedBay Works Section */}
        <section id="how-it-works" className="bg-[#F8FAFC] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-2xl space-y-3">
                  <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                    From raw medical PDF to prepared doctor visit in under thirty seconds.
                  </h2>
                  <p className="text-base leading-relaxed text-[#475569] sm:text-lg text-pretty">
                    Designed for mobile thumb ergonomics when you are sitting in a waiting room or
                    reviewing late evening lab results at home.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-[10px] bg-[#059669] px-6 text-base font-semibold whitespace-nowrap text-white transition-colors duration-300 hover:bg-[#047857] lg:self-auto"
                >
                  <span>Create Your Family Vault</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {WORKFLOW_STAGES.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <ScrollReveal key={stage.title} delayMs={index * 80}>
                    <div className="flex h-full flex-col justify-between rounded-2xl border border-[#DCE2DF] bg-white p-7 sm:p-8">
                      <div className="space-y-4">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                        </span>
                        <h3 className="font-heading text-xl font-semibold text-[#0F172A] text-balance">
                          {stage.title}
                        </h3>
                        <p className="text-base leading-relaxed text-[#475569] text-pretty">
                          {stage.description}
                        </p>
                      </div>
                      <p className="mt-6 border-t border-[#E2E8F0] pt-4 text-sm font-medium text-[#065F46]">
                        {stage.meta}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* About Section Preview */}
        <section id="about" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <ScrollReveal>
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-6">
                <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                  Why we built MedBay as a private health archive
                </h2>
                <p className="text-lg leading-relaxed text-[#475569] text-pretty">
                  Modern families accumulate dozens of fragmented clinical documents across
                  pediatricians, specialists, pharmacies, and laboratories. Yet patients are still
                  expected to translate dense terminology alone and carry records across portals.
                </p>
                <p className="text-base leading-relaxed text-[#475569] text-pretty">
                  MedBay pairs archival grade encryption with grounded clinical AI so every caregiver
                  has calm, accurate context in their pocket—without turning personal health history
                  into an ad profile or a noisy social dashboard.
                </p>
                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-[#064E3B] bg-white px-6 text-base font-semibold text-[#064E3B] transition-colors duration-300 hover:bg-[#ECFDF5]"
                  >
                    <span>Read Our Story &amp; Principles</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-[#F5F5F0] p-8 sm:p-10">
                  <div className="flex items-center justify-between border-b border-[#DCE2DF] pb-6">
                    <MedBayLogo
                      size="lg"
                      showTagline
                      tagline="Medical AI & Document Hub"
                    />
                    <span className="rounded-lg bg-[#ECFDF5] px-3 py-1.5 text-xs font-semibold text-[#065F46]">
                      Private Atelier
                    </span>
                  </div>

                  <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-5">
                      <dt className="text-sm font-medium text-[#475569]">Dependent profiles</dt>
                      <dd className="mt-1 font-heading text-2xl font-semibold text-[#0F172A] tabular-nums">
                        Up to 5 members
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white p-5">
                      <dt className="text-sm font-medium text-[#475569]">Document capacity</dt>
                      <dd className="mt-1 font-heading text-2xl font-semibold text-[#0F172A] tabular-nums">
                        25 MB multi format
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white p-5">
                      <dt className="text-sm font-medium text-[#475569]">Medical authorities</dt>
                      <dd className="mt-1 font-heading text-2xl font-semibold text-[#0F172A] tabular-nums">
                        8 verified sources
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white p-5">
                      <dt className="text-sm font-medium text-[#475569]">Share link expiry</dt>
                      <dd className="mt-1 font-heading text-2xl font-semibold text-[#0F172A] tabular-nums">
                        24h, 7d, or 30d
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Clinical Journal / Blog Section */}
        <section id="blog" className="bg-[#F5F5F0] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="max-w-2xl space-y-3">
                  <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                    Notes on family health clarity and clinical privacy
                  </h2>
                  <p className="text-base leading-relaxed text-[#475569] sm:text-lg text-pretty">
                    Practical guides for understanding laboratory panels, organizing multi
                    generational care, and protecting sensitive medical documents.
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-[10px] border border-[#0F172A] bg-white px-5 text-sm font-semibold whitespace-nowrap text-[#0F172A] transition-colors duration-300 hover:bg-[#0F172A] hover:text-white sm:self-auto"
                >
                  <span>Visit Clinical Journal</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-12">
              {/* Featured Lead Article */}
              <ScrollReveal className="lg:col-span-7">
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DCE2DF] bg-white transition-colors duration-300 hover:border-[#059669]">
                  <Link href={`/blog/${featuredPost.slug}`} className="block overflow-hidden">
                    <BlogCoverIllustration
                      visual={featuredPost.coverVisual}
                      className="aspect-video w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                        <span className="rounded-md bg-[#ECFDF5] px-2.5 py-1 text-[#065F46]">
                          {featuredPost.category}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-[#64748B]">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{featuredPost.readTime}</span>
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl leading-snug font-semibold text-[#0F172A] transition-colors duration-300 group-hover:text-[#059669] text-balance">
                        <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                      </h3>
                      <p className="text-base leading-relaxed text-[#475569] text-pretty">
                        {featuredPost.excerpt}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                      <span className="text-sm font-medium text-[#0F172A]">
                        {featuredPost.author.name}
                      </span>
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#059669]"
                      >
                        <span>Read guide</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              </ScrollReveal>

              {/* Stacked Secondary Articles */}
              <div className="flex flex-col gap-6 lg:col-span-5">
                {secondaryPosts.map((post, idx) => (
                  <ScrollReveal key={post.slug} delayMs={(idx + 1) * 70} className="flex-1">
                    <article className="group flex h-full flex-col justify-between rounded-2xl border border-[#DCE2DF] bg-white p-6 transition-colors duration-300 hover:border-[#059669]">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          <span className="rounded-md bg-[#ECFDF5] px-2.5 py-1 text-[#065F46]">
                            {post.category}
                          </span>
                          <span className="font-medium text-[#64748B]">{post.readTime}</span>
                        </div>
                        <h3 className="font-heading text-lg leading-snug font-semibold text-[#0F172A] transition-colors duration-300 group-hover:text-[#059669] text-balance">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        <p className="text-sm leading-relaxed text-[#475569] text-pretty">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-2 text-xs font-medium text-[#64748B]">
                        <span>{post.publishedAt}</span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1 font-semibold text-[#059669]"
                        >
                          <span>Read</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Zero-Trust Security Architecture & FAQ */}
        <section id="security-faq" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          {/* Security Dark Emerald Panel */}
          <ScrollReveal>
            <div className="rounded-2xl bg-[#064E3B] p-8 text-white sm:p-12">
              <div className="grid gap-10 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-5">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-semibold text-[#A7F3D0]">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Zero Trust Medical Storage</span>
                  </span>
                  <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-white text-balance sm:text-4xl">
                    Your family&apos;s health history stays private and under your control.
                  </h2>
                  <p className="text-base leading-relaxed text-[#D1FAE5] text-pretty">
                    Every document, OAuth refresh token, and AI chat thread is engineered around
                    strict isolation, short lived signed URLs, and zero metadata leaks.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/privacy"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#6EE7B7] underline-offset-4 hover:text-white hover:underline"
                    >
                      <span>Read our Privacy Policy</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                  {ARCHITECTURE_PILLARS.map((pillar) => (
                    <div
                      key={pillar.label}
                      className="rounded-xl bg-[#047857]/60 p-5"
                    >
                      <h3 className="font-heading text-base font-semibold text-white">
                        {pillar.label}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#D1FAE5]">
                        {pillar.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Frequently Asked Questions */}
          <ScrollReveal delayMs={80} className="mt-20 lg:mt-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-4">
                <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance">
                  Questions families ask before moving their records
                </h2>
                <p className="text-base leading-relaxed text-[#475569] text-pretty">
                  Straight answers on privacy boundaries, supported document formats, Google
                  Workspace sync, and clinical AI citations.
                </p>
                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#059669] hover:text-[#047857]"
                  >
                    <span>Still have a question? Contact our team</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-8">
                <FaqAccordion items={FAQ_ITEMS} />
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Embedded Contact Section */}
        <section id="contact" className="bg-[#F8FAFC] py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="grid gap-12 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-5">
                  <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                    Talk with the MedBay team
                  </h2>
                  <p className="text-base leading-relaxed text-[#475569] sm:text-lg text-pretty">
                    Have a question about dependent profiles, security architecture, or clinical
                    partnerships? Send a note directly or visit our dedicated contact page.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm font-medium text-[#0F172A]">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669]">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-[#0F172A]">Support &amp; Privacy Desk</p>
                        <a
                          href="mailto:support@medbay.health"
                          className="text-[#475569] hover:text-[#059669]"
                        >
                          support@medbay.health
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#059669] hover:text-[#047857]"
                    >
                      <span>Open full Contact page</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#DCE2DF] bg-white p-6 sm:p-8 lg:col-span-7">
                  <ContactForm compact />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Final Risk-Reversal CTA Band */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <ScrollReveal>
            <div className="flex flex-col justify-between gap-8 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-8 sm:p-12 lg:flex-row lg:items-center">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#065F46]">
                  <Sparkles className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                  <span>Free to start · Zero separate logins for family members</span>
                </div>
                <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                  Bring your family&apos;s health records into one calm, encrypted vault.
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#059669] px-6 text-base font-semibold whitespace-nowrap text-white transition-[background-color,transform] duration-300 hover:bg-[#047857] active:scale-[0.98]"
                >
                  <span>Open Encrypted Vault</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
