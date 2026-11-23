import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import { JsonLd, MarketingFooter, MarketingHeader } from "@/components/marketing";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildPageMetadata,
  SITE_BRAND,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service — Medical Disclaimer & Vault Terms",
  description:
    "Read MedBay's Terms of Service covering our informational-only AI clinical disclaimer, dependent family profile authorization, and expiring doctor links.",
  pathname: "/terms",
});

const LAST_UPDATED = "November 23, 2026";

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#0F172A]">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "MedBay Terms of Service",
            url: absoluteUrl("/terms"),
            dateModified: "2026-11-23",
          },
          buildBreadcrumbSchema([
            { name: "Home", pathname: "/" },
            { name: "Terms of Service", pathname: "/terms" },
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
                <FileCheck2 className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                <span>Last updated: {LAST_UPDATED}</span>
              </span>
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-[-0.025em] text-[#0F172A] sm:text-5xl">
                Terms of Service
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-[#475569] text-pretty">
                These Terms of Service govern your access to and use of MedBay, including our web
                application, Progressive Web App, AI document summarization features, and expiring
                share links.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="clinical-prose space-y-12 text-[#0F172A]">
            <section className="space-y-4 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-6">
              <h2 className="font-heading text-xl font-semibold text-[#92400E]">
                1. Important Medical Disclaimer
              </h2>
              <p className="text-base leading-relaxed text-[#92400E]">
                MedBay is a personal document organization and clinical literacy tool. MedBay AI
                provides plain English explanations, biomarker highlights, and suggested clinician
                questions for informational purposes only and is not a substitute for professional
                medical advice, diagnosis, or treatment. Always consult a licensed physician or
                qualified healthcare provider regarding any medical condition, medication dosage, or
                emergency.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                2. Account eligibility &amp; managed family profiles
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                To create a MedBay account, you must be at least 18 years old (or the age of
                majority in your jurisdiction). By creating managed dependent profiles for children,
                spouses, or older relatives inside your vault, you represent that you have lawful
                parental authority, caregiving authorization, or explicit consent from those
                individuals to store and manage their medical records on their behalf.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                3. Ownership of your records &amp; license to operate
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                You retain full ownership of every document, image, and note you upload to MedBay.
                You grant MedBay a limited, revocable, non exclusive license solely to encrypt,
                store, run OCR and plain English summarization, generate profile isolated search
                embeddings, and stream documents to recipients you explicitly choose via share
                links.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                4. Expiring share links &amp; recipient responsibility
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                When you generate an expiring 24 hour, 7 day, or 30 day doctor share link, you are
                responsible for transmitting that URL only to intended clinicians or trusted
                recipients. MedBay automatically disables access upon expiration or manual
                revocation, but cannot control copies downloaded by a recipient while the link was
                active.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                5. Acceptable use &amp; security boundaries
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                You agree not to misuse MedBay, attempt to bypass authentication or Row Level
                Security isolation, upload malicious executables disguised as medical files, scrape
                public share endpoints, or use automated tools to exceed service rate limits.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                6. Third party integrations
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                Optional integrations with Google Calendar and read only Gmail scanning depend on
                your active Google account authorization. Your use of Google services remains
                subject to Google&apos;s own terms, and you may disconnect these scopes inside
                MedBay at any time.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                7. Service availability &amp; limitation of liability
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                While we engineer MedBay for high reliability and encrypted durability, MedBay is
                provided &ldquo;as is&rdquo; and should never serve as the sole archival copy of
                critical medical records required for emergency care. To the fullest extent permitted
                by law, MedBay is not liable for indirect, incidental, or consequential damages
                arising from reliance on informational AI summaries or temporary service outages.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                8. Updates &amp; contact information
              </h2>
              <p className="text-base leading-relaxed text-[#475569]">
                We may update these Terms of Service as MedBay evolves. Material changes will be
                noted with an updated effective date at the top of this page. For questions
                regarding these terms, please contact{" "}
                <a
                  href={`mailto:${SITE_BRAND.supportEmail}`}
                  className="font-semibold text-[#059669] hover:text-[#047857]"
                >
                  {SITE_BRAND.supportEmail}
                </a>{" "}
                or visit our{" "}
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
