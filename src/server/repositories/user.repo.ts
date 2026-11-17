import type { SupabaseClient } from "@supabase/supabase-js";
import { ExternalProviderError, NotFoundError, RateLimitError } from "@/lib/errors";
import type { Database } from "@/types/database.types";
import type { RateLimitResult, UserAccountDto } from "@/types/domain.types";

const SAFE_USER_COLUMNS =
  "id, email, full_name, avatar_url, google_scopes_valid, gmail_scan_enabled, last_gmail_scan_at, created_at, updated_at" as const;

type SafeUserRow = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  | "id"
  | "email"
  | "full_name"
  | "avatar_url"
  | "google_scopes_valid"
  | "gmail_scan_enabled"
  | "last_gmail_scan_at"
  | "created_at"
  | "updated_at"
>;

function mapUserRowToDto(row: SafeUserRow): UserAccountDto {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    googleScopesValid: row.google_scopes_valid,
    gmailScanEnabled: row.gmail_scan_enabled,
    lastGmailScanAt: row.last_gmail_scan_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserAccount(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<UserAccountDto> {
  const { data, error } = await client
    .from("users")
    .select(SAFE_USER_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to load user account: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("User account not found.");
  }
  return mapUserRowToDto(data);
}

export async function upsertUserFromOAuth(
  client: SupabaseClient<Database>,
  input: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    encryptedGoogleRefreshToken?: string | null;
  },
): Promise<UserAccountDto> {
  const payload: Database["public"]["Tables"]["users"]["Insert"] = {
    id: input.id,
    email: input.email,
    full_name: input.fullName,
    avatar_url: input.avatarUrl,
    ...(input.encryptedGoogleRefreshToken
      ? {
          encrypted_google_refresh_token: input.encryptedGoogleRefreshToken,
          google_scopes_valid: true,
        }
      : {}),
  };

  const { data, error } = await client
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select(SAFE_USER_COLUMNS)
    .single();

  if (error || !data) {
    throw new ExternalProviderError(
      `Failed to upsert user account: ${error?.message ?? "unknown"}`,
    );
  }
  return mapUserRowToDto(data);
}

export async function updateUserPreferences(
  client: SupabaseClient<Database>,
  userId: string,
  gmailScanEnabled: boolean,
): Promise<UserAccountDto> {
  const { data, error } = await client
    .from("users")
    .update({ gmail_scan_enabled: gmailScanEnabled })
    .eq("id", userId)
    .select(SAFE_USER_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to update account preferences: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("User account not found.");
  }
  return mapUserRowToDto(data);
}

export async function deleteUserRow(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await client.from("users").delete().eq("id", userId);
  if (error) {
    throw new ExternalProviderError(`Failed to delete user record: ${error.message}`);
  }
}

/**
 * Worker-only query retrieving encrypted refresh token. Must only be called with service-role client.
 */
export async function getEncryptedRefreshTokenForWorker(
  adminClient: SupabaseClient<Database>,
  userId: string,
): Promise<{ encryptedRefreshToken: string | null; googleScopesValid: boolean }> {
  const { data, error } = await adminClient
    .from("users")
    .select("encrypted_google_refresh_token, google_scopes_valid")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to load Google token metadata: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("User account not found.");
  }
  return {
    encryptedRefreshToken: data.encrypted_google_refresh_token,
    googleScopesValid: data.google_scopes_valid,
  };
}

export async function markGoogleScopesInvalid(
  adminClient: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await adminClient
    .from("users")
    .update({ google_scopes_valid: false })
    .eq("id", userId);

  if (error) {
    throw new ExternalProviderError(`Failed to update Google scope validity: ${error.message}`);
  }
}

export async function listEligibleUsersForGmailScan(
  adminClient: SupabaseClient<Database>,
  limit = 100,
): Promise<Array<{ id: string; encryptedGoogleRefreshToken: string }>> {
  const { data, error } = await adminClient
    .from("users")
    .select("id, encrypted_google_refresh_token")
    .eq("gmail_scan_enabled", true)
    .eq("google_scopes_valid", true)
    .not("encrypted_google_refresh_token", "is", null)
    .order("last_gmail_scan_at", { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error) {
    throw new ExternalProviderError(`Failed to list eligible Gmail scan users: ${error.message}`);
  }

  return (data ?? [])
    .filter(
      (row): row is { id: string; encrypted_google_refresh_token: string } =>
        typeof row.encrypted_google_refresh_token === "string" &&
        row.encrypted_google_refresh_token.length > 0,
    )
    .map((row) => ({
      id: row.id,
      encryptedGoogleRefreshToken: row.encrypted_google_refresh_token,
    }));
}

export async function updateLastGmailScanAt(
  adminClient: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await adminClient
    .from("users")
    .update({ last_gmail_scan_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    throw new ExternalProviderError(`Failed to update last_gmail_scan_at: ${error.message}`);
  }
}

export async function checkRateLimit(
  client: SupabaseClient<Database>,
  bucketKey: string,
  maxRequests: number,
  windowSeconds = 60,
): Promise<RateLimitResult> {
  const { data, error } = await client.rpc("check_rate_limit", {
    p_bucket_key: bucketKey,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    throw new ExternalProviderError(`Rate limit check failed: ${error.message}`);
  }

  const row = data?.[0];
  if (!row) {
    throw new ExternalProviderError("Rate limit check returned empty result.");
  }

  return {
    allowed: row.allowed,
    remaining: row.remaining,
    resetAt: row.reset_at,
  };
}

export async function enforceRateLimit(
  client: SupabaseClient<Database>,
  bucketKey: string,
  maxRequests: number,
  windowSeconds = 60,
): Promise<RateLimitResult> {
  const result = await checkRateLimit(client, bucketKey, maxRequests, windowSeconds);
  if (!result.allowed) {
    throw new RateLimitError("Too many requests. Please wait a moment before trying again.");
  }
  return result;
}
