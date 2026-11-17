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
import { History, Lock, MessageSquarePlus, Send, Sparkles, Square, Trash2 } from "lucide-react";
import { Badge, Button, Card, ModalOrSheet, cn } from "@/components/ui";
import type { ChatStreamFrame } from "@/server/agents/rag-chat.graph";
import { deleteChatThreadAction } from "@/server/actions";
import { useVaultStore } from "@/stores/use-vault-store";
import type { ChatMessageDto, ChatThreadDto, FamilyProfileDto } from "@/types/domain.types";
import { MessageBubble } from "./MessageBubble";

export interface ChatWorkspaceProps {
  profiles: FamilyProfileDto[];
  threads: ChatThreadDto[];
  initialThreadId: string | null;
  initialMessages: ChatMessageDto[];
  initialProfileId: string | null;
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
}: ChatWorkspaceProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const storeProfileId = useVaultStore((state) => state.activeProfileId);

  const resolvedProfileId = initialProfileId ?? (storeProfileId !== "all" ? storeProfileId : null);

  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [messages, setMessages] = useState<ChatMessageDto[]>(initialMessages);
  const [promptInput, setPromptInput] = useState("");
  const [useHeavyReasoning, setUseHeavyReasoning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isDeletingThread, startDeleteTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

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
    router.push("/chat");
  }

  function handleStopGenerating() {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStatusStep(null);
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
    <div className="mx-auto flex h-[calc(100vh-210px)] min-h-[500px] max-w-[820px] flex-col md:h-[calc(100vh-140px)]">
      {/* Top Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="vault" className="py-1.5">
            <Lock className="h-3 w-3" aria-hidden="true" />
            <span>Chatting about: {activeProfileLabel}</span>
          </Badge>

          <button
            type="button"
            onClick={() => setUseHeavyReasoning((v) => !v)}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors md:min-h-[36px]",
              useHeavyReasoning
                ? "border-accent-primary bg-accent-primary-tint text-accent-primary"
                : "border-border-hairline bg-surface text-text-secondary hover:border-border-strong",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Deep Synthesis {useHeavyReasoning ? "On" : "Off"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="compact" onClick={() => setHistoryOpen(true)}>
            <History className="h-4 w-4" aria-hidden="true" />
            <span>Threads ({threads.length})</span>
          </Button>
          <Button variant="secondary" size="compact" onClick={handleNewThread}>
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            <span>New</span>
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
        {messages.length === 0 ? (
          <Card className="flex flex-col items-center px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-primary-border bg-accent-primary-tint text-accent-primary">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-4 font-heading text-xl font-semibold text-text-primary">
              Ask about {activeProfileLabel}&apos;s health records
            </h1>
            <p className="mt-2 max-w-[380px] text-[15px] text-text-secondary">
              Answers are grounded strictly in {activeProfileLabel}&apos;s uploaded documents and
              verified medical sources.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void sendMessage(chip)}
                  className="min-h-[44px] rounded-full border border-border-strong bg-surface px-4 text-[14px] font-medium text-text-primary transition-colors hover:bg-surface-hover"
                >
                  {chip}
                </button>
              ))}
            </div>
          </Card>
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
          <div className="flex items-center gap-2 text-[13px] font-medium text-accent-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-primary" />
            <span>{statusStep}</span>
          </div>
        )}

        <div ref={scrollAnchorRef} />
      </div>

      {/* Sticky Bottom Composer */}
      <div className="border-t border-border-hairline pt-3">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-lg border border-border-strong bg-surface p-2 shadow-elevation-1 focus-within:border-border-focus"
        >
          <textarea
            aria-label="Ask a question about your health records"
            placeholder={`Ask about ${activeProfileLabel}'s records or book an appointment...`}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="max-h-[140px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 font-body text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />

          {isStreaming ? (
            <Button
              type="button"
              variant="outline"
              size="compact"
              onClick={handleStopGenerating}
              aria-label="Stop generating"
            >
              <Square className="h-4 w-4" aria-hidden="true" />
              <span>Stop</span>
            </Button>
          ) : (
            <button
              type="submit"
              disabled={!promptInput.trim()}
              aria-label="Send message"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-primary text-text-inverted transition-colors hover:bg-accent-primary-hover disabled:bg-border-hairline disabled:text-text-muted"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </form>
        <p className="mt-1.5 text-center text-[12px] text-text-muted">
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
        {threads.length === 0 ? (
          <p className="text-[15px] text-text-secondary">No saved chat threads yet.</p>
        ) : (
          <ul className="space-y-2">
            {threads.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border-hairline bg-surface px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setHistoryOpen(false);
                    router.push(`/chat?threadId=${item.id}`);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-[14px] font-semibold text-text-primary">
                    {item.title}
                  </p>
                  <p className="font-mono text-xs text-text-muted tabular-nums">
                    {item.updatedAt.slice(0, 10)}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="compact"
                  disabled={isDeletingThread}
                  aria-label={`Delete thread ${item.title}`}
                  onClick={() => handleDeleteThread(item.id)}
                  className="text-status-danger-text hover:bg-status-danger-bg hover:text-status-danger-text"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ModalOrSheet>
    </div>
  );
}
