import { redirect } from "next/navigation";
import { DashboardClientView } from "@/components/dashboard";
import { vaultSearchParamsSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserAccount, listDocumentsByUser, listProfilesByUser } from "@/server/repositories";
import { getTimelineFeed } from "@/server/services";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const rawSearch = await searchParams;
  const parsedParams = vaultSearchParamsSchema.safeParse({
    profileId: typeof rawSearch.profileId === "string" ? rawSearch.profileId : undefined,
  });
  const activeProfileId = parsedParams.success ? parsedParams.data.profileId : "all";

  const [userAccount, profiles, documentsPage, timeline] = await Promise.all([
    getUserAccount(supabase, user.id),
    listProfilesByUser(supabase, user.id),
    listDocumentsByUser(supabase, user.id, {
      page: 1,
      pageSize: 12,
      profileId: activeProfileId,
    }),
    getTimelineFeed(supabase, user.id, {
      page: 1,
      pageSize: 8,
      profileId: activeProfileId,
      category: "all",
      eventType: "all",
    }),
  ]);

  return (
    <DashboardClientView
      user={userAccount}
      profiles={profiles}
      recentDocuments={documentsPage.items}
      totalDocumentsCount={documentsPage.pagination.totalCount}
      timelineGroups={timeline.groups}
      totalEventsCount={timeline.pagination.totalCount}
      activeProfileFilter={activeProfileId}
    />
  );
}
