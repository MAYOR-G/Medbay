import { describe, expect, it } from "vitest";
import {
  chatRequestSchema,
  createFamilyProfileSchema,
  createShareLinkSchema,
  documentFileMetaSchema,
  markNotificationsReadSchema,
  shareTokenParamSchema,
  updateDocumentMetadataSchema,
  vaultSearchParamsSchema,
} from "@/lib/schemas";
import { MAX_DOCUMENT_SIZE_BYTES } from "@/types/domain.types";

describe("MedBay Zod validation schemas", () => {
  it("validates dependent family profile creation without email/password", () => {
    const valid = createFamilyProfileSchema.safeParse({
      fullName: "David Morgan",
      relationship: "Child",
      dateOfBirth: "2019-09-03",
    });
    expect(valid.success).toBe(true);

    const selfAttempt = createFamilyProfileSchema.safeParse({
      fullName: "Alex Morgan",
      relationship: "Self",
    });
    expect(selfAttempt.success).toBe(false);

    const futureDob = createFamilyProfileSchema.safeParse({
      fullName: "Future Child",
      relationship: "Child",
      dateOfBirth: "2099-01-01",
    });
    expect(futureDob.success).toBe(false);
  });

  it("enforces 25 MB limit and 6 allowed MIME types for document uploads", () => {
    expect(
      documentFileMetaSchema.safeParse({
        mimeType: "application/pdf",
        fileSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      }).success,
    ).toBe(true);

    expect(
      documentFileMetaSchema.safeParse({
        mimeType: "application/pdf",
        fileSizeBytes: MAX_DOCUMENT_SIZE_BYTES + 1,
      }).success,
    ).toBe(false);

    expect(
      documentFileMetaSchema.safeParse({
        mimeType: "application/zip",
        fileSizeBytes: 1024,
      }).success,
    ).toBe(false);
  });

  it("validates document metadata updates and category enum", () => {
    const valid = updateDocumentMetadataSchema.safeParse({
      documentId: "33333333-3333-4333-8333-333333333301",
      title: "Comprehensive Metabolic Panel",
      category: "Lab Report",
      documentDate: "2026-10-14",
    });
    expect(valid.success).toBe(true);
  });

  it("validates expiring share link presets and 192-bit token format", () => {
    expect(
      createShareLinkSchema.safeParse({
        documentId: "33333333-3333-4333-8333-333333333301",
        durationPreset: "7d",
      }).success,
    ).toBe(true);

    expect(
      createShareLinkSchema.safeParse({
        documentId: "33333333-3333-4333-8333-333333333301",
        durationPreset: "90d",
      }).success,
    ).toBe(false);

    expect(
      shareTokenParamSchema.safeParse({
        token: "AbCdEfGhIjKlMnOpQrStUvWxYz012345",
      }).success,
    ).toBe(true);

    expect(
      shareTokenParamSchema.safeParse({
        token: "../bad-token",
      }).success,
    ).toBe(false);
  });

  it("validates chat requests, pagination bounds, and notification reads", () => {
    expect(
      chatRequestSchema.safeParse({
        threadId: null,
        profileId: "22222222-2222-4222-8222-222222222201",
        message: "What was my LDL cholesterol?",
      }).success,
    ).toBe(true);

    const parsedSearch = vaultSearchParamsSchema.parse({ page: "2", pageSize: "20" });
    expect(parsedSearch.page).toBe(2);
    expect(parsedSearch.profileId).toBe("all");
    expect(parsedSearch.category).toBe("all");

    expect(markNotificationsReadSchema.safeParse({}).success).toBe(false);
    expect(markNotificationsReadSchema.safeParse({ markAll: true }).success).toBe(true);
  });
});
