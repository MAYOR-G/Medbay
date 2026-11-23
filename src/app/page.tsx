import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileSearch,
  Mail,
  Share2,
  ShieldCheck,
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
    title: "Upload or import records",
    description:
      "Drop a multi page lab PDF, photograph a handwritten prescription, or import clinic attachments detected by the 24 hour Gmail medical scanner.",
    meta: "PDF, JPEG, PNG, WebP, DOCX, TXT up to 25 MB",
  },
  {
    icon: FileSearch,
    title: "Read your plain English report",
    description:
      "MedBay extracts every biomarker, flags borderline or critical values, prepares tailored doctor questions, and links directly to WHO, NHS, and CDC references.",
    meta: "Structured Overview, Findings, and Doctor Questions",
  },
  {
    icon: Share2,
    title: "Share or book follow ups",
    description:
      "Send a 24 hour, 7 day, or 30 day link to the original document with zero recipient login, or ask MedBay AI to schedule your follow up on Google Calendar.",
    meta: "One tap revocation · Zero recipient sign up",
  },
] as const;

const AUTHORITY_SOURCES = [
  "World Health Organization",
  "NHS Guidelines",
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

      <main id="main-content" className="flex-1 text-base">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14 lg:pt-16 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Narrative & Primary CTA */}
            <div className="space-y-6 lg:col-span-6">
              <h1 className="max-w-[660px] font-heading text-3xl leading-[1.12] font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl lg:text-[42px]">
                Your family&apos;s medical records, understood and ready anywhere.
              </h1>

              <p className="max-w-[58ch] text-base leading-relaxed text-[#1E293B] sm:text-lg text-pretty">
                Store encrypted lab results, prescriptions, and pediatric plans for up to five
                dependents. Read plain English AI summaries grounded in WHO and NHS guidelines, and
                share originals with doctors in one click.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#047857] px-6 text-base font-semibold whitespace-nowrap text-white transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#065F46] active:scale-[0.98]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                </Link>
                <PwaInstallButton />
              </div>

              <div className="grid gap-3 pt-3 sm:grid-cols-2">
                <div className="flex items-start gap-2.5 text-sm font-medium text-[#1E293B]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#047857]"
                    aria-hidden="true"
                  />
                  <span>No separate logins for kids or parents</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm font-medium text-[#1E293B]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#047857]"
                    aria-hidden="true"
                  />
                  <span>Expiring 24h links with instant revoke</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm font-medium text-[#1E293B]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#047857]"
                    aria-hidden="true"
                  />
                  <span>AES 256 private vault &amp; signed URLs</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm font-medium text-[#1E293B]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#047857]"
                    aria-hidden="true"
                  />
                  <span>24h Gmail alerts &amp; Calendar sync</span>
                </div>
              </div>
            </div>

            {/* Right Column: Large Interactive Live Vault Object */}
            <div className="lg:col-span-6">
              <HeroVaultInteractive />
            </div>
          </div>

          {/* Grounded Medical Authorities Strip */}
          <div className="mt-14 rounded-2xl bg-[#F2F6F4] px-6 py-6 sm:px-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <p className="text-sm font-semibold text-[#0F172A]">
                Verified clinical references built into every summary
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#1E293B]">
                {AUTHORITY_SOURCES.map((source) => (
                  <span key={source} className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#047857]" aria-hidden="true" />
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
          caption="A calm family health archive where clinical clarity replaces scattered clinic portals, camera roll screenshots, and late night symptom searches."
        />

        {/* Core Product Capabilities Showcase (Asymmetric Editorial Splits) */}
        <section id="vault-showcase" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                Built for clinical clarity across your household
              </h2>
              <p className="max-w-[60ch] text-base leading-relaxed text-[#1E293B] sm:text-lg text-pretty">
                MedBay separates each family member at the database layer while turning raw scans
                into cited, plain English briefings ready for any consultation.
              </p>
            </div>
          </ScrollReveal>

          {/* Split 1: Family Profile Isolation */}
          <ScrollReveal delayMs={60} className="mt-16 lg:mt-20">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="space-y-5 lg:col-span-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#047857]">
                  <Users className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-3xl text-balance">
                  Strict family isolation without extra logins
                </h3>
                <p className="max-w-[54ch] text-base leading-relaxed text-[#1E293B] text-pretty">
                  Manage records for yourself, your children, and aging parents inside one encrypted
                  vault. Automatic patient name matching assigns incoming lab reports accurately,
                  and scoped RAG chat keeps each person&apos;s records strictly separated.
                </p>
                <ul className="space-y-3 pt-2 text-base text-[#0F172A]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#047857]" aria-hidden="true" />
                    <span>Up to five dependent profiles with clear identity pills</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#047857]" aria-hidden="true" />
                    <span>Profile scoped vector search enforced inside PostgreSQL RLS</span>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-7">
                <FamilyIsolationDiagram className="w-full rounded-2xl" />
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
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#047857]">
                  <CalendarClock className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-3xl text-balance">
                  Expiring doctor links and workspace sync
                </h3>
                <p className="max-w-[54ch] text-base leading-relaxed text-[#1E293B] text-pretty">
                  Hand any specialist a clean 24 hour, 7 day, or 30 day view of the original PDF
                  with zero recipient sign up. Connect Google Workspace so MedBay watches Gmail once
                  daily for new lab alerts and books follow ups directly on Google Calendar.
                </p>
                <ul className="space-y-3 pt-2 text-base text-[#0F172A]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#047857]" aria-hidden="true" />
                    <span>Shared links hide your AI chat, questions, and other profiles</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#047857]" aria-hidden="true" />
                    <span>Read only 24 hour Gmail scanner with Web Push alerts</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* How MedBay Works Section (Clean Unboxed Editorial Columns on Tone Field) */}
        <section id="how-it-works" className="bg-[#F2F6F4] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-2xl space-y-3">
                  <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                    Ready for your doctor visit in seconds
                  </h2>
                  <p className="max-w-[58ch] text-base leading-relaxed text-[#1E293B] sm:text-lg text-pretty">
                    Designed for calm one thumb use when you are in a clinic waiting room or
                    reviewing late evening lab results at home.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-[10px] bg-[#047857] px-6 text-base font-semibold whitespace-nowrap text-white transition-colors duration-300 hover:bg-[#065F46] lg:self-auto"
                >
                  <span>Create Your Family Vault</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </ScrollReveal>

            <ol className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-12">
              {WORKFLOW_STAGES.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <li key={stage.title}>
                    <ScrollReveal delayMs={index * 80} className="space-y-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#047857]">
                        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <h3 className="font-heading text-xl font-semibold text-[#0F172A] text-balance">
                        {stage.title}
                      </h3>
                      <p className="max-w-[48ch] text-base leading-relaxed text-[#1E293B] text-pretty">
                        {stage.description}
                      </p>
                      <p className="pt-1 text-sm font-semibold text-[#065F46]">{stage.meta}</p>
                    </ScrollReveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* About Section Preview */}
        <section id="about" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <ScrollReveal>
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-6">
                <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                  Built as a private health archive
                </h2>
                <p className="max-w-[58ch] text-base leading-relaxed text-[#1E293B] sm:text-lg text-pretty">
                  Modern families accumulate dozens of fragmented clinical documents across
                  pediatricians, specialists, pharmacies, and laboratories. Yet patients are still
                  expected to translate dense terminology alone and carry records across portals.
                </p>
                <p className="max-w-[58ch] text-base leading-relaxed text-[#1E293B] text-pretty">
                  MedBay pairs archival grade encryption with grounded clinical AI so every caregiver
                  has calm, accurate context in their pocket—without turning personal health history
                  into an ad profile.
                </p>
                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#064E3B] px-6 text-base font-semibold text-white transition-colors duration-300 hover:bg-[#047857]"
                  >
                    <span>Read Our Story &amp; Principles</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-[#F2F6F4] p-8 sm:p-10">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
                    <MedBayLogo
                      size="lg"
                      showTagline
                      tagline="Medical AI & Document Hub"
                    />
                    <span className="rounded-lg bg-[#ECFDF5] px-3 py-1.5 text-sm font-semibold text-[#065F46]">
                      Private Archive
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-5">
                      <dt className="text-sm font-medium text-[#334155]">Dependent profiles</dt>
                      <dd className="mt-1 font-heading text-2xl font-semibold text-[#0F172A] tabular-nums">
                        Up to 5 members
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white p-5">
                      <dt className="text-sm font-medium text-[#334155]">Document capacity</dt>
                      <dd className="mt-1 font-heading text-2xl font-semibold text-[#0F172A] tabular-nums">
                        25 MB multi format
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white p-5">
                      <dt className="text-sm font-medium text-[#334155]">Medical authorities</dt>
                      <dd className="mt-1 font-heading text-2xl font-semibold text-[#0F172A] tabular-nums">
                        8 verified sources
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white p-5">
                      <dt className="text-sm font-medium text-[#334155]">Share link expiry</dt>
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
        <section id="blog" className="bg-[#F2F6F4] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="max-w-2xl space-y-3">
                  <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                    The MedBay Clinical Journal
                  </h2>
                  <p className="max-w-[58ch] text-base leading-relaxed text-[#1E293B] sm:text-lg text-pretty">
                    Practical guides for understanding laboratory panels, organizing multi
                    generational care, and protecting sensitive medical documents.
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-[10px] bg-[#0F172A] px-5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-300 hover:bg-[#1E293B] sm:self-auto"
                >
                  <span>Visit Clinical Journal</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-12">
              {/* Featured Lead Article */}
              <ScrollReveal className="lg:col-span-7">
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white">
                  <Link href={`/blog/${featuredPost.slug}`} className="block overflow-hidden">
                    <BlogCoverIllustration
                      visual={featuredPost.coverVisual}
                      className="aspect-video w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                        <span className="rounded-md bg-[#ECFDF5] px-2.5 py-1 text-[#065F46]">
                          {featuredPost.category}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-[#334155]">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          <span>{featuredPost.readTime}</span>
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl leading-snug font-semibold text-[#0F172A] transition-colors duration-300 group-hover:text-[#047857] text-balance">
                        <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                      </h3>
                      <p className="max-w-[58ch] text-base leading-relaxed text-[#1E293B] text-pretty">
                        {featuredPost.excerpt}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between pt-4">
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {featuredPost.author.name}
                      </span>
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#047857]"
                      >
                        <span>Read guide</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              </ScrollReveal>

              {/* Stacked Secondary Articles */}
              <div className="flex flex-col gap-5 lg:col-span-5">
                {secondaryPosts.map((post, idx) => (
                  <ScrollReveal key={post.slug} delayMs={(idx + 1) * 70} className="flex-1">
                    <article className="group flex h-full flex-col justify-between rounded-2xl bg-white p-6">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm font-semibold">
                          <span className="rounded-md bg-[#ECFDF5] px-2.5 py-1 text-[#065F46]">
                            {post.category}
                          </span>
                          <span className="font-medium text-[#334155]">{post.readTime}</span>
                        </div>
                        <h3 className="font-heading text-lg leading-snug font-semibold text-[#0F172A] transition-colors duration-300 group-hover:text-[#047857] text-balance">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        <p className="text-sm leading-relaxed text-[#1E293B] text-pretty">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-2 text-sm font-medium text-[#334155]">
                        <span>{post.publishedAt}</span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1 font-semibold text-[#047857]"
                        >
                          <span>Read</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
                  <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-white text-balance sm:text-4xl">
                    Zero trust privacy, under your control
                  </h2>
                  <p className="max-w-[52ch] text-base leading-relaxed text-[#D1FAE5] text-pretty">
                    Every document, OAuth refresh token, and AI chat thread is engineered around
                    strict isolation, short lived signed URLs, and zero metadata leaks.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/privacy"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#A7F3D0] underline-offset-4 hover:text-white hover:underline"
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
                      className="rounded-xl bg-[#047857]/75 p-5"
                    >
                      <h3 className="font-heading text-base font-semibold text-white">
                        {pillar.label}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#ECFDF5]">
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
                  Common family vault questions
                </h2>
                <p className="max-w-[44ch] text-base leading-relaxed text-[#1E293B] text-pretty">
                  Straight answers on privacy boundaries, supported document formats, Google
                  Workspace sync, and clinical AI citations.
                </p>
                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#047857] hover:text-[#065F46]"
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
        <section id="contact" className="bg-[#F2F6F4] py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <ScrollReveal>
              <div className="grid gap-12 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-5">
                  <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                    Talk with the MedBay team
                  </h2>
                  <p className="max-w-[50ch] text-base leading-relaxed text-[#1E293B] sm:text-lg text-pretty">
                    Have a question about dependent profiles, security architecture, or clinical
                    partnerships? Send a note directly or visit our dedicated contact page.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm font-medium text-[#0F172A]">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#047857]">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-[#0F172A]">Support &amp; Privacy Desk</p>
                        <a
                          href="mailto:support@medbay.health"
                          className="text-[#1E293B] hover:text-[#047857]"
                        >
                          support@medbay.health
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#047857] hover:text-[#065F46]"
                    >
                      <span>Open full Contact page</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 sm:p-8 lg:col-span-7">
                  <ContactForm compact />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Final Risk-Reversal CTA Band */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <ScrollReveal>
            <div className="flex flex-col justify-between gap-8 rounded-2xl bg-[#ECFDF5] p-8 sm:p-12 lg:flex-row lg:items-center">
              <div className="max-w-2xl space-y-3">
                <h2 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-4xl">
                  Bring your family&apos;s records into one vault
                </h2>
                <p className="max-w-[56ch] text-base leading-relaxed text-[#065F46] text-pretty">
                  Free to start with encrypted AES 256 storage, up to five managed dependent
                  profiles, and one click expiring doctor links.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#047857] px-6 text-base font-semibold whitespace-nowrap text-white transition-[background-color,transform] duration-300 hover:bg-[#065F46] active:scale-[0.98]"
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
