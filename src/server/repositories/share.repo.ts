import type { SupabaseClient } from "@supabase/supabase-js";
import { ExternalProviderError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/types/database.types";
import type {
  AllowedDocumentMimeType,
  ResolvedShareLinkDto,
  ShareDurationPreset,
  ShareLinkDto,
} from "@/types/domain.types";

type ShareLinkRow = Database["public"]["Tables"]["share_links"]["Row"];

function mapShareLinkRowToDto(row: ShareLinkRow): ShareLinkDto {
  return {
    id: row.id,
    documentId: row.document_id,
    token: row.token,
    durationPreset: row.duration_preset as ShareDurationPreset,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    viewCount: row.view_count,
    lastAccessedAt: row.last_accessed_at,
    createdAt: row.created_at,
  };
}

export async function listActiveShareLinksByDocument(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<ShareLinkDto[]> {
  const { data, error } = await client
    .from("share_links")
    .select("*")
    .eq("user_id", userId)
    .eq("document_id", documentId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    throw new ExternalProviderError(`Failed to load active share links: ${error.message}`);
  }
  return (data ?? []).map(mapShareLinkRowToDto);
}

export async function createShareLink(
  client: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    token: string;
    durationPreset: ShareDurationPreset;
    expiresAt: string;
  },
): Promise<ShareLinkDto> {
  const { data, error } = await client
    .from("share_links")
    .insert({
      user_id: input.userId,
      document_id: input.documentId,
      token: input.token,
      duration_preset: input.durationPreset,
      expires_at: input.expiresAt,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ExternalProviderError(`Failed to create share link: ${error?.message ?? "unknown"}`);
  }
  return mapShareLinkRowToDto(data);
}

export async function revokeShareLink(
  client: SupabaseClient<Database>,
  userId: string,
  shareLinkId: string,
): Promise<ShareLinkDto> {
  const { data, error } = await client
    .from("share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", shareLinkId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to revoke share link: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Share link not found.");
  }
  return mapShareLinkRowToDto(data);
}

/**
 * Resolves a public share token strictly via SECURITY DEFINER RPC.
 * Returns ONLY raw file location, title, MIME type, and expiration timestamp.
 */
export async function resolveActiveShareLink(
  client: SupabaseClient<Database>,
  token: string,
): Promise<ResolvedShareLinkDto | null> {
  const { data, error } = await client.rpc("resolve_active_share_link", {
    p_token: token,
  });

  if (error) {
    throw new ExternalProviderError(`Failed to resolve share link: ${error.message}`);
  }

  const row = data?.[0];
  if (!row) {
    return null;
  }

  return {
    documentId: row.document_id,
    title: row.title,
    mimeType: row.mime_type as AllowedDocumentMimeType,
    storagePath: row.storage_path,
    expiresAt: row.expires_at,
  };
}
