import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasLiveSupabase = Boolean(supabaseUrl && anonKey && serviceRoleKey);

describe.skipIf(!hasLiveSupabase)("Supabase RLS & Profile Vector Isolation", () => {
  it("blocks anonymous reads on medical_documents and document_summaries", async () => {
    if (!supabaseUrl || !anonKey) return;
    const anonClient = createClient<Database>(supabaseUrl, anonKey);

    const { data: docs } = await anonClient.from("medical_documents").select("id");
    expect(docs ?? []).toHaveLength(0);

    const { data: summaries } = await anonClient.from("document_summaries").select("id");
    expect(summaries ?? []).toHaveLength(0);
  });

  it("isolates document_chunks by profile_id in match_document_chunks", async () => {
    if (!supabaseUrl || !serviceRoleKey) return;
    const adminClient = createClient<Database>(supabaseUrl, serviceRoleKey);

    const demoUserId = "11111111-1111-4111-8111-111111111111";
    const davidProfileId = "22222222-2222-4222-8222-222222222203";
    const sampleEmbedding = `[${Array(1536).fill(0.01).join(",")}]`;

    const { data, error } = await adminClient.rpc("match_document_chunks", {
      p_user_id: demoUserId,
      p_profile_id: davidProfileId,
      p_query_embedding: sampleEmbedding,
      p_match_threshold: 0.1,
      p_match_count: 10,
    });

    expect(error).toBeNull();
    expect((data ?? []).every((row) => row.profile_name === "David Morgan")).toBe(true);
  });
});
