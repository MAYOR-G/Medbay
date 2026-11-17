import { describe, expect, it } from "vitest";
import {
  chunkMedicalText,
  detectMimeFromMagicBytes,
  matchPatientNameToProfile,
  sanitizeUploadFilename,
} from "@/server/services/document-utils";
import type { FamilyProfileDto } from "@/types/domain.types";

const SAMPLE_PROFILES: FamilyProfileDto[] = [
  {
    id: "prof-self",
    userId: "user-1",
    fullName: "Alex Morgan",
    relationship: "Self",
    dateOfBirth: "1988-04-12",
    isPrimary: true,
    colorIndex: 0,
    createdAt: "2026-11-17T10:00:00.000Z",
    updatedAt: "2026-11-17T10:00:00.000Z",
  },
  {
    id: "prof-david",
    userId: "user-1",
    fullName: "David Morgan",
    relationship: "Child",
    dateOfBirth: "2019-09-03",
    isPrimary: false,
    colorIndex: 2,
    createdAt: "2026-11-17T10:05:00.000Z",
    updatedAt: "2026-11-17T10:05:00.000Z",
  },
];

describe("document-utils", () => {
  it("verifies magic bytes for PDF, JPEG, PNG, WebP, DOCX, and TXT while rejecting spoofed binaries", () => {
    expect(detectMimeFromMagicBytes(Buffer.from("%PDF-1.7\n..."), "image/png", "doc.pdf")).toBe(
      "application/pdf",
    );
    expect(
      detectMimeFromMagicBytes(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg", "scan.jpg"),
    ).toBe("image/jpeg");
    expect(
      detectMimeFromMagicBytes(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        "image/png",
        "scan.png",
      ),
    ).toBe("image/png");
    expect(detectMimeFromMagicBytes(Buffer.from("RIFF1234WEBP"), "image/webp", "scan.webp")).toBe(
      "image/webp",
    );
    expect(
      detectMimeFromMagicBytes(
        Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "note.docx",
      ),
    ).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(detectMimeFromMagicBytes(Buffer.from("CBC panel normal"), "text/plain", "lab.txt")).toBe(
      "text/plain",
    );

    // Executable MZ header disguised as PDF
    expect(
      detectMimeFromMagicBytes(Buffer.from("MZ\x90\x00"), "application/pdf", "evil.pdf"),
    ).toBeNull();
  });

  it("sanitizes filenames against directory traversal and special characters", () => {
    expect(sanitizeUploadFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeUploadFilename("..hidden\0file (1).pdf")).toBe("hiddenfile__1_.pdf");
  });

  it("matches patient names accurately and flags unrecognized names as needs_review", () => {
    expect(matchPatientNameToProfile("David Morgan", SAMPLE_PROFILES)).toEqual({
      profileId: "prof-david",
      confidence: "high",
    });

    expect(matchPatientNameToProfile("D. Morgan", SAMPLE_PROFILES).confidence).toBe("needs_review");
    expect(matchPatientNameToProfile("John Doe", SAMPLE_PROFILES)).toEqual({
      profileId: null,
      confidence: "needs_review",
    });
  });

  it("chunks long medical documents with bounded size and overlapping context", () => {
    const paragraph = "Hemoglobin A1c is 5.6 percent within normal range. ".repeat(40);
    const longText = `${paragraph}\n\n${paragraph}`;
    const chunks = chunkMedicalText(longText, 1200, 200);

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(1200);
      expect(chunk.length).toBeGreaterThan(0);
    }
  });
});
