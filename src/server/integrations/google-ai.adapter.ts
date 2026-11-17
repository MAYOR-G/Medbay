import { GoogleGenAI } from "@google/genai";
import { getServerEnv } from "@/lib/env";
import { ExternalProviderError } from "@/lib/errors";

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 1536;
const RETRY_DELAYS_MS = [500, 1500, 3000] as const;

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedSingleWithRetry(
  ai: GoogleGenAI,
  text: string,
  taskType: EmbeddingTaskType,
): Promise<number[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: {
          taskType,
          outputDimensionality: EMBEDDING_DIMENSIONS,
          httpOptions: {
            timeout: 15_000,
          },
        },
      });

      const values = response.embeddings?.[0]?.values;
      if (!values || values.length !== EMBEDDING_DIMENSIONS) {
        throw new ExternalProviderError(
          `Expected ${EMBEDDING_DIMENSIONS}-dim embedding, received ${values?.length ?? 0}.`,
        );
      }
      return values;
    } catch (err) {
      lastError = err;
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay !== undefined) {
        await sleep(delay);
      }
    }
  }

  throw new ExternalProviderError(
    `Google AI embedding failed after retries: ${lastError instanceof Error ? lastError.message : "unknown"}`,
  );
}

/**
 * Generates 1536-dimensional embeddings using Google AI gemini-embedding-001.
 */
export async function embedTexts(
  texts: string[],
  taskType: EmbeddingTaskType,
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const { GOOGLE_AI_API_KEY } = getServerEnv();
  const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });

  const vectors: number[][] = [];
  for (const text of texts) {
    vectors.push(await embedSingleWithRetry(ai, text, taskType));
  }
  return vectors;
}
