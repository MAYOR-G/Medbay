import type { SupabaseClient } from "@supabase/supabase-js";
import { format, isToday, isYesterday } from "date-fns";
import { listActivityEvents } from "@/server/repositories";
import type { Database } from "@/types/database.types";
import type { ActivityEventDto, ActivityEventType, PaginationMeta } from "@/types/domain.types";

export const TIMELINE_CATEGORY_FILTERS = [
  "all",
  "uploads",
  "shares",
  "appointments",
  "gmail",
] as const;
export type TimelineCategoryFilter = (typeof TIMELINE_CATEGORY_FILTERS)[number];

const CATEGORY_TO_EVENT_TYPES: Record<
  Exclude<TimelineCategoryFilter, "all">,
  ActivityEventType[]
> = {
  uploads: ["DOCUMENT_UPLOADED", "AI_SUMMARY_GENERATED", "PROFILE_ASSIGNED"],
  shares: ["SHARE_LINK_CREATED", "SHARE_LINK_ACCESSED", "SHARE_LINK_REVOKED"],
  appointments: ["CALENDAR_APPOINTMENT_BOOKED"],
  gmail: ["GMAIL_MEDICAL_DETECTED"],
};

export interface TimelineGroupDto {
  dateKey: string;
  label: string;
  events: ActivityEventDto[];
}

export function resolveEventTypesForCategory(
  category: TimelineCategoryFilter,
): ActivityEventType[] | undefined {
  if (category === "all") return undefined;
  return CATEGORY_TO_EVENT_TYPES[category];
}

export function formatTimelineDateHeader(isoTimestamp: string, now: Date = new Date()): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return "Unknown Date";

  if (isToday(parsed)) return "Today";
  if (isYesterday(parsed)) return "Yesterday";

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventMidnight = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const diffDays = Math.round(
    (todayMidnight.getTime() - eventMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return format(parsed, "MMM d, yyyy");
}

export function groupActivityEventsByDate(
  events: ActivityEventDto[],
  now: Date = new Date(),
): TimelineGroupDto[] {
  const groups = new Map<string, TimelineGroupDto>();

  for (const event of events) {
    const parsed = new Date(event.createdAt);
    const dateKey = Number.isNaN(parsed.getTime()) ? "unknown" : format(parsed, "yyyy-MM-dd");
    const existing = groups.get(dateKey);

    if (existing) {
      existing.events.push(event);
    } else {
      groups.set(dateKey, {
        dateKey,
        label: formatTimelineDateHeader(event.createdAt, now),
        events: [event],
      });
    }
  }

  return Array.from(groups.values());
}

export async function getTimelineFeed(
  client: SupabaseClient<Database>,
  userId: string,
  filters: {
    page: number;
    pageSize: number;
    profileId?: string | "all";
    category?: TimelineCategoryFilter;
    eventType?: ActivityEventType | "all";
  },
): Promise<{ groups: TimelineGroupDto[]; pagination: PaginationMeta }> {
  const categoryEventTypes =
    filters.category && filters.category !== "all"
      ? resolveEventTypesForCategory(filters.category)
      : undefined;

  const result = await listActivityEvents(client, userId, {
    page: filters.page,
    pageSize: filters.pageSize,
    profileId: filters.profileId,
    eventType: filters.eventType,
    eventTypes: categoryEventTypes,
  });

  return {
    groups: groupActivityEventsByDate(result.items),
    pagination: result.pagination,
  };
}
