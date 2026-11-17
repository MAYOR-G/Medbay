import type { SupabaseClient } from "@supabase/supabase-js";
import { ConflictError, ExternalProviderError, NotFoundError } from "@/lib/errors";
import type { Database, Json } from "@/types/database.types";
import type {
  AllowedDocumentMimeType,
  DocumentCategory,
  DocumentSource,
  DocumentSummaryDto,
  IngestionStatus,
  KeyFindingItem,
  MatchedDocumentChunkDto,
  MedicalCitationItem,
  MedicalDocumentDetailDto,
  MedicalDocumentSummaryDto,
  PaginatedResult,
  ProfileMatchConfidence,
} from "@/types/domain.types";

const SAFE_DOCUMENT_COLUMNS =
  "id, user_id, profile_id, title, original_filename, mime_type, file_size_bytes, category, document_date, detected_patient_name, profile_match_confidence, ingestion_status, ingestion_error, source, created_at, updated_at" as const;

type SafeDocumentRow = Pick<
  Database["public"]["Tables"]["medical_documents"]["Row"],
  | "id"
  | "user_id"
  | "profile_id"
  | "title"
  | "original_filename"
  | "mime_type"
  | "file_size_bytes"
  | "category"
  | "document_date"
  | "detected_patient_name"
  | "profile_match_confidence"
  | "ingestion_status"
  | "ingestion_error"
  | "source"
  | "created_at"
  | "updated_at"
>;

type SummaryRow = Database["public"]["Tables"]["document_summaries"]["Row"];

function mapDocumentRowToSummaryDto(row: SafeDocumentRow): MedicalDocumentSummaryDto {
  return {
    id: row.id,
    userId: row.user_id,
    profileId: row.profile_id,
    title: row.title,
    originalFilename: row.original_filename,
    mimeType: row.mime_type as AllowedDocumentMimeType,
    fileSizeBytes: row.file_size_bytes,
    category: row.category as DocumentCategory,
    documentDate: row.document_date,
    detectedPatientName: row.detected_patient_name,
    profileMatchConfidence: row.profile_match_confidence as ProfileMatchConfidence,
    ingestionStatus: row.ingestion_status as IngestionStatus,
    ingestionError: row.ingestion_error,
    source: row.source as DocumentSource,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSummaryRowToDto(row: SummaryRow): DocumentSummaryDto {
  return {
    id: row.id,
    documentId: row.document_id,
    overview: row.overview,
    keyFindings: Array.isArray(row.key_findings)
      ? (row.key_findings as unknown as KeyFindingItem[])
      : [],
    doctorQuestions: Array.isArray(row.doctor_questions)
      ? (row.doctor_questions as unknown as string[])
      : [],
    citations: Array.isArray(row.citations)
      ? (row.citations as unknown as MedicalCitationItem[])
      : [],
    modelUsed: row.model_used,
    createdAt: row.created_at,
  };
}

function sanitizeSearchToken(query: string): string {
  return query.replace(/[,()%_\\]/g, " ").trim();
}

export async function listDocumentsByUser(
  client: SupabaseClient<Database>,
  userId: string,
  filters: {
    page: number;
    pageSize: number;
    profileId?: string | "all";
    category?: DocumentCategory | "all";
    q?: string;
  },
): Promise<PaginatedResult<MedicalDocumentSummaryDto>> {
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = client
    .from("medical_documents")
    .select(SAFE_DOCUMENT_COLUMNS, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.profileId && filters.profileId !== "all") {
    query = query.eq("profile_id", filters.profileId);
  }
  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters.q) {
    const cleaned = sanitizeSearchToken(filters.q);
    if (cleaned.length > 0) {
      query = query.or(`title.ilike.%${cleaned}%,extracted_text.ilike.%${cleaned}%`);
    }
  }

  const { data, error, count } = await query;
  if (error) {
    throw new ExternalProviderError(`Failed to load medical documents: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const items = (data ?? []).map(mapDocumentRowToSummaryDto);

  return {
    items,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalCount,
      hasMore: from + items.length < totalCount,
    },
  };
}

export async function getDocumentDetailById(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<MedicalDocumentDetailDto> {
  const { data, error } = await client
    .from("medical_documents")
    .select(`${SAFE_DOCUMENT_COLUMNS}, document_summaries(*)`)
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to load document detail: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Medical document not found.");
  }

  const { document_summaries: summaryJoin, ...docRow } = data;
  const rawSummary = Array.isArray(summaryJoin) ? summaryJoin[0] : summaryJoin;

  return {
    ...mapDocumentRowToSummaryDto(docRow),
    summary: rawSummary ? mapSummaryRowToDto(rawSummary) : null,
  };
}

export async function getDocumentStorageLocation(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<{
  id: string;
  storagePath: string;
  mimeType: AllowedDocumentMimeType;
  originalFilename: string;
  ingestionStatus: IngestionStatus;
}> {
  const { data, error } = await client
    .from("medical_documents")
    .select("id, storage_path, mime_type, original_filename, ingestion_status")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to load document storage location: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Medical document not found.");
  }

  return {
    id: data.id,
    storagePath: data.storage_path,
    mimeType: data.mime_type as AllowedDocumentMimeType,
    originalFilename: data.original_filename,
    ingestionStatus: data.ingestion_status as IngestionStatus,
  };
}

export async function getDocumentCountsByProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<Map<string, number>> {
  const { data, error } = await client
    .from("medical_documents")
    .select("profile_id")
    .eq("user_id", userId);

  if (error) {
    throw new ExternalProviderError(`Failed to count profile documents: ${error.message}`);
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.profile_id, (counts.get(row.profile_id) ?? 0) + 1);
  }
  return counts;
}

export async function listStoragePathsByProfile(
  client: SupabaseClient<Database>,
  userId: string,
  profileId: string,
): Promise<string[]> {
  const { data, error } = await client
    .from("medical_documents")
    .select("storage_path")
    .eq("user_id", userId)
    .eq("profile_id", profileId);

  if (error) {
    throw new ExternalProviderError(`Failed to list profile storage paths: ${error.message}`);
  }

  return (data ?? []).map((row) => row.storage_path);
}

export async function createDocument(
  client: SupabaseClient<Database>,
  input: {
    id: string;
    userId: string;
    profileId: string;
    title: string;
    originalFilename: string;
    mimeType: AllowedDocumentMimeType;
    fileSizeBytes: number;
    storagePath: string;
    source: DocumentSource;
  },
): Promise<MedicalDocumentSummaryDto> {
  const { data, error } = await client
    .from("medical_documents")
    .insert({
      id: input.id,
      user_id: input.userId,
      profile_id: input.profileId,
      title: input.title,
      original_filename: input.originalFilename,
      mime_type: input.mimeType,
      file_size_bytes: input.fileSizeBytes,
      storage_path: input.storagePath,
      source: input.source,
      ingestion_status: "queued",
      profile_match_confidence: "manual",
    })
    .select(SAFE_DOCUMENT_COLUMNS)
    .single();

  if (error || !data) {
    throw new ExternalProviderError(
      `Failed to create document record: ${error?.message ?? "unknown"}`,
    );
  }
  return mapDocumentRowToSummaryDto(data);
}

export async function updateDocumentMetadata(
  client: SupabaseClient<Database>,
  userId: string,
  input: {
    documentId: string;
    title: string;
    category: DocumentCategory;
    documentDate: string | null;
  },
): Promise<MedicalDocumentSummaryDto> {
  const { data, error } = await client
    .from("medical_documents")
    .update({
      title: input.title,
      category: input.category,
      document_date: input.documentDate,
    })
    .eq("id", input.documentId)
    .eq("user_id", userId)
    .select(SAFE_DOCUMENT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to update document metadata: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Medical document not found.");
  }
  return mapDocumentRowToSummaryDto(data);
}

export async function reassignDocumentProfile(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
  profileId: string,
): Promise<MedicalDocumentSummaryDto> {
  const { data, error } = await client
    .from("medical_documents")
    .update({
      profile_id: profileId,
      profile_match_confidence: "manual",
    })
    .eq("id", documentId)
    .eq("user_id", userId)
    .select(SAFE_DOCUMENT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new ExternalProviderError(`Failed to reassign document profile: ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError("Medical document or target profile not found.");
  }
  return mapDocumentRowToSummaryDto(data);
}

export async function updateIngestionStatus(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
  status: IngestionStatus,
  errorMessage: string | null = null,
): Promise<void> {
  const { error } = await client
    .from("medical_documents")
    .update({
      ingestion_status: status,
      ingestion_error: errorMessage,
    })
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    throw new ExternalProviderError(`Failed to update ingestion status: ${error.message}`);
  }
}

export async function requeueFailedDocument(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<MedicalDocumentSummaryDto> {
  const current = await getDocumentStorageLocation(client, userId, documentId);
  if (current.ingestionStatus !== "failed") {
    throw new ConflictError(
      "Only failed documents can be retried.",
      "INGESTION_ALREADY_IN_PROGRESS",
    );
  }

  const { data, error } = await client
    .from("medical_documents")
    .update({
      ingestion_status: "queued",
      ingestion_error: null,
    })
    .eq("id", documentId)
    .eq("user_id", userId)
    .select(SAFE_DOCUMENT_COLUMNS)
    .single();

  if (error || !data) {
    throw new ExternalProviderError(
      `Failed to retry document ingestion: ${error?.message ?? "unknown"}`,
    );
  }
  return mapDocumentRowToSummaryDto(data);
}

export async function deleteDocument(
  client: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<string> {
  const { error, count } = await client
    .from("medical_documents")
    .delete({ count: "exact" })
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    throw new ExternalProviderError(`Failed to delete document: ${error.message}`);
  }
  if (!count) {
    throw new NotFoundError("Medical document not found.");
  }
  return documentId;
}

export async function completeDocumentIngestion(
  adminClient: SupabaseClient<Database>,
  input: {
    documentId: string;
    userId: string;
    profileId: string;
    title: string;
    category: DocumentCategory;
    documentDate: string | null;
    detectedPatientName: string | null;
    profileMatchConfidence: ProfileMatchConfidence;
    extractedText: string;
    overview: string;
    keyFindings: KeyFindingItem[];
    doctorQuestions: string[];
    citations: MedicalCitationItem[];
    modelUsed: string;
    chunks: Array<{ chunkIndex: number; content: string; embedding: number[] }>;
  },
): Promise<void> {
  const serializedChunks = input.chunks.map((chunk) => ({
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    embedding: `[${chunk.embedding.join(",")}]`,
  }));

  const { error } = await adminClient.rpc("complete_document_ingestion", {
    p_document_id: input.documentId,
    p_user_id: input.userId,
    p_profile_id: input.profileId,
    p_title: input.title,
    p_category: input.category,
    p_document_date: input.documentDate,
    p_detected_patient_name: input.detectedPatientName,
    p_profile_match_confidence: input.profileMatchConfidence,
    p_extracted_text: input.extractedText,
    p_overview: input.overview,
    p_key_findings: input.keyFindings as unknown as Json,
    p_doctor_questions: input.doctorQuestions as unknown as Json,
    p_citations: input.citations as unknown as Json,
    p_model_used: input.modelUsed,
    p_chunks: serializedChunks as unknown as Json,
  });

  if (error) {
    throw new ExternalProviderError(`Failed to finalize document ingestion: ${error.message}`);
  }
}

export async function matchDocumentChunks(
  client: SupabaseClient<Database>,
  input: {
    userId: string;
    profileId: string | null;
    queryEmbedding: number[];
    matchThreshold?: number;
    matchCount?: number;
  },
): Promise<MatchedDocumentChunkDto[]> {
  const { data, error } = await client.rpc("match_document_chunks", {
    p_user_id: input.userId,
    p_profile_id: input.profileId,
    p_query_embedding: `[${input.queryEmbedding.join(",")}]`,
    p_match_threshold: input.matchThreshold ?? 0.45,
    p_match_count: input.matchCount ?? 8,
  });

  if (error) {
    throw new ExternalProviderError(`Vector chunk search failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    documentTitle: row.document_title,
    documentDate: row.document_date,
    detectedPatientName: row.detected_patient_name,
    profileName: row.profile_name,
    content: row.content,
    similarity: row.similarity,
  }));
}
