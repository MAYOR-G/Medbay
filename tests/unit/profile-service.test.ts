import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { ConflictError, ValidationError } from "@/lib/errors";
import {
  computeNextDependentColorIndex,
  createManagedDependentProfile,
  deleteManagedDependentProfile,
  updateManagedFamilyProfile,
} from "@/server/services/profile.service";
import * as repositories from "@/server/repositories";
import type { Database } from "@/types/database.types";
import type { FamilyProfileDto } from "@/types/domain.types";

function makeProfile(overrides: Partial<FamilyProfileDto> = {}): FamilyProfileDto {
  return {
    id: "22222222-2222-4222-8222-222222222201",
    userId: "11111111-1111-4111-8111-111111111111",
    fullName: "Alex Morgan",
    relationship: "Self",
    dateOfBirth: null,
    isPrimary: true,
    colorIndex: 0,
    createdAt: "2026-11-17T10:00:00.000Z",
    updatedAt: "2026-11-17T10:00:00.000Z",
    ...overrides,
  };
}

const dummyClient = {} as SupabaseClient<Database>;

describe("profile.service", () => {
  it("computes deterministic unused dependent color indices 1-6", () => {
    const primary = makeProfile();
    expect(computeNextDependentColorIndex([primary])).toBe(1);

    const dep1 = makeProfile({
      id: "dep-1",
      isPrimary: false,
      relationship: "Spouse",
      colorIndex: 1,
    });
    expect(computeNextDependentColorIndex([primary, dep1])).toBe(2);
  });

  it("throws 409 MAX_PROFILES_EXCEEDED when 15 dependents already exist", async () => {
    const primary = makeProfile();
    const dependents = Array.from({ length: 15 }, (_, idx) =>
      makeProfile({
        id: `dep-${idx}`,
        isPrimary: false,
        relationship: "Child",
        colorIndex: (idx % 6) + 1,
      }),
    );

    vi.spyOn(repositories, "listProfilesByUser").mockResolvedValueOnce([primary, ...dependents]);

    await expect(
      createManagedDependentProfile(dummyClient, primary.userId, {
        fullName: "16th Dependent",
        relationship: "Other",
        dateOfBirth: null,
      }),
    ).rejects.toMatchObject({
      code: "MAX_PROFILES_EXCEEDED",
      statusCode: 409,
    } satisfies Partial<ConflictError>);
  });

  it("blocks changing primary profile relationship away from Self", async () => {
    const primary = makeProfile();
    vi.spyOn(repositories, "getProfileById").mockResolvedValueOnce(primary);

    await expect(
      updateManagedFamilyProfile(dummyClient, primary.userId, {
        profileId: primary.id,
        fullName: "Alex Morgan",
        relationship: "Spouse",
        dateOfBirth: null,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("blocks deleting the primary Self profile with 409 CANNOT_DELETE_PRIMARY_PROFILE", async () => {
    const primary = makeProfile();
    vi.spyOn(repositories, "getProfileById").mockResolvedValueOnce(primary);

    await expect(
      deleteManagedDependentProfile(dummyClient, primary.userId, primary.id),
    ).rejects.toMatchObject({
      code: "CANNOT_DELETE_PRIMARY_PROFILE",
      statusCode: 409,
    } satisfies Partial<ConflictError>);
  });
});
