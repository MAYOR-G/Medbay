import Link from "next/link";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import type { VaultCitationRef, WebCitationRef } from "@/types/domain.types";

export function VaultCitationChip({ citation }: { citation: VaultCitationRef }) {
  return (
    <Link
      href={`/vault/${citation.documentId}`}
      className="inline-flex h-9 flex-row items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-3 text-[13px] font-semibold text-[#065F46] transition-colors hover:bg-[#D1FAE5]"
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-[#059669]" aria-hidden="true" />
      <span>{citation.title}</span>
      {citation.documentDate && (
        <span className="font-mono text-xs text-[#065F46]/80 tabular-nums">
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
      className="inline-flex h-9 flex-row items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[13px] font-semibold text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE]"
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="font-mono text-xs">{citation.domain}</span>
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  );
}
