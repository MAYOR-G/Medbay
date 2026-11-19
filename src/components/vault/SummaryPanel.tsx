"use client";

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

const SEVERITY_DOT_CLASS: Record<FindingSeverity, string> = {
  normal: "bg-[#059669]",
  attention: "bg-[#92400E]",
  critical: "bg-[#991B1B]",
};

const IN_PROGRESS_STATUSES = new Set(["queued", "extracting", "summarizing", "indexing"]);

export function SummaryPanel({ document, profiles, onOpenShare }: SummaryPanelProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const setChatOpen = useVaultStore((state) => state.setChatOpen);
  const setActiveProfileId = useVaultStore((state) => state.setActiveProfileId);

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

  function handleAskAiAboutRecord() {
    setActiveProfileId(document.profileId);
    setChatOpen(
      true,
      `Explain the key findings, abnormal markers, and next steps from "${document.title}".`,
    );
  }

  return (
    <div className="space-y-5">
      {/* Clinical Report Header Card */}
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
                <span className="font-mono text-xs text-[#64748B] tabular-nums">
                  {document.documentDate}
                </span>
              )}
            </div>
            <h1 className="font-heading text-[24px] leading-[1.2] font-bold tracking-[-0.02em] text-[#0F172A]">
              {document.title}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" size="compact" onClick={handleAskAiAboutRecord}>
              <MessageSquareText className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Ask AI</span>
            </Button>
            {onOpenShare && (
              <Button variant="primary" size="compact" onClick={onOpenShare}>
                <Share2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Share</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="compact"
              aria-label="Delete document"
              onClick={() => setDeleteModalOpen(true)}
              className="text-[#991B1B] hover:bg-[#FEF2F2] hover:text-[#991B1B]"
            >
              <Trash2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-3.5">
          <label className="flex items-center gap-2.5 text-[14px] font-semibold text-[#475569]">
            <span>Patient Profile</span>
            <select
              aria-label="Reassign family profile"
              value={document.profileId}
              disabled={isPending}
              onChange={(e) => handleProfileChange(e.target.value)}
              className="h-10 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[14px] font-semibold text-[#0F172A] focus:border-[#059669]"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.isPrimary ? "Self" : `${profile.fullName} (${profile.relationship})`}
                </option>
              ))}
            </select>
          </label>

          {document.detectedPatientName && (
            <span className="font-mono text-xs text-[#64748B]">
              Detected name: {document.detectedPatientName}
            </span>
          )}
        </div>
      </Card>

      {/* Verify Patient Warning Banner */}
      {document.profileMatchConfidence === "needs_review" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-[14px] text-[#92400E]"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <p className="font-semibold">Verify patient profile</p>
            <p className="mt-0.5">
              MedBay could not confidently match this record to a family member. Please confirm or
              reassign the patient profile above.
            </p>
          </div>
        </div>
      )}

      {/* Processing / Failed States */}
      {isProcessing && (
        <Card className="flex items-center gap-3.5">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#059669]" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-semibold text-[#0F172A]">
              Preparing clinical AI summary...
            </p>
            <p className="font-mono text-xs text-[#475569]">Stage: {document.ingestionStatus}</p>
          </div>
        </Card>
      )}

      {document.ingestionStatus === "failed" && (
        <Card className="space-y-3 border-[#FECACA] bg-[#FEF2F2]">
          <div className="flex items-start gap-2.5 text-[#991B1B]">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">AI summary failed</p>
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
            <RefreshCw className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Retry Analysis</span>
          </Button>
        </Card>
      )}

      {/* Unified Clinical AI Summary Report Sheet */}
      {document.summary && (
        <div className="divide-y divide-[#E2E8F0] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
          {/* Plain-English Overview */}
          <section className="space-y-2.5 p-5 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                Clinical Summary Report
              </h2>
              <span className="font-mono text-[11px] text-[#64748B]">
                {document.summary.modelUsed}
              </span>
            </div>
            <p className="clinical-prose text-[15px] leading-relaxed text-[#0F172A]">
              {document.summary.overview}
            </p>
          </section>

          {/* Key Findings & Biomarkers */}
          <section className="space-y-3.5 p-5 md:p-6">
            <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">
              Key Findings &amp; Markers
            </h2>
            {document.summary.keyFindings.length === 0 ? (
              <p className="text-[15px] text-[#475569]">
                No abnormal or notable markers highlighted.
              </p>
            ) : (
              <div className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0]">
                {document.summary.keyFindings.map((finding, idx) => (
                  <div key={`${finding.label}-${idx}`} className="space-y-1.5 px-4 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            SEVERITY_DOT_CLASS[finding.severity],
                          )}
                          aria-hidden="true"
                        />
                        <span className="text-[15px] font-semibold text-[#0F172A]">
                          {finding.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#0F172A] tabular-nums">
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
                    <p className="pl-4 text-[14px] leading-relaxed text-[#475569]">
                      {finding.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Questions to Ask Your Doctor */}
          <section className="space-y-3.5 p-5 md:p-6">
            <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">
              Questions for Your Doctor
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#0F172A]">
              {document.summary.doctorQuestions.map((question, idx) => (
                <li key={idx}>{question}</li>
              ))}
            </ol>
            <div className="pt-1">
              <Button variant="secondary" onClick={handleAskAiAboutRecord}>
                <MessageSquareText className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Discuss This Report in AI Chat</span>
              </Button>
            </div>
          </section>

          {/* Verified Medical Citations & Disclaimer */}
          <section className="space-y-3 bg-[#F8FAFC] p-5 md:p-6">
            <h2 className="font-heading text-[16px] font-semibold text-[#0F172A]">
              Verified Medical References
            </h2>
            {document.summary.citations.length === 0 ? (
              <p className="text-[14px] text-[#475569]">
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
                    className="inline-flex h-9 flex-row items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 font-mono text-xs font-medium text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE]"
                  >
                    <ShieldCheck
                      className="h-3.5 w-3.5 shrink-0"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span>{citation.domain}</span>
                    <ExternalLink
                      className="h-3 w-3 shrink-0"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            )}
            <p className="pt-1 text-[12px] text-[#64748B]">
              MedBay AI provides plain-English explanations for informational purposes only and is
              not a substitute for professional medical advice.
            </p>
          </section>
        </div>
      )}

      <ModalOrSheet
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Medical Document"
        description="This permanently deletes the original encrypted file, AI summary, vector index, and any active share links."
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={isPending} onClick={() => setDeleteModalOpen(false)}>
            <span>Cancel</span>
          </Button>
          <Button
            variant="destructive"
            isLoading={isPending}
            loadingLabel="Deleting..."
            onClick={handleConfirmDelete}
          >
            <span>Delete Document</span>
          </Button>
        </div>
      </ModalOrSheet>
    </div>
  );
}
