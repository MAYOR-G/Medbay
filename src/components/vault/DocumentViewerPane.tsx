"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, ZoomIn, ZoomOut } from "lucide-react";
import type { AllowedDocumentMimeType } from "@/types/domain.types";

export interface DocumentViewerPaneProps {
  documentId: string;
  title: string;
  mimeType: AllowedDocumentMimeType;
}

export function DocumentViewerPane({ documentId, title, mimeType }: DocumentViewerPaneProps) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const fileUrl = `/api/documents/${documentId}/file`;
  const downloadUrl = `${fileUrl}?download=true`;
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";

  return (
    <div className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-lg border border-white/10 bg-viewer-dark text-text-inverted">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-text-primary px-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
          <span className="truncate font-mono text-xs text-white/85">{title}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isImage && (
            <>
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoomPercent((z) => Math.max(50, z - 25))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-white/80 hover:bg-white/10 hover:text-white"
              >
                <ZoomOut className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="px-1 font-mono text-xs text-white/70 tabular-nums">
                {zoomPercent}%
              </span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoomPercent((z) => Math.min(200, z + 25))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-white/80 hover:bg-white/10 hover:text-white"
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
          <a
            href={downloadUrl}
            aria-label="Download original file"
            className="inline-flex h-10 items-center gap-1.5 rounded-sm px-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        {isPdf ? (
          <iframe
            src={fileUrl}
            title={title}
            className="h-[600px] w-full rounded-sm bg-white lg:h-full lg:min-h-[640px]"
          />
        ) : isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={title}
            style={{ width: `${zoomPercent}%`, maxWidth: "none" }}
            className="rounded-sm object-contain transition-all duration-150"
          />
        ) : (
          <div className="max-w-[360px] space-y-3 text-center">
            <FileText className="mx-auto h-10 w-10 text-white/60" aria-hidden="true" />
            <p className="text-[15px] text-white/85">
              Previewing {mimeType === "text/plain" ? "text document" : "Word document"} via direct
              download.
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-accent-primary px-4 text-[14px] font-semibold text-text-inverted hover:bg-accent-primary-hover"
            >
              <span>Open Original File</span>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
