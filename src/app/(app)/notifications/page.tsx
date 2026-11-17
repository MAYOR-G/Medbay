import { redirect } from "next/navigation";
import { NotificationList } from "@/components/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount, listNotificationsByUser } from "@/server/repositories";

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const [notificationsPage, unreadCount] = await Promise.all([
    listNotificationsByUser(supabase, user.id, 1, 50),
    getUnreadNotificationCount(supabase, user.id),
  ]);

  return <NotificationList items={notificationsPage.items} unreadCount={unreadCount} />;
}
