import { redirect } from "next/navigation";
import { ProfilesClientView } from "@/components/profiles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserAccount } from "@/server/repositories";
import { listFamilyProfilesWithDocCounts } from "@/server/services";

export default async function ProfilesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const [userAccount, profiles] = await Promise.all([
    getUserAccount(supabase, user.id),
    listFamilyProfilesWithDocCounts(supabase, user.id),
  ]);

  return <ProfilesClientView user={userAccount} profiles={profiles} />;
}
