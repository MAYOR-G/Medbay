import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  BlogGridClient,
  JsonLd,
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildPageMetadata,
  getSiteUrl,
  SITE_BRAND,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Clinical Journal — Family Health & Privacy Guides",
  description:
    "Read plain-English clinical guides from MedBay on metabolic blood panels, multi-generational family record management, and zero-trust doctor share links.",
  pathname: "/blog",
});

export default function BlogPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "MedBay Clinical Journal",
    url: absoluteUrl("/blog"),
    description:
      "Plain-English guides on laboratory literacy, family caregiving, and medical document privacy.",
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
      "@type": "Organization",
      name: SITE_BRAND.name,
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#0F172A]">
      <JsonLd
        data={[
          blogSchema,
          buildBreadcrumbSchema([
            { name: "Home", pathname: "/" },
            { name: "Clinical Journal", pathname: "/blog" },
          ]),
        ]}
      />
      <MarketingHeader />

      <main id="main-content" className="flex-1">
        <section className="bg-[#F5F5F0] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#065F46] hover:text-[#047857]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>

            <div className="mt-8 max-w-3xl space-y-4">
              <h1 className="font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-[#0F172A] text-balance sm:text-5xl">
                The MedBay Clinical Journal
              </h1>
              <p className="text-lg leading-relaxed text-[#475569] text-pretty">
                Thoughtful, plain English writing on laboratory literacy, family caregiving, and
                zero trust health privacy—written for patients and parents rather than hospital IT
                committees.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <BlogGridClient />
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-8 sm:p-10 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                Upload your next lab report and read it in plain English
              </h2>
              <p className="text-base text-[#065F46]">
                Every MedBay summary includes flagged biomarker explanations and verified WHO, NHS,
                and CDC citations.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-[10px] bg-[#059669] px-6 text-base font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#047857] lg:self-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
