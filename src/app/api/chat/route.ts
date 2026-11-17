import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { chatRequestSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeRagChatStream } from "@/server/agents/rag-chat.graph";
import {
  createChatThread,
  enforceRateLimit,
  getChatThreadWithMessages,
  getProfileById,
} from "@/server/repositories";
import type { ChatMessageDto } from "@/types/domain.types";

/**
 * POST /api/chat
 * Streams profile-isolated RAG responses with inline citations and Google Calendar tool execution.
 */
export async function POST(request: NextRequest): Promise<Response> {
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

    await enforceRateLimit(supabase, `chat:${user.id}`, 20, 60);

    const body: unknown = await request.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid chat request.");
    }

    const { threadId, profileId, message, useHeavyReasoning } = parsed.data;

    let activeProfileName: string | null = null;
    if (profileId) {
      const profile = await getProfileById(supabase, user.id, profileId);
      activeProfileName = profile.isPrimary ? "Self" : profile.fullName;
    }

    let resolvedThreadId: string;
    let history: ChatMessageDto[] = [];

    if (threadId) {
      const existing = await getChatThreadWithMessages(supabase, user.id, threadId);
      resolvedThreadId = existing.thread.id;
      history = existing.messages;
    } else {
      const thread = await createChatThread(supabase, {
        userId: user.id,
        profileId,
        title: message.slice(0, 80),
      });
      resolvedThreadId = thread.id;
    }

    const stream = executeRagChatStream({
      supabase,
      userId: user.id,
      threadId: resolvedThreadId,
      profileId,
      activeProfileName,
      history,
      message,
      useHeavyReasoning,
      abortSignal: request.signal,
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Connection: "keep-alive",
        "X-Thread-Id": resolvedThreadId,
        "X-Request-ID": requestId,
      },
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
