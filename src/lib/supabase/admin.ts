import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Privileged service-role Supabase client (bypasses RLS).
 * STRICTLY RESTRICTED to:
 *  1. /api/cron/gmail-scan (CRON_SECRET verified)
 *  2. Agent 1 background ingestion workers inside Next.js after()
 *  3. /share/[token] and /api/share/[token]/file via resolve_active_share_link
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  const env = getServerEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
