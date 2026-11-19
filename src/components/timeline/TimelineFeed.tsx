"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button, Card, EmptyStateIllustration, cn } from "@/components/ui";
import type { TimelineCategoryFilter, TimelineGroupDto } from "@/server/services";
import type { FamilyProfileDto, PaginationMeta } from "@/types/domain.types";
import { TimelineGroup } from "./TimelineGroup";

export interface TimelineFeedProps {
  groups: TimelineGroupDto[];
  profiles: FamilyProfileDto[];
  activeCategory: TimelineCategoryFilter;
  pagination: PaginationMeta;
}

const CATEGORY_CHIPS: ReadonlyArray<{ value: TimelineCategoryFilter; label: string }> = [
  { value: "all", label: "All Activity" },
  { value: "uploads", label: "Uploads" },
  { value: "shares", label: "Shares" },
  { value: "appointments", label: "Appointments" },
  { value: "gmail", label: "Gmail Alerts" },
];

export function TimelineFeed({ groups, profiles, activeCategory, pagination }: TimelineFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  function updateFilter(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (!val || val === "all") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    const qs = next.toString();
    router.push(qs ? `/timeline?${qs}` : "/timeline");
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-[#0F172A]">
          Activity Timeline
        </h1>
        <p className="mt-1.5 text-[15px] text-[#475569] tabular-nums">
          {pagination.totalCount} {pagination.totalCount === 1 ? "event" : "events"} recorded across
          uploads, AI summaries, physician links, and appointments
        </p>
      </div>

      {/* Event Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORY_CHIPS.map((chip) => {
          const selected = activeCategory === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => updateFilter({ category: chip.value, page: null })}
              className={cn(
                "inline-flex h-10 shrink-0 flex-row items-center whitespace-nowrap rounded-full border px-4 text-[14px] transition-colors",
                selected
                  ? "border-[#A7F3D0] bg-[#ECFDF5] font-semibold text-[#065F46] shadow-2xs"
                  : "border-[#E2E8F0] bg-white font-medium text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <EmptyStateIllustration variant="timeline" />
          <h2 className="mt-4 font-heading text-lg font-semibold text-[#0F172A]">
            No vault activity yet
          </h2>
          <p className="mt-2 max-w-md text-[15px] text-[#475569]">
            Uploads, AI summaries, shared links, and booked appointments will appear here
            chronologically.
          </p>
          <div className="mt-6">
            <Link
              href="/vault"
              className="inline-flex h-11 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-5 text-[15px] font-semibold text-white shadow-xs transition-colors hover:bg-[#047857]"
            >
              <span>Go to Vault</span>
              <ArrowRight className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <TimelineGroup key={group.dateKey} group={group} profileMap={profileMap} />
          ))}

          {(pagination.page > 1 || pagination.hasMore) && (
            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => updateFilter({ page: String(pagination.page - 1) })}
              >
                <span>Previous</span>
              </Button>
              <span className="font-mono text-xs text-[#64748B] tabular-nums">
                Page {pagination.page}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasMore}
                onClick={() => updateFilter({ page: String(pagination.page + 1) })}
              >
                <span>Next</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
