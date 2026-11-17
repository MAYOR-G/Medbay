import { timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logEvent } from "@/lib/logger";
import { scanRecentMedicalEmails, sendWebPushToUser } from "@/server/integrations";
import {
  createActivityEvent,
  createNotificationFromGmail,
  listEligibleUsersForGmailScan,
  pruneStaleRateLimitBuckets,
  updateLastGmailScanAt,
} from "@/server/repositories";
import type { Database } from "@/types/database.types";

export interface GmailScanSummary {
  usersScanned: number;
  alertsCreated: number;
  pushNotificationsSent: number;
  staleEndpointsPurged: number;
}

/**
 * Constant-time Bearer token check preventing timing side-channel attacks on cron endpoint.
 */
export function verifyCronBearerSecret(
  authorizationHeader: string | null,
  expectedSecret: string,
): boolean {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return false;
  }
  const providedToken = authorizationHeader.slice(7).trim();
  if (!providedToken || !expectedSecret) {
    return false;
  }

  const providedBuf = Buffer.from(providedToken, "utf8");
  const expectedBuf = Buffer.from(expectedSecret, "utf8");
  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Scans connected Gmail accounts for medical correspondence from the past 24 hours and
 * dispatches strictly in-app + Web Push notifications (zero outbound emails).
 */
export async function runDailyGmailMedicalScan(
  adminClient: SupabaseClient<Database>,
): Promise<GmailScanSummary> {
  const users = await listEligibleUsersForGmailScan(adminClient, 100);
  let usersScanned = 0;
  let alertsCreated = 0;
  let pushNotificationsSent = 0;
  let staleEndpointsPurged = 0;

  for (const user of users) {
    try {
      const candidates = await scanRecentMedicalEmails(user.id, adminClient);
      usersScanned += 1;
      let userNewAlerts = 0;

      for (const email of candidates) {
        const inserted = await createNotificationFromGmail(adminClient, {
          userId: user.id,
          title: email.subject.slice(0, 200),
          body: email.snippet || `Medical correspondence from ${email.sender}`,
          gmailMessageId: email.messageId,
          emailSubject: email.subject,
          emailSender: email.sender,
          hasAttachments: email.hasAttachments,
        });

        if (inserted) {
          alertsCreated += 1;
          userNewAlerts += 1;

          await createActivityEvent(adminClient, {
            userId: user.id,
            eventType: "GMAIL_MEDICAL_DETECTED",
            description: "Detected incoming medical email in 24-hour Gmail scan",
            metadata: {
              notification_id: inserted.id,
              has_attachments: email.hasAttachments,
            },
          });
        }
      }

      if (userNewAlerts > 0) {
        const pushResult = await sendWebPushToUser(adminClient, user.id, {
          title:
            userNewAlerts === 1
              ? "New medical email detected"
              : `${userNewAlerts} new medical emails detected`,
          body: "Open MedBay Notifications to review and import attachments into your vault.",
          url: "/notifications",
        });
        pushNotificationsSent += pushResult.sentCount;
        staleEndpointsPurged += pushResult.purgedCount;
      }

      await updateLastGmailScanAt(adminClient, user.id);
    } catch (err) {
      logEvent("warn", {
        service: "gmail-scanner",
        event: "user_scan_skipped",
        userId: user.id,
        errorCode: err instanceof Error ? err.name : "GMAIL_SCAN_SKIPPED",
      });
    }
  }

  await pruneStaleRateLimitBuckets(adminClient).catch(() => undefined);

  logEvent("info", {
    service: "gmail-scanner",
    event: "daily_scan_completed",
    meta: {
      usersScanned,
      alertsCreated,
      pushNotificationsSent,
      staleEndpointsPurged,
    },
  });

  return {
    usersScanned,
    alertsCreated,
    pushNotificationsSent,
    staleEndpointsPurged,
  };
}
