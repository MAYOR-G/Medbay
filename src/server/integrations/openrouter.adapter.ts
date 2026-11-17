import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import type { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { ExternalProviderError } from "@/lib/errors";

export const PRIMARY_OPENROUTER_MODEL = "deepseek/deepseek-v4.1-flash";
export const HEAVY_OPENROUTER_MODEL = "google/gemini-4-carbon";
export const FALLBACK_OPENROUTER_MODEL = "openai/gpt-oss-20b:free";

const DEFAULT_MODEL_CHAIN = [PRIMARY_OPENROUTER_MODEL, FALLBACK_OPENROUTER_MODEL];
const HEAVY_MODEL_CHAIN = [
  HEAVY_OPENROUTER_MODEL,
  PRIMARY_OPENROUTER_MODEL,
  FALLBACK_OPENROUTER_MODEL,
];

function createOpenRouterClient() {
  const { OPENROUTER_API_KEY } = getServerEnv();
  return createOpenRouter({
    apiKey: OPENROUTER_API_KEY,
  });
}

export function getOpenRouterChatModel(useHeavyReasoning = false) {
  const openrouter = createOpenRouterClient();
  const primaryId = useHeavyReasoning ? HEAVY_OPENROUTER_MODEL : PRIMARY_OPENROUTER_MODEL;
  const models = useHeavyReasoning ? HEAVY_MODEL_CHAIN : DEFAULT_MODEL_CHAIN;

  return openrouter.chat(primaryId, {
    models,
  });
}

async function runWithSingleRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fn();
  }
}

/**
 * Extracts text from a scanned or digital PDF via OpenRouter's file-parser (mistral-ocr).
 */
export async function extractTextFromPdfWithOcr(
  pdfBuffer: Buffer,
  filename: string,
): Promise<string> {
  const openrouter = createOpenRouterClient();
  const model = openrouter.chat(PRIMARY_OPENROUTER_MODEL, {
    models: DEFAULT_MODEL_CHAIN,
    plugins: [
      {
        id: "file-parser",
        pdf: { engine: "mistral-ocr" },
      },
    ],
    reasoning: { enabled: false, effort: "none" },
  });

  try {
    const result = await runWithSingleRetry(() =>
      generateText({
        model,
        abortSignal: AbortSignal.timeout(45_000),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe every visible word, lab value, reference range, date, and patient name from this medical document verbatim as plain text. Do not summarize or omit anything.",
              },
              {
                type: "file",
                data: pdfBuffer,
                mediaType: "application/pdf",
                filename,
              },
            ],
          },
        ],
      }),
    );

    const text = result.text.trim();
    if (!text) {
      throw new ExternalProviderError("PDF OCR returned empty text.");
    }
    return text;
  } catch (err) {
    if (err instanceof ExternalProviderError) throw err;
    throw new ExternalProviderError(
      `PDF OCR failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}

/**
 * Transcribes medical document images verbatim with reasoning disabled for accuracy.
 */
export async function extractTextFromImageWithVision(
  imageBuffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
): Promise<string> {
  const openrouter = createOpenRouterClient();
  const model = openrouter.chat(PRIMARY_OPENROUTER_MODEL, {
    models: DEFAULT_MODEL_CHAIN,
    reasoning: { enabled: false, effort: "none" },
  });

  try {
    const result = await runWithSingleRetry(() =>
      generateText({
        model,
        abortSignal: AbortSignal.timeout(45_000),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe all text, numbers, units, reference ranges, dates, and patient name visible in this medical image verbatim. Preserve line structure and do not interpret or summarize.",
              },
              {
                type: "image",
                image: imageBuffer,
                mediaType: mimeType,
              },
            ],
          },
        ],
      }),
    );

    const text = result.text.trim();
    if (!text) {
      throw new ExternalProviderError("Image transcription returned empty text.");
    }
    return text;
  } catch (err) {
    if (err instanceof ExternalProviderError) throw err;
    throw new ExternalProviderError(
      `Image vision transcription failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}

/**
 * Generates a strict Zod-validated JSON object via OpenRouter with automatic model fallback.
 */
export async function generateStructuredJson<T extends z.ZodTypeAny>(
  systemPrompt: string,
  userPrompt: string,
  schema: T,
): Promise<{ data: z.infer<T>; modelUsed: string }> {
  const openrouter = createOpenRouterClient();
  const model = openrouter.chat(PRIMARY_OPENROUTER_MODEL, {
    models: DEFAULT_MODEL_CHAIN,
    temperature: 0.2,
  });

  try {
    const result = await runWithSingleRetry(() =>
      generateText({
        model,
        abortSignal: AbortSignal.timeout(45_000),
        system: systemPrompt,
        prompt: userPrompt,
        output: Output.object({ schema }),
      }),
    );

    const parsed = schema.parse(result.output);
    return {
      data: parsed,
      modelUsed: result.response?.modelId || PRIMARY_OPENROUTER_MODEL,
    };
  } catch (err) {
    throw new ExternalProviderError(
      `Structured LLM generation failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}
