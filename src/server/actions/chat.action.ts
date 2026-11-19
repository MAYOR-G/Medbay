"use server";

import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import { deleteChatThreadSchema, type DeleteChatThreadInput } from "@/lib/schemas";
import { deleteChatThread, getChatThreadWithMessages } from "@/server/repositories";
import type { ChatMessageDto, ChatThreadDto } from "@/types/domain.types";
import { executeServerAction, parseWithZod, requireAuthenticatedContext } from "./action-utils";

export async function loadChatThreadAction(
  input: DeleteChatThreadInput,
): Promise<ApiResponse<{ thread: ChatThreadDto; messages: ChatMessageDto[] }>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(deleteChatThreadSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();
    return getChatThreadWithMessages(supabase, userId, parsed.threadId);
  });
}

export async function deleteChatThreadAction(
  input: DeleteChatThreadInput,
): Promise<ApiResponse<{ deletedId: string }>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(deleteChatThreadSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const deletedId = await deleteChatThread(supabase, userId, parsed.threadId);
    revalidatePath("/chat");

    logEvent("info", {
      service: "chat",
      event: "chat_thread_deleted",
      userId,
      meta: { threadId: deletedId },
    });

    return { deletedId };
  });
}
