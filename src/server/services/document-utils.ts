import type { AllowedDocumentMimeType, FamilyProfileDto } from "@/types/domain.types";

/**
 * Inspects leading binary magic bytes to verify genuine file type rather than trusting Content-Type.
 */
export function detectMimeFromMagicBytes(
  buffer: Buffer,
  declaredMime: string,
  filename: string,
): AllowedDocumentMimeType | null {
  if (buffer.length === 0) return null;

  // PDF: %PDF
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return "application/pdf";
  }

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  // DOCX (OOXML ZIP container): PK\x03\x04
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04 &&
    (declaredMime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      filename.toLowerCase().endsWith(".docx"))
  ) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  // Plain UTF-8 text (no null bytes, valid UTF-8 decoding)
  if (declaredMime === "text/plain" || filename.toLowerCase().endsWith(".txt")) {
    const sample = buffer.subarray(0, Math.min(buffer.length, 4100));
    if (sample.includes(0x00)) return null;
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(sample);
      return "text/plain";
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Strips path traversal segments, null bytes, and special characters from uploaded filenames.
 */
export function sanitizeUploadFilename(originalFilename: string): string {
  const baseName = originalFilename.split(/[\\/]/).pop() ?? "document";
  const cleaned = baseName
    .replace(/\0/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "");
  return cleaned.slice(0, 120) || "document";
}

function normalizeName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i]![0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0]![j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
    }
  }
  return matrix[a.length]![b.length]!;
}

/**
 * Matches an extracted patient name against existing FamilyProfile names using token & Levenshtein similarity.
 */
export function matchPatientNameToProfile(
  detectedPatientName: string | null,
  profiles: FamilyProfileDto[],
): { profileId: string | null; confidence: "high" | "needs_review" } {
  if (!detectedPatientName || profiles.length === 0) {
    return { profileId: null, confidence: "needs_review" };
  }

  const target = normalizeName(detectedPatientName);
  if (!target) {
    return { profileId: null, confidence: "needs_review" };
  }

  const targetTokens = target.split(" ").filter((t) => t.length > 1);
  let bestProfileId: string | null = null;
  let bestScore = 0;

  for (const profile of profiles) {
    const candidate = normalizeName(profile.fullName);
    if (!candidate) continue;

    if (candidate === target) {
      return { profileId: profile.id, confidence: "high" };
    }

    const maxLen = Math.max(candidate.length, target.length);
    const editSimilarity = maxLen > 0 ? 1 - levenshteinDistance(candidate, target) / maxLen : 0;

    const candidateTokens = candidate.split(" ").filter((t) => t.length > 1);
    const overlapCount = targetTokens.filter((token) => candidateTokens.includes(token)).length;
    const tokenScore =
      Math.max(targetTokens.length, candidateTokens.length) > 0
        ? overlapCount / Math.max(targetTokens.length, candidateTokens.length)
        : 0;

    const firstNameMatches =
      targetTokens[0] !== undefined &&
      candidateTokens[0] !== undefined &&
      targetTokens[0] === candidateTokens[0];

    const combined = Math.max(editSimilarity, tokenScore, firstNameMatches ? 0.78 : 0);
    if (combined > bestScore) {
      bestScore = combined;
      bestProfileId = profile.id;
    }
  }

  if (bestProfileId && bestScore >= 0.75) {
    return { profileId: bestProfileId, confidence: "high" };
  }

  return { profileId: null, confidence: "needs_review" };
}

/**
 * Splits extracted medical text into overlapping semantic chunks (~650 tokens / ~2400 chars,
 * ~100 tokens / ~400 chars overlap) while preserving word/sentence boundaries.
 */
export function chunkMedicalText(
  rawText: string,
  targetChars = 2400,
  overlapChars = 400,
): string[] {
  const normalized = rawText.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= targetChars) return [normalized];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + targetChars, normalized.length);

    if (end < normalized.length) {
      const boundarySlice = normalized.slice(start, end);
      const lastParagraph = boundarySlice.lastIndexOf("\n\n");
      const lastSentence = boundarySlice.lastIndexOf(". ");
      const lastSpace = boundarySlice.lastIndexOf(" ");

      const breakOffset =
        lastParagraph > targetChars * 0.5
          ? lastParagraph + 2
          : lastSentence > targetChars * 0.5
            ? lastSentence + 2
            : lastSpace > targetChars * 0.5
              ? lastSpace + 1
              : boundarySlice.length;

      end = start + breakOffset;
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) break;
    start = Math.max(start + 1, end - overlapChars);
  }

  return chunks;
}
