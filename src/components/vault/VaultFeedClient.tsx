"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilePlus2, Search, Upload, UserPlus } from "lucide-react";
import { Button, Card, EmptyStateIllustration, cn } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";
import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
  type FamilyProfileDto,
  type MedicalDocumentSummaryDto,
} from "@/types/domain.types";
import { DocumentCard } from "./DocumentCard";

export interface VaultFeedClientProps {
  documents: MedicalDocumentSummaryDto[];
  profiles: FamilyProfileDto[];
  activeCategory: DocumentCategory | "all";
  activeProfileFilter: string;
  initialQuery: string;
  totalCount: number;
}

const IN_PROGRESS_STATUSES = new Set(["queued", "extracting", "summarizing", "indexing"]);

export function VaultFeedClient({
  documents,
  profiles,
  activeCategory,
  activeProfileFilter,
  initialQuery,
  totalCount,
}: VaultFeedClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUploadSheetOpen = useVaultStore((state) => state.setUploadSheetOpen);
  const [searchValue, setSearchValue] = useState(initialQuery);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const hasPendingIngestion = documents.some((doc) =>
    IN_PROGRESS_STATUSES.has(doc.ingestionStatus),
  );

  useEffect(() => {
    if (!hasPendingIngestion) return;
    const interval = setInterval(() => {
      router.refresh();
    }, 3500);
    return () => clearInterval(interval);
  }, [hasPendingIngestion, router]);

  function updateQueryParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (!val || val === "all") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `/vault?${qs}` : "/vault");
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQueryParams({ q: searchValue.trim() || null });
  }

  const selectedProfile =
    activeProfileFilter !== "all" ? profileMap.get(activeProfileFilter) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-[#0F172A]">
            Medical Document Vault
          </h1>
          <p className="mt-1.5 text-[15px] text-[#475569] tabular-nums">
            {totalCount} {totalCount === 1 ? "file" : "files"} stored · Click any row to open the
            original PDF viewer and AI clinical report
          </p>
        </div>

        <Button variant="primary" onClick={() => setUploadSheetOpen(true)}>
          <FilePlus2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* Quick Upload Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
            <Upload className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-[#0F172A]">
              Add a medical record to your family vault
            </p>
            <p className="text-[14px] text-[#475569]">
              Accepts PDF, JPEG, PNG, WEBP, DOCX, or TXT up to 25 MB · Automatic OCR and clinical
              summary
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setUploadSheetOpen(true)}>
          <FilePlus2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>Choose File to Upload</span>
        </Button>
      </div>

      {/* Search & Category Filter Row */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-[#64748B]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search medical documents"
              placeholder="Search lab results, prescriptions, doctors..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-[#CBD5E1] bg-white pr-4 pl-10 font-body text-[15px] text-[#0F172A] placeholder:text-[#64748B] shadow-2xs transition-colors focus:border-[#059669] focus:outline-none"
            />
          </div>
          <Button type="submit" variant="outline">
            <span>Search</span>
          </Button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => updateQueryParams({ category: null })}
            className={cn(
              "inline-flex h-9 shrink-0 flex-row items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] transition-colors",
              activeCategory === "all"
                ? "border-[#A7F3D0] bg-[#ECFDF5] font-semibold text-[#065F46]"
                : "border-[#E2E8F0] bg-white font-medium text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]",
            )}
          >
            All Categories
          </button>
          {DOCUMENT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => updateQueryParams({ category })}
              className={cn(
                "inline-flex h-9 shrink-0 flex-row items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] transition-colors",
                activeCategory === category
                  ? "border-[#A7F3D0] bg-[#ECFDF5] font-semibold text-[#065F46]"
                  : "border-[#E2E8F0] bg-white font-medium text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Document Ledger or Empty States */}
      {documents.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <EmptyStateIllustration variant="vault" />
          <h2 className="mt-4 font-heading text-lg font-semibold text-[#0F172A]">
            {selectedProfile
              ? `No records for ${selectedProfile.isPrimary ? "Self" : selectedProfile.fullName} yet`
              : "Your family's medical vault is ready"}
          </h2>
          <p className="mt-2 max-w-md text-[15px] text-[#475569]">
            {selectedProfile
              ? `Documents uploaded for ${selectedProfile.fullName} will appear here in a clean chronological ledger.`
              : "Upload a lab result, prescription, or scan to generate a structured clinical summary and keep it ready anywhere."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" onClick={() => setUploadSheetOpen(true)}>
              <FilePlus2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>
                {selectedProfile
                  ? `Upload for ${selectedProfile.isPrimary ? "Self" : selectedProfile.fullName}`
                  : "Upload First Document"}
              </span>
            </Button>
            {!selectedProfile && (
              <Link
                href="/profiles"
                className="inline-flex h-11 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-[#A7F3D0] bg-[#ECFDF5] px-4 text-[15px] font-semibold text-[#065F46] transition-colors hover:bg-[#D1FAE5]"
              >
                <UserPlus className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Add Family Member</span>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="hidden border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-3 text-[12px] font-semibold text-[#64748B] md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] md:gap-4">
            <span>Document</span>
            <span>Patient</span>
            <span>Category</span>
            <span>Date &amp; Size</span>
            <span className="text-right">AI Report</span>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} profile={profileMap.get(doc.profileId)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
