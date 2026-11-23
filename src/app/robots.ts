import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

const PRIVATE_DISALLOW_PATHS = [
  "/dashboard",
  "/dashboard/",
  "/vault",
  "/vault/",
  "/chat",
  "/chat/",
  "/timeline",
  "/timeline/",
  "/profiles",
  "/profiles/",
  "/notifications",
  "/notifications/",
  "/login",
  "/auth/",
  "/api/",
  "/share/",
  "/*?*q=",
  "/*?*next=",
];

const PUBLIC_ALLOW_PATHS = [
  "/",
  "/about",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
  "/llms.txt",
  "/llms-full.txt",
];

export default function robots(): MetadataRoute.Robots {
  const aiAndSearchCrawlers = [
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: PUBLIC_ALLOW_PATHS,
        disallow: PRIVATE_DISALLOW_PATHS,
      },
      ...aiAndSearchCrawlers.map((userAgent) => ({
        userAgent,
        allow: PUBLIC_ALLOW_PATHS,
        disallow: PRIVATE_DISALLOW_PATHS,
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
