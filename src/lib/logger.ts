export type LogLevel = "info" | "warn" | "error";

export interface StructuredLogPayload {
  service: string;
  event: string;
  userId?: string;
  documentId?: string;
  durationMs?: number;
  errorCode?: string;
  meta?: Record<string, string | number | boolean | null>;
}

const REDACTED_KEYS = new Set([
  "extractedtext",
  "overview",
  "summary",
  "patientname",
  "detectedpatientname",
  "token",
  "refreshtoken",
  "accesstoken",
  "prompt",
  "message",
  "subject",
  "snippet",
  "email",
]);

function sanitizeMeta(
  meta?: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> | undefined {
  if (!meta) return undefined;
  const cleaned: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(meta)) {
    const normalized = key.toLowerCase().replace(/[_-]/g, "");
    cleaned[key] = REDACTED_KEYS.has(normalized) ? "[REDACTED]" : value;
  }
  return cleaned;
}

/**
 * Emits single-line structured JSON logs with PHI/PII keys automatically redacted.
 */
export function logEvent(level: LogLevel, payload: StructuredLogPayload): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: payload.service,
    event: payload.event,
    ...(payload.userId ? { userId: payload.userId } : {}),
    ...(payload.documentId ? { documentId: payload.documentId } : {}),
    ...(payload.durationMs !== undefined ? { durationMs: payload.durationMs } : {}),
    ...(payload.errorCode ? { errorCode: payload.errorCode } : {}),
    ...(payload.meta ? { meta: sanitizeMeta(payload.meta) } : {}),
  };

  const serialized = JSON.stringify(entry);
  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.info(serialized);
  }
}
