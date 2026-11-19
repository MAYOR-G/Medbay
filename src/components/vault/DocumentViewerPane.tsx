"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, ZoomIn, ZoomOut } from "lucide-react";
import type { AllowedDocumentMimeType } from "@/types/domain.types";

export interface DocumentViewerPaneProps {
  documentId: string;
  title: string;
  mimeType: AllowedDocumentMimeType;
}

function getFormatBadge(mimeType: AllowedDocumentMimeType): string {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.includes("wordprocessingml")) return "DOCX";
  return "Text";
}

export function DocumentViewerPane({ documentId, title, mimeType }: DocumentViewerPaneProps) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const fileUrl = `/api/documents/${documentId}/file`;
  const downloadUrl = `${fileUrl}?download=true`;
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";

  return (
    <div className="flex h-full min-h-[540px] flex-col overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0B1120] text-white shadow-md">
      {/* Dark Slate Archival Viewer Toolbar */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#0F172A] px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="rounded-[6px] border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[11px] font-medium text-white/90">
            {getFormatBadge(mimeType)}
          </span>
          <span className="truncate font-mono text-xs text-white/85">{title}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isImage && (
            <>
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoomPercent((z) => Math.max(50, z - 25))}
                className="inline-flex h-9 w-9 flex-row items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ZoomOut className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              </button>
              <span className="px-1 font-mono text-xs text-white/80 tabular-nums">
                {zoomPercent}%
              </span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoomPercent((z) => Math.min(200, z + 25))}
                className="inline-flex h-9 w-9 flex-row items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ZoomIn className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </>
          )}

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open original file in new tab"
            className="inline-flex h-9 flex-row items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">Open Tab</span>
          </a>

          <a
            href={downloadUrl}
            aria-label="Download original file"
            className="inline-flex h-9 flex-row items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#059669] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#047857]"
          >
            <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Isolated #0B1120 Paper Framing Canvas */}
      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#0B1120] p-4">
        {isPdf ? (
          <iframe
            src={fileUrl}
            title={title}
            className="h-[640px] w-full rounded-lg bg-white shadow-lg lg:h-full"
          />
        ) : isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={title}
            style={{ width: `${zoomPercent}%`, maxWidth: "none" }}
            className="rounded-lg bg-white object-contain shadow-lg transition-[width] duration-150"
          />
        ) : (
          <div className="max-w-[360px] space-y-3 text-center">
            <FileText
              className="mx-auto h-10 w-10 text-white/60"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-[15px] text-white/85">
              {mimeType === "text/plain"
                ? "Text documents open in a dedicated browser tab or direct download."
                : "Word documents (.docx) open via direct download."}
            </p>
            <a
              href={downloadUrl}
              className="inline-flex h-11 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#047857]"
            >
              <Download className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Download Original File</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
