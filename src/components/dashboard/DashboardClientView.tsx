"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FilePlus2,
  FileText,
  FolderLock,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, EmptyStateIllustration, ProfileBadge, cn } from "@/components/ui";
import type { TimelineGroupDto } from "@/server/services";
import { useVaultStore } from "@/stores/use-vault-store";
import type {
  DocumentCategory,
  FamilyProfileDto,
  MedicalDocumentSummaryDto,
  UserAccountDto,
} from "@/types/domain.types";

export interface DashboardClientViewProps {
  user: UserAccountDto;
  profiles: FamilyProfileDto[];
  recentDocuments: MedicalDocumentSummaryDto[];
  totalDocumentsCount: number;
  timelineGroups: TimelineGroupDto[];
  totalEventsCount: number;
  activeProfileFilter: string;
}

const IN_PROGRESS_STATUSES = new Set(["queued", "extracting", "summarizing", "indexing"]);

const CATEGORY_SEGMENT_SHADES = [
  "bg-[#059669]",
  "bg-[#1D4ED8]",
  "bg-[#047857]",
  "bg-[#475569]",
  "bg-[#94A3B8]",
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFormatShortLabel(mimeType: string): string {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "IMG";
  if (mimeType.includes("wordprocessingml")) return "DOCX";
  return "TXT";
}

function getStatusDisplay(status: MedicalDocumentSummaryDto["ingestionStatus"]) {
  if (status === "ready") {
    return {
      label: "Ready",
      badgeClass: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
      dotClass: "bg-[#059669]",
      spinning: false,
    };
  }
  if (status === "failed") {
    return {
      label: "Failed",
      badgeClass: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
      dotClass: "bg-[#991B1B]",
      spinning: false,
    };
  }
  const label =
    status === "extracting"
      ? "Reading"
      : status === "summarizing"
        ? "Summarizing"
        : status === "indexing"
          ? "Indexing"
          : "Queued";
  return {
    label,
    badgeClass: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
    dotClass: "bg-[#059669]",
    spinning: true,
  };
}

export function DashboardClientView({
  user,
  profiles,
  recentDocuments,
  totalDocumentsCount,
  timelineGroups,
  totalEventsCount,
  activeProfileFilter,
}: DashboardClientViewProps) {
  const setUploadSheetOpen = useVaultStore((state) => state.setUploadSheetOpen);
  const setChatOpen = useVaultStore((state) => state.setChatOpen);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const selectedProfile =
    activeProfileFilter !== "all" ? profileMap.get(activeProfileFilter) : undefined;

  const readyDocsCount = recentDocuments.filter((doc) => doc.ingestionStatus === "ready").length;
  const processingDocsCount = recentDocuments.filter((doc) =>
    IN_PROGRESS_STATUSES.has(doc.ingestionStatus),
  ).length;
  const needsReviewCount = recentDocuments.filter(
    (doc) => doc.profileMatchConfidence === "needs_review",
  ).length;

  // Build category distribution from loaded documents (sorted descending by count)
  const categoryCountsMap = new Map<DocumentCategory, number>();
  for (const doc of recentDocuments) {
    categoryCountsMap.set(doc.category, (categoryCountsMap.get(doc.category) ?? 0) + 1);
  }
  const categoryBreakdown = Array.from(categoryCountsMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const flatHistoryEvents = timelineGroups.flatMap((group) => group.events).slice(0, 7);
  const dependentCount = Math.max(0, profiles.length - 1);
  const ledgerDocs = recentDocuments.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-[#0F172A]">
            {selectedProfile
              ? `${selectedProfile.isPrimary ? "Self" : selectedProfile.fullName} — Clinical Dashboard`
              : "Clinical Dashboard"}
          </h1>
          <p className="mt-1.5 text-[15px] text-[#475569]">
            {selectedProfile
              ? `Filtered records, AI reports, and activity for ${selectedProfile.fullName}`
              : "Overview of uploaded medical files, AI clinical reports, and household history"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setChatOpen(true)}>
            <Sparkles className="h-[18px] w-[18px] shrink-0 text-[#059669]" strokeWidth={1.75} aria-hidden="true" />
            <span>Ask MedBay AI</span>
          </Button>
          <Button variant="primary" onClick={() => setUploadSheetOpen(true)}>
            <FilePlus2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Upload Document</span>
          </Button>
        </div>
      </div>

      {/* 4-Card KPI Stat Row */}
      <section
        aria-label="Vault overview metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[#475569]">Total Uploaded Files</p>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
              <FolderLock className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-heading text-[32px] leading-none font-bold text-[#0F172A] tabular-nums">
            {totalDocumentsCount}
          </p>
          <p className="mt-2 text-[13px] text-[#64748B] tabular-nums">
            {processingDocsCount > 0
              ? `${processingDocsCount} processing now`
              : totalDocumentsCount === 0
                ? "Ready for first upload"
                : "Encrypted in family vault"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[#475569]">Family Members</p>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
              <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-heading text-[32px] leading-none font-bold text-[#0F172A] tabular-nums">
            {profiles.length}
          </p>
          <p className="mt-2 text-[13px] text-[#64748B] tabular-nums">
            1 primary · {dependentCount} {dependentCount === 1 ? "dependent" : "dependents"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[#475569]">AI Summaries Ready</p>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
              <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-heading text-[32px] leading-none font-bold text-[#059669] tabular-nums">
            {readyDocsCount}
          </p>
          <p className="mt-2 text-[13px] text-[#64748B] tabular-nums">
            {needsReviewCount > 0
              ? `${needsReviewCount} patient match to verify`
              : "Biomarkers & guidelines indexed"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[#475569]">History Events</p>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]">
              <Clock className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-heading text-[32px] leading-none font-bold text-[#0F172A] tabular-nums">
            {totalEventsCount}
          </p>
          <p className="mt-2 text-[13px] text-[#64748B]">Uploads, shares &amp; appointments</p>
        </div>
      </section>

      {/* Main 8/4 Asymmetric Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Category Distribution + Recent Documents Ledger */}
        <div className="space-y-6 lg:col-span-8">
          {/* Category Breakdown Bar */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)] md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                Records by Category
              </h2>
              <span className="font-mono text-xs text-[#64748B] tabular-nums">
                {recentDocuments.length} recent sampled
              </span>
            </div>

            {categoryBreakdown.length === 0 ? (
              <p className="mt-3 text-[15px] text-[#475569]">
                Category distribution will appear once you upload lab reports, prescriptions, or
                imaging scans.
              </p>
            ) : (
              <div className="mt-4 space-y-3.5">
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#F8FAFC]">
                  {categoryBreakdown.map((item, idx) => {
                    const percent = Math.max(
                      6,
                      Math.round((item.count / Math.max(1, recentDocuments.length)) * 100),
                    );
                    const shadeClass =
                      CATEGORY_SEGMENT_SHADES[idx % CATEGORY_SEGMENT_SHADES.length] ??
                      "bg-[#CBD5E1]";
                    return (
                      <div
                        key={item.category}
                        style={{ width: `${percent}%` }}
                        className={cn("h-full border-r border-white last:border-r-0", shadeClass)}
                        title={`${item.category}: ${item.count}`}
                      />
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {categoryBreakdown.map((item, idx) => {
                    const shadeClass =
                      CATEGORY_SEGMENT_SHADES[idx % CATEGORY_SEGMENT_SHADES.length] ??
                      "bg-[#CBD5E1]";
                    return (
                      <Link
                        key={item.category}
                        href={`/vault?category=${encodeURIComponent(item.category)}`}
                        className="inline-flex h-9 flex-row items-center gap-2 whitespace-nowrap rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[13px] font-medium text-[#0F172A] transition-colors hover:border-[#CBD5E1] hover:bg-white"
                      >
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", shadeClass)} />
                        <span>{item.category}</span>
                        <span className="font-mono text-xs text-[#64748B] tabular-nums">
                          {item.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Recent Uploaded Documents Ledger */}
          <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 md:px-6">
              <div>
                <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                  Recent Medical Records
                </h2>
                <p className="mt-0.5 text-[13px] text-[#64748B]">
                  Select any document to open its original viewer and AI clinical report
                </p>
              </div>
              <Link
                href="/vault"
                className="inline-flex h-10 flex-row items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 text-[14px] font-semibold text-[#059669] transition-colors hover:bg-[#ECFDF5]"
              >
                <span>Open Vault</span>
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>

            {ledgerDocs.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <EmptyStateIllustration variant="vault" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-[#0F172A]">
                  No documents uploaded yet
                </h3>
                <p className="mt-1.5 max-w-md text-[15px] text-[#475569]">
                  Upload a lab result, prescription, or discharge letter to extract plain-English
                  clinical summaries automatically.
                </p>
                <div className="mt-6">
                  <Button variant="primary" onClick={() => setUploadSheetOpen(true)}>
                    <FilePlus2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span>Upload First Document</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="hidden border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-2.5 text-[12px] font-semibold text-[#64748B] md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto] md:gap-4">
                  <span>Document</span>
                  <span>Patient</span>
                  <span>Category</span>
                  <span>Date &amp; Size</span>
                  <span className="text-right">Status</span>
                </div>

                <div className="divide-y divide-[#E2E8F0]">
                  {ledgerDocs.map((doc) => {
                    const profile = profileMap.get(doc.profileId);
                    const statusInfo = getStatusDisplay(doc.ingestionStatus);
                    const displayDate = doc.documentDate ?? doc.createdAt.slice(0, 10);
                    return (
                      <Link
                        key={doc.id}
                        href={`/vault/${doc.id}`}
                        className="flex flex-col gap-2 px-5 py-3.5 transition-colors duration-150 hover:bg-[#F8FAFC] md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto] md:items-center md:gap-4 md:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-[10px] font-semibold text-[#475569]">
                            {getFormatShortLabel(doc.mimeType)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold text-[#0F172A]">
                              {doc.title}
                            </p>
                            <p className="truncate font-mono text-[11px] text-[#64748B]">
                              {doc.originalFilename}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ProfileBadge
                            name={
                              profile ? (profile.isPrimary ? "Self" : profile.fullName) : "Family"
                            }
                            colorIndex={profile?.colorIndex ?? 0}
                          />
                        </div>

                        <span className="truncate text-[14px] text-[#475569]">
                          {doc.category}
                        </span>

                        <span className="font-mono text-xs text-[#64748B] tabular-nums">
                          {displayDate} · {formatBytes(doc.fileSizeBytes)}
                        </span>

                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={cn(
                              "inline-flex flex-row items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-2.5 py-0.5 font-mono text-xs font-medium",
                              statusInfo.badgeClass,
                            )}
                          >
                            {statusInfo.spinning ? (
                              <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden="true" />
                            ) : (
                              <span
                                className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusInfo.dotClass)}
                                aria-hidden="true"
                              />
                            )}
                            <span>{statusInfo.label}</span>
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right 4 Cols: Recent History & Family Roster */}
        <div className="space-y-6 lg:col-span-4">
          {/* Chronological History Feed */}
          <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-[18px] w-[18px] text-[#059669]" strokeWidth={1.75} aria-hidden="true" />
                <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                  Recent History
                </h2>
              </div>
              <Link
                href="/timeline"
                className="text-[14px] font-semibold text-[#059669] hover:underline"
              >
                View all
              </Link>
            </div>

            {flatHistoryEvents.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <EmptyStateIllustration variant="timeline" className="h-24 w-24" />
                <p className="mt-3 text-[15px] font-semibold text-[#0F172A]">No recent activity</p>
                <p className="mt-1 text-[14px] text-[#475569]">
                  Uploads, AI analyses, share links, and appointments will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {flatHistoryEvents.map((event) => {
                  const eventProfile = event.profileId
                    ? profileMap.get(event.profileId)
                    : undefined;
                  return (
                    <li key={event.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] leading-snug font-medium text-[#0F172A]">
                          {event.description}
                        </p>
                        <span className="shrink-0 font-mono text-[11px] text-[#64748B] tabular-nums">
                          {event.createdAt.slice(5, 10)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-[12px] text-[#64748B]">
                        <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                        <span>
                          {eventProfile
                            ? eventProfile.isPrimary
                              ? "Self"
                              : eventProfile.fullName
                            : "Household"}
                        </span>
                        {event.documentId && (
                          <>
                            <span>·</span>
                            <Link
                              href={`/vault/${event.documentId}`}
                              className="font-semibold text-[#059669] hover:underline"
                            >
                              Open record
                            </Link>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Household Roster & Google Sync Status */}
          <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-[18px] w-[18px] text-[#059669]" strokeWidth={1.75} aria-hidden="true" />
                <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                  Family Profiles
                </h2>
              </div>
              <Link
                href="/profiles"
                className="text-[14px] font-semibold text-[#059669] hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {profiles.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/vault?profileId=${profile.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-[#0F172A]">
                      {profile.isPrimary ? `${profile.fullName} (Self)` : profile.fullName}
                    </p>
                    <p className="text-[13px] text-[#64748B]">{profile.relationship}</p>
                  </div>
                  <ProfileBadge
                    name={profile.isPrimary ? "Primary" : profile.relationship}
                    colorIndex={profile.colorIndex}
                  />
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 text-[13px]">
              <span className="inline-flex flex-row items-center gap-2 font-medium text-[#475569]">
                <CheckCircle2
                  className={cn(
                    "h-4 w-4 shrink-0",
                    user.googleScopesValid ? "text-[#059669]" : "text-[#92400E]",
                  )}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>
                  {user.googleScopesValid
                    ? "Google Calendar & Gmail connected"
                    : "Google sync needs reconnect"}
                </span>
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
