import { google } from "googleapis";
import { decryptSecret } from "@/lib/crypto";
import { getServerEnv } from "@/lib/env";
import { ExternalProviderError, ForbiddenError } from "@/lib/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEncryptedRefreshTokenForWorker, markGoogleScopesInvalid } from "@/server/repositories";
import type { CalendarEventArtifact } from "@/types/domain.types";

async function withGoogleTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new ExternalProviderError(`${label} timed out.`)), 12_000);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isInvalidGrantError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("invalid_grant") || msg.includes("token has been expired or revoked");
}

export async function getAuthorizedGoogleOAuthClient(userId: string) {
  const adminClient = createSupabaseAdminClient();
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ENCRYPTION_SECRET } = getServerEnv();
  const tokenRecord = await getEncryptedRefreshTokenForWorker(adminClient, userId);

  if (!tokenRecord.googleScopesValid || !tokenRecord.encryptedRefreshToken) {
    throw new ForbiddenError(
      "Google Calendar & Gmail permissions need to be reconnected in Family & Settings.",
    );
  }

  const refreshToken = decryptSecret(tokenRecord.encryptedRefreshToken, ENCRYPTION_SECRET);
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    await withGoogleTimeout(oauth2Client.getAccessToken(), "Google OAuth token refresh");
    return oauth2Client;
  } catch (err) {
    if (isInvalidGrantError(err)) {
      await markGoogleScopesInvalid(adminClient, userId).catch(() => undefined);
      throw new ForbiddenError(
        "Your Google permissions were revoked. Please reconnect Google in Family & Settings.",
      );
    }
    throw new ExternalProviderError(
      `Failed to refresh Google access token: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}

/**
 * Inserts a medical appointment onto the user's primary Google Calendar.
 */
export async function createCalendarEvent(
  userId: string,
  input: {
    title: string;
    startIso: string;
    endIso: string;
    timezone: string;
    location: string | null;
    description: string | null;
  },
): Promise<CalendarEventArtifact> {
  const adminClient = createSupabaseAdminClient();
  const auth = await getAuthorizedGoogleOAuthClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  try {
    const response = await withGoogleTimeout(
      calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: input.title,
          location: input.location ?? undefined,
          description: input.description ?? undefined,
          start: {
            dateTime: input.startIso,
            timeZone: input.timezone,
          },
          end: {
            dateTime: input.endIso,
            timeZone: input.timezone,
          },
        },
      }),
      "Google Calendar event creation",
    );

    const created = response.data;
    if (!created.id || !created.htmlLink) {
      throw new ExternalProviderError("Google Calendar returned an incomplete event response.");
    }

    return {
      eventId: created.id,
      title: created.summary ?? input.title,
      startIso: created.start?.dateTime ?? input.startIso,
      endIso: created.end?.dateTime ?? input.endIso,
      timezone: input.timezone,
      location: created.location ?? input.location,
      htmlLink: created.htmlLink,
    };
  } catch (err) {
    if (isInvalidGrantError(err)) {
      await markGoogleScopesInvalid(adminClient, userId).catch(() => undefined);
      throw new ForbiddenError(
        "Google Calendar permissions were revoked. Please reconnect Google in Family & Settings.",
      );
    }
    if (err instanceof ExternalProviderError || err instanceof ForbiddenError) {
      throw err;
    }
    throw new ExternalProviderError(
      `Google Calendar booking failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}
