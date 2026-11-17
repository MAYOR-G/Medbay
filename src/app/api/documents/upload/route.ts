import { randomUUID } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { normalizeError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import { uploadDocumentFieldsSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAgent1Ingestion } from "@/server/agents/ingestion.graph";
import { enforceRateLimit } from "@/server/repositories";
import { uploadMedicalDocument } from "@/server/services";
import { MAX_DOCUMENT_SIZE_BYTES } from "@/types/domain.types";

/**
 * POST /api/documents/upload
 * Accepts multipart/form-data, validates binary magic bytes and <= 25 MB size,
 * persists binary to private vault-files bucket, schedules Agent 1 via after(), and returns 201.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError("Authentication required.");
    }

    await enforceRateLimit(supabase, `upload:${user.id}`, 10, 60);

    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      throw new ValidationError("A medical document file is required.", {
        file: ["Please select a file to upload."],
      });
    }

    if (fileEntry.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new ValidationError("File size exceeds the 25 MB maximum limit.", {
        file: ["Maximum allowed file size is 26,214,400 bytes (25 MB)."],
      });
    }

    const rawProfileId = formData.get("profileId");
    const rawTitle = formData.get("title");
    const parsedFields = uploadDocumentFieldsSchema.safeParse({
      profileId:
        typeof rawProfileId === "string" && rawProfileId.trim() ? rawProfileId.trim() : null,
      title: typeof rawTitle === "string" && rawTitle.trim() ? rawTitle.trim() : null,
    });

    if (!parsedFields.success) {
      throw new ValidationError("Invalid upload metadata.", {
        profileId: ["Target family profile ID must be a valid UUID."],
      });
    }

    const arrayBuffer = await fileEntry.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { document, autoDetectProfile } = await uploadMedicalDocument(supabase, {
      userId: user.id,
      fileBuffer,
      originalFilename: fileEntry.name || "medical-document",
      declaredMimeType: fileEntry.type || "",
      profileId: parsedFields.data.profileId,
      title: parsedFields.data.title,
    });

    after(async () => {
      await runAgent1Ingestion({
        documentId: document.id,
        userId: user.id,
        selectedProfileId: document.profileId,
        autoDetectProfile,
      });
    });

    logEvent("info", {
      service: "upload-api",
      event: "document_queued_for_ingestion",
      userId: user.id,
      documentId: document.id,
      meta: {
        mimeType: document.mimeType,
        fileSizeBytes: document.fileSizeBytes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: document,
        requestId,
      },
      {
        status: 201,
        headers: {
          "X-Request-ID": requestId,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (err) {
    const normalized = normalizeError(err);
    return NextResponse.json(
      {
        success: false,
        error: normalized.body,
        requestId,
      },
      {
        status: normalized.statusCode,
        headers: { "X-Request-ID": requestId },
      },
    );
  }
}
