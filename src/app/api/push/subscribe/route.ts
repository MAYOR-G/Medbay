import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { pushSubscribeSchema, pushUnsubscribeSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deletePushSubscription, upsertPushSubscription } from "@/server/repositories";

/**
 * POST /api/push/subscribe
 * Registers or updates a browser/PWA Web Push VAPID endpoint.
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

    const body: unknown = await request.json().catch(() => null);
    const parsed = pushSubscribeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid push subscription.");
    }

    await upsertPushSubscription(supabase, {
      userId: user.id,
      endpoint: parsed.data.endpoint,
      p256dhKey: parsed.data.keys.p256dh,
      authKey: parsed.data.keys.auth,
      deviceLabel: parsed.data.deviceLabel,
    });

    return NextResponse.json(
      {
        success: true,
        data: { subscribed: true },
        requestId,
      },
      {
        status: 200,
        headers: { "X-Request-ID": requestId },
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

/**
 * DELETE /api/push/subscribe
 * Removes a browser/PWA Web Push subscription endpoint.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
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

    const body: unknown = await request.json().catch(() => null);
    const parsed = pushUnsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid endpoint.");
    }

    await deletePushSubscription(supabase, user.id, parsed.data.endpoint);

    return new NextResponse(null, {
      status: 204,
      headers: { "X-Request-ID": requestId },
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
