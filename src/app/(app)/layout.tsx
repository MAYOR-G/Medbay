import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";
import { PRIVATE_NOINDEX_ROBOTS } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ensurePrimarySelfProfile,
  getUnreadNotificationCount,
  getUserAccount,
  listChatThreadsByUser,
  listProfilesByUser,
  upsertUserFromOAuth,
} from "@/server/repositories";

export const metadata: Metadata = {
  title: "Private Family Vault",
  robots: PRIVATE_NOINDEX_ROBOTS,
};

export default async function AuthenticatedAppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fallbackName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    user.email?.split("@")[0] ||
    "MedBay User";

  let userAccount;
  try {
    userAccount = await getUserAccount(supabase, user.id);
  } catch {
    userAccount = await upsertUserFromOAuth(supabase, {
      id: user.id,
      email: user.email ?? "",
      fullName: fallbackName,
      avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    });
  }

  let profiles = await listProfilesByUser(supabase, user.id);
  if (profiles.length === 0) {
    const primary = await ensurePrimarySelfProfile(supabase, user.id, userAccount.fullName);
    profiles = [primary];
  }

  const [unreadNotificationCount, threads] = await Promise.all([
    getUnreadNotificationCount(supabase, user.id),
    listChatThreadsByUser(supabase, user.id, 30),
  ]);

  return (
    <AppShell
      user={userAccount}
      profiles={profiles}
      unreadNotificationCount={unreadNotificationCount}
      initialThreads={threads}
    >
      {children}
    </AppShell>
  );
}
