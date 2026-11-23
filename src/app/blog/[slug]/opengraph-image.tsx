import { ImageResponse } from "next/og";
import { getBlogArticleBySlug } from "@/lib/marketing-content";

export const alt = "MedBay Clinical Journal Article";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function BlogArticleOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  const title = article?.title ?? "MedBay Clinical Journal";
  const category = article?.category ?? "Clinical Literacy";
  const authorLine = article
    ? `${article.author.name} · ${article.author.role} · ${article.readTime}`
    : "MedBay Family Health Archive";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F2F6F4",
          color: "#0F172A",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "#064E3B",
              color: "#FFFFFF",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            MedBay Clinical Journal
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#ECFDF5",
              color: "#065F46",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
              color: "#0F172A",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 24, color: "#334155", lineHeight: 1.4 }}>{authorLine}</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            fontWeight: 600,
            color: "#047857",
          }}
        >
          <span>Encrypted Family Medical Vault</span>
          <span>www.medbayhealth.xyz/blog</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
