import { z } from "zod";
import { SHARE_DURATION_PRESETS } from "@/types/domain.types";

export const createShareLinkSchema = z.object({
  documentId: z.string().uuid(),
  durationPreset: z.enum(SHARE_DURATION_PRESETS),
});

export const revokeShareLinkSchema = z.object({
  shareLinkId: z.string().uuid(),
});

export const shareTokenParamSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{24,64}$/, "Invalid share token format."),
});

export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
export type RevokeShareLinkInput = z.infer<typeof revokeShareLinkSchema>;
export type ShareTokenParamInput = z.infer<typeof shareTokenParamSchema>;
