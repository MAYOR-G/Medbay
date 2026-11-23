import { ImageResponse } from "next/og";

export const alt =
  "MedBay — Encrypted Family Medical Vault & Plain-English Clinical AI Hub";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#064E3B",
          color: "#FFFFFF",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Row: Brand Mark & Domain */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 3L41 9.4V23.2C41 33.7 33.5 41.4 24 44.8C14.5 41.4 7 33.7 7 23.2V9.4L24 3Z"
                fill="#10B981"
              />
              <path
                d="M24 7.4L36.6 12.1V22.4C36.6 25.1 35.8 27.6 34.4 29.8L24 26.2L13.6 29.8C12.2 27.6 11.4 25.1 11.4 22.4V12.1L24 7.4Z"
                fill="#047857"
              />
              <path
                d="M22.2 12.4C22.2 11.85 22.65 11.4 23.2 11.4H24.8C25.35 11.4 25.8 11.85 25.8 12.4V16.4H29.8C30.35 16.4 30.8 16.85 30.8 17.4V19C30.8 19.55 30.35 20 29.8 20H25.8V24C25.8 24.55 25.35 25 24.8 25H23.2C22.65 25 22.2 24.55 22.2 24V20H18.2C17.65 20 17.2 19.55 17.2 19V17.4C17.2 16.85 17.65 16.4 18.2 16.4H22.2V12.4Z"
                fill="#FFFFFF"
              />
              <path
                d="M11.6 26.2C16.2 26.2 20.5 27.6 23.5 30.2V39.2C20.2 36.8 16.1 35.4 11.6 35.1V26.2Z"
                fill="#FFFFFF"
              />
              <path
                d="M36.4 26.2C31.8 26.2 27.5 27.6 24.5 30.2V39.2C27.8 36.8 31.9 35.4 36.4 35.1V26.2Z"
                fill="#D1FAE5"
              />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
                MedBay
              </span>
              <span style={{ fontSize: 16, color: "#A7F3D0" }}>Medical AI & Document Hub</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#047857",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: 18,
              fontWeight: 600,
              color: "#ECFDF5",
            }}
          >
            www.medbayhealth.xyz
          </div>
        </div>

        {/* Main Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "960px" }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            Your family&apos;s medical records, understood and ready anywhere.
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.4, color: "#D1FAE5" }}>
            Encrypted lab storage, plain-English AI summaries backed by WHO &amp; NHS citations,
            and one-click expiring doctor links.
          </div>
        </div>

        {/* Trust Footer Strip */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {[
            "AES-256 Encrypted Vault",
            "Up to 5 Family Profiles",
            "WHO · NHS · CDC Grounded",
            "24h Expiring Doctor Links",
          ].map((pill) => (
            <div
              key={pill}
              style={{
                display: "flex",
                backgroundColor: "#047857",
                color: "#ECFDF5",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
