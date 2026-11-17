import { z } from "zod";

export const chatRequestSchema = z.object({
  threadId: z.string().uuid().nullable().optional().default(null),
  profileId: z.string().uuid().nullable().optional().default(null),
  message: z.string().trim().min(1, "Message cannot be empty.").max(4000),
  useHeavyReasoning: z.boolean().optional().default(false),
});

export const deleteChatThreadSchema = z.object({
  threadId: z.string().uuid(),
});

export const bookCalendarAppointmentArgsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  startIso: z.string().datetime({ offset: true }),
  endIso: z.string().datetime({ offset: true }),
  timezone: z.string().trim().min(1).max(80).default("UTC"),
  location: z.string().trim().max(240).nullable().optional().default(null),
  description: z.string().trim().max(1000).nullable().optional().default(null),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type DeleteChatThreadInput = z.infer<typeof deleteChatThreadSchema>;
export type BookCalendarAppointmentArgs = z.infer<typeof bookCalendarAppointmentArgsSchema>;
