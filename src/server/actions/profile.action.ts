"use server";

import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import {
  createFamilyProfileSchema,
  deleteFamilyProfileSchema,
  updateFamilyProfileSchema,
  type CreateFamilyProfileInput,
  type DeleteFamilyProfileInput,
  type UpdateFamilyProfileInput,
} from "@/lib/schemas";
import {
  createManagedDependentProfile,
  deleteManagedDependentProfile,
  updateManagedFamilyProfile,
} from "@/server/services";
import type { FamilyProfileDto } from "@/types/domain.types";
import { executeServerAction, parseWithZod, requireAuthenticatedContext } from "./action-utils";

function revalidateProfileRoutes(): void {
  revalidatePath("/profiles");
  revalidatePath("/vault");
  revalidatePath("/chat");
  revalidatePath("/timeline");
}

export async function createFamilyProfileAction(
  input: CreateFamilyProfileInput,
): Promise<ApiResponse<FamilyProfileDto>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(createFamilyProfileSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const created = await createManagedDependentProfile(supabase, userId, {
      fullName: parsed.fullName,
      relationship: parsed.relationship,
      dateOfBirth: parsed.dateOfBirth,
    });

    revalidateProfileRoutes();
    logEvent("info", {
      service: "profile",
      event: "family_profile_created",
      userId,
      meta: { profileId: created.id, relationship: created.relationship },
    });

    return created;
  });
}

export async function updateFamilyProfileAction(
  input: UpdateFamilyProfileInput,
): Promise<ApiResponse<FamilyProfileDto>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(updateFamilyProfileSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const updated = await updateManagedFamilyProfile(supabase, userId, {
      profileId: parsed.profileId,
      fullName: parsed.fullName,
      relationship: parsed.relationship,
      dateOfBirth: parsed.dateOfBirth,
    });

    revalidateProfileRoutes();
    logEvent("info", {
      service: "profile",
      event: "family_profile_updated",
      userId,
      meta: { profileId: updated.id },
    });

    return updated;
  });
}

export async function deleteFamilyProfileAction(
  input: DeleteFamilyProfileInput,
): Promise<ApiResponse<{ deletedId: string }>> {
  return executeServerAction(async () => {
    const parsed = parseWithZod(deleteFamilyProfileSchema, input);
    const { supabase, userId } = await requireAuthenticatedContext();

    const deletedId = await deleteManagedDependentProfile(supabase, userId, parsed.profileId);

    revalidateProfileRoutes();
    logEvent("info", {
      service: "profile",
      event: "family_profile_deleted",
      userId,
      meta: { profileId: deletedId },
    });

    return { deletedId };
  });
}
