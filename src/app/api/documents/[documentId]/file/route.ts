import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { documentIdParamSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDocumentSignedUrl } from "@/server/services";

/**
 * GET /api/documents/[documentId]/file
 * Generates a 15-minute (900s) private Supabase Storage signed URL for the authenticated owner.
 */
export async function GET(
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

    const rawParams = await context.params;
    const parsedParams = documentIdParamSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      throw new ValidationError("Invalid document ID.");
    }

    const download = request.nextUrl.searchParams.get("download") === "true";
    const { signedUrl, expiresInSeconds } = await getDocumentSignedUrl(
      supabase,
      user.id,
      parsedParams.data.documentId,
      download,
    );

    const accept = request.headers.get("accept") ?? "";
    if (accept.includes("application/json")) {
      return NextResponse.json(
        {
          success: true,
          data: { signedUrl, expiresInSeconds },
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
    }

    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        "X-Request-ID": requestId,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
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
