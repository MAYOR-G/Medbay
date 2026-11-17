import { z } from "zod";
import { DEPENDENT_RELATIONSHIPS, FAMILY_RELATIONSHIPS } from "@/types/domain.types";

const isoDateNotFutureSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be formatted as YYYY-MM-DD.")
  .refine((val) => {
    const parsed = new Date(`${val}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return false;
    const todayIso = new Date().toISOString().slice(0, 10);
    return val <= todayIso;
  }, "Date of birth cannot be in the future.");

export const createFamilyProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(160),
  relationship: z.enum(DEPENDENT_RELATIONSHIPS),
  dateOfBirth: isoDateNotFutureSchema.nullable().optional().default(null),
});

export const updateFamilyProfileSchema = z.object({
  profileId: z.string().uuid(),
  fullName: z.string().trim().min(1, "Full name is required.").max(160),
  relationship: z.enum(FAMILY_RELATIONSHIPS),
  dateOfBirth: isoDateNotFutureSchema.nullable().optional().default(null),
});

export const deleteFamilyProfileSchema = z.object({
  profileId: z.string().uuid(),
});

export const updateAccountPreferencesSchema = z.object({
  gmailScanEnabled: z.boolean(),
});

export const deleteUserAccountSchema = z.object({
  confirmationText: z.literal("DELETE"),
});

export type CreateFamilyProfileInput = z.infer<typeof createFamilyProfileSchema>;
export type UpdateFamilyProfileInput = z.infer<typeof updateFamilyProfileSchema>;
export type DeleteFamilyProfileInput = z.infer<typeof deleteFamilyProfileSchema>;
export type UpdateAccountPreferencesInput = z.infer<typeof updateAccountPreferencesSchema>;
export type DeleteUserAccountInput = z.infer<typeof deleteUserAccountSchema>;
