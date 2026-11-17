import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeError, ValidationError } from "@/lib/errors";
import { shareTokenParamSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedVaultUrl } from "@/server/integrations";
import { enforceRateLimit } from "@/server/repositories";
import { resolvePublicShareDocument } from "@/server/services";

const NO_CACHE_NO_INDEX_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

function getClientIpHash(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const rawIp = forwarded?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(rawIp).digest("hex").slice(0, 32);
}

/**
 * GET /api/share/[token]/file
 * Public, PIN-free, token-gated endpoint serving ONLY the original raw binary via a 5-minute
 * Supabase Storage signed URL. Strictly excludes AI summaries and profile metadata.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();

  try {
    const rawParams = await context.params;
    const parsed = shareTokenParamSchema.safeParse(rawParams);
    if (!parsed.success) {
      throw new ValidationError("Invalid share token format.");
    }

    const adminClient = createSupabaseAdminClient();
    const ipHash = getClientIpHash(request);
    await enforceRateLimit(adminClient, `share:${ipHash}`, 60, 60);

    const resolved = await resolvePublicShareDocument(adminClient, parsed.data.token);
    const download = request.nextUrl.searchParams.get("download") === "true";
    const filename = resolved.storagePath.split("/").pop() || "medical-record";

    const signedUrl = await createSignedVaultUrl(
      adminClient,
      resolved.storagePath,
      300,
      download ? filename : undefined,
    );

    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        "X-Request-ID": requestId,
        ...NO_CACHE_NO_INDEX_HEADERS,
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
        headers: {
          "X-Request-ID": requestId,
          ...NO_CACHE_NO_INDEX_HEADERS,
        },
      },
    );
  }
}
