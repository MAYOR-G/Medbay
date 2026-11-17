"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilePlus2, Search, UserPlus } from "lucide-react";
import { Button, Card, cn } from "@/components/ui";
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.015em] text-text-primary">
            Family Medical Vault
          </h1>
          <p className="mt-0.5 text-[14px] text-text-secondary tabular-nums">
            {totalCount} {totalCount === 1 ? "record" : "records"} stored
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setUploadSheetOpen(true)}
          className="hidden md:inline-flex"
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* Search & Category Filter Chips */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search medical documents"
              placeholder="Search labs, prescriptions, doctors..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-[44px] w-full rounded-md border border-border-strong bg-surface pr-3 pl-9 font-body text-[15px] text-text-primary placeholder:text-text-muted focus:border-border-focus"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => updateQueryParams({ category: null })}
            className={cn(
              "min-h-[44px] shrink-0 rounded-full border px-3.5 text-[13px] transition-colors",
              activeCategory === "all"
                ? "border-accent-primary bg-accent-primary font-semibold text-text-inverted"
                : "border-border-hairline bg-surface font-medium text-text-secondary hover:border-border-strong",
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
                "min-h-[44px] shrink-0 rounded-full border px-3.5 text-[13px] transition-colors",
                activeCategory === category
                  ? "border-accent-primary bg-accent-primary font-semibold text-text-inverted"
                  : "border-border-hairline bg-surface font-medium text-text-secondary hover:border-border-strong",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Document Feed or Empty States */}
      {documents.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent-primary-border bg-accent-primary-tint text-accent-primary">
            <FilePlus2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold text-text-primary">
            {selectedProfile
              ? `No records for ${selectedProfile.isPrimary ? "Self" : selectedProfile.fullName} yet`
              : "Your family's medical vault is ready"}
          </h2>
          <p className="mt-2 max-w-[360px] text-[15px] text-text-secondary">
            {selectedProfile
              ? `Documents uploaded for ${selectedProfile.fullName} will automatically appear here.`
              : "Upload a lab result, prescription, or scan to get an instant plain-English summary and keep it ready anywhere."}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button variant="primary" onClick={() => setUploadSheetOpen(true)}>
              {selectedProfile
                ? `Upload for ${selectedProfile.isPrimary ? "Self" : selectedProfile.fullName}`
                : "Upload First Document"}
            </Button>
            {!selectedProfile && (
              <Link
                href="/profiles"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-accent-primary-border bg-accent-primary-tint px-4 text-[15px] font-semibold text-accent-primary hover:bg-[#D6E7E0]"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                <span>Add Family Member</span>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 md:gap-5">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} profile={profileMap.get(doc.profileId)} />
          ))}
        </div>
      )}
    </div>
  );
}
