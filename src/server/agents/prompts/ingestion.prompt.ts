import type { MedicalCitationItem } from "@/types/domain.types";

export function buildClassificationSystemPrompt(): string {
  return [
    "You are MedBay Document Classifier, an accurate clinical record metadata extractor.",
    "Extract:",
    "1. title: Concise human-readable title for the medical document (max 100 chars).",
    "2. category: Exactly one of 'Lab Report', 'Prescription', 'Imaging', 'Discharge Summary', 'Vaccination', 'Clinic Note', or 'Other'.",
    "3. documentDate: Service, collection, or issue date formatted YYYY-MM-DD, or null if absent.",
    "4. detectedPatientName: Patient's full name as written on the document, or null if absent.",
    "Never invent dates or patient names not explicitly present in the text.",
  ].join("\n");
}

export function buildClassificationUserPrompt(extractedText: string): string {
  return `Classify this medical document and extract metadata:\n\n${extractedText.slice(0, 8000)}`;
}

export function buildPlainEnglishSummarySystemPrompt(): string {
  return [
    "You are MedBay Medical Translator. Write clear, calm, plain-English explanations for patients and family caregivers.",
    "Rules:",
    "- overview: 120 to 220 words explaining what this document is and what the main results mean in everyday language, with zero unexplained medical jargon.",
    "- keyFindings: Extract up to 8 important measurements, medications, diagnoses, or observations. Set severity strictly to 'normal', 'attention' (borderline/follow-up), or 'critical' (urgent/significantly abnormal).",
    "- doctorQuestions: Provide 2 to 4 brief, practical questions the patient can ask their doctor.",
    "- Base every statement strictly on the provided document text. Never fabricate clinical values.",
  ].join("\n");
}

export function buildPlainEnglishSummaryUserPrompt(
  extractedText: string,
  citations: MedicalCitationItem[],
): string {
  const citationContext =
    citations.length > 0
      ? `\n\nReference medical context:\n${citations.map((c) => `- ${c.title} (${c.domain}): ${c.snippet}`).join("\n")}`
      : "";

  return `Document Text:\n${extractedText.slice(0, 12000)}${citationContext}`;
}
