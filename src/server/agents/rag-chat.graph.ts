import type { SupabaseClient } from "@supabase/supabase-js";
import { stepCountIs, streamText, tool, type ModelMessage } from "ai";
import { logEvent } from "@/lib/logger";
import { bookCalendarAppointmentArgsSchema } from "@/lib/schemas";
import {
  createCalendarEvent,
  embedTexts,
  getOpenRouterChatModel,
  searchMedicalAuthorities,
} from "@/server/integrations";
import { createActivityEvent, createChatMessage, matchDocumentChunks } from "@/server/repositories";
import type { Database } from "@/types/database.types";
import type {
  CalendarEventArtifact,
  ChatMessageDto,
  VaultCitationRef,
  WebCitationRef,
} from "@/types/domain.types";
import { z } from "zod";
import { buildRagChatSystemPrompt } from "./prompts";

export type ChatStreamFrame =
  | { type: "status-step"; label: string }
  | { type: "text-delta"; delta: string }
  | { type: "calendar-event"; event: CalendarEventArtifact }
  | {
      type: "citations-bundle";
      vaultCitations: VaultCitationRef[];
      webCitations: WebCitationRef[];
    }
  | { type: "finish" }
  | { type: "error"; message: string };

function encodeSseFrame(frame: ChatStreamFrame): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(frame)}\n\n`);
}

function buildConversationMessages(
  history: ChatMessageDto[],
  latestUserMessage: string,
): ModelMessage[] {
  const recent = history.slice(-12); // Cap at 12 recent turns per ARCHITECTURE.md 10.2
  const messages: ModelMessage[] = recent.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
  messages.push({ role: "user", content: latestUserMessage });
  return messages;
}

export function executeRagChatStream(input: {
  supabase: SupabaseClient<Database>;
  userId: string;
  threadId: string;
  profileId: string | null;
  activeProfileName: string | null;
  history: ChatMessageDto[];
  message: string;
  useHeavyReasoning: boolean;
  abortSignal: AbortSignal;
}): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const startedAt = Date.now();
      const scopeLabel = input.activeProfileName ?? "family";

      const emit = (frame: ChatStreamFrame) => {
        try {
          controller.enqueue(encodeSseFrame(frame));
        } catch {
          // Stream closed by client
        }
      };

      try {
        await createChatMessage(input.supabase, {
          threadId: input.threadId,
          userId: input.userId,
          role: "user",
          content: input.message,
        });

        emit({
          type: "status-step",
          label: `Searching ${scopeLabel}'s records...`,
        });

        const [queryEmbedding] = await embedTexts([input.message], "RETRIEVAL_QUERY");
        const matchedChunks = queryEmbedding
          ? await matchDocumentChunks(input.supabase, {
              userId: input.userId,
              profileId: input.profileId,
              queryEmbedding,
              matchThreshold: 0.45,
              matchCount: 8,
            })
          : [];

        const vaultCitationMap = new Map<string, VaultCitationRef>();
        for (const chunk of matchedChunks) {
          if (!vaultCitationMap.has(chunk.documentId)) {
            vaultCitationMap.set(chunk.documentId, {
              documentId: chunk.documentId,
              title: chunk.documentTitle,
              documentDate: chunk.documentDate,
              profileName: chunk.profileName,
            });
          }
        }
        const vaultCitations = Array.from(vaultCitationMap.values());
        const webCitations: WebCitationRef[] = [];
        let bookedCalendarEvent: CalendarEventArtifact | null = null;

        const systemPrompt = buildRagChatSystemPrompt({
          activeProfileName: input.activeProfileName,
          retrievedChunks: matchedChunks,
          currentIsoDate: new Date().toISOString(),
        });

        const result = streamText({
          model: getOpenRouterChatModel(input.useHeavyReasoning),
          system: systemPrompt,
          messages: buildConversationMessages(input.history, input.message),
          abortSignal: input.abortSignal,
          stopWhen: stepCountIs(5),
          tools: {
            search_medical_authorities: tool({
              description:
                "Search authoritative medical sources (WHO, NHS, CDC, NIH, MedlinePlus) to verify clinical terminology, conditions, or medications.",
              inputSchema: z.object({
                query: z.string().trim().min(2).max(200),
              }),
              execute: async ({ query }) => {
                emit({ type: "status-step", label: "Checking WHO & NHS sources..." });
                const citations = await searchMedicalAuthorities(query, 4);
                for (const item of citations) {
                  if (!webCitations.some((existing) => existing.url === item.url)) {
                    webCitations.push({
                      title: item.title,
                      url: item.url,
                      domain: item.domain,
                    });
                  }
                }
                return citations;
              },
            }),
            book_calendar_appointment: tool({
              description:
                "Book a medical appointment on the user's primary Google Calendar once date and time are confirmed.",
              inputSchema: bookCalendarAppointmentArgsSchema,
              execute: async (args) => {
                emit({ type: "status-step", label: "Booking on Google Calendar..." });
                const artifact = await createCalendarEvent(input.userId, {
                  title: args.title,
                  startIso: args.startIso,
                  endIso: args.endIso,
                  timezone: args.timezone,
                  location: args.location ?? null,
                  description: args.description ?? null,
                });
                bookedCalendarEvent = artifact;

                await createActivityEvent(input.supabase, {
                  userId: input.userId,
                  profileId: input.profileId,
                  eventType: "CALENDAR_APPOINTMENT_BOOKED",
                  description: `Booked ${artifact.title} on Google Calendar`,
                  metadata: {
                    event_id: artifact.eventId,
                    start_iso: artifact.startIso,
                    calendar_html_link: artifact.htmlLink,
                  },
                });

                emit({ type: "calendar-event", event: artifact });
                return artifact;
              },
            }),
          },
        });

        let assistantText = "";
        for await (const delta of result.textStream) {
          assistantText += delta;
          emit({ type: "text-delta", delta });
        }

        const finalContent =
          assistantText.trim() ||
          (bookedCalendarEvent
            ? `I have scheduled **${(bookedCalendarEvent as CalendarEventArtifact).title}** on your Google Calendar.`
            : "I could not generate a response for that query. Please try rephrasing.");

        await createChatMessage(input.supabase, {
          threadId: input.threadId,
          userId: input.userId,
          role: "assistant",
          content: finalContent,
          vaultCitations,
          webCitations,
          calendarEventCreated: bookedCalendarEvent,
        });

        emit({
          type: "citations-bundle",
          vaultCitations,
          webCitations,
        });
        emit({ type: "finish" });

        logEvent("info", {
          service: "agent2-rag-chat",
          event: "chat_turn_completed",
          userId: input.userId,
          durationMs: Date.now() - startedAt,
          meta: {
            vaultCitationCount: vaultCitations.length,
            webCitationCount: webCitations.length,
            calendarBooked: Boolean(bookedCalendarEvent),
          },
        });
      } catch (err) {
        if (!input.abortSignal.aborted) {
          logEvent("error", {
            service: "agent2-rag-chat",
            event: "chat_turn_failed",
            userId: input.userId,
            durationMs: Date.now() - startedAt,
            errorCode: err instanceof Error ? err.name : "CHAT_FAILED",
          });
          emit({
            type: "error",
            message:
              err instanceof Error
                ? err.message
                : "AI assistant encountered an error. Please try again.",
          });
        }
      } finally {
        controller.close();
      }
    },
  });
}
