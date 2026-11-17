import { randomUUID } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { normalizeError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { documentIdParamSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAgent1Ingestion } from "@/server/agents/ingestion.graph";
import { enforceRateLimit } from "@/server/repositories";
import { retryFailedDocumentIngestion } from "@/server/services";

/**
 * POST /api/documents/[documentId]/retry
 * Re-queues a failed document for Agent 1 ingestion.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ documentId: string }> },
): Promise<NextResponse> {
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

    await enforceRateLimit(supabase, `retry:${user.id}`, 5, 60);

    const rawParams = await context.params;
    const parsedParams = documentIdParamSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      throw new ValidationError("Invalid document ID.");
    }

    const updated = await retryFailedDocumentIngestion(
      supabase,
      user.id,
      parsedParams.data.documentId,
    );

    after(async () => {
      await runAgent1Ingestion({
        documentId: updated.id,
        userId: user.id,
        selectedProfileId: updated.profileId,
        autoDetectProfile: updated.profileMatchConfidence === "needs_review",
      });
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updated.id,
          ingestionStatus: updated.ingestionStatus,
        },
        requestId,
      },
      {
        status: 200,
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
