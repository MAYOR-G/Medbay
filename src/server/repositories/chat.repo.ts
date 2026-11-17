import type { SupabaseClient } from "@supabase/supabase-js";
import { ExternalProviderError, NotFoundError } from "@/lib/errors";
import type { Database, Json } from "@/types/database.types";
import type {
  CalendarEventArtifact,
  ChatMessageDto,
  ChatRole,
  ChatThreadDto,
  VaultCitationRef,
  WebCitationRef,
} from "@/types/domain.types";

type ThreadRow = Database["public"]["Tables"]["chat_threads"]["Row"];
type MessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];

function mapThreadRowToDto(row: ThreadRow): ChatThreadDto {
  return {
    id: row.id,
    userId: row.user_id,
    profileId: row.profile_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessageRowToDto(row: MessageRow): ChatMessageDto {
  return {
    id: row.id,
    threadId: row.thread_id,
    role: row.role as ChatRole,
    content: row.content,
    vaultCitations: Array.isArray(row.vault_citations)
      ? (row.vault_citations as unknown as VaultCitationRef[])
      : [],
    webCitations: Array.isArray(row.web_citations)
      ? (row.web_citations as unknown as WebCitationRef[])
      : [],
    calendarEventCreated:
      row.calendar_event_created &&
      typeof row.calendar_event_created === "object" &&
      !Array.isArray(row.calendar_event_created)
        ? (row.calendar_event_created as unknown as CalendarEventArtifact)
        : null,
    createdAt: row.created_at,
  };
}

export async function listChatThreadsByUser(
  client: SupabaseClient<Database>,
  userId: string,
  limit = 30,
): Promise<ChatThreadDto[]> {
  const { data, error } = await client
    .from("chat_threads")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new ExternalProviderError(`Failed to load chat threads: ${error.message}`);
  }
  return (data ?? []).map(mapThreadRowToDto);
}

export async function getChatThreadWithMessages(
  client: SupabaseClient<Database>,
  userId: string,
  threadId: string,
): Promise<{ thread: ChatThreadDto; messages: ChatMessageDto[] }> {
  const { data: thread, error: threadError } = await client
    .from("chat_threads")
    .select("*")
    .eq("id", threadId)
    .eq("user_id", userId)
    .maybeSingle();

  if (threadError) {
    throw new ExternalProviderError(`Failed to load chat thread: ${threadError.message}`);
  }
  if (!thread) {
    throw new NotFoundError("Chat thread not found.");
  }

  const { data: messages, error: msgError } = await client
    .from("chat_messages")
    .select("*")
    .eq("thread_id", threadId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (msgError) {
    throw new ExternalProviderError(`Failed to load chat messages: ${msgError.message}`);
  }

  return {
    thread: mapThreadRowToDto(thread),
    messages: (messages ?? []).map(mapMessageRowToDto),
  };
}

export async function createChatThread(
  client: SupabaseClient<Database>,
  input: {
    userId: string;
    profileId: string | null;
    title: string;
  },
): Promise<ChatThreadDto> {
  const { data, error } = await client
    .from("chat_threads")
    .insert({
      user_id: input.userId,
      profile_id: input.profileId,
      title: input.title.slice(0, 160),
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ExternalProviderError(`Failed to create chat thread: ${error?.message ?? "unknown"}`);
  }
  return mapThreadRowToDto(data);
}

export async function createChatMessage(
  client: SupabaseClient<Database>,
  input: {
    threadId: string;
    userId: string;
    role: ChatRole;
    content: string;
    vaultCitations?: VaultCitationRef[];
    webCitations?: WebCitationRef[];
    calendarEventCreated?: CalendarEventArtifact | null;
  },
): Promise<ChatMessageDto> {
  const { data, error } = await client
    .from("chat_messages")
    .insert({
      thread_id: input.threadId,
      user_id: input.userId,
      role: input.role,
      content: input.content,
      vault_citations: (input.vaultCitations ?? []) as unknown as Json,
      web_citations: (input.webCitations ?? []) as unknown as Json,
      calendar_event_created: (input.calendarEventCreated ?? null) as unknown as Json,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ExternalProviderError(`Failed to save chat message: ${error?.message ?? "unknown"}`);
  }

  await client
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.threadId)
    .eq("user_id", input.userId);

  return mapMessageRowToDto(data);
}

export async function deleteChatThread(
  client: SupabaseClient<Database>,
  userId: string,
  threadId: string,
): Promise<string> {
  const { error, count } = await client
    .from("chat_threads")
    .delete({ count: "exact" })
    .eq("id", threadId)
    .eq("user_id", userId);

  if (error) {
    throw new ExternalProviderError(`Failed to delete chat thread: ${error.message}`);
  }
  if (!count) {
    throw new NotFoundError("Chat thread not found.");
  }
  return threadId;
}
