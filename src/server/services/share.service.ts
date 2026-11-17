import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, addHours } from "date-fns";
import { generateShareToken } from "@/lib/crypto";
import { LinkExpiredError } from "@/lib/errors";
import {
  createActivityEvent,
  createShareLink,
  getDocumentStorageLocation,
  listActiveShareLinksByDocument,
  resolveActiveShareLink,
  revokeShareLink,
} from "@/server/repositories";
import type { Database } from "@/types/database.types";
import type { ResolvedShareLinkDto, ShareDurationPreset, ShareLinkDto } from "@/types/domain.types";

const DURATION_LABELS: Record<ShareDurationPreset, string> = {
  "24h": "24 Hours",
  "7d": "7 Days",
  "30d": "30 Days",
};

export function calculateShareExpiration(
  preset: ShareDurationPreset,
  now: Date = new Date(),
): Date {
  if (preset === "24h") return addHours(now, 24);
  if (preset === "7d") return addDays(now, 7);
  return addDays(now, 30);
}

export function buildShareUrl(appBaseUrl: string, token: string): string {
  return `${appBaseUrl.replace(/\/+$/, "")}/share/${token}`;
}

export async function listDocumentActiveShareLinks(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<ShareLinkDto[]> {
  return listActiveShareLinksByDocument(client, userId, documentId);
}

export async function createDocumentShareLink(
  client: SupabaseClient<Database>,
  userId: string,
  input: {
    documentId: string;
    durationPreset: ShareDurationPreset;
    appBaseUrl: string;
  },
): Promise<{ shareLink: ShareLinkDto; shareUrl: string }> {
  const docLocation = await getDocumentStorageLocation(client, userId, input.documentId);
  const token = generateShareToken();
  const expiresAt = calculateShareExpiration(input.durationPreset).toISOString();

  const shareLink = await createShareLink(client, {
    userId,
    documentId: docLocation.id,
    token,
    durationPreset: input.durationPreset,
    expiresAt,
  });

  await createActivityEvent(client, {
    userId,
    documentId: docLocation.id,
    eventType: "SHARE_LINK_CREATED",
    description: `Created ${DURATION_LABELS[input.durationPreset]} expiring share link`,
    metadata: {
      share_link_id: shareLink.id,
      duration_preset: input.durationPreset,
      expires_at: expiresAt,
    },
  });

  return {
    shareLink,
    shareUrl: buildShareUrl(input.appBaseUrl, shareLink.token),
  };
}

export async function revokeDocumentShareLink(
  client: SupabaseClient<Database>,
  userId: string,
  shareLinkId: string,
): Promise<ShareLinkDto> {
  const revoked = await revokeShareLink(client, userId, shareLinkId);

  await createActivityEvent(client, {
    userId,
    documentId: revoked.documentId,
    eventType: "SHARE_LINK_REVOKED",
    description: "Revoked expiring share link",
    metadata: {
      share_link_id: revoked.id,
      duration_preset: revoked.durationPreset,
    },
  });

  return revoked;
}

export async function resolvePublicShareDocument(
  adminClient: SupabaseClient<Database>,
  token: string,
): Promise<ResolvedShareLinkDto> {
  const resolved = await resolveActiveShareLink(adminClient, token);
  if (!resolved) {
    throw new LinkExpiredError("This medical share link has expired or been revoked.");
  }
  return resolved;
}
