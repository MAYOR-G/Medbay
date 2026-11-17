import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import * as integrations from "@/server/integrations";
import * as repositories from "@/server/repositories";
import { isMedicalEmailCandidate } from "@/server/integrations/google-workspace.adapter";
import {
  runDailyGmailMedicalScan,
  verifyCronBearerSecret,
} from "@/server/services/gmail-scanner.service";
import type { Database } from "@/types/database.types";

const dummyAdmin = {} as SupabaseClient<Database>;

describe("gmail-scanner.service", () => {
  it("verifies CRON_SECRET using constant-time bearer comparison", () => {
    const secret = "super-secret-cron-token-32-chars-minimum";
    expect(verifyCronBearerSecret(`Bearer ${secret}`, secret)).toBe(true);
    expect(verifyCronBearerSecret("Bearer wrong-token", secret)).toBe(false);
    expect(verifyCronBearerSecret(null, secret)).toBe(false);
    expect(verifyCronBearerSecret(`Basic ${secret}`, secret)).toBe(false);
  });

  it("classifies medical correspondence accurately while ignoring non-medical mail", () => {
    expect(
      isMedicalEmailCandidate(
        "Your Quest Diagnostics Lab Results Are Ready",
        "results@questdiagnostics.com",
        "View your recent metabolic panel.",
      ),
    ).toBe(true);

    expect(
      isMedicalEmailCandidate(
        "Weekly Grocery Newsletter",
        "deals@market.example",
        "Save 20% on organic produce this weekend.",
      ),
    ).toBe(false);
  });

  it("deduplicates repeat gmail_message_id alerts and dispatches push only when new alerts exist", async () => {
    vi.spyOn(repositories, "listEligibleUsersForGmailScan").mockResolvedValueOnce([
      { id: "user-1", encryptedGoogleRefreshToken: "enc" },
    ]);
    vi.spyOn(integrations, "scanRecentMedicalEmails").mockResolvedValueOnce([
      {
        messageId: "gmail-msg-duplicate",
        subject: "Lab Result Ready",
        sender: "lab@clinic.org",
        snippet: "CBC report attached",
        hasAttachments: true,
      },
    ]);
    // Duplicate message returns null from upsert(ignoreDuplicates: true)
    vi.spyOn(repositories, "createNotificationFromGmail").mockResolvedValueOnce(null);
    const pushSpy = vi.spyOn(integrations, "sendWebPushToUser");
    vi.spyOn(repositories, "updateLastGmailScanAt").mockResolvedValueOnce();
    vi.spyOn(repositories, "pruneStaleRateLimitBuckets").mockResolvedValueOnce();

    const summary = await runDailyGmailMedicalScan(dummyAdmin);

    expect(summary).toEqual({
      usersScanned: 1,
      alertsCreated: 0,
      pushNotificationsSent: 0,
      staleEndpointsPurged: 0,
    });
    expect(pushSpy).not.toHaveBeenCalled();
  });
});
