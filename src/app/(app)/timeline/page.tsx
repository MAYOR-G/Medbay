import { redirect } from "next/navigation";
import { TimelineFeed } from "@/components/timeline";
import { timelineSearchParamsSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listProfilesByUser } from "@/server/repositories";
import {
  getTimelineFeed,
  TIMELINE_CATEGORY_FILTERS,
  type TimelineCategoryFilter,
} from "@/server/services";

interface TimelinePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const rawSearch = await searchParams;
  const parsed = timelineSearchParamsSchema.safeParse({
    page: typeof rawSearch.page === "string" ? rawSearch.page : undefined,
    pageSize: typeof rawSearch.pageSize === "string" ? rawSearch.pageSize : undefined,
    profileId: typeof rawSearch.profileId === "string" ? rawSearch.profileId : undefined,
    eventType: typeof rawSearch.eventType === "string" ? rawSearch.eventType : undefined,
  });

  const filters = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20, profileId: "all" as const, eventType: "all" as const };

  const rawCategory = typeof rawSearch.category === "string" ? rawSearch.category : "all";
  const activeCategory: TimelineCategoryFilter = (
    TIMELINE_CATEGORY_FILTERS as readonly string[]
  ).includes(rawCategory)
    ? (rawCategory as TimelineCategoryFilter)
    : "all";

  const [timeline, profiles] = await Promise.all([
    getTimelineFeed(supabase, user.id, {
      page: filters.page,
      pageSize: filters.pageSize,
      profileId: filters.profileId,
      category: activeCategory,
      eventType: filters.eventType,
    }),
    listProfilesByUser(supabase, user.id),
  ]);

  return (
    <TimelineFeed
      groups={timeline.groups}
      profiles={profiles}
      activeCategory={activeCategory}
      pagination={timeline.pagination}
    />
  );
}
