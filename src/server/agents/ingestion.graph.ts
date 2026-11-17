import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import mammoth from "mammoth";
import { ExternalProviderError } from "@/lib/errors";
import { logEvent } from "@/lib/logger";
import { agent1ClassificationSchema, agent1SummaryOutputSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  downloadVaultFile,
  embedTexts,
  extractTextFromImageWithVision,
  extractTextFromPdfWithOcr,
  generateStructuredJson,
  searchMedicalAuthorities,
} from "@/server/integrations";
import {
  completeDocumentIngestion,
  getDocumentStorageLocation,
  listProfilesByUser,
  updateIngestionStatus,
} from "@/server/repositories";
import { chunkMedicalText, matchPatientNameToProfile } from "@/server/services/document-utils";
import type {
  AllowedDocumentMimeType,
  DocumentCategory,
  KeyFindingItem,
  MedicalCitationItem,
  ProfileMatchConfidence,
} from "@/types/domain.types";
import {
  buildClassificationSystemPrompt,
  buildClassificationUserPrompt,
  buildPlainEnglishSummarySystemPrompt,
  buildPlainEnglishSummaryUserPrompt,
} from "./prompts";

const IngestionState = Annotation.Root({
  documentId: Annotation<string>(),
  userId: Annotation<string>(),
  selectedProfileId: Annotation<string>(),
  autoDetectProfile: Annotation<boolean>(),
  storagePath: Annotation<string>(),
  mimeType: Annotation<AllowedDocumentMimeType>(),
  originalFilename: Annotation<string>(),
  extractedText: Annotation<string>(),
  title: Annotation<string>(),
  category: Annotation<DocumentCategory>(),
  documentDate: Annotation<string | null>(),
  detectedPatientName: Annotation<string | null>(),
  assignedProfileId: Annotation<string>(),
  profileMatchConfidence: Annotation<ProfileMatchConfidence>(),
  citations: Annotation<MedicalCitationItem[]>(),
  overview: Annotation<string>(),
  keyFindings: Annotation<KeyFindingItem[]>(),
  doctorQuestions: Annotation<string[]>(),
  modelUsed: Annotation<string>(),
  chunks: Annotation<Array<{ chunkIndex: number; content: string; embedding: number[] }>>(),
});

type IngestionGraphState = typeof IngestionState.State;

function createIngestionGraph() {
  const adminClient = createSupabaseAdminClient();

  const extractTextNode = async (state: IngestionGraphState) => {
    await updateIngestionStatus(adminClient, state.userId, state.documentId, "extracting");
    const fileBuffer = await downloadVaultFile(adminClient, state.storagePath);

    let extractedText = "";
    if (state.mimeType === "application/pdf") {
      extractedText = await extractTextFromPdfWithOcr(fileBuffer, state.originalFilename);
    } else if (
      state.mimeType === "image/jpeg" ||
      state.mimeType === "image/png" ||
      state.mimeType === "image/webp"
    ) {
      extractedText = await extractTextFromImageWithVision(fileBuffer, state.mimeType);
    } else if (
      state.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = parsed.value.trim();
    } else {
      extractedText = fileBuffer.toString("utf-8").trim();
    }

    if (!extractedText) {
      throw new ExternalProviderError("No readable text could be extracted from this document.");
    }

    return { extractedText };
  };

  const classifyAndMatchProfileNode = async (state: IngestionGraphState) => {
    const [{ data: classified }, profiles] = await Promise.all([
      generateStructuredJson(
        buildClassificationSystemPrompt(),
        buildClassificationUserPrompt(state.extractedText),
        agent1ClassificationSchema,
      ),
      listProfilesByUser(adminClient, state.userId),
    ]);

    let assignedProfileId = state.selectedProfileId;
    let profileMatchConfidence: ProfileMatchConfidence = "manual";

    if (state.autoDetectProfile) {
      const matched = matchPatientNameToProfile(classified.detectedPatientName, profiles);
      if (matched.profileId && matched.confidence === "high") {
        assignedProfileId = matched.profileId;
        profileMatchConfidence = "high";
      } else {
        profileMatchConfidence = "needs_review";
      }
    } else if (classified.detectedPatientName) {
      const matched = matchPatientNameToProfile(classified.detectedPatientName, profiles);
      if (matched.profileId === state.selectedProfileId && matched.confidence === "high") {
        profileMatchConfidence = "high";
      }
    }

    return {
      title: classified.title,
      category: classified.category,
      documentDate: classified.documentDate,
      detectedPatientName: classified.detectedPatientName,
      assignedProfileId,
      profileMatchConfidence,
    };
  };

  const gatherCitationsNode = async (state: IngestionGraphState) => {
    await updateIngestionStatus(adminClient, state.userId, state.documentId, "summarizing");
    const query = `${state.title} ${state.category}`.trim();
    const citations = await searchMedicalAuthorities(query, 4);
    return { citations };
  };

  const summarizeDocumentNode = async (state: IngestionGraphState) => {
    const { data: summary, modelUsed } = await generateStructuredJson(
      buildPlainEnglishSummarySystemPrompt(),
      buildPlainEnglishSummaryUserPrompt(state.extractedText, state.citations),
      agent1SummaryOutputSchema,
    );

    return {
      overview: summary.overview,
      keyFindings: summary.keyFindings,
      doctorQuestions: summary.doctorQuestions,
      modelUsed,
    };
  };

  const chunkAndEmbedNode = async (state: IngestionGraphState) => {
    await updateIngestionStatus(adminClient, state.userId, state.documentId, "indexing");
    const textChunks = chunkMedicalText(state.extractedText);
    const embeddings = await embedTexts(textChunks, "RETRIEVAL_DOCUMENT");

    const chunks = textChunks.map((content, chunkIndex) => ({
      chunkIndex,
      content,
      embedding: embeddings[chunkIndex] ?? [],
    }));

    return { chunks };
  };

  const finalizeIngestionNode = async (state: IngestionGraphState) => {
    await completeDocumentIngestion(adminClient, {
      documentId: state.documentId,
      userId: state.userId,
      profileId: state.assignedProfileId,
      title: state.title,
      category: state.category,
      documentDate: state.documentDate,
      detectedPatientName: state.detectedPatientName,
      profileMatchConfidence: state.profileMatchConfidence,
      extractedText: state.extractedText,
      overview: state.overview,
      keyFindings: state.keyFindings,
      doctorQuestions: state.doctorQuestions,
      citations: state.citations,
      modelUsed: state.modelUsed,
      chunks: state.chunks,
    });

    return {};
  };

  return new StateGraph(IngestionState)
    .addNode("extractText", extractTextNode)
    .addNode("classifyAndMatchProfile", classifyAndMatchProfileNode)
    .addNode("gatherCitations", gatherCitationsNode)
    .addNode("summarizeDocument", summarizeDocumentNode)
    .addNode("chunkAndEmbed", chunkAndEmbedNode)
    .addNode("finalizeIngestion", finalizeIngestionNode)
    .addEdge(START, "extractText")
    .addEdge("extractText", "classifyAndMatchProfile")
    .addEdge("classifyAndMatchProfile", "gatherCitations")
    .addEdge("gatherCitations", "summarizeDocument")
    .addEdge("summarizeDocument", "chunkAndEmbed")
    .addEdge("chunkAndEmbed", "finalizeIngestion")
    .addEdge("finalizeIngestion", END)
    .compile();
}

/**
 * Executes Agent 1 asynchronous ingestion pipeline inside Next.js after().
 */
export async function runAgent1Ingestion(input: {
  documentId: string;
  userId: string;
  selectedProfileId: string;
  autoDetectProfile: boolean;
}): Promise<void> {
  const startedAt = Date.now();
  const adminClient = createSupabaseAdminClient();

  try {
    const location = await getDocumentStorageLocation(adminClient, input.userId, input.documentId);
    const graph = createIngestionGraph();

    await graph.invoke({
      documentId: input.documentId,
      userId: input.userId,
      selectedProfileId: input.selectedProfileId,
      autoDetectProfile: input.autoDetectProfile,
      storagePath: location.storagePath,
      mimeType: location.mimeType,
      originalFilename: location.originalFilename,
      extractedText: "",
      title: location.originalFilename,
      category: "Other",
      documentDate: null,
      detectedPatientName: null,
      assignedProfileId: input.selectedProfileId,
      profileMatchConfidence: "manual",
      citations: [],
      overview: "",
      keyFindings: [],
      doctorQuestions: [],
      modelUsed: "",
      chunks: [],
    });

    logEvent("info", {
      service: "agent1-ingestion",
      event: "ingestion_completed",
      userId: input.userId,
      documentId: input.documentId,
      durationMs: Date.now() - startedAt,
      meta: { mimeType: location.mimeType },
    });
  } catch (err) {
    const sanitizedError =
      err instanceof ExternalProviderError
        ? err.message
        : "AI analysis encountered an unexpected error. Please retry.";

    await updateIngestionStatus(
      adminClient,
      input.userId,
      input.documentId,
      "failed",
      sanitizedError.slice(0, 240),
    ).catch(() => undefined);

    logEvent("error", {
      service: "agent1-ingestion",
      event: "ingestion_failed",
      userId: input.userId,
      documentId: input.documentId,
      durationMs: Date.now() - startedAt,
      errorCode: err instanceof Error ? err.name : "INGESTION_FAILED",
    });
  }
}
