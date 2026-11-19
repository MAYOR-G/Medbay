import { describe, expect, it } from "vitest";
import { ConflictError, normalizeError, ValidationError } from "@/lib/errors";
import { createFamilyProfileSchema } from "@/lib/schemas";
import { parseWithZod } from "@/server/actions/action-utils";
import { useVaultStore } from "@/stores/use-vault-store";

describe("action error normalization and Zod parsing", () => {
  it("normalizes AppError subclasses into API error bodies", () => {
    const conflict = new ConflictError("Limit reached.", "MAX_PROFILES_EXCEEDED");
    expect(normalizeError(conflict)).toEqual({
      statusCode: 409,
      body: {
        code: "MAX_PROFILES_EXCEEDED",
        message: "Limit reached.",
      },
    });

    const unexpected = normalizeError(new Error("database password leaked"));
    expect(unexpected).toEqual({
      statusCode: 500,
      body: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred.",
      },
    });
  });

  it("throws ValidationError with fieldErrors when Zod parsing fails", () => {
    try {
      parseWithZod(createFamilyProfileSchema, {
        fullName: "",
        relationship: "Self",
      });
      expect.unreachable("Expected ValidationError");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      const validationErr = err as ValidationError;
      expect(validationErr.statusCode).toBe(400);
      expect(validationErr.fieldErrors?.fullName).toBeDefined();
      expect(validationErr.fieldErrors?.relationship).toBeDefined();
    }
  });
});

describe("useVaultStore", () => {
  it("tracks activeProfileId, upload sheet state, and toast queue", () => {
    const store = useVaultStore.getState();
    expect(store.activeProfileId).toBe("all");

    store.setActiveProfileId("22222222-2222-4222-8222-222222222201");
    expect(useVaultStore.getState().activeProfileId).toBe("22222222-2222-4222-8222-222222222201");

    store.setUploadSheetOpen(true);
    expect(useVaultStore.getState().isUploadSheetOpen).toBe(true);

    store.addToast("Profile saved", "success");
    const toasts = useVaultStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe("Profile saved");

    if (toasts[0]) {
      store.dismissToast(toasts[0].id);
    }
    expect(useVaultStore.getState().toasts).toHaveLength(0);

    expect(useVaultStore.getState().isChatOpen).toBe(false);
    expect(useVaultStore.getState().hasOpenedChat).toBe(false);
    store.setChatOpen(true, "Explain my CMP lab results");
    expect(useVaultStore.getState().isChatOpen).toBe(true);
    expect(useVaultStore.getState().hasOpenedChat).toBe(true);
    expect(useVaultStore.getState().chatInitialPrompt).toBe("Explain my CMP lab results");
    store.setChatOpen(false);
    expect(useVaultStore.getState().isChatOpen).toBe(false);
    expect(useVaultStore.getState().hasOpenedChat).toBe(true);
    expect(useVaultStore.getState().chatInitialPrompt).toBeNull();
  });
});
