import { NextResponse, type NextRequest } from "next/server";
import { encryptSecret } from "@/lib/crypto";
import { getServerEnv } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensurePrimarySelfProfile, upsertUserFromOAuth } from "@/server/repositories";

function sanitizeRedirectPath(rawNext: string | null): string {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/vault";
  }
  return rawNext;
}

/**
 * Exchanges Google OAuth 2.0 PKCE code for a Supabase session, encrypts and stores
 * provider_refresh_token, and provisions the default Self FamilyProfile.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = sanitizeRedirectPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session || !data.user) {
      logEvent("warn", {
        service: "auth",
        event: "oauth_exchange_failed",
        errorCode: "OAUTH_EXCHANGE_FAILED",
      });
      return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
    }

    const user = data.user;
    const providerRefreshToken = data.session.provider_refresh_token;
    let encryptedGoogleRefreshToken: string | null | undefined;

    if (providerRefreshToken) {
      const { ENCRYPTION_SECRET } = getServerEnv();
      encryptedGoogleRefreshToken = encryptSecret(providerRefreshToken, ENCRYPTION_SECRET);
    }

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fullName =
      (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
      (typeof metadata.name === "string" && metadata.name.trim()) ||
      user.email?.split("@")[0] ||
      "MedBay User";
    const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

    await upsertUserFromOAuth(supabase, {
      id: user.id,
      email: user.email ?? "",
      fullName,
      avatarUrl,
      encryptedGoogleRefreshToken,
    });

    await ensurePrimarySelfProfile(supabase, user.id, fullName);

    logEvent("info", {
      service: "auth",
      event: "oauth_login_completed",
      userId: user.id,
      meta: { hasRefreshToken: Boolean(providerRefreshToken) },
    });

    return NextResponse.redirect(`${origin}${nextPath}`);
  } catch (err) {
    logEvent("error", {
      service: "auth",
      event: "oauth_callback_exception",
      errorCode: err instanceof Error ? err.name : "UNKNOWN",
    });
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }
}
