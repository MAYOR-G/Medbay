import type { SupabaseClient } from "@supabase/supabase-js";
import { ExternalProviderError } from "@/lib/errors";
import type { Database, Json } from "@/types/database.types";
import type { ActivityEventDto, ActivityEventType, PaginatedResult } from "@/types/domain.types";

type ActivityRow = Database["public"]["Tables"]["activity_events"]["Row"];

function mapActivityRowToDto(row: ActivityRow): ActivityEventDto {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};

  return {
    id: row.id,
    userId: row.user_id,
    profileId: row.profile_id,
    documentId: row.document_id,
    eventType: row.event_type as ActivityEventType,
    description: row.description,
    metadata,
    createdAt: row.created_at,
  };
}

export async function listActivityEvents(
  client: SupabaseClient<Database>,
  userId: string,
  filters: {
    page: number;
    pageSize: number;
    profileId?: string | "all";
    eventType?: ActivityEventType | "all";
  },
): Promise<PaginatedResult<ActivityEventDto>> {
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = client
    .from("activity_events")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.profileId && filters.profileId !== "all") {
    query = query.eq("profile_id", filters.profileId);
  }
  if (filters.eventType && filters.eventType !== "all") {
    query = query.eq("event_type", filters.eventType);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new ExternalProviderError(`Failed to load activity timeline: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const items = (data ?? []).map(mapActivityRowToDto);

  return {
    items,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalCount,
      hasMore: from + items.length < totalCount,
    },
  };
}

export async function createActivityEvent(
  client: SupabaseClient<Database>,
  input: {
    userId: string;
    profileId?: string | null;
    documentId?: string | null;
    eventType: ActivityEventType;
    description: string;
    metadata?: Record<string, Json>;
  },
): Promise<ActivityEventDto> {
  const { data, error } = await client
    .from("activity_events")
    .insert({
      user_id: input.userId,
      profile_id: input.profileId ?? null,
      document_id: input.documentId ?? null,
      event_type: input.eventType,
      description: input.description,
      metadata: (input.metadata ?? {}) as Json,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ExternalProviderError(
      `Failed to record activity event: ${error?.message ?? "unknown"}`,
    );
  }
  return mapActivityRowToDto(data);
}
