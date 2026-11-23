import type { MetadataRoute } from "next";
import { BLOG_ARTICLES } from "@/lib/marketing-content";
import { absoluteUrl } from "@/lib/seo";

const SITE_LAST_MODIFIED = new Date("2026-11-23T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = BLOG_ARTICLES.map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}`),
    lastModified: new Date(article.updatedIso),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticPages, ...blogEntries];
}
