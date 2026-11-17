import type { SupabaseClient } from "@supabase/supabase-js";
import { ConflictError, ExternalProviderError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/types/database.types";
import type {
  NotificationItemDto,
  NotificationType,
  PaginatedResult,
  PushSubscriptionDto,
} from "@/types/domain.types";

type NotificationRow = Database["public"]["Tables"]["notification_items"]["Row"];
type PushRow = Database["public"]["Tables"]["push_subscriptions"]["Row"];

function mapNotificationRowToDto(row: NotificationRow): NotificationItemDto {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    gmailMessageId: row.gmail_message_id,
    emailSubject: row.email_subject,
    emailSender: row.email_sender,
    hasAttachments: row.has_attachments,
    isRead: row.is_read,
    importedDocumentId: row.imported_document_id,
    createdAt: row.created_at,
  };
}

function mapPushRowToDto(row: PushRow): PushSubscriptionDto {
  return {
    id: row.id,
    userId: row.user_id,
    endpoint: row.endpoint,
    deviceLabel: row.device_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listNotificationsByUser(
  client: SupabaseClient<Database>,
  userId: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResult<NotificationItemDto>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await client
    .from("notification_items")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new ExternalProviderError(`Failed to load notifications: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const items = (data ?? []).map(mapNotificationRowToDto);

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalCount,
      hasMore: from + items.length < totalCount,
    },
  };
}

export async function getUnreadNotificationCount(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await client
    .from("notification_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new ExternalProviderError(`Failed to count unread notifications: ${error.message}`);
  }
  return count ?? 0;
}

export async function getNotificationById(
  client: SupabaseClient<Database>,
  userId: string,
  notificationId: string,
): Promise<NotificationItemDto> {
  const { data, error } = await client
    .from("notification_items")
    .select("*")
    .eq("id", notificationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to load notification: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Notification item not found.");
  }
  return mapNotificationRowToDto(data);
}

/**
 * Idempotently inserts a Gmail medical alert. Returns null if gmail_message_id already exists.
 */
export async function createNotificationFromGmail(
  adminClient: SupabaseClient<Database>,
  input: {
    userId: string;
    title: string;
    body: string;
    gmailMessageId: string;
    emailSubject: string;
    emailSender: string;
    hasAttachments: boolean;
  },
): Promise<NotificationItemDto | null> {
  const { data, error } = await adminClient
    .from("notification_items")
    .upsert(
      {
        user_id: input.userId,
        type: "gmail_medical_found",
        title: input.title,
        body: input.body,
        gmail_message_id: input.gmailMessageId,
        email_subject: input.emailSubject,
        email_sender: input.emailSender,
        has_attachments: input.hasAttachments,
        is_read: false,
      },
      { onConflict: "user_id,gmail_message_id", ignoreDuplicates: true },
    )
    .select("*")
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to insert Gmail notification: ${error.message}`);
  }
  return data ? mapNotificationRowToDto(data) : null;
}

export async function markNotificationsRead(
  client: SupabaseClient<Database>,
  userId: string,
  input: { notificationId?: string; markAll?: boolean },
): Promise<number> {
  let query = client
    .from("notification_items")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (!input.markAll && input.notificationId) {
    query = query.eq("id", input.notificationId);
  }

  const { data, error } = await query.select("id");
  if (error) {
    throw new ExternalProviderError(`Failed to mark notifications read: ${error.message}`);
  }
  return data?.length ?? 0;
}

export async function markNotificationImported(
  client: SupabaseClient<Database>,
  userId: string,
  notificationId: string,
  importedDocumentId: string,
): Promise<NotificationItemDto> {
  const existing = await getNotificationById(client, userId, notificationId);
  if (existing.importedDocumentId) {
    throw new ConflictError(
      "Attachments from this alert have already been imported.",
      "ALREADY_IMPORTED",
    );
  }

  const { data, error } = await client
    .from("notification_items")
    .update({
      imported_document_id: importedDocumentId,
      is_read: true,
    })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new ExternalProviderError(
      `Failed to update imported notification: ${error?.message ?? "unknown"}`,
    );
  }
  return mapNotificationRowToDto(data);
}

export async function dismissNotification(
  client: SupabaseClient<Database>,
  userId: string,
  notificationId: string,
): Promise<string> {
  const { error, count } = await client
    .from("notification_items")
    .delete({ count: "exact" })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    throw new ExternalProviderError(`Failed to dismiss notification: ${error.message}`);
  }
  if (!count) {
    throw new NotFoundError("Notification item not found.");
  }
  return notificationId;
}

export async function upsertPushSubscription(
  client: SupabaseClient<Database>,
  input: {
    userId: string;
    endpoint: string;
    p256dhKey: string;
    authKey: string;
    deviceLabel?: string;
  },
): Promise<PushSubscriptionDto> {
  const { data, error } = await client
    .from("push_subscriptions")
    .upsert(
      {
        user_id: input.userId,
        endpoint: input.endpoint,
        p256dh_key: input.p256dhKey,
        auth_key: input.authKey,
        device_label: input.deviceLabel ?? null,
      },
      { onConflict: "endpoint" },
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new ExternalProviderError(
      `Failed to save Web Push subscription: ${error?.message ?? "unknown"}`,
    );
  }
  return mapPushRowToDto(data);
}

export async function deletePushSubscription(
  client: SupabaseClient<Database>,
  userId: string,
  endpoint: string,
): Promise<void> {
  const { error } = await client
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint);

  if (error) {
    throw new ExternalProviderError(`Failed to remove Web Push subscription: ${error.message}`);
  }
}

export async function listPushSubscriptionsForWorker(
  adminClient: SupabaseClient<Database>,
  userId: string,
): Promise<Array<{ id: string; endpoint: string; p256dhKey: string; authKey: string }>> {
  const { data, error } = await adminClient
    .from("push_subscriptions")
    .select("id, endpoint, p256dh_key, auth_key")
    .eq("user_id", userId);

  if (error) {
    throw new ExternalProviderError(`Failed to load push subscriptions: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    endpoint: row.endpoint,
    p256dhKey: row.p256dh_key,
    authKey: row.auth_key,
  }));
}
