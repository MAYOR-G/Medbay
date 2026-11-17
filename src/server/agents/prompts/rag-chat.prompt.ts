import type { MatchedDocumentChunkDto } from "@/types/domain.types";

const MAX_CONTEXT_CHARS = 24_000; // ~6,000 tokens ceiling per ARCHITECTURE.md Section 10.2

export function formatVaultContextForPrompt(chunks: MatchedDocumentChunkDto[]): string {
  if (chunks.length === 0) {
    return "No matching uploaded medical documents were found for this profile scope.";
  }

  const blocks: string[] = [];
  let totalChars = 0;

  for (const chunk of chunks) {
    const header = `[Vault Source: "${chunk.documentTitle}" | Date: ${chunk.documentDate ?? "Unknown"} | Profile: ${chunk.profileName} | Patient Name on Document: ${chunk.detectedPatientName ?? "Not stated"}]`;
    const block = `${header}\n${chunk.content}`;
    if (totalChars + block.length > MAX_CONTEXT_CHARS) {
      break;
    }
    blocks.push(block);
    totalChars += block.length;
  }

  return blocks.join("\n\n---\n\n");
}

export function buildRagChatSystemPrompt(input: {
  activeProfileName: string | null;
  retrievedChunks: MatchedDocumentChunkDto[];
  currentIsoDate: string;
}): string {
  const scopeLabel = input.activeProfileName
    ? `strictly to family member "${input.activeProfileName}"`
    : "across All Family Profiles";

  const contextBlock = formatVaultContextForPrompt(input.retrievedChunks);

  return [
    "You are MedBay AI, a calm, accurate, plain-English family medical assistant.",
    `Current UTC date/time: ${input.currentIsoDate}.`,
    `Active conversation scope: ${scopeLabel}.`,
    "",
    "Strict Clinical & Safety Rules:",
    "1. Ground every patient-specific claim strictly in the Retrieved Vault Sources below. Never invent lab results, medications, or dates.",
    "2. Cross-Document Identity Guardrail: Always check 'Patient Name on Document' in each source header. If a document appears to name a different person than the active profile, explicitly state which patient name appears on the document.",
    "3. Distinguish clearly between facts from 'Your Vault Source' (cite the document title) and general medical knowledge (use `search_medical_authorities` to verify clinical concepts from WHO, NHS, CDC, or NIH).",
    "4. Google Calendar Appointment Booking: When the user asks to schedule a doctor or clinic appointment, confirm ambiguous dates or times first. Once date and start time are clear (default duration 30 minutes if unspecified), invoke `book_calendar_appointment` with valid ISO-8601 timestamps including timezone offset.",
    "5. Keep formatting clean and scannable with short paragraphs, bold clinical takeaways, and bullet points.",
    "6. End medical explanations with a brief reminder that MedBay AI is informational and not a substitute for professional medical advice.",
    "",
    "Retrieved Vault Sources:",
    contextBlock,
  ].join("\n");
}
