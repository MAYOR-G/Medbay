"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, History, Lock, MessageSquarePlus, Sparkles, Square, Trash2 } from "lucide-react";
import { Button, EmptyStateIllustration, ModalOrSheet, cn } from "@/components/ui";
import { deleteChatThreadAction, loadChatThreadAction } from "@/server/actions";
import type { ChatStreamFrame } from "@/server/agents/rag-chat.graph";
import { useVaultStore } from "@/stores/use-vault-store";
import type { ChatMessageDto, ChatThreadDto, FamilyProfileDto } from "@/types/domain.types";
import { MessageBubble } from "./MessageBubble";

export interface ChatWorkspaceProps {
  profiles: FamilyProfileDto[];
  threads: ChatThreadDto[];
  initialThreadId: string | null;
  initialMessages: ChatMessageDto[];
  initialProfileId: string | null;
  fullScreen?: boolean;
  initialPrompt?: string | null;
  onConsumeInitialPrompt?: () => void;
}

const STARTER_PROMPTS = [
  "Summarize recent lab results",
  "What questions should I ask my doctor?",
  "Book a doctor appointment on my calendar",
] as const;

function createOptimisticTurn(
  activeThreadId: string | null,
  text: string,
): { userMsg: ChatMessageDto; assistantMsg: ChatMessageDto } {
  const nowIso = new Date().toISOString();
  const suffix = crypto.randomUUID();
  return {
    userMsg: {
      id: `user-${suffix}`,
      threadId: activeThreadId ?? "pending",
      role: "user",
      content: text,
      vaultCitations: [],
      webCitations: [],
      calendarEventCreated: null,
      createdAt: nowIso,
    },
    assistantMsg: {
      id: `assistant-${suffix}`,
      threadId: activeThreadId ?? "pending",
      role: "assistant",
      content: "",
      vaultCitations: [],
      webCitations: [],
      calendarEventCreated: null,
      createdAt: nowIso,
    },
  };
}

export function ChatWorkspace({
  profiles,
  threads,
  initialThreadId,
  initialMessages,
  initialProfileId,
  fullScreen = false,
  initialPrompt = null,
  onConsumeInitialPrompt,
}: ChatWorkspaceProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const storeProfileId = useVaultStore((state) => state.activeProfileId);

  const resolvedProfileId = initialProfileId ?? (storeProfileId !== "all" ? storeProfileId : null);

  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [createdThreads, setCreatedThreads] = useState<ChatThreadDto[]>([]);
  const [deletedThreadIds, setDeletedThreadIds] = useState<Set<string>>(() => new Set());
  const [messages, setMessages] = useState<ChatMessageDto[]>(initialMessages);
  const [promptInput, setPromptInput] = useState("");
  const [useHeavyReasoning, setUseHeavyReasoning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isDeletingThread, startDeleteTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => undefined);

  const threadList = [
    ...createdThreads.filter((ct) => !threads.some((t) => t.id === ct.id)),
    ...threads,
  ].filter((t) => !deletedThreadIds.has(t.id));

  const activeProfile = profiles.find((p) => p.id === resolvedProfileId);
  const activeProfileLabel = activeProfile
    ? activeProfile.isPrimary
      ? "Self"
      : activeProfile.fullName
    : "All Family";

  useEffect(() => {
    if (!userScrolledUpRef.current) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, statusStep]);

  function handleScroll() {
    const el = streamContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distanceFromBottom > 120;
  }

  function handleNewThread() {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStatusStep(null);
    setThreadId(null);
    setMessages([]);
    if (!fullScreen) {
      router.push("/chat");
    }
  }

  function handleStopGenerating() {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStatusStep(null);
  }

  async function handleSelectThread(targetThreadId: string) {
    setHistoryOpen(false);
    if (!fullScreen) {
      router.push(`/chat?threadId=${targetThreadId}`);
      return;
    }

    abortRef.current?.abort();
    setIsStreaming(false);
    setStatusStep(null);
    setIsLoadingThread(true);
    try {
      const res = await loadChatThreadAction({ threadId: targetThreadId });
      if (res.success) {
        setThreadId(res.data.thread.id);
        setMessages(res.data.messages);
      } else {
        addToast(res.error.message, "danger");
      }
    } finally {
      setIsLoadingThread(false);
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    userScrolledUpRef.current = false;
    setPromptInput("");
    setIsStreaming(true);
    setStatusStep(`Searching ${activeProfileLabel}'s records...`);

    const { userMsg, assistantMsg } = createOptimisticTurn(threadId, trimmed);
    const tempAssistantId = assistantMsg.id;

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          threadId,
          profileId: resolvedProfileId,
          message: trimmed,
          useHeavyReasoning,
        }),
      });

      const returnedThreadId = response.headers.get("x-thread-id");
      if (returnedThreadId && !threadId) {
        setThreadId(returnedThreadId);
        setCreatedThreads((prev) =>
          prev.some((t) => t.id === returnedThreadId)
            ? prev
            : [
                {
                  id: returnedThreadId,
                  userId: activeProfile?.userId ?? "",
                  profileId: resolvedProfileId,
                  title: trimmed.slice(0, 64),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                ...prev,
              ],
        );
      }

      if (!response.ok || !response.body) {
        const errorJson = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(errorJson?.error?.message ?? "Failed to start chat response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          const line = rawEvent.trim();
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          const frame = JSON.parse(jsonStr) as ChatStreamFrame;
          if (frame.type === "status-step") {
            setStatusStep(frame.label);
          } else if (frame.type === "text-delta") {
            setStatusStep(null);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId ? { ...m, content: m.content + frame.delta } : m,
              ),
            );
          } else if (frame.type === "calendar-event") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId ? { ...m, calendarEventCreated: frame.event } : m,
              ),
            );
          } else if (frame.type === "citations-bundle") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? {
                      ...m,
                      vaultCitations: frame.vaultCitations,
                      webCitations: frame.webCitations,
                    }
                  : m,
              ),
            );
          } else if (frame.type === "error") {
            addToast(frame.message, "danger");
          }
        }
      }

      router.refresh();
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        addToast(err instanceof Error ? err.message : "Chat request failed.", "danger");
        setMessages((prev) => prev.filter((m) => m.id !== tempAssistantId || m.content.length > 0));
      }
    } finally {
      setIsStreaming(false);
      setStatusStep(null);
      abortRef.current = null;
    }
  }

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  useEffect(() => {
    if (!initialPrompt || isStreaming) return;
    const queued = initialPrompt;
    onConsumeInitialPrompt?.();
    void sendMessageRef.current(queued);
  }, [initialPrompt, isStreaming, onConsumeInitialPrompt]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(promptInput);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(promptInput);
    }
  }

  function handleDeleteThread(targetThreadId: string) {
    startDeleteTransition(async () => {
      const result = await deleteChatThreadAction({ threadId: targetThreadId });
      if (result.success) {
        addToast("Conversation deleted.", "success");
        setDeletedThreadIds((prev) => {
          const next = new Set(prev);
          next.add(targetThreadId);
          return next;
        });
        if (threadId === targetThreadId) {
          handleNewThread();
        } else {
          router.refresh();
        }
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col",
        fullScreen
          ? "h-full min-h-0 max-w-[1040px] px-4 py-4 md:px-6 md:py-5"
          : "h-[calc(100vh-210px)] min-h-[540px] w-full md:h-[calc(100vh-148px)]",
      )}
    >
      {/* Top Header & Context Bar */}
      {!fullScreen && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-[#0F172A]">
              MedBay Clinical AI Chat
            </h1>
            <p className="mt-1 text-[15px] text-[#475569]">
              Ask questions about lab results, prescriptions, or book Google Calendar appointments
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-10 flex-row items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#A7F3D0] bg-[#ECFDF5] px-3 font-mono text-xs font-semibold text-[#065F46]">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#059669]" strokeWidth={1.75} aria-hidden="true" />
            <span>Scope: {activeProfileLabel}</span>
          </span>

          <button
            type="button"
            onClick={() => setUseHeavyReasoning((v) => !v)}
            className={cn(
              "inline-flex h-10 flex-row items-center gap-1.5 whitespace-nowrap rounded-[10px] border px-3.5 text-[14px] font-semibold transition-colors duration-150",
              useHeavyReasoning
                ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]"
                : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]",
            )}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-[#059669]" strokeWidth={1.75} aria-hidden="true" />
            <span>Deep Synthesis: {useHeavyReasoning ? "On" : "Off"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="compact" onClick={() => setHistoryOpen(true)}>
            <History className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="tabular-nums">History ({threadList.length})</span>
          </Button>
          <Button variant="secondary" size="compact" onClick={handleNewThread}>
            <MessageSquarePlus className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      {/* Message Stream */}
      <div
        ref={streamContainerRef}
        onScroll={handleScroll}
        aria-live="polite"
        className="flex-1 space-y-4 overflow-y-auto pr-1 pb-4"
      >
        {isLoadingThread ? (
          <div className="space-y-3 py-6">
            <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-[#F8FAFC]" />
            <div className="h-28 w-full animate-pulse rounded-2xl bg-[#F8FAFC]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]">
            <EmptyStateIllustration variant="chat" />
            <h2 className="mt-4 font-heading text-lg font-semibold text-[#0F172A]">
              Ask about {activeProfileLabel}&apos;s health records
            </h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#475569]">
              Responses stream with inline citations grounded strictly in {activeProfileLabel}
              &apos;s uploaded vault records and verified WHO, NHS, and CDC medical references.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {STARTER_PROMPTS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void sendMessage(chip)}
                  className="inline-flex h-11 flex-row items-center justify-center whitespace-nowrap rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-semibold text-[#0F172A] shadow-2xs transition-colors duration-150 hover:border-[#059669] hover:bg-[#ECFDF5] hover:text-[#065F46]"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && idx === messages.length - 1 && msg.role === "assistant"}
            />
          ))
        )}

        {statusStep && (
          <div className="inline-flex flex-row items-center gap-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-3.5 py-2 text-[13px] font-semibold text-[#065F46]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#059669]" />
            <span>{statusStep}</span>
          </div>
        )}

        <div ref={scrollAnchorRef} />
      </div>

      {/* Sticky Bottom Composer */}
      <div className="border-t border-[#E2E8F0] pt-3">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2.5 rounded-2xl border border-[#CBD5E1] bg-white p-2.5 shadow-xs transition-colors focus-within:border-[#059669]"
        >
          <textarea
            aria-label="Ask a question about your health records"
            placeholder={`Ask about ${activeProfileLabel}'s records or book a doctor follow-up...`}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="max-h-[140px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 font-body text-[15px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none"
          />

          {isStreaming ? (
            <Button
              type="button"
              variant="outline"
              size="compact"
              onClick={handleStopGenerating}
              aria-label="Stop generating"
            >
              <Square className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Stop</span>
            </Button>
          ) : (
            <button
              type="submit"
              disabled={!promptInput.trim()}
              aria-label="Send message"
              className="inline-flex h-11 w-11 shrink-0 flex-row items-center justify-center rounded-[10px] bg-[#059669] text-white transition-colors duration-150 hover:bg-[#047857] disabled:bg-[#E2E8F0] disabled:text-[#64748B]"
            >
              <ArrowUp className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </form>
        <p className="mt-2 text-center text-[12px] text-[#64748B]">
          MedBay AI provides plain-English explanations for informational purposes only and is not a
          substitute for professional medical advice.
        </p>
      </div>

      {/* Thread History Modal / Sheet */}
      <ModalOrSheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        title="Saved Conversations"
        description="Select a previous consultation or remove old threads."
      >
        {threadList.length === 0 ? (
          <p className="text-[15px] text-[#475569]">No saved chat threads yet.</p>
        ) : (
          <ul className="space-y-2">
            {threadList.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5",
                  item.id === threadId
                    ? "border-[#059669] bg-[#ECFDF5]"
                    : "border-[#E2E8F0]",
                )}
              >
                <button
                  type="button"
                  onClick={() => void handleSelectThread(item.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-[14px] font-semibold text-[#0F172A]">{item.title}</p>
                  <p className="font-mono text-xs text-[#64748B] tabular-nums">
                    {item.updatedAt.slice(0, 10)}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="compact"
                  disabled={isDeletingThread}
                  aria-label={`Delete thread ${item.title}`}
                  onClick={() => handleDeleteThread(item.id)}
                  className="text-[#991B1B] hover:bg-[#FEF2F2] hover:text-[#991B1B]"
                >
                  <Trash2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ModalOrSheet>
    </div>
  );
}
