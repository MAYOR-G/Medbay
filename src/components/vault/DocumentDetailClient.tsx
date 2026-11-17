"use client";

import { useState } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft } from "lucide-react";
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

export function DocumentDetailClient({
  document,
  profiles,
  activeShareLinks,
}: DocumentDetailClientProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Link
        href="/vault"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back to Vault</span>
      </Link>

      {/* Mobile / Tablet Segmented Tabs (< 1024px) */}
      <div className="lg:hidden">
        <Tabs.Root defaultValue="summary" className="space-y-4">
          <Tabs.List
            aria-label="Document View"
            className="grid grid-cols-2 rounded-md border border-border-hairline bg-surface-subtle p-1"
          >
            <Tabs.Trigger
              value="summary"
              className="min-h-[40px] rounded-sm text-[14px] font-semibold text-text-secondary transition-colors data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-elevation-1"
            >
              AI Summary
            </Tabs.Trigger>
            <Tabs.Trigger
              value="original"
              className="min-h-[40px] rounded-sm text-[14px] font-semibold text-text-secondary transition-colors data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-elevation-1"
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

      {/* Desktop 50/50 Split Screen (>= 1024px) */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-2 lg:items-start">
        <div className="sticky top-6 h-[calc(100vh-140px)]">
          <DocumentViewerPane
            documentId={document.id}
            title={document.title}
            mimeType={document.mimeType}
          />
        </div>
        <div>
          <SummaryPanel
            document={document}
            profiles={profiles}
            onOpenShare={() => setShareModalOpen(true)}
          />
        </div>
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
