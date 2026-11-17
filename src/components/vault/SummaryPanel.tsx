"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Badge, Button, Card, ModalOrSheet, ProfileBadge, cn } from "@/components/ui";
import { deleteDocumentAction, reassignDocumentProfileAction } from "@/server/actions";
import { useVaultStore } from "@/stores/use-vault-store";
import type {
  FamilyProfileDto,
  FindingSeverity,
  MedicalDocumentDetailDto,
} from "@/types/domain.types";

export interface SummaryPanelProps {
  document: MedicalDocumentDetailDto;
  profiles: FamilyProfileDto[];
  onOpenShare?: () => void;
}

const SEVERITY_ACCENT: Record<FindingSeverity, string> = {
  normal: "border-l-[3px] border-l-status-success-text bg-status-success-bg/50",
  attention: "border-l-[3px] border-l-status-warning-text bg-status-warning-bg/70",
  critical: "border-l-[3px] border-l-status-danger-text bg-status-danger-bg/80",
};

const IN_PROGRESS_STATUSES = new Set(["queued", "extracting", "summarizing", "indexing"]);

export function SummaryPanel({ document, profiles, onOpenShare }: SummaryPanelProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const [isPending, startTransition] = useTransition();
  const [isRetrying, setIsRetrying] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const isProcessing = IN_PROGRESS_STATUSES.has(document.ingestionStatus);
  const activeProfile = profiles.find((p) => p.id === document.profileId);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);
    return () => clearInterval(interval);
  }, [isProcessing, router]);

  function handleProfileChange(nextProfileId: string) {
    startTransition(async () => {
      const result = await reassignDocumentProfileAction({
        documentId: document.id,
        profileId: nextProfileId,
      });
      if (result.success) {
        addToast("Document reassigned to selected family member.", "success");
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  async function handleRetryIngestion() {
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/documents/${document.id}/retry`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };
      if (!response.ok || !payload.success) {
        addToast(payload.error?.message ?? "Could not retry AI analysis.", "danger");
        return;
      }
      addToast("Re-running AI analysis...", "success");
      router.refresh();
    } catch {
      addToast("Network error while retrying analysis.", "danger");
    } finally {
      setIsRetrying(false);
    }
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      const result = await deleteDocumentAction({ documentId: document.id });
      if (result.success) {
        addToast("Document permanently deleted.", "success");
        router.push("/vault");
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {activeProfile && (
                <ProfileBadge
                  name={activeProfile.isPrimary ? "Self" : activeProfile.fullName}
                  colorIndex={activeProfile.colorIndex}
                />
              )}
              <Badge variant="neutral">{document.category}</Badge>
              {document.documentDate && (
                <span className="font-mono text-xs text-text-muted tabular-nums">
                  {document.documentDate}
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.015em] text-text-primary">
              {document.title}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onOpenShare && (
              <Button variant="primary" size="compact" onClick={onOpenShare}>
                <Share2 className="h-4 w-4" aria-hidden="true" />
                <span>Share</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="compact"
              aria-label="Delete document"
              onClick={() => setDeleteModalOpen(true)}
              className="text-status-danger-text hover:bg-status-danger-bg hover:text-status-danger-text"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-hairline pt-3">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-text-secondary">
            <span>Patient Profile:</span>
            <select
              aria-label="Reassign family profile"
              value={document.profileId}
              disabled={isPending}
              onChange={(e) => handleProfileChange(e.target.value)}
              className="h-[40px] rounded-md border border-border-strong bg-surface px-2.5 text-[14px] font-medium text-text-primary focus:border-border-focus"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.isPrimary ? "Self" : `${profile.fullName} (${profile.relationship})`}
                </option>
              ))}
            </select>
          </label>

          {document.detectedPatientName && (
            <span className="font-mono text-xs text-text-muted">
              Detected name: {document.detectedPatientName}
            </span>
          )}
        </div>
      </Card>

      {/* Verify Patient Warning Banner */}
      {document.profileMatchConfidence === "needs_review" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-status-warning-border bg-status-warning-bg p-4 text-[14px] text-status-warning-text"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Verify Patient Profile</p>
            <p className="mt-0.5">
              MedBay could not confidently match this record to a family member. Please confirm or
              reassign the Patient Profile above.
            </p>
          </div>
        </div>
      )}

      {/* Processing / Failed / Ready Summary Cards */}
      {isProcessing && (
        <Card className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-accent-primary" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-semibold text-text-primary">
              Analyzing your medical document...
            </p>
            <p className="text-[13px] text-text-secondary">
              Current stage: <span className="font-mono uppercase">{document.ingestionStatus}</span>
            </p>
          </div>
        </Card>
      )}

      {document.ingestionStatus === "failed" && (
        <Card className="space-y-3 border-status-danger-border bg-status-danger-bg">
          <div className="flex items-start gap-2.5 text-status-danger-text">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">AI Summary Failed</p>
              <p className="mt-1 text-[14px]">
                {document.ingestionError ??
                  "The AI analysis pipeline encountered a temporary issue. Your original document is safely stored."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            isLoading={isRetrying}
            loadingLabel="Retrying..."
            onClick={handleRetryIngestion}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Retry Analysis</span>
          </Button>
        </Card>
      )}

      {document.summary && (
        <>
          {/* Card 1: Plain-English Overview */}
          <Card className="space-y-2.5">
            <h2 className="font-heading text-[17px] font-semibold text-text-primary">
              What This Document Is About
            </h2>
            <p className="clinical-prose text-text-primary">{document.summary.overview}</p>
          </Card>

          {/* Card 2: Key Findings & Critical Flags */}
          <Card className="space-y-3">
            <h2 className="font-heading text-[17px] font-semibold text-text-primary">
              Key Findings &amp; Clinical Flags
            </h2>
            {document.summary.keyFindings.length === 0 ? (
              <p className="text-[15px] text-text-secondary">
                No abnormal or notable markers highlighted.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {document.summary.keyFindings.map((finding, idx) => (
                  <li
                    key={`${finding.label}-${idx}`}
                    className={cn(
                      "rounded-md border border-border-hairline px-3.5 py-2.5",
                      SEVERITY_ACCENT[finding.severity],
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-text-primary">{finding.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-text-primary tabular-nums">
                          {finding.value}
                        </span>
                        <Badge
                          variant={
                            finding.severity === "critical"
                              ? "critical"
                              : finding.severity === "attention"
                                ? "attention"
                                : "ready"
                          }
                        >
                          {finding.severity}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-1 text-[14px] text-text-secondary">{finding.explanation}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Card 3: Questions to Ask Your Doctor */}
          <Card className="space-y-3">
            <h2 className="font-heading text-[17px] font-semibold text-text-primary">
              Questions to Ask Your Doctor
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-[15px] text-text-primary">
              {document.summary.doctorQuestions.map((question, idx) => (
                <li key={idx}>{question}</li>
              ))}
            </ol>
            <div className="pt-1">
              <Link
                href={`/chat?profileId=${document.profileId}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-accent-primary-border bg-accent-primary-tint px-4 text-[14px] font-semibold text-accent-primary hover:bg-[#D6E7E0]"
              >
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                <span>Ask AI Follow-Up Questions</span>
              </Link>
            </div>
          </Card>

          {/* Card 4: Verified Medical Citations */}
          <Card className="space-y-3">
            <h2 className="font-heading text-[17px] font-semibold text-text-primary">
              Verified Medical Citations
            </h2>
            {document.summary.citations.length === 0 ? (
              <p className="text-[14px] text-text-secondary">
                External medical citations temporarily unavailable for this record.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {document.summary.citations.map((citation, idx) => (
                  <a
                    key={`${citation.url}-${idx}`}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-status-info-border bg-status-info-bg px-3 py-1.5 text-[13px] font-medium text-status-info-text hover:underline"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="font-mono text-xs">{citation.domain}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
            <p className="border-t border-border-hairline pt-2.5 text-[12px] text-text-muted">
              MedBay AI provides plain-English explanations for informational purposes only and is
              not a substitute for professional medical advice.
            </p>
          </Card>
        </>
      )}

      <ModalOrSheet
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Medical Document?"
        description="This permanently deletes the original encrypted file, AI summary, vector index, and any active share links."
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={isPending} onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={isPending}
            loadingLabel="Deleting..."
            onClick={handleConfirmDelete}
          >
            Delete Document
          </Button>
        </div>
      </ModalOrSheet>
    </div>
  );
}
