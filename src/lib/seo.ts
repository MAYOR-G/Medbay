import type { Metadata } from "next";
import type { BlogArticle, FaqItem } from "@/lib/marketing-content";

const DEFAULT_PRODUCTION_URL = "https://www.medbayhealth.xyz";

/**
 * Returns the normalized canonical site origin without a trailing slash.
 * Defaults to the production domain https://www.medbayhealth.xyz when unset or localhost.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) {
    return DEFAULT_PRODUCTION_URL;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return DEFAULT_PRODUCTION_URL;
    }
    return parsed.origin.replace(/\/+$/, "");
  } catch {
    return DEFAULT_PRODUCTION_URL;
  }
}

/**
 * Builds a deterministic, trailing-slash-free canonical URL for a public route.
 */
export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  if (!pathname || pathname === "/") {
    return base;
  }
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${normalized.replace(/\/+$/, "")}`;
}

export const SITE_BRAND = {
  name: "MedBay",
  legalName: "MedBay Health",
  tagline: "Encrypted Family Medical Vault & Clinical AI Hub",
  description:
    "Store encrypted family medical records, read plain-English AI summaries backed by WHO, NHS, and CDC citations, and share originals with doctors in one click.",
  locale: "en_US",
  themeColor: "#047857",
  supportEmail: "support@medbayhealth.xyz",
  privacyEmail: "privacy@medbayhealth.xyz",
  githubUrl: "https://github.com/MAYOR-G/Medbay",
  logoPath: "/brand/medbay-logo.svg",
  markPath: "/brand/medbay-mark.svg",
  ogImagePath: "/opengraph-image",
} as const;

export const INDEXABLE_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export const PRIVATE_NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export interface PageMetadataOptions {
  title: string;
  description: string;
  pathname: string;
  type?: "website" | "article";
  imagePath?: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
}

export function buildPageMetadata({
  title,
  description,
  pathname,
  type = "website",
  imagePath = SITE_BRAND.ogImagePath,
  imageAlt = "MedBay — Encrypted Family Medical Vault & Plain-English Clinical AI Hub",
  publishedTime,
  modifiedTime,
  authors,
  keywords,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = absoluteUrl(pathname);
  const ogImageUrl = absoluteUrl(imagePath);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: INDEXABLE_ROBOTS,
    openGraph: {
      type,
      url: canonicalUrl,
      siteName: SITE_BRAND.name,
      locale: SITE_BRAND.locale,
      title,
      description,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
      ...(type === "article" && authors ? { authors } : {}),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export function buildOrganizationSchema(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_BRAND.name,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE_BRAND.logoPath),
    },
    description: SITE_BRAND.description,
    sameAs: [SITE_BRAND.githubUrl],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SITE_BRAND.supportEmail,
        url: absoluteUrl("/contact"),
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "privacy and security",
        email: SITE_BRAND.privacyEmail,
        url: absoluteUrl("/privacy"),
        availableLanguage: ["English"],
      },
    ],
  };
}

export function buildWebSiteSchema(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_BRAND.name,
    url: siteUrl,
    description: SITE_BRAND.description,
    inLanguage: "en-US",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };
}

export function buildWebApplicationSchema(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${siteUrl}/#application`,
    name: SITE_BRAND.name,
    url: siteUrl,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS PWA, Android PWA",
    browserRequirements: "Requires a modern browser with JavaScript enabled",
    description: SITE_BRAND.description,
    screenshot: absoluteUrl(SITE_BRAND.ogImagePath),
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "AES-256 encrypted family medical document storage",
      "Up to five managed dependent profiles with PostgreSQL Row-Level Security isolation",
      "Plain-English AI clinical summaries with WHO, NHS, and CDC citations",
      "Profile-isolated clinical RAG chat and Google Calendar follow-up booking",
      "One-click expiring 24h, 7d, or 30d zero-login doctor share links",
      "24-hour read-only Gmail medical notification scanner with Web Push alerts",
    ],
  };
}

export function buildFaqSchema(items: readonly FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  pathname: string;
}

export function buildBreadcrumbSchema(items: readonly BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.pathname),
    })),
  };
}

export function buildArticleSchema(article: BlogArticle): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const articleUrl = absoluteUrl(`/blog/${article.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    headline: article.title,
    description: article.excerpt,
    articleSection: article.category,
    inLanguage: "en-US",
    datePublished: article.publishedIso,
    dateModified: article.updatedIso,
    image: [absoluteUrl(`/blog/${article.slug}/opengraph-image`)],
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: SITE_BRAND.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE_BRAND.logoPath),
      },
    },
  };
}
