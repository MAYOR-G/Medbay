import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import {
  BlogCoverIllustration,
  JsonLd,
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing";
import { BLOG_ARTICLES, getBlogArticleBySlug } from "@/lib/marketing-content";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildPageMetadata,
} from "@/lib/seo";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);
  if (!article) {
    return { title: "Article Not Found" };
  }
  return buildPageMetadata({
    title: article.title,
    description: article.excerpt,
    pathname: `/blog/${article.slug}`,
    type: "article",
    imagePath: `/blog/${article.slug}/opengraph-image`,
    imageAlt: `${article.title} — MedBay Clinical Journal`,
    publishedTime: article.publishedIso,
    modifiedTime: article.updatedIso,
    authors: [article.author.name],
  });
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = BLOG_ARTICLES.filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#0F172A]">
      <JsonLd
        data={[
          buildArticleSchema(article),
          buildBreadcrumbSchema([
            { name: "Home", pathname: "/" },
            { name: "Clinical Journal", pathname: "/blog" },
            { name: article.title, pathname: `/blog/${article.slug}` },
          ]),
        ]}
      />
      <MarketingHeader />

      <main id="main-content" className="flex-1">
        {/* Article Header */}
        <article>
          <header className="bg-[#F5F5F0] py-14 sm:py-20">
            <div className="mx-auto max-w-4xl px-5 sm:px-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#065F46] hover:text-[#047857]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to Clinical Journal</span>
              </Link>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-semibold">
                <span className="rounded-md bg-[#ECFDF5] px-3 py-1 text-[#065F46]">
                  {article.category}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[#475569]">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{article.readTime}</span>
                </span>
                <time dateTime={article.publishedIso} className="font-medium text-[#475569]">
                  {article.publishedAt}
                </time>
              </div>

              <h1 className="mt-5 font-heading text-3xl leading-[1.12] font-semibold tracking-[-0.025em] text-[#0F172A] text-balance sm:text-5xl">
                {article.title}
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-[#475569] text-pretty">
                {article.excerpt}
              </p>

              <div className="mt-8 flex items-center gap-3 border-t border-[#DCE2DF] pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#064E3B] font-heading text-sm font-semibold text-white">
                  {article.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{article.author.name}</p>
                  <p className="text-xs text-[#475569]">{article.author.role}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Cover Illustration & Body */}
          <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
            <BlogCoverIllustration
              visual={article.coverVisual}
              className="aspect-video w-full rounded-2xl border border-[#DCE2DF]"
            />

            {/* Key Takeaways Box */}
            <aside className="mt-10 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-6 sm:p-8">
              <h2 className="font-heading text-lg font-semibold text-[#065F46]">
                Key clinical takeaways
              </h2>
              <ul className="mt-4 space-y-3 text-base text-[#0F172A]">
                {article.keyTakeaways.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0 text-[#059669]"
                      aria-hidden="true"
                    />
                    <span className="text-pretty">{point}</span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Article Sections */}
            <div className="clinical-prose mt-12 space-y-10 text-[#0F172A]">
              {article.sections.map((section) => (
                <section key={section.heading} className="space-y-4">
                  <h2 className="font-heading text-2xl font-semibold tracking-[-0.015em] text-[#0F172A]">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-relaxed text-[#475569] sm:text-lg text-pretty"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="space-y-3 rounded-xl bg-[#F8FAFC] p-5 text-base text-[#0F172A]">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="mt-1 h-4 w-4 shrink-0 text-[#059669]"
                            aria-hidden="true"
                          />
                          <span className="text-pretty">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {/* Informational Note */}
            <div className="mt-12 rounded-xl border border-[#DCE2DF] bg-[#F8FAFC] p-5 text-sm leading-relaxed text-[#475569]">
              This article is published for informational and patient literacy purposes only and
              does not constitute medical advice, diagnosis, or treatment. Always discuss lab
              results and medication changes with a qualified healthcare clinician.
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <section className="bg-[#F5F5F0] py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                Continue reading
              </h2>
              <Link
                href="/blog"
                className="text-sm font-semibold text-[#059669] hover:text-[#047857]"
              >
                All articles
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {relatedArticles.map((related) => (
                <article
                  key={related.slug}
                  className="flex flex-col justify-between rounded-2xl border border-[#DCE2DF] bg-white p-6"
                >
                  <div className="space-y-2.5">
                    <span className="inline-block rounded-md bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#065F46]">
                      {related.category}
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-[#0F172A] text-balance">
                      <Link href={`/blog/${related.slug}`} className="hover:text-[#059669]">
                        {related.title}
                      </Link>
                    </h3>
                    <p className="text-sm leading-relaxed text-[#475569]">{related.excerpt}</p>
                  </div>
                  <Link
                    href={`/blog/${related.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#059669]"
                  >
                    <span>Read article</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
