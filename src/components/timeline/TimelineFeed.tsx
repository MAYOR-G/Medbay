"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";
import { Button, Card, cn } from "@/components/ui";
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
  { value: "all", label: "All" },
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
    <div className="mx-auto max-w-[760px] space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.015em] text-text-primary">
          Activity Timeline
        </h1>
        <p className="mt-0.5 text-[14px] text-text-secondary tabular-nums">
          {pagination.totalCount} {pagination.totalCount === 1 ? "event" : "events"} recorded
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
                "min-h-[44px] shrink-0 rounded-full border px-4 text-[13px] transition-colors",
                selected
                  ? "border-accent-primary bg-accent-primary font-semibold text-text-inverted"
                  : "border-border-hairline bg-surface font-medium text-text-secondary hover:border-border-strong",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent-primary-border bg-accent-primary-tint text-accent-primary">
            <Clock className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold text-text-primary">
            No vault activity yet
          </h2>
          <p className="mt-2 max-w-[360px] text-[15px] text-text-secondary">
            Uploads, AI summaries, shared links, and booked appointments will appear here
            chronologically.
          </p>
          <div className="mt-6">
            <Link
              href="/vault"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent-primary px-5 text-[15px] font-semibold text-text-inverted hover:bg-accent-primary-hover"
            >
              Go to Vault
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <TimelineGroup key={group.dateKey} group={group} profileMap={profileMap} />
          ))}

          {(pagination.page > 1 || pagination.hasMore) && (
            <div className="flex items-center justify-between border-t border-border-hairline pt-4">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => updateFilter({ page: String(pagination.page - 1) })}
              >
                Previous
              </Button>
              <span className="font-mono text-xs text-text-muted tabular-nums">
                Page {pagination.page}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasMore}
                onClick={() => updateFilter({ page: String(pagination.page + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
