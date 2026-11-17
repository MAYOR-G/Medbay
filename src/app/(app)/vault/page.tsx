import { redirect } from "next/navigation";
import { VaultFeedClient } from "@/components/vault";
import { vaultSearchParamsSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listDocumentsByUser, listProfilesByUser } from "@/server/repositories";

interface VaultPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VaultPage({ searchParams }: VaultPageProps) {
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
    page: typeof rawSearch.page === "string" ? rawSearch.page : undefined,
    pageSize: typeof rawSearch.pageSize === "string" ? rawSearch.pageSize : undefined,
    profileId: typeof rawSearch.profileId === "string" ? rawSearch.profileId : undefined,
    category: typeof rawSearch.category === "string" ? rawSearch.category : undefined,
    q: typeof rawSearch.q === "string" ? rawSearch.q : undefined,
  });

  const filters = parsedParams.success
    ? parsedParams.data
    : { page: 1, pageSize: 20, profileId: "all" as const, category: "all" as const, q: "" };

  const [documentsPage, profiles] = await Promise.all([
    listDocumentsByUser(supabase, user.id, {
      page: filters.page,
      pageSize: filters.pageSize,
      profileId: filters.profileId,
      category: filters.category,
      q: filters.q,
    }),
    listProfilesByUser(supabase, user.id),
  ]);

  return (
    <VaultFeedClient
      documents={documentsPage.items}
      profiles={profiles}
      activeCategory={filters.category}
      activeProfileFilter={filters.profileId}
      initialQuery={filters.q}
      totalCount={documentsPage.pagination.totalCount}
    />
  );
}
