import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { JsonLd, MarketingFooter, MarketingHeader } from "@/components/marketing";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildPageMetadata,
  SITE_BRAND,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy — AES-256 Vault & Google Limited Use",
  description:
    "Review how MedBay encrypts family medical records with AES-256 storage, PostgreSQL Row-Level Security, PHI log redaction, and Google API Limited Use.",
  pathname: "/privacy",
});

const LAST_UPDATED = "November 23, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#0F172A]">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "MedBay Privacy Policy",
            url: absoluteUrl("/privacy"),
            dateModified: "2026-11-23",
          },
          buildBreadcrumbSchema([
            { name: "Home", pathname: "/" },
            { name: "Privacy Policy", pathname: "/privacy" },
          ]),
        ]}
      />
      <MarketingHeader />

      <main id="main-content" className="flex-1">
        <header className="bg-[#F5F5F0] py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#065F46] hover:text-[#047857]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>

            <div className="mt-8 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#ECFDF5] px-3 py-1.5 text-xs font-semibold text-[#065F46]">
                <Lock className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                <span>Last updated: {LAST_UPDATED}</span>
              </span>
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-[#475569] text-pretty">
                Your family&apos;s medical history is deeply personal. This policy explains exactly
                what data MedBay collects, how we isolate and encrypt it, how Google Workspace
                permissions work, and how you retain full custody at every step.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="clinical-prose space-y-12 text-[#0F172A]">
            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                1. Information we collect and store
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                MedBay collects only the information needed to operate your encrypted family health
                vault:
              </p>
              <ul className="list-disc space-y-2.5 pl-6 text-base leading-relaxed text-[#475569]">
                <li>
                  <strong className="font-semibold text-[#0F172A]">Account identity:</strong> Your
                  name, email address, and authentication session managed via Google OAuth or email
                  one time passcode sign in.
                </li>
                <li>
                  <strong className="font-semibold text-[#0F172A]">Managed family profiles:</strong>{" "}
                  Display names, relationships, and optional dates of birth you add for yourself and
                  up to five dependents. Dependents do not receive separate login credentials.
                </li>
                <li>
                  <strong className="font-semibold text-[#0F172A]">Uploaded medical records:</strong>{" "}
                  Files you upload (PDF, JPEG, PNG, WebP, DOCX, or TXT up to 25 MB), OCR extracted
                  text, plain English AI summaries, and vector embeddings scoped strictly to the
                  owning profile.
                </li>
                <li>
                  <strong className="font-semibold text-[#0F172A]">
                    Optional Google Workspace connection:
                  </strong>{" "}
                  Encrypted refresh tokens when you authorize read only Gmail scanning or Google
                  Calendar appointment booking, plus Web Push notification subscriptions if enabled.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                2. Encryption, storage, and family profile isolation
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                Security boundaries are enforced across storage, database queries, and runtime logs:
              </p>
              <ul className="list-disc space-y-2.5 pl-6 text-base leading-relaxed text-[#475569]">
                <li>
                  All medical files are stored in private AES 256 encrypted storage buckets under
                  user scoped paths and delivered exclusively through short lived signed URLs.
                </li>
                <li>
                  Every database table enforces PostgreSQL Row Level Security (RLS), and AI
                  retrieval filters strictly by both your account ID and the active family member
                  profile ID so one relative&apos;s documents never enter another relative&apos;s
                  context.
                </li>
                <li>
                  Google OAuth refresh tokens are encrypted using AES 256 GCM before database
                  persistence and are never serialized to client browsers.
                </li>
                <li>
                  Server logs enforce strict PHI and PII redaction: raw OCR text, clinical
                  summaries, patient names, chat prompts, and email snippets are excluded from
                  operational logs.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                3. AI clinical processing &amp; medical authority citations
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                When you upload a document or start a profile scoped chat, MedBay processes document
                text through configured AI inference and embedding providers strictly to generate
                your plain English clinical summary, biomarker flags, and doctor questions. External
                citation queries search authoritative public medical domains (such as WHO, NHS, CDC,
                NIH, MedlinePlus, and Mayo Clinic) using generalized clinical concepts without
                sending your family&apos;s personal identity.
              </p>
              <p className="text-base leading-relaxed text-[#475569]">
                We never sell your medical records, never serve health targeted advertisements, and
                never permit third parties to use your family&apos;s health documents for marketing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                4. Expiring doctor share links
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                When you create a 24 hour, 7 day, or 30 day share link, anyone holding that link can
                view or download solely the single original medical document you selected until it
                expires or you revoke it. Share views carry strict{" "}
                <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-sm">
                  noindex, nofollow
                </code>{" "}
                headers and never expose AI summaries, chat history, or other family profiles.
                Expired or revoked links display a neutral unavailable page with zero metadata.
              </p>
            </section>

            <section className="space-y-4 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-6">
              <div className="flex items-center gap-2 font-heading text-xl font-semibold text-[#065F46]">
                <ShieldCheck className="h-5 w-5 text-[#059669]" aria-hidden="true" />
                <h2>5. Google Workspace API Limited Use Disclosure</h2>
              </div>
              <p className="text-base leading-relaxed text-[#065F46]">
                MedBay&apos;s use and transfer of information received from Google APIs adheres
                strictly to the Google API Services User Data Policy, including the Limited Use
                requirements.
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-[#065F46]">
                <li>
                  <strong>Gmail read only scope (gmail.readonly):</strong> Used exclusively to
                  detect medical lab alerts, prescription notices, and clinic updates once every 24
                  hours and surface in app or Web Push alerts for you. MedBay never sends emails on
                  your behalf and never shares Gmail content with advertisers.
                </li>
                <li>
                  <strong>Google Calendar scope (calendar.events):</strong> Used exclusively to
                  create doctor follow up appointments or clinical reminders when you explicitly
                  request booking inside MedBay.
                </li>
                <li>
                  You may disconnect Google Workspace access at any time from your MedBay Family
                  &amp; Settings page or directly from your Google Account permissions dashboard.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                6. Your control, deletion, and retention rights
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                You remain the sole owner of your family&apos;s documents. Inside your MedBay
                account you can revoke any active share link immediately, delete individual
                documents (which removes the encrypted file, extracted chunks, and AI summary),
                delete a dependent sub profile, or request complete account deletion.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                7. Contact our privacy desk
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                If you have any questions about this Privacy Policy, encryption safeguards, or data
                deletion requests, please email{" "}
                <a
                  href={`mailto:${SITE_BRAND.privacyEmail}`}
                  className="font-semibold text-[#059669] hover:text-[#047857]"
                >
                  {SITE_BRAND.privacyEmail}
                </a>{" "}
                or reach us via our{" "}
                <Link href="/contact" className="font-semibold text-[#059669] hover:text-[#047857]">
                  Contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
