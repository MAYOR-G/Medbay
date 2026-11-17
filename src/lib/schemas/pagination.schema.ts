import { z } from "zod";
import { ACTIVITY_EVENT_TYPES, DOCUMENT_CATEGORIES } from "@/types/domain.types";

const uuidOrAllSchema = z.union([z.literal("all"), z.string().uuid()]);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const vaultSearchParamsSchema = paginationQuerySchema.extend({
  profileId: uuidOrAllSchema.default("all"),
  category: z.union([z.literal("all"), z.enum(DOCUMENT_CATEGORIES)]).default("all"),
  q: z.string().trim().max(100).default(""),
});

export const timelineSearchParamsSchema = paginationQuerySchema.extend({
  profileId: uuidOrAllSchema.default("all"),
  eventType: z.union([z.literal("all"), z.enum(ACTIVITY_EVENT_TYPES)]).default("all"),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type VaultSearchParamsInput = z.infer<typeof vaultSearchParamsSchema>;
export type TimelineSearchParamsInput = z.infer<typeof timelineSearchParamsSchema>;
