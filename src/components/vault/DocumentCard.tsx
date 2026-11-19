"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { ProfileBadge, cn } from "@/components/ui";
import type { FamilyProfileDto, MedicalDocumentSummaryDto } from "@/types/domain.types";

export interface DocumentCardProps {
  document: MedicalDocumentSummaryDto;
  profile: FamilyProfileDto | undefined;
}

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

function LedgerStatusCell({ status }: { status: MedicalDocumentSummaryDto["ingestionStatus"] }) {
  if (status === "ready") {
    return (
      <span className="inline-flex flex-row items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 font-mono text-xs font-medium text-[#065F46]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#059669]" aria-hidden="true" />
        <span>Ready</span>
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex flex-row items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-0.5 font-mono text-xs font-medium text-[#991B1B]">
        <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span>Failed</span>
      </span>
    );
  }

  const label =
    status === "extracting"
      ? "Reading"
      : status === "summarizing"
        ? "Summarizing"
        : status === "indexing"
          ? "Indexing"
          : "Queued";

  return (
    <span className="inline-flex flex-row items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 font-mono text-xs font-medium text-[#065F46]">
      <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function DocumentCard({ document, profile }: DocumentCardProps) {
  const displayDate = document.documentDate ?? document.createdAt.slice(0, 10);
  const formatLabel = getFormatShortLabel(document.mimeType);

  return (
    <Link
      href={`/vault/${document.id}`}
      className={cn(
        "group flex flex-col gap-3 px-5 py-4 transition-colors duration-150 hover:bg-[#F8FAFC] focus-visible:bg-[#F8FAFC] focus-visible:outline-none md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] md:items-center md:gap-4 md:px-6",
      )}
    >
      {/* Document Title & Original Format */}
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-[11px] font-semibold text-[#475569]">
          {formatLabel}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#0F172A] group-hover:text-[#059669]">
            {document.title}
          </p>
          <p className="truncate font-mono text-xs text-[#64748B]">{document.originalFilename}</p>
        </div>
      </div>

      {/* Patient Profile */}
      <div className="flex flex-wrap items-center gap-1.5">
        <ProfileBadge
          name={profile ? (profile.isPrimary ? "Self" : profile.fullName) : "Family"}
          colorIndex={profile?.colorIndex ?? 0}
        />
        {document.profileMatchConfidence === "needs_review" && (
          <span className="inline-flex flex-row items-center gap-1 whitespace-nowrap rounded-[6px] border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 font-mono text-[11px] font-medium text-[#92400E]">
            Verify
          </span>
        )}
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 text-[14px] text-[#475569]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#64748B]" aria-hidden="true" />
        <span className="truncate">{document.category}</span>
      </div>

      {/* Date & Size */}
      <div className="font-mono text-xs text-[#64748B] tabular-nums">
        <span>{displayDate}</span>
        <span className="mx-1.5">·</span>
        <span>{formatBytes(document.fileSizeBytes)}</span>
      </div>

      {/* Status & Open Indicator */}
      <div className="flex items-center justify-between gap-3 md:justify-end">
        <LedgerStatusCell status={document.ingestionStatus} />
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#0F172A]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
