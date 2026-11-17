import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasLiveSupabase = Boolean(supabaseUrl && anonKey);

describe.skipIf(!hasLiveSupabase)("Public Share Link Isolation", () => {
  it("denies direct anon selects on share_links and returns empty on invalid token RPC", async () => {
    if (!supabaseUrl || !anonKey) return;
    const anonClient = createClient<Database>(supabaseUrl, anonKey);

    const { data: directRows } = await anonClient.from("share_links").select("id, token");
    expect(directRows ?? []).toHaveLength(0);

    const { data: resolved } = await anonClient.rpc("resolve_active_share_link", {
      p_token: "nonexistent-share-token-00000000",
    });
    expect(resolved ?? []).toHaveLength(0);
  });
});
