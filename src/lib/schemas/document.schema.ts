import { z } from "zod";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_CATEGORIES,
  FINDING_SEVERITIES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/types/domain.types";

const isoDateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Document date must be formatted as YYYY-MM-DD.");

export const uploadDocumentFieldsSchema = z.object({
  profileId: z.string().uuid().nullable().optional().default(null),
  title: z.string().trim().min(1).max(240).nullable().optional().default(null),
});

export const documentFileMetaSchema = z.object({
  mimeType: z.enum(ALLOWED_DOCUMENT_MIME_TYPES),
  fileSizeBytes: z.number().int().min(1).max(MAX_DOCUMENT_SIZE_BYTES),
});

export const updateDocumentMetadataSchema = z.object({
  documentId: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required.").max(240),
  category: z.enum(DOCUMENT_CATEGORIES),
  documentDate: isoDateOnlySchema.nullable().optional().default(null),
});

export const reassignDocumentProfileSchema = z.object({
  documentId: z.string().uuid(),
  profileId: z.string().uuid(),
});

export const deleteDocumentSchema = z.object({
  documentId: z.string().uuid(),
});

export const documentIdParamSchema = z.object({
  documentId: z.string().uuid(),
});

export const keyFindingSchema = z.object({
  label: z.string().trim().min(1).max(160),
  value: z.string().trim().min(1).max(160),
  severity: z.enum(FINDING_SEVERITIES),
  explanation: z.string().trim().min(1).max(400),
});

export const medicalCitationSchema = z.object({
  title: z.string().trim().min(1).max(240),
  url: z.string().url().startsWith("https://"),
  domain: z.string().trim().min(1).max(120),
  snippet: z.string().trim().max(500),
});

export const agent1ClassificationSchema = z.object({
  title: z.string().trim().min(1).max(240),
  category: z.enum(DOCUMENT_CATEGORIES),
  documentDate: isoDateOnlySchema.nullable(),
  detectedPatientName: z.string().trim().max(160).nullable(),
});

export const agent1SummaryOutputSchema = z.object({
  overview: z.string().trim().min(1),
  keyFindings: z.array(keyFindingSchema).max(10),
  doctorQuestions: z.array(z.string().trim().min(1).max(300)).min(1).max(4),
});

export type UploadDocumentFieldsInput = z.infer<typeof uploadDocumentFieldsSchema>;
export type UpdateDocumentMetadataInput = z.infer<typeof updateDocumentMetadataSchema>;
export type ReassignDocumentProfileInput = z.infer<typeof reassignDocumentProfileSchema>;
export type DeleteDocumentInput = z.infer<typeof deleteDocumentSchema>;
export type Agent1ClassificationOutput = z.infer<typeof agent1ClassificationSchema>;
export type Agent1SummaryOutput = z.infer<typeof agent1SummaryOutputSchema>;
