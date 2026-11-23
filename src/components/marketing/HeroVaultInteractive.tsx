"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DEMO_VAULT_PROFILES, type DemoVaultProfile } from "@/lib/marketing-content";

/**
 * Interactive Family Vault Live Preview (Hero Focal Object).
 * Allows visitors to switch family profiles, toggle between AI Clinical Summary
 * and Original Lab Sheet views, and inspect a zero-login 24h doctor share link.
 */
export function HeroVaultInteractive() {
  const [selectedId, setSelectedId] = React.useState<DemoVaultProfile["id"]>("self");
  const [activeTab, setActiveTab] = React.useState<"summary" | "original">("summary");
  const [sharePreviewOpen, setSharePreviewOpen] = React.useState(false);

  const activeProfile =
    DEMO_VAULT_PROFILES.find((item) => item.id === selectedId) ?? DEMO_VAULT_PROFILES[0];

  function handleProfileChange(id: DemoVaultProfile["id"]) {
    setSelectedId(id);
    setSharePreviewOpen(false);
  }

  return (
    <div
      data-ui="true"
      className="medbay-shutter rounded-2xl border border-[#DCE2DF] bg-[#F5F5F0] p-4 sm:p-6"
    >
      {/* Top Vault Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" aria-hidden="true" />
          <span className="font-heading text-sm font-semibold text-[#0F172A]">
            Family Clinical Vault
          </span>
          <span className="rounded-md bg-[#E6F0EC] px-2 py-0.5 text-xs font-medium text-[#065F46]">
            AES 256
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSharePreviewOpen((prev) => !prev)}
          aria-pressed={sharePreviewOpen}
          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-300 ${
            sharePreviewOpen
              ? "border-[#064E3B] bg-[#064E3B] text-white"
              : "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5]"
          }`}
        >
          <Share2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{sharePreviewOpen ? "Viewing Doctor Link" : "Preview Doctor Link"}</span>
        </button>
      </div>

      {/* Interactive Family Profile Switcher */}
      <div
        role="tablist"
        aria-label="Switch demo family profile"
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        {DEMO_VAULT_PROFILES.map((profile) => {
          const isSelected = profile.id === activeProfile.id;
          return (
            <button
              key={profile.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleProfileChange(profile.id)}
              className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${
                isSelected
                  ? "border-[#059669] bg-[#059669] text-white"
                  : "border-[#DCE2DF] bg-white text-[#475569] hover:border-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              <span>{profile.label}</span>
            </button>
          );
        })}
      </div>

      {/* Share Link Preview Banner */}
      {sharePreviewOpen ? (
        <div className="space-y-4 rounded-xl bg-[#0B1120] p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#6EE7B7]" aria-hidden="true" />
              <span className="font-heading text-sm font-semibold">
                Isolated Doctor Share View
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs text-[#A7F3D0] tabular-nums">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{activeProfile.shareExpiryLabel}</span>
            </span>
          </div>

          <div className="rounded-lg bg-white p-4 text-[#0F172A]">
            <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div>
                <p className="font-heading text-sm font-semibold text-[#0F172A]">
                  {activeProfile.documentTitle}
                </p>
                <p className="mt-0.5 text-xs text-[#475569]">
                  {activeProfile.facility} · {activeProfile.date}
                </p>
              </div>
              <span className="rounded bg-[#F8FAFC] px-2 py-0.5 font-mono text-xs text-[#475569]">
                {activeProfile.fileSize}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {activeProfile.biomarkers.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between text-xs tabular-nums"
                >
                  <span className="font-medium text-[#0F172A]">{row.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-[#0F172A]">{row.value}</span>
                    <span className="hidden text-[#64748B] sm:inline">{row.range}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#CBD5E1]">
            <span className="font-mono text-[#6EE7B7]">{activeProfile.shareTokenPreview}</span>
            <span>Zero recipient login · AI chat &amp; other profiles hidden</span>
          </div>
        </div>
      ) : (
        /* Active Document Sheet Card */
        <div className="space-y-4 rounded-xl border border-[#DCE2DF] bg-white p-4 sm:p-5">
          {/* Header Row */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
                <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-base font-semibold text-[#0F172A]">
                  {activeProfile.documentTitle}
                </h2>
                <p className="mt-0.5 text-xs text-[#475569] tabular-nums">
                  {activeProfile.patientName} ({activeProfile.relation}) · {activeProfile.date}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#065F46]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#059669]" aria-hidden="true" />
              <span>Ready</span>
            </span>
          </div>

          {/* Segmented View Toggle (AI Summary vs Original Biomarkers) */}
          <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors duration-300 ${
                activeTab === "summary"
                  ? "bg-white text-[#0F172A]"
                  : "text-[#475569] hover:text-[#0F172A]"
              }`}
            >
              AI Clinical Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("original")}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors duration-300 ${
                activeTab === "original"
                  ? "bg-white text-[#0F172A]"
                  : "text-[#475569] hover:text-[#0F172A]"
              }`}
            >
              Extracted Lab Values
            </button>
          </div>

          {activeTab === "summary" ? (
            <div className="space-y-4 rounded-xl bg-[#F8FAFC] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A]">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                  <span>Plain English Summary</span>
                </span>
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                    activeProfile.flagLevel === "Attention"
                      ? "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
                      : "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]"
                  }`}
                >
                  {activeProfile.flagLabel}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-[#0F172A] text-pretty">
                {activeProfile.overview}
              </p>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#065F46]">
                  Questions to ask your doctor
                </p>
                <ol className="list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-[#475569]">
                  {activeProfile.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  {activeProfile.citations.map((citation) => (
                    <a
                      key={citation.label}
                      href={citation.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#1D4ED8] transition-colors duration-300 hover:bg-[#DBEAFE]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{citation.label}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#475569]">
                  <Lock className="h-3 w-3 shrink-0 text-[#059669]" aria-hidden="true" />
                  <span>Profile isolated RAG</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#475569]">
                  <tr>
                    <th className="px-3.5 py-2.5 font-semibold">Biomarker</th>
                    <th className="px-3.5 py-2.5 font-semibold">Result</th>
                    <th className="hidden px-3.5 py-2.5 font-semibold sm:table-cell">Reference</th>
                    <th className="px-3.5 py-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white tabular-nums">
                  {activeProfile.biomarkers.map((row) => (
                    <tr key={row.name}>
                      <td className="px-3.5 py-2.5 font-medium text-[#0F172A]">{row.name}</td>
                      <td className="px-3.5 py-2.5 font-mono font-semibold text-[#0F172A]">
                        {row.value}
                      </td>
                      <td className="hidden px-3.5 py-2.5 text-[#475569] sm:table-cell">
                        {row.range}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${
                            row.status === "Attention"
                              ? "bg-[#FFFBEB] text-[#92400E]"
                              : "bg-[#ECFDF5] text-[#065F46]"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
