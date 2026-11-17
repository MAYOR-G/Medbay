"use server";

import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import {
  createShareLinkSchema,
  revokeShareLinkSchema,
  type CreateShareLinkInput,
  type RevokeShareLinkInput,
} from "@/lib/schemas";
import { createDocumentShareLink, revokeDocumentShareLink } from "@/server/services";
import type { ShareDurationPreset } from "@/types/domain.types";
import { executeServerAction, parseWithZod, requireAuthenticatedContext } from "./action-utils";

export async function createShareLinkAction(input: CreateShareLinkInput): Promise<
  ApiResponse<{
    id: string;
    documentId: string;
    token: string;
    shareUrl: string;
    durationPreset: ShareDurationPreset;
    expiresAt: string;
    viewCount: number;
    createdAt: string;
  }>
> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(createShareLinkSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { shareLink, shareUrl } = await createDocumentShareLink(supabase, userId, {
      documentId: parsed.documentId,
      durationPreset: parsed.durationPreset,
      appBaseUrl,
    });

    revalidatePath(`/vault/${parsed.documentId}`);
    revalidatePath("/timeline");

    logEvent("info", {
      service: "share",
      event: "share_link_created",
      userId,
      documentId: parsed.documentId,
      meta: { durationPreset: parsed.durationPreset },
    });

    return {
      id: shareLink.id,
      documentId: shareLink.documentId,
      token: shareLink.token,
      shareUrl,
      durationPreset: shareLink.durationPreset,
      expiresAt: shareLink.expiresAt,
      viewCount: shareLink.viewCount,
      createdAt: shareLink.createdAt,
    };
  });
}

export async function revokeShareLinkAction(
  input: RevokeShareLinkInput,
): Promise<ApiResponse<{ id: string; revokedAt: string }>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(revokeShareLinkSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const revoked = await revokeDocumentShareLink(supabase, userId, parsed.shareLinkId);

    revalidatePath(`/vault/${revoked.documentId}`);
    revalidatePath("/timeline");

    logEvent("info", {
      service: "share",
      event: "share_link_revoked",
      userId,
      documentId: revoked.documentId,
      meta: { shareLinkId: revoked.id },
    });

    return {
      id: revoked.id,
      revokedAt: revoked.revokedAt ?? new Date().toISOString(),
    };
  });
}
