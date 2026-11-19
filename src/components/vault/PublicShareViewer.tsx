"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, ZoomIn, ZoomOut } from "lucide-react";
import { MedBayLogo } from "@/components/ui";
import type { AllowedDocumentMimeType } from "@/types/domain.types";

export interface PublicShareViewerProps {
  token: string;
  title: string;
  mimeType: AllowedDocumentMimeType;
  expiresAt: string;
}

function formatCountdown(expiresAtIso: string): string {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `Expires in ${days}d ${hours}h`;
  return `Expires in ${hours}h ${minutes}m`;
}

export function PublicShareViewer({ token, title, mimeType, expiresAt }: PublicShareViewerProps) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const [countdown, setCountdown] = useState(() => formatCountdown(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(expiresAt));
    }, 30_000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const fileUrl = `/api/share/${token}/file`;
  const downloadUrl = `${fileUrl}?download=true`;
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1120] text-white">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0F172A] px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <MedBayLogo size="sm" variant="light" showWordmark={false} />
          <div className="min-w-0">
            <h1 className="truncate font-heading text-base font-bold text-white">{title}</h1>
            <p className="text-[12px] text-white/65">Shared via MedBay Encrypted Vault</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="rounded-[6px] border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-xs text-white/90 tabular-nums">
            {countdown}
          </span>

          {isImage && (
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoomPercent((z) => Math.max(50, z - 25))}
                className="inline-flex h-10 w-10 flex-row items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              >
                <ZoomOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoomPercent((z) => Math.min(200, z + 25))}
                className="inline-flex h-10 w-10 flex-row items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              >
                <ZoomIn className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          )}

          <a
            href={downloadUrl}
            aria-label="Download original medical document"
            className="inline-flex h-11 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#047857]"
          >
            <Download className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] flex-1 items-center justify-center overflow-auto bg-[#0B1120] p-4 sm:p-6">
        {isPdf ? (
          <iframe
            src={fileUrl}
            title={title}
            className="h-[calc(100vh-104px)] w-full rounded-lg bg-white shadow-xl"
          />
        ) : isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={title}
            style={{ width: `${zoomPercent}%`, maxWidth: "none" }}
            className="rounded-lg bg-white object-contain shadow-xl transition-all duration-150"
          />
        ) : (
          <div className="max-w-[360px] space-y-4 text-center">
            <FileText className="mx-auto h-10 w-10 text-white/70" aria-hidden="true" />
            <p className="text-[15px] text-white/85">
              Open or download the shared medical record below.
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#047857]"
            >
              <span>Open Document</span>
              <ExternalLink className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
