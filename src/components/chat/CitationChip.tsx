import Link from "next/link";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import type { VaultCitationRef, WebCitationRef } from "@/types/domain.types";

export function VaultCitationChip({ citation }: { citation: VaultCitationRef }) {
  return (
    <Link
      href={`/vault/${citation.documentId}`}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-accent-primary-border bg-accent-primary-tint px-2.5 py-1 text-[13px] font-medium text-accent-primary hover:bg-[#D6E7E0]"
    >
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{citation.title}</span>
      {citation.documentDate && (
        <span className="font-mono text-xs text-accent-secondary tabular-nums">
          ({citation.documentDate})
        </span>
      )}
    </Link>
  );
}

export function WebCitationChip({ citation }: { citation: WebCitationRef }) {
  const safeHref = citation.url.startsWith("https://") ? citation.url : "#";

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-status-info-border bg-status-info-bg px-2.5 py-1 text-[13px] font-medium text-status-info-text hover:underline"
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="font-mono text-xs">{citation.domain}</span>
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  );
}
