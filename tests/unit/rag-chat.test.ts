import { describe, expect, it } from "vitest";
import {
  buildRagChatSystemPrompt,
  formatVaultContextForPrompt,
} from "@/server/agents/prompts/rag-chat.prompt";
import type { MatchedDocumentChunkDto } from "@/types/domain.types";

function makeChunk(overrides: Partial<MatchedDocumentChunkDto> = {}): MatchedDocumentChunkDto {
  return {
    chunkId: "chunk-1",
    documentId: "doc-1",
    documentTitle: "Pediatric Immunization Record",
    documentDate: "2026-09-20",
    detectedPatientName: "David Morgan",
    profileName: "David Morgan",
    content: "DTaP booster administered.",
    similarity: 0.88,
    ...overrides,
  };
}

describe("rag-chat prompt builder", () => {
  it("caps injected RAG context below 24,000 characters", () => {
    const hugeChunks = Array.from({ length: 20 }, (_, i) =>
      makeChunk({
        chunkId: `chunk-${i}`,
        content: "Medical record observation. ".repeat(150),
      }),
    );

    const formatted = formatVaultContextForPrompt(hugeChunks);
    expect(formatted.length).toBeLessThanOrEqual(24_000);
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("enforces profile scope and cross-document identity guardrail in system prompt", () => {
    const prompt = buildRagChatSystemPrompt({
      activeProfileName: "David Morgan",
      retrievedChunks: [makeChunk({ detectedPatientName: "Sarah Morgan" })],
      currentIsoDate: "2026-11-17T12:00:00.000Z",
    });

    expect(prompt).toContain('strictly to family member "David Morgan"');
    expect(prompt).toContain("Patient Name on Document: Sarah Morgan");
    expect(prompt).toContain("Cross-Document Identity Guardrail");
    expect(prompt).toContain("book_calendar_appointment");
  });
});
