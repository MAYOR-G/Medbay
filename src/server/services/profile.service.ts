import type { SupabaseClient } from "@supabase/supabase-js";
import { ConflictError, ValidationError } from "@/lib/errors";
import {
  createDependentProfile,
  deleteDependentProfile,
  getDocumentCountsByProfile,
  getProfileById,
  listProfilesByUser,
  listStoragePathsByProfile,
  updateFamilyProfile,
} from "@/server/repositories";
import type { Database } from "@/types/database.types";
import {
  MAX_DEPENDENT_PROFILES,
  type DependentRelationship,
  type FamilyProfileDto,
  type FamilyRelationship,
} from "@/types/domain.types";

export interface FamilyProfileWithCountDto extends FamilyProfileDto {
  documentCount: number;
}

/**
 * Assigns a deterministic archival palette index (1-6) for managed dependent profiles.
 * Index 0 is reserved for the primary Self profile.
 */
export function computeNextDependentColorIndex(existingProfiles: FamilyProfileDto[]): number {
  const used = new Set(existingProfiles.filter((p) => !p.isPrimary).map((p) => p.colorIndex));
  for (let candidate = 1; candidate <= 6; candidate += 1) {
    if (!used.has(candidate)) {
      return candidate;
    }
  }
  const dependentCount = existingProfiles.filter((p) => !p.isPrimary).length;
  return (dependentCount % 6) + 1;
}

export async function listFamilyProfilesWithDocCounts(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<FamilyProfileWithCountDto[]> {
  const [profiles, countsMap] = await Promise.all([
    listProfilesByUser(client, userId),
    getDocumentCountsByProfile(client, userId),
  ]);

  return profiles.map((profile) => ({
    ...profile,
    documentCount: countsMap.get(profile.id) ?? 0,
  }));
}

export async function createManagedDependentProfile(
  client: SupabaseClient<Database>,
  userId: string,
  input: {
    fullName: string;
    relationship: DependentRelationship;
    dateOfBirth: string | null;
  },
): Promise<FamilyProfileDto> {
  const existingProfiles = await listProfilesByUser(client, userId);
  const dependentCount = existingProfiles.filter((p) => !p.isPrimary).length;

  if (dependentCount >= MAX_DEPENDENT_PROFILES) {
    throw new ConflictError(
      `Maximum of ${MAX_DEPENDENT_PROFILES} dependent family profiles allowed per account.`,
      "MAX_PROFILES_EXCEEDED",
    );
  }

  const colorIndex = computeNextDependentColorIndex(existingProfiles);

  return createDependentProfile(client, userId, {
    fullName: input.fullName,
    relationship: input.relationship,
    dateOfBirth: input.dateOfBirth,
    colorIndex,
  });
}

export async function updateManagedFamilyProfile(
  client: SupabaseClient<Database>,
  userId: string,
  input: {
    profileId: string;
    fullName: string;
    relationship: FamilyRelationship;
    dateOfBirth: string | null;
  },
): Promise<FamilyProfileDto> {
  const existing = await getProfileById(client, userId, input.profileId);

  if (existing.isPrimary && input.relationship !== "Self") {
    throw new ValidationError("The primary profile relationship must remain Self.");
  }
  if (!existing.isPrimary && input.relationship === "Self") {
    throw new ValidationError("Only the primary profile can have the Self relationship.");
  }

  return updateFamilyProfile(client, userId, input);
}

export async function deleteManagedDependentProfile(
  client: SupabaseClient<Database>,
  userId: string,
  profileId: string,
): Promise<string> {
  const existing = await getProfileById(client, userId, profileId);
  if (existing.isPrimary) {
    throw new ConflictError(
      "The primary Self profile cannot be deleted.",
      "CANNOT_DELETE_PRIMARY_PROFILE",
    );
  }

  const storagePaths = await listStoragePathsByProfile(client, userId, profileId);
  if (storagePaths.length > 0) {
    await client.storage.from("vault-files").remove(storagePaths);
  }

  return deleteDependentProfile(client, userId, profileId);
}
