import { z } from "zod";

export const markNotificationsReadSchema = z
  .object({
    notificationId: z.string().uuid().optional(),
    markAll: z.boolean().optional(),
  })
  .refine(
    (data) => Boolean(data.notificationId) || data.markAll === true,
    "Either notificationId or markAll=true must be provided.",
  );

export const dismissNotificationSchema = z.object({
  notificationId: z.string().uuid(),
});

export const importGmailAttachmentSchema = z.object({
  notificationId: z.string().uuid(),
  profileId: z.string().uuid().nullable().optional().default(null),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url().startsWith("https://"),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  deviceLabel: z.string().trim().max(120).optional(),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url().startsWith("https://"),
});

export type MarkNotificationsReadInput = z.infer<typeof markNotificationsReadSchema>;
export type DismissNotificationInput = z.infer<typeof dismissNotificationSchema>;
export type ImportGmailAttachmentInput = z.infer<typeof importGmailAttachmentSchema>;
export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>;
export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeSchema>;
