import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { normalizeError, UnauthorizedError } from "@/lib/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { runDailyGmailMedicalScan, verifyCronBearerSecret } from "@/server/services";

/**
 * GET /api/cron/gmail-scan
 * Scheduled 24-hour Vercel Cron job scanning Gmail (gmail.readonly) and sending
 * strictly in-app + Web Push notifications (zero outbound emails).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();

  try {
    const { CRON_SECRET } = getServerEnv();
    const authHeader = request.headers.get("authorization");

    if (!verifyCronBearerSecret(authHeader, CRON_SECRET)) {
      throw new UnauthorizedError("Invalid cron authorization token.");
    }

    const adminClient = createSupabaseAdminClient();
    const summary = await runDailyGmailMedicalScan(adminClient);

    return NextResponse.json(
      {
        success: true,
        data: summary,
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
