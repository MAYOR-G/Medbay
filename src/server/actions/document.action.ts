"use server";

import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import {
  deleteDocumentSchema,
  reassignDocumentProfileSchema,
  updateDocumentMetadataSchema,
  type DeleteDocumentInput,
  type ReassignDocumentProfileInput,
  type UpdateDocumentMetadataInput,
} from "@/lib/schemas";
import {
  deleteMedicalDocument,
  reassignDocumentFamilyProfile,
  updateDocumentDetails,
} from "@/server/services";
import type { MedicalDocumentSummaryDto } from "@/types/domain.types";
import { executeServerAction, parseWithZod, requireAuthenticatedContext } from "./action-utils";

function revalidateDocumentRoutes(documentId?: string): void {
  revalidatePath("/vault");
  revalidatePath("/timeline");
  revalidatePath("/profiles");
  if (documentId) {
    revalidatePath(`/vault/${documentId}`);
  }
}

export async function updateDocumentMetadataAction(
  input: UpdateDocumentMetadataInput,
): Promise<ApiResponse<MedicalDocumentSummaryDto>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(updateDocumentMetadataSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const updated = await updateDocumentDetails(supabase, userId, {
      documentId: parsed.documentId,
      title: parsed.title,
      category: parsed.category,
      documentDate: parsed.documentDate,
    });

    revalidateDocumentRoutes(updated.id);
    logEvent("info", {
      service: "document",
      event: "document_metadata_updated",
      userId,
      documentId: updated.id,
    });

    return updated;
  });
}

export async function reassignDocumentProfileAction(input: ReassignDocumentProfileInput): Promise<
  ApiResponse<{
    documentId: string;
    profileId: string;
    profileMatchConfidence: MedicalDocumentSummaryDto["profileMatchConfidence"];
  }>
> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(reassignDocumentProfileSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const updated = await reassignDocumentFamilyProfile(supabase, userId, {
      documentId: parsed.documentId,
      profileId: parsed.profileId,
    });

    revalidateDocumentRoutes(updated.id);
    logEvent("info", {
      service: "document",
      event: "document_profile_reassigned",
      userId,
      documentId: updated.id,
      meta: { profileId: updated.profileId },
    });

    return {
      documentId: updated.id,
      profileId: updated.profileId,
      profileMatchConfidence: updated.profileMatchConfidence,
    };
  });
}

export async function deleteDocumentAction(
  input: DeleteDocumentInput,
): Promise<ApiResponse<{ deletedId: string }>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(deleteDocumentSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const deletedId = await deleteMedicalDocument(supabase, userId, parsed.documentId);

    revalidateDocumentRoutes(deletedId);
    logEvent("info", {
      service: "document",
      event: "document_deleted",
      userId,
      documentId: deletedId,
    });

    return { deletedId };
  });
}
