import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "@/lib/errors";
import {
  createActivityEvent,
  createDocument,
  deleteDocument,
  getDocumentStorageLocation,
  getPrimaryProfile,
  getProfileById,
  reassignDocumentProfile,
  requeueFailedDocument,
  updateDocumentMetadata,
} from "@/server/repositories";
import { createSignedVaultUrl, deleteVaultFile, uploadVaultFile } from "@/server/integrations";
import type { Database } from "@/types/database.types";
import {
  MAX_DOCUMENT_SIZE_BYTES,
  type DocumentCategory,
  type DocumentSource,
  type MedicalDocumentSummaryDto,
} from "@/types/domain.types";
import { detectMimeFromMagicBytes, sanitizeUploadFilename } from "./document-utils";

export async function uploadMedicalDocument(
  client: SupabaseClient<Database>,
  input: {
    userId: string;
    fileBuffer: Buffer;
    originalFilename: string;
    declaredMimeType: string;
    profileId: string | null;
    title: string | null;
    source?: DocumentSource;
  },
): Promise<{
  document: MedicalDocumentSummaryDto;
  autoDetectProfile: boolean;
}> {
  if (input.fileBuffer.length === 0) {
    throw new ValidationError("Uploaded file is empty.", {
      file: ["Please select a non-empty file."],
    });
  }

  if (input.fileBuffer.length > MAX_DOCUMENT_SIZE_BYTES) {
    throw new ValidationError("File size exceeds the 25 MB maximum limit.", {
      file: ["Maximum allowed file size is 26,214,400 bytes (25 MB)."],
    });
  }

  const verifiedMime = detectMimeFromMagicBytes(
    input.fileBuffer,
    input.declaredMimeType,
    input.originalFilename,
  );
  if (!verifiedMime) {
    throw new ValidationError(
      "Unsupported file format. Please upload a JPEG, PNG, WebP, PDF, DOCX, or TXT file.",
      {
        file: ["File content does not match an approved medical document format."],
      },
    );
  }

  const autoDetectProfile = !input.profileId;
  const targetProfile = input.profileId
    ? await getProfileById(client, input.userId, input.profileId)
    : await getPrimaryProfile(client, input.userId);

  const documentId = randomUUID();
  const sanitizedFilename = sanitizeUploadFilename(input.originalFilename);
  const storagePath = `${input.userId}/${documentId}/${sanitizedFilename}`;
  const fallbackTitle = sanitizedFilename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  const title = (input.title?.trim() || fallbackTitle || "Medical Document").slice(0, 240);

  await uploadVaultFile(client, storagePath, input.fileBuffer, verifiedMime);

  try {
    const document = await createDocument(client, {
      id: documentId,
      userId: input.userId,
      profileId: targetProfile.id,
      title,
      originalFilename: sanitizedFilename,
      mimeType: verifiedMime,
      fileSizeBytes: input.fileBuffer.length,
      storagePath,
      source: input.source ?? "manual_upload",
    });

    await createActivityEvent(client, {
      userId: input.userId,
      profileId: targetProfile.id,
      documentId: document.id,
      eventType: "DOCUMENT_UPLOADED",
      description: `Uploaded ${document.title}`,
      metadata: {
        mime_type: document.mimeType,
        file_size_bytes: document.fileSizeBytes,
        source: document.source,
      },
    });

    return { document, autoDetectProfile };
  } catch (err) {
    await deleteVaultFile(client, storagePath).catch(() => undefined);
    throw err;
  }
}

export async function getDocumentSignedUrl(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
  download = false,
): Promise<{ signedUrl: string; expiresInSeconds: number }> {
  const location = await getDocumentStorageLocation(client, userId, documentId);
  const expiresInSeconds = 900;
  const signedUrl = await createSignedVaultUrl(
    client,
    location.storagePath,
    expiresInSeconds,
    download ? location.originalFilename : undefined,
  );
  return { signedUrl, expiresInSeconds };
}

export async function retryFailedDocumentIngestion(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<MedicalDocumentSummaryDto> {
  return requeueFailedDocument(client, userId, documentId);
}

export async function updateDocumentDetails(
  client: SupabaseClient<Database>,
  userId: string,
  input: {
    documentId: string;
    title: string;
    category: DocumentCategory;
    documentDate: string | null;
  },
): Promise<MedicalDocumentSummaryDto> {
  return updateDocumentMetadata(client, userId, input);
}

export async function reassignDocumentFamilyProfile(
  client: SupabaseClient<Database>,
  userId: string,
  input: { documentId: string; profileId: string },
): Promise<MedicalDocumentSummaryDto> {
  const targetProfile = await getProfileById(client, userId, input.profileId);
  const updated = await reassignDocumentProfile(client, userId, input.documentId, targetProfile.id);

  await createActivityEvent(client, {
    userId,
    profileId: targetProfile.id,
    documentId: updated.id,
    eventType: "PROFILE_ASSIGNED",
    description: `Assigned ${updated.title} to ${targetProfile.fullName}`,
    metadata: {
      profile_id: targetProfile.id,
    },
  });

  return updated;
}

export async function deleteMedicalDocument(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<string> {
  const location = await getDocumentStorageLocation(client, userId, documentId);
  await deleteVaultFile(client, location.storagePath);
  return deleteDocument(client, userId, documentId);
}
