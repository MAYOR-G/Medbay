import type { SupabaseClient } from "@supabase/supabase-js";
import { ConflictError, ExternalProviderError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/types/database.types";
import type {
  DependentRelationship,
  FamilyProfileDto,
  FamilyRelationship,
} from "@/types/domain.types";

type ProfileRow = Database["public"]["Tables"]["family_profiles"]["Row"];

function mapProfileRowToDto(row: ProfileRow): FamilyProfileDto {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    relationship: row.relationship as FamilyRelationship,
    dateOfBirth: row.date_of_birth,
    isPrimary: row.is_primary,
    colorIndex: row.color_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProfilesByUser(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<FamilyProfileDto[]> {
  const { data, error } = await client
    .from("family_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new ExternalProviderError(`Failed to load family profiles: ${error.message}`);
  }
  return (data ?? []).map(mapProfileRowToDto);
}

export async function getProfileById(
  client: SupabaseClient<Database>,
  userId: string,
  profileId: string,
): Promise<FamilyProfileDto> {
  const { data, error } = await client
    .from("family_profiles")
    .select("*")
    .eq("id", profileId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to load family profile: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Family profile not found.");
  }
  return mapProfileRowToDto(data);
}

export async function getPrimaryProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<FamilyProfileDto> {
  const { data, error } = await client
    .from("family_profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to load primary profile: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Primary Self profile not found.");
  }
  return mapProfileRowToDto(data);
}

export async function ensurePrimarySelfProfile(
  client: SupabaseClient<Database>,
  userId: string,
  fullName: string,
): Promise<FamilyProfileDto> {
  const { data: existing, error: selectError } = await client
    .from("family_profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (selectError) {
    throw new ExternalProviderError(`Failed to check primary profile: ${selectError.message}`);
  }
  if (existing) {
    return mapProfileRowToDto(existing);
  }

  const { data: created, error: insertError } = await client
    .from("family_profiles")
    .insert({
      user_id: userId,
      full_name: fullName,
      relationship: "Self",
      is_primary: true,
      color_index: 0,
    })
    .select("*")
    .single();

  if (insertError || !created) {
    throw new ExternalProviderError(
      `Failed to create primary Self profile: ${insertError?.message ?? "unknown"}`,
    );
  }
  return mapProfileRowToDto(created);
}

export async function createDependentProfile(
  client: SupabaseClient<Database>,
  userId: string,
  input: {
    fullName: string;
    relationship: DependentRelationship;
    dateOfBirth: string | null;
    colorIndex: number;
  },
): Promise<FamilyProfileDto> {
  const { data, error } = await client
    .from("family_profiles")
    .insert({
      user_id: userId,
      full_name: input.fullName,
      relationship: input.relationship,
      date_of_birth: input.dateOfBirth,
      is_primary: false,
      color_index: input.colorIndex,
    })
    .select("*")
    .single();

  if (error) {
    if (error.message.includes("MAX_PROFILES_EXCEEDED")) {
      throw new ConflictError(
        "Maximum of 15 dependent family profiles allowed per account.",
        "MAX_PROFILES_EXCEEDED",
      );
    }
    throw new ExternalProviderError(`Failed to create family profile: ${error.message}`);
  }
  if (!data) {
    throw new ExternalProviderError("Failed to create family profile.");
  }
  return mapProfileRowToDto(data);
}

export async function updateFamilyProfile(
  client: SupabaseClient<Database>,
  userId: string,
  input: {
    profileId: string;
    fullName: string;
    relationship: FamilyRelationship;
    dateOfBirth: string | null;
  },
): Promise<FamilyProfileDto> {
  const { data, error } = await client
    .from("family_profiles")
    .update({
      full_name: input.fullName,
      relationship: input.relationship,
      date_of_birth: input.dateOfBirth,
    })
    .eq("id", input.profileId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to update family profile: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Family profile not found.");
  }
  return mapProfileRowToDto(data);
}

export async function deleteDependentProfile(
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

  const { error } = await client
    .from("family_profiles")
    .delete()
    .eq("id", profileId)
    .eq("user_id", userId)
    .eq("is_primary", false);

  if (error) {
    throw new ExternalProviderError(`Failed to delete family profile: ${error.message}`);
  }
  return profileId;
}
