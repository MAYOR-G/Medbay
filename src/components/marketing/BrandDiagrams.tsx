import * as React from "react";
import type { BlogArticle } from "@/lib/marketing-content";

/**
 * Bespoke architectural SVG illustrations tailored strictly to MedBay's
 * Private Health Atelier palette (Clinical Emerald, Archival Stone, Deep Slate).
 */

export function FamilyIsolationDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Diagram showing one encrypted parent account isolating Self, Child, and Parent medical profiles with zero cross profile leakage"
      className={className}
    >
      <rect width="560" height="320" rx="14" fill="#F5F5F0" />

      {/* Master Encrypted Vault Header */}
      <rect x="28" y="24" width="504" height="58" rx="10" fill="#064E3B" />
      <rect x="44" y="40" width="26" height="26" rx="7" fill="#059669" />
      <path
        d="M57 46V60M50 53H64"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <text
        x="84"
        y="50"
        fill="#FFFFFF"
        fontFamily="Outfit, sans-serif"
        fontSize="14"
        fontWeight="600"
      >
        Primary Account Owner · AES 256 Private Vault
      </text>
      <text
        x="84"
        y="68"
        fill="#A7F3D0"
        fontFamily="Source Sans 3, sans-serif"
        fontSize="12"
      >
        Single Google sign in · PostgreSQL Row Level Security enforced
      </text>

      {/* Connector Rails */}
      <path d="M112 82V114M280 82V114M448 82V114" stroke="#059669" strokeWidth="2" />
      <circle cx="112" cy="114" r="4" fill="#059669" />
      <circle cx="280" cy="114" r="4" fill="#059669" />
      <circle cx="448" cy="114" r="4" fill="#059669" />

      {/* Lane 1: Self */}
      <rect x="28" y="124" width="160" height="168" rx="12" fill="#FFFFFF" stroke="#DCE2DF" />
      <rect x="42" y="140" width="56" height="22" rx="11" fill="#ECFDF5" stroke="#A7F3D0" />
      <text x="58" y="155" fill="#065F46" fontFamily="Source Sans 3, sans-serif" fontSize="11.5" fontWeight="600">
        Self
      </text>
      <text x="42" y="184" fill="#0F172A" fontFamily="Outfit, sans-serif" fontSize="14" fontWeight="600">
        Elena Vance
      </text>
      <rect x="42" y="198" width="132" height="32" rx="6" fill="#F8FAFC" />
      <text x="50" y="218" fill="#475569" fontFamily="Source Sans 3, sans-serif" fontSize="11">
        Metabolic Panel PDF
      </text>
      <rect x="42" y="240" width="132" height="36" rx="6" fill="#ECFDF5" />
      <text x="50" y="262" fill="#065F46" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
        RAG Scope: self_id
      </text>

      {/* Lane 2: Child */}
      <rect x="200" y="124" width="160" height="168" rx="12" fill="#FFFFFF" stroke="#DCE2DF" />
      <rect x="214" y="140" width="96" height="22" rx="11" fill="#FFFBEB" stroke="#FDE68A" />
      <text x="226" y="155" fill="#92400E" fontFamily="Source Sans 3, sans-serif" fontSize="11.5" fontWeight="600">
        Maya (Child)
      </text>
      <text x="214" y="184" fill="#0F172A" fontFamily="Outfit, sans-serif" fontSize="14" fontWeight="600">
        Maya Vance
      </text>
      <rect x="214" y="198" width="132" height="32" rx="6" fill="#F8FAFC" />
      <text x="222" y="218" fill="#475569" fontFamily="Source Sans 3, sans-serif" fontSize="11">
        Pediatric Asthma Plan
      </text>
      <rect x="214" y="240" width="132" height="36" rx="6" fill="#FFFBEB" />
      <text x="222" y="262" fill="#92400E" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
        RAG Scope: child_id
      </text>

      {/* Lane 3: Parent */}
      <rect x="372" y="124" width="160" height="168" rx="12" fill="#FFFFFF" stroke="#DCE2DF" />
      <rect x="386" y="140" width="104" height="22" rx="11" fill="#EFF6FF" stroke="#BFDBFE" />
      <text x="396" y="155" fill="#1D4ED8" fontFamily="Source Sans 3, sans-serif" fontSize="11.5" fontWeight="600">
        David (Parent)
      </text>
      <text x="386" y="184" fill="#0F172A" fontFamily="Outfit, sans-serif" fontSize="14" fontWeight="600">
        David Vance
      </text>
      <rect x="386" y="198" width="132" height="32" rx="6" fill="#F8FAFC" />
      <text x="394" y="218" fill="#475569" fontFamily="Source Sans 3, sans-serif" fontSize="11">
        Cardiology Echo PDF
      </text>
      <rect x="386" y="240" width="132" height="36" rx="6" fill="#EFF6FF" />
      <text x="394" y="262" fill="#1D4ED8" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
        RAG Scope: parent_id
      </text>
    </svg>
  );
}

export function ExpiringShareDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Diagram illustrating one click expiring share link streaming only the original medical PDF while hiding AI summaries and chat history"
      className={className}
    >
      <rect width="560" height="320" rx="14" fill="#0B1120" />

      {/* Left: Private Vault */}
      <rect x="28" y="34" width="212" height="252" rx="12" fill="#131F2E" stroke="#1E293B" />
      <text x="46" y="64" fill="#6EE7B7" fontFamily="Outfit, sans-serif" fontSize="13" fontWeight="600">
        Your Private Vault
      </text>
      <rect x="46" y="82" width="176" height="46" rx="8" fill="#059669" />
      <text x="58" y="102" fill="#FFFFFF" fontFamily="Outfit, sans-serif" fontSize="12.5" fontWeight="600">
        Original Lab Report PDF
      </text>
      <text x="58" y="118" fill="#D1FAE5" fontFamily="Source Sans 3, sans-serif" fontSize="11">
        Selected for 24h share
      </text>

      <rect x="46" y="142" width="176" height="44" rx="8" fill="#1E293B" />
      <text x="58" y="162" fill="#CBD5E1" fontFamily="Source Sans 3, sans-serif" fontSize="12">
        AI Summary &amp; Questions
      </text>
      <text x="58" y="177" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="10">
        NEVER EXPOSED
      </text>

      <rect x="46" y="198" width="176" height="44" rx="8" fill="#1E293B" />
      <text x="58" y="218" fill="#CBD5E1" fontFamily="Source Sans 3, sans-serif" fontSize="12">
        Other Family Profiles
      </text>
      <text x="58" y="233" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="10">
        NEVER EXPOSED
      </text>

      {/* Center Signed Stream Arrow */}
      <path d="M240 105H312" stroke="#10B981" strokeWidth="2.5" strokeDasharray="5 4" />
      <path d="M306 98L314 105L306 112" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="247" y="122" width="66" height="24" rx="6" fill="#064E3B" />
      <text x="256" y="138" fill="#A7F3D0" fontFamily="JetBrains Mono, monospace" fontSize="10.5">
        24h TTL
      </text>

      {/* Right: Visiting Doctor View */}
      <rect x="320" y="34" width="212" height="252" rx="12" fill="#FFFFFF" />
      <rect x="320" y="34" width="212" height="42" rx="12" fill="#ECFDF5" />
      <text x="338" y="60" fill="#065F46" fontFamily="Outfit, sans-serif" fontSize="13" fontWeight="600">
        Visiting Doctor View
      </text>
      <rect x="338" y="92" width="176" height="106" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
      <rect x="352" y="108" width="94" height="10" rx="3" fill="#0F172A" />
      <rect x="352" y="128" width="144" height="6" rx="3" fill="#CBD5E1" />
      <rect x="352" y="142" width="132" height="6" rx="3" fill="#CBD5E1" />
      <rect x="352" y="156" width="110" height="6" rx="3" fill="#CBD5E1" />
      <rect x="352" y="172" width="64" height="14" rx="4" fill="#ECFDF5" />
      <text x="360" y="182" fill="#065F46" fontFamily="JetBrains Mono, monospace" fontSize="9.5">
        RAW PDF
      </text>

      <rect x="338" y="216" width="176" height="48" rx="8" fill="#F5F5F0" />
      <text x="350" y="236" fill="#0F172A" fontFamily="Source Sans 3, sans-serif" fontSize="11.5" fontWeight="600">
        Zero login · Zero PIN
      </text>
      <text x="350" y="253" fill="#475569" fontFamily="Source Sans 3, sans-serif" fontSize="11">
        One tap revocation anytime
      </text>
    </svg>
  );
}

export function BlogCoverIllustration({
  visual,
  className,
}: {
  visual: BlogArticle["coverVisual"];
  className?: string;
}) {
  if (visual === "metabolic-panel") {
    return (
      <svg
        viewBox="0 0 640 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <rect width="640" height="360" fill="#ECFDF5" />
        <rect x="76" y="48" width="320" height="264" rx="14" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1.5" />
        <rect x="104" y="76" width="148" height="14" rx="4" fill="#064E3B" />
        <rect x="104" y="102" width="110" height="8" rx="4" fill="#94A3B8" />
        <rect x="104" y="132" width="264" height="40" rx="8" fill="#FFFBEB" stroke="#FDE68A" />
        <text x="120" y="157" fill="#92400E" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="600">
          HbA1c · 6.1% · Borderline
        </text>
        <rect x="104" y="186" width="264" height="36" rx="8" fill="#F8FAFC" />
        <text x="120" y="209" fill="#065F46" fontFamily="JetBrains Mono, monospace" fontSize="12.5">
          eGFR · 96 mL/min · Normal
        </text>
        <rect x="104" y="236" width="264" height="36" rx="8" fill="#F8FAFC" />
        <text x="120" y="259" fill="#065F46" fontFamily="JetBrains Mono, monospace" fontSize="12.5">
          ALT · 21 U/L · Normal
        </text>
        <rect x="356" y="120" width="212" height="168" rx="14" fill="#064E3B" />
        <text x="380" y="156" fill="#6EE7B7" fontFamily="Outfit, sans-serif" fontSize="14" fontWeight="600">
          Plain English Guide
        </text>
        <rect x="380" y="174" width="160" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="380" y="192" width="142" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.6" />
        <rect x="380" y="210" width="154" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.6" />
        <rect x="380" y="238" width="92" height="26" rx="6" fill="#059669" />
        <text x="394" y="255" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace" fontSize="11">
          WHO · NHS
        </text>
      </svg>
    );
  }

  if (visual === "family-isolation") {
    return (
      <svg
        viewBox="0 0 640 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <rect width="640" height="360" fill="#F5F5F0" />
        <rect x="64" y="64" width="156" height="232" rx="14" fill="#FFFFFF" stroke="#DCE2DF" strokeWidth="1.5" />
        <rect x="86" y="88" width="66" height="24" rx="12" fill="#ECFDF5" />
        <text x="106" y="104" fill="#065F46" fontFamily="Source Sans 3, sans-serif" fontSize="12" fontWeight="600">
          Self
        </text>
        <rect x="86" y="132" width="112" height="10" rx="4" fill="#0F172A" />
        <rect x="86" y="156" width="112" height="52" rx="8" fill="#F8FAFC" />
        <rect x="86" y="220" width="90" height="24" rx="6" fill="#059669" />

        <rect x="242" y="44" width="156" height="252" rx="14" fill="#064E3B" />
        <rect x="264" y="68" width="96" height="24" rx="12" fill="#059669" />
        <text x="278" y="84" fill="#FFFFFF" fontFamily="Source Sans 3, sans-serif" fontSize="12" fontWeight="600">
          Maya (Child)
        </text>
        <rect x="264" y="114" width="112" height="10" rx="4" fill="#FFFFFF" />
        <rect x="264" y="138" width="112" height="68" rx="8" fill="#047857" />
        <rect x="264" y="224" width="102" height="24" rx="6" fill="#6EE7B7" />

        <rect x="420" y="64" width="156" height="232" rx="14" fill="#FFFFFF" stroke="#DCE2DF" strokeWidth="1.5" />
        <rect x="442" y="88" width="96" height="24" rx="12" fill="#EFF6FF" />
        <text x="454" y="104" fill="#1D4ED8" fontFamily="Source Sans 3, sans-serif" fontSize="12" fontWeight="600">
          David (Parent)
        </text>
        <rect x="442" y="132" width="112" height="10" rx="4" fill="#0F172A" />
        <rect x="442" y="156" width="112" height="52" rx="8" fill="#F8FAFC" />
        <rect x="442" y="220" width="90" height="24" rx="6" fill="#1D4ED8" />
      </svg>
    );
  }

  if (visual === "expiring-share") {
    return (
      <svg
        viewBox="0 0 640 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        <rect width="640" height="360" fill="#0B1120" />
        <rect x="92" y="66" width="456" height="228" rx="16" fill="#131F2E" stroke="#1E293B" strokeWidth="1.5" />
        <rect x="124" y="98" width="160" height="28" rx="14" fill="#064E3B" />
        <text x="144" y="116" fill="#A7F3D0" fontFamily="JetBrains Mono, monospace" fontSize="12">
          24h EXPIRING LINK
        </text>
        <rect x="124" y="148" width="392" height="46" rx="10" fill="#0B1120" stroke="#059669" />
        <text x="144" y="176" fill="#6EE7B7" fontFamily="JetBrains Mono, monospace" fontSize="14">
          medbay.health/share/rv84-cmp-24h
        </text>
        <rect x="124" y="214" width="186" height="44" rx="10" fill="#059669" />
        <text x="150" y="241" fill="#FFFFFF" fontFamily="Outfit, sans-serif" fontSize="13.5" fontWeight="600">
          Raw Document Only
        </text>
        <rect x="328" y="214" width="188" height="44" rx="10" fill="#1E293B" />
        <text x="352" y="241" fill="#CBD5E1" fontFamily="Outfit, sans-serif" fontSize="13.5" fontWeight="600">
          Revoke in One Tap
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="640" height="360" fill="#F8FAFC" />
      <rect x="84" y="54" width="472" height="252" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="116" y="86" width="220" height="32" rx="8" fill="#ECFDF5" />
      <text x="132" y="107" fill="#065F46" fontFamily="JetBrains Mono, monospace" fontSize="12.5" fontWeight="600">
        Vault Source: Lab Report
      </text>
      <rect x="352" y="86" width="172" height="32" rx="8" fill="#EFF6FF" />
      <text x="372" y="107" fill="#1D4ED8" fontFamily="JetBrains Mono, monospace" fontSize="12.5" fontWeight="600">
        WHO · NHS · CDC
      </text>
      <rect x="116" y="142" width="408" height="12" rx="4" fill="#0F172A" />
      <rect x="116" y="168" width="370" height="10" rx="4" fill="#64748B" />
      <rect x="116" y="190" width="340" height="10" rx="4" fill="#64748B" />
      <rect x="116" y="226" width="286" height="46" rx="10" fill="#064E3B" />
      <text x="136" y="254" fill="#FFFFFF" fontFamily="Outfit, sans-serif" fontSize="13.5" fontWeight="600">
        Row Level Scoped Vector Retrieval
      </text>
    </svg>
  );
}
