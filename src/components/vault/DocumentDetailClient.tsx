"use client";

import { useState } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, Columns2, FileText, Sparkles } from "lucide-react";
import { cn } from "@/components/ui";
import type {
  FamilyProfileDto,
  MedicalDocumentDetailDto,
  ShareLinkDto,
} from "@/types/domain.types";
import { DocumentViewerPane } from "./DocumentViewerPane";
import { ShareModal } from "./ShareModal";
import { SummaryPanel } from "./SummaryPanel";

export interface DocumentDetailClientProps {
  document: MedicalDocumentDetailDto;
  profiles: FamilyProfileDto[];
  activeShareLinks: ShareLinkDto[];
}

type DesktopViewMode = "split" | "document" | "report";

export function DocumentDetailClient({
  document,
  profiles,
  activeShareLinks,
}: DocumentDetailClientProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [desktopMode, setDesktopMode] = useState<DesktopViewMode>("split");

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Desktop Layout Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[14px]">
          <Link
            href="/vault"
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-[8px] px-2 font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Vault</span>
          </Link>
          <span className="text-text-muted">/</span>
          <span className="truncate font-medium text-text-primary">{document.title}</span>
        </div>

        <div
          role="group"
          aria-label="Workspace view mode"
          className="hidden items-center gap-1 rounded-[10px] border border-border-hairline bg-surface p-1 lg:inline-flex"
        >
          <button
            type="button"
            onClick={() => setDesktopMode("split")}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-[7px] px-3 text-[13px] font-medium transition-colors",
              desktopMode === "split"
                ? "bg-accent-primary text-text-inverted"
                : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
            )}
          >
            <Columns2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>Split view</span>
          </button>
          <button
            type="button"
            onClick={() => setDesktopMode("document")}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-[7px] px-3 text-[13px] font-medium transition-colors",
              desktopMode === "document"
                ? "bg-accent-primary text-text-inverted"
                : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
            )}
          >
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>PDF / Original</span>
          </button>
          <button
            type="button"
            onClick={() => setDesktopMode("report")}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-[7px] px-3 text-[13px] font-medium transition-colors",
              desktopMode === "report"
                ? "bg-accent-primary text-text-inverted"
                : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>AI report</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Segmented Tabs (< 1024px) */}
      <div className="lg:hidden">
        <Tabs.Root defaultValue="summary" className="space-y-4">
          <Tabs.List
            aria-label="Document View"
            className="grid grid-cols-2 rounded-[10px] border border-border-hairline bg-surface-subtle p-1"
          >
            <Tabs.Trigger
              value="summary"
              className="min-h-[40px] rounded-[8px] text-[14px] font-medium text-text-secondary transition-colors data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-elevation-1"
            >
              AI Report
            </Tabs.Trigger>
            <Tabs.Trigger
              value="original"
              className="min-h-[40px] rounded-[8px] text-[14px] font-medium text-text-secondary transition-colors data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-elevation-1"
            >
              Original Document
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="summary">
            <SummaryPanel
              document={document}
              profiles={profiles}
              onOpenShare={() => setShareModalOpen(true)}
            />
          </Tabs.Content>
          <Tabs.Content value="original">
            <DocumentViewerPane
              documentId={document.id}
              title={document.title}
              mimeType={document.mimeType}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Desktop Split / Focused Reader (>= 1024px) */}
      <div className="hidden lg:block">
        {desktopMode === "split" && (
          <div className="grid grid-cols-12 items-start gap-6">
            <div className="sticky top-6 col-span-7 h-[calc(100vh-148px)]">
              <DocumentViewerPane
                documentId={document.id}
                title={document.title}
                mimeType={document.mimeType}
              />
            </div>
            <div className="col-span-5">
              <SummaryPanel
                document={document}
                profiles={profiles}
                onOpenShare={() => setShareModalOpen(true)}
              />
            </div>
          </div>
        )}

        {desktopMode === "document" && (
          <div className="h-[calc(100vh-148px)]">
            <DocumentViewerPane
              documentId={document.id}
              title={document.title}
              mimeType={document.mimeType}
            />
          </div>
        )}

        {desktopMode === "report" && (
          <div className="mx-auto max-w-[780px]">
            <SummaryPanel
              document={document}
              profiles={profiles}
              onOpenShare={() => setShareModalOpen(true)}
            />
          </div>
        )}
      </div>

      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        documentId={document.id}
        documentTitle={document.title}
        activeLinks={activeShareLinks}
      />
    </div>
  );
}
