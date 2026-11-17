import { redirect } from "next/navigation";
import { ChatWorkspace } from "@/components/chat";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getChatThreadWithMessages,
  listChatThreadsByUser,
  listProfilesByUser,
} from "@/server/repositories";
import type { ChatMessageDto } from "@/types/domain.types";

interface ChatPageProps {
  searchParams: Promise<{ threadId?: string; profileId?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const params = await searchParams;
  const [profiles, threads] = await Promise.all([
    listProfilesByUser(supabase, user.id),
    listChatThreadsByUser(supabase, user.id, 30),
  ]);

  let initialThreadId: string | null = null;
  let initialMessages: ChatMessageDto[] = [];
  let initialProfileId: string | null = params.profileId ?? null;

  if (params.threadId) {
    try {
      const loaded = await getChatThreadWithMessages(supabase, user.id, params.threadId);
      initialThreadId = loaded.thread.id;
      initialMessages = loaded.messages;
      initialProfileId = loaded.thread.profileId;
    } catch {
      initialThreadId = null;
    }
  }

  return (
    <ChatWorkspace
      key={initialThreadId ?? "new-thread"}
      profiles={profiles}
      threads={threads}
      initialThreadId={initialThreadId}
      initialMessages={initialMessages}
      initialProfileId={initialProfileId}
    />
  );
}
