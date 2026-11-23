"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import {
  BLOG_ARTICLES,
  type BlogCategory,
} from "@/lib/marketing-content";
import { BlogCoverIllustration } from "./BrandDiagrams";

const CATEGORIES: Array<"All" | BlogCategory> = [
  "All",
  "Clinical Literacy",
  "Family Care",
  "Privacy & Security",
  "Product Guide",
];

export function BlogGridClient() {
  const [selectedCategory, setSelectedCategory] = React.useState<"All" | BlogCategory>("All");

  const filteredArticles =
    selectedCategory === "All"
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((article) => article.category === selectedCategory);

  return (
    <div className="space-y-10">
      {/* Category Filter Pills */}
      <div
        role="tablist"
        aria-label="Filter articles by category"
        className="flex flex-wrap items-center gap-2"
      >
        {CATEGORIES.map((category) => {
          const active = category === selectedCategory;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedCategory(category)}
              className={`min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-colors duration-300 ${
                active
                  ? "border-[#064E3B] bg-[#064E3B] text-white"
                  : "border-[#DCE2DF] bg-white text-[#475569] hover:border-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Article Cards Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <article
            key={article.slug}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#DCE2DF] bg-white transition-colors duration-300 hover:border-[#059669]"
          >
            <Link href={`/blog/${article.slug}`} className="block overflow-hidden bg-[#F5F5F0]">
              <BlogCoverIllustration
                visual={article.coverVisual}
                className="aspect-video w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
            </Link>

            <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#065F46]">
                  <span className="rounded-md bg-[#ECFDF5] px-2.5 py-1">
                    {article.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#64748B]">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{article.readTime}</span>
                  </span>
                  <span className="font-medium text-[#64748B]">{article.publishedAt}</span>
                </div>

                <h2 className="font-heading text-xl leading-snug font-semibold text-[#0F172A] transition-colors duration-300 group-hover:text-[#059669] sm:text-2xl text-balance">
                  <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                </h2>

                <p className="text-base leading-relaxed text-[#475569] text-pretty">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{article.author.name}</p>
                  <p className="text-xs text-[#64748B]">{article.author.role}</p>
                </div>
                <Link
                  href={`/blog/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#059669] transition-colors duration-300 hover:text-[#047857]"
                >
                  <span>Read article</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
