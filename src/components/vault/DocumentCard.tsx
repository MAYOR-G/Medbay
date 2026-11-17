"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, FileText, Loader2 } from "lucide-react";
import { Badge, Card, ProfileBadge } from "@/components/ui";
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

function IngestionStatusBadge({
  status,
}: {
  status: MedicalDocumentSummaryDto["ingestionStatus"];
}) {
  if (status === "ready") {
    return (
      <Badge variant="ready">
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        <span>Ready</span>
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="critical">
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        <span>AI Summary Failed</span>
      </Badge>
    );
  }

  const label =
    status === "extracting"
      ? "Reading..."
      : status === "summarizing"
        ? "Summarizing..."
        : status === "indexing"
          ? "Indexing..."
          : "Queued";

  return (
    <Badge variant="processing">
      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
}

export function DocumentCard({ document, profile }: DocumentCardProps) {
  const displayDate = document.documentDate ?? document.createdAt.slice(0, 10);

  return (
    <Link href={`/vault/${document.id}`} className="block rounded-lg focus-visible:outline-none">
      <Card interactive className="flex h-full flex-col justify-between gap-3">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ProfileBadge
              name={profile ? (profile.isPrimary ? "Self" : profile.fullName) : "Family"}
              colorIndex={profile?.colorIndex ?? 0}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {document.profileMatchConfidence === "needs_review" && (
                <Badge variant="attention">Verify Patient</Badge>
              )}
              <IngestionStatusBadge status={document.ingestionStatus} />
            </div>
          </div>

          <h3 className="line-clamp-2 font-body text-[16px] leading-[1.4] font-semibold text-text-primary">
            {document.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline pt-2.5 text-[13px] text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
            <span>{document.category}</span>
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-xs text-text-muted tabular-nums">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{displayDate}</span>
            <span>·</span>
            <span>{formatBytes(document.fileSizeBytes)}</span>
          </span>
        </div>
      </Card>
    </Link>
  );
}
