import type { SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { getServerEnv } from "@/lib/env";
import { deletePushSubscription, listPushSubscriptionsForWorker } from "@/server/repositories";
import type { Database } from "@/types/database.types";

let vapidConfigured = false;

function ensureVapidConfigured(): void {
  if (vapidConfigured) return;
  const env = getServerEnv();
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
  vapidConfigured = true;
}

function getPushStatusCode(err: unknown): number | null {
  if (err && typeof err === "object" && "statusCode" in err) {
    const code = (err as { statusCode?: unknown }).statusCode;
    if (typeof code === "number") return code;
  }
  return null;
}

/**
 * Dispatches encrypted VAPID Web Push payloads to a user's registered devices.
 * Automatically purges stale 404/410 endpoints while preserving in-app alerts.
 */
export async function sendWebPushToUser(
  adminClient: SupabaseClient<Database>,
  userId: string,
  payload: {
    title: string;
    body: string;
    url?: string;
  },
): Promise<{ sentCount: number; purgedCount: number }> {
  ensureVapidConfigured();
  const subscriptions = await listPushSubscriptionsForWorker(adminClient, userId);

  if (subscriptions.length === 0) {
    return { sentCount: 0, purgedCount: 0 };
  }

  const serializedPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/notifications",
  });

  let sentCount = 0;
  let purgedCount = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dhKey,
            auth: sub.authKey,
          },
        },
        serializedPayload,
        { timeout: 8_000 },
      );
      sentCount += 1;
    } catch (err) {
      const statusCode = getPushStatusCode(err);
      if (statusCode === 404 || statusCode === 410) {
        await deletePushSubscription(adminClient, userId, sub.endpoint).catch(() => undefined);
        purgedCount += 1;
      }
    }
  }

  return { sentCount, purgedCount };
}
