import type { SupabaseClient } from "@supabase/supabase-js";
import { google, type gmail_v1 } from "googleapis";
import { decryptSecret } from "@/lib/crypto";
import { getServerEnv } from "@/lib/env";
import { ExternalProviderError, ForbiddenError } from "@/lib/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEncryptedRefreshTokenForWorker, markGoogleScopesInvalid } from "@/server/repositories";
import type { Database } from "@/types/database.types";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  type AllowedDocumentMimeType,
  type CalendarEventArtifact,
} from "@/types/domain.types";

const MEDICAL_KEYWORDS = [
  "lab result",
  "laboratory",
  "test result",
  "blood test",
  "blood panel",
  "prescription",
  "pharmacy",
  "rx",
  "refill",
  "appointment",
  "diagnosis",
  "diagnostic",
  "hospital",
  "clinic",
  "radiology",
  "imaging",
  "mri",
  "ct scan",
  "x-ray",
  "discharge summary",
  "patient portal",
  "mychart",
  "immunization",
  "vaccine",
  "referral",
  "physician",
  "pathology",
  "quest diagnostics",
  "labcorp",
] as const;

export interface ScannedMedicalEmail {
  messageId: string;
  subject: string;
  sender: string;
  snippet: string;
  hasAttachments: boolean;
}

export interface DownloadedGmailAttachment {
  filename: string;
  mimeType: AllowedDocumentMimeType;
  buffer: Buffer;
}

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

export function isMedicalEmailCandidate(subject: string, sender: string, snippet: string): boolean {
  const haystack = `${subject} ${sender} ${snippet}`.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => haystack.includes(kw));
}

function collectMessageParts(
  part: gmail_v1.Schema$MessagePart | undefined,
  acc: gmail_v1.Schema$MessagePart[],
): void {
  if (!part) return;
  acc.push(part);
  if (part.parts) {
    for (const child of part.parts) {
      collectMessageParts(child, acc);
    }
  }
}

function extractHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
): string {
  if (!headers) return "";
  const match = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return match?.value?.trim() ?? "";
}

export async function getAuthorizedGoogleOAuthClient(
  userId: string,
  clientOverride?: SupabaseClient<Database>,
) {
  const dbClient = clientOverride ?? createSupabaseAdminClient();
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ENCRYPTION_SECRET } = getServerEnv();
  const tokenRecord = await getEncryptedRefreshTokenForWorker(dbClient, userId);

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
      await markGoogleScopesInvalid(dbClient, userId).catch(() => undefined);
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
  clientOverride?: SupabaseClient<Database>,
): Promise<CalendarEventArtifact> {
  const dbClient = clientOverride ?? createSupabaseAdminClient();
  const auth = await getAuthorizedGoogleOAuthClient(userId, dbClient);
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
      await markGoogleScopesInvalid(dbClient, userId).catch(() => undefined);
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

/**
 * Queries Gmail (gmail.readonly) for medical emails received in the past 24 hours.
 */
export async function scanRecentMedicalEmails(
  userId: string,
  adminClient: SupabaseClient<Database>,
): Promise<ScannedMedicalEmail[]> {
  const auth = await getAuthorizedGoogleOAuthClient(userId, adminClient);
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const listResponse = await withGoogleTimeout(
      gmail.users.messages.list({
        userId: "me",
        q: "newer_than:1d",
        maxResults: 25,
      }),
      "Gmail messages.list",
    );

    const refs = listResponse.data.messages ?? [];
    const results: ScannedMedicalEmail[] = [];

    for (const ref of refs) {
      if (!ref.id) continue;
      const msgResponse = await withGoogleTimeout(
        gmail.users.messages.get({
          userId: "me",
          id: ref.id,
          format: "full",
        }),
        "Gmail messages.get",
      );

      const message = msgResponse.data;
      const headers = message.payload?.headers;
      const subject = extractHeader(headers, "Subject") || "Medical Update";
      const sender = extractHeader(headers, "From") || "Unknown Sender";
      const snippet = (message.snippet ?? "").trim();

      if (!isMedicalEmailCandidate(subject, sender, snippet)) {
        continue;
      }

      const parts: gmail_v1.Schema$MessagePart[] = [];
      collectMessageParts(message.payload, parts);
      const hasAttachments = parts.some(
        (p) =>
          Boolean(p.filename && p.filename.trim().length > 0 && p.body?.attachmentId) &&
          (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(p.mimeType ?? ""),
      );

      results.push({
        messageId: ref.id,
        subject: subject.slice(0, 300),
        sender: sender.slice(0, 320),
        snippet: snippet.slice(0, 500),
        hasAttachments,
      });
    }

    return results;
  } catch (err) {
    if (isInvalidGrantError(err)) {
      await markGoogleScopesInvalid(adminClient, userId).catch(() => undefined);
      throw new ForbiddenError("Gmail scopes revoked.");
    }
    if (err instanceof ExternalProviderError || err instanceof ForbiddenError) {
      throw err;
    }
    throw new ExternalProviderError(
      `Gmail scan failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}

/**
 * Downloads supported medical attachments from a flagged Gmail message.
 */
export async function fetchMedicalAttachmentsFromMessage(
  userId: string,
  gmailMessageId: string,
  client: SupabaseClient<Database>,
): Promise<DownloadedGmailAttachment[]> {
  const auth = await getAuthorizedGoogleOAuthClient(userId, client);
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const msgResponse = await withGoogleTimeout(
      gmail.users.messages.get({
        userId: "me",
        id: gmailMessageId,
        format: "full",
      }),
      "Gmail message fetch",
    );

    const parts: gmail_v1.Schema$MessagePart[] = [];
    collectMessageParts(msgResponse.data.payload, parts);

    const attachments: DownloadedGmailAttachment[] = [];
    for (const part of parts) {
      const attachmentId = part.body?.attachmentId;
      const filename = part.filename?.trim();
      const mimeType = part.mimeType ?? "";

      if (
        !attachmentId ||
        !filename ||
        !(ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType)
      ) {
        continue;
      }

      const attachResponse = await withGoogleTimeout(
        gmail.users.messages.attachments.get({
          userId: "me",
          messageId: gmailMessageId,
          id: attachmentId,
        }),
        "Gmail attachment fetch",
      );

      const base64Data = attachResponse.data.data;
      if (!base64Data) continue;

      const buffer = Buffer.from(base64Data, "base64url");
      if (buffer.length > 0 && buffer.length <= MAX_DOCUMENT_SIZE_BYTES) {
        attachments.push({
          filename,
          mimeType: mimeType as AllowedDocumentMimeType,
          buffer,
        });
      }
    }

    return attachments;
  } catch (err) {
    if (isInvalidGrantError(err)) {
      await markGoogleScopesInvalid(client, userId).catch(() => undefined);
      throw new ForbiddenError(
        "Google permissions were revoked. Please reconnect Google in Family & Settings.",
      );
    }
    if (err instanceof ExternalProviderError || err instanceof ForbiddenError) {
      throw err;
    }
    throw new ExternalProviderError(
      `Failed to download Gmail attachment: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}
