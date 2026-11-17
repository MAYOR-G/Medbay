"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import type { z } from "zod";
import { ConflictError, ValidationError, type ApiResponse } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import {
  dismissNotificationSchema,
  importGmailAttachmentSchema,
  markNotificationsReadSchema,
  type DismissNotificationInput,
  type MarkNotificationsReadInput,
} from "@/lib/schemas";
import { runAgent1Ingestion } from "@/server/agents/ingestion.graph";
import { fetchMedicalAttachmentsFromMessage } from "@/server/integrations";
import {
  dismissNotification,
  getNotificationById,
  markNotificationImported,
  markNotificationsRead,
} from "@/server/repositories";
import { uploadMedicalDocument } from "@/server/services";
import type { IngestionStatus } from "@/types/domain.types";
import { executeServerAction, parseWithZod, requireAuthenticatedContext } from "./action-utils";

export async function markNotificationsReadAction(
  input: MarkNotificationsReadInput,
): Promise<ApiResponse<{ updatedCount: number }>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(markNotificationsReadSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const updatedCount = await markNotificationsRead(supabase, userId, {
      notificationId: parsed.notificationId,
      markAll: parsed.markAll,
    });

    revalidatePath("/notifications");
    revalidatePath("/vault");

    return { updatedCount };
  });
}

export async function dismissNotificationAction(
  input: DismissNotificationInput,
): Promise<ApiResponse<{ deletedId: string }>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(dismissNotificationSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const deletedId = await dismissNotification(supabase, userId, parsed.notificationId);
    revalidatePath("/notifications");

    return { deletedId };
  });
}

export async function importGmailAttachmentAction(
  input: z.input<typeof importGmailAttachmentSchema>,
): Promise<
  ApiResponse<{
    importedDocuments: Array<{ id: string; title: string; ingestionStatus: IngestionStatus }>;
  }>
> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(importGmailAttachmentSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const notification = await getNotificationById(supabase, userId, parsed.notificationId);
    if (notification.importedDocumentId) {
      throw new ConflictError(
        "Attachments from this notification have already been imported.",
        "ALREADY_IMPORTED",
      );
    }

    if (!notification.gmailMessageId) {
      throw new ValidationError("This notification does not reference a Gmail message.");
    }

    const attachments = await fetchMedicalAttachmentsFromMessage(
      userId,
      notification.gmailMessageId,
      supabase,
    );

    if (attachments.length === 0) {
      throw new ValidationError(
        "No supported medical attachments (PDF, image, DOCX, or TXT under 25 MB) were found in this email.",
      );
    }

    const importedDocuments: Array<{
      id: string;
      title: string;
      ingestionStatus: IngestionStatus;
    }> = [];

    for (const attachment of attachments) {
      const { document, autoDetectProfile } = await uploadMedicalDocument(supabase, {
        userId,
        fileBuffer: attachment.buffer,
        originalFilename: attachment.filename,
        declaredMimeType: attachment.mimeType,
        profileId: parsed.profileId ?? null,
        title: null,
        source: "gmail_import",
      });

      importedDocuments.push({
        id: document.id,
        title: document.title,
        ingestionStatus: document.ingestionStatus,
      });

      after(async () => {
        await runAgent1Ingestion({
          documentId: document.id,
          userId,
          selectedProfileId: document.profileId,
          autoDetectProfile,
        });
      });
    }

    const firstImported = importedDocuments[0];
    if (firstImported) {
      await markNotificationImported(supabase, userId, notification.id, firstImported.id);
    }

    revalidatePath("/notifications");
    revalidatePath("/vault");
    revalidatePath("/timeline");

    logEvent("info", {
      service: "notifications",
      event: "gmail_attachments_imported",
      userId,
      meta: { count: importedDocuments.length },
    });

    return { importedDocuments };
  });
}
