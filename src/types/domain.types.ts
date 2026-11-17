// ============================================================================
// MedBay Domain Types, Enums & DTOs (camelCase transport contracts)
// Aligned 1:1 with DATABASE.md v1.0 & API.md v1.0
// ============================================================================

export const FAMILY_RELATIONSHIPS = [
  "Self",
  "Spouse",
  "Child",
  "Parent",
  "Dependent",
  "Other",
] as const;
export type FamilyRelationship = (typeof FAMILY_RELATIONSHIPS)[number];

export const DEPENDENT_RELATIONSHIPS = ["Spouse", "Child", "Parent", "Dependent", "Other"] as const;
export type DependentRelationship = (typeof DEPENDENT_RELATIONSHIPS)[number];

export const DOCUMENT_CATEGORIES = [
  "Lab Report",
  "Prescription",
  "Imaging",
  "Discharge Summary",
  "Vaccination",
  "Clinic Note",
  "Other",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const PROFILE_MATCH_CONFIDENCES = ["high", "needs_review", "manual"] as const;
export type ProfileMatchConfidence = (typeof PROFILE_MATCH_CONFIDENCES)[number];

export const INGESTION_STATUSES = [
  "queued",
  "extracting",
  "summarizing",
  "indexing",
  "ready",
  "failed",
] as const;
export type IngestionStatus = (typeof INGESTION_STATUSES)[number];

export const DOCUMENT_SOURCES = ["manual_upload", "gmail_import"] as const;
export type DocumentSource = (typeof DOCUMENT_SOURCES)[number];

export const FINDING_SEVERITIES = ["normal", "attention", "critical"] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export const CHAT_ROLES = ["user", "assistant"] as const;
export type ChatRole = (typeof CHAT_ROLES)[number];

export const SHARE_DURATION_PRESETS = ["24h", "7d", "30d"] as const;
export type ShareDurationPreset = (typeof SHARE_DURATION_PRESETS)[number];

export const ACTIVITY_EVENT_TYPES = [
  "DOCUMENT_UPLOADED",
  "AI_SUMMARY_GENERATED",
  "PROFILE_ASSIGNED",
  "SHARE_LINK_CREATED",
  "SHARE_LINK_ACCESSED",
  "SHARE_LINK_REVOKED",
  "CALENDAR_APPOINTMENT_BOOKED",
  "GMAIL_MEDICAL_DETECTED",
] as const;
export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export const NOTIFICATION_TYPES = ["gmail_medical_found", "ingestion_failed"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;
export type AllowedDocumentMimeType = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

export const MAX_DOCUMENT_SIZE_BYTES = 26_214_400; // 25 MB
export const MAX_DEPENDENT_PROFILES = 15;

export interface UserAccountDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  googleScopesValid: boolean;
  gmailScanEnabled: boolean;
  lastGmailScanAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyProfileDto {
  id: string;
  userId: string;
  fullName: string;
  relationship: FamilyRelationship;
  dateOfBirth: string | null;
  isPrimary: boolean;
  colorIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface KeyFindingItem {
  label: string;
  value: string;
  severity: FindingSeverity;
  explanation: string;
}

export interface MedicalCitationItem {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface DocumentSummaryDto {
  id: string;
  documentId: string;
  overview: string;
  keyFindings: KeyFindingItem[];
  doctorQuestions: string[];
  citations: MedicalCitationItem[];
  modelUsed: string;
  createdAt: string;
}

export interface MedicalDocumentSummaryDto {
  id: string;
  userId: string;
  profileId: string;
  title: string;
  originalFilename: string;
  mimeType: AllowedDocumentMimeType;
  fileSizeBytes: number;
  category: DocumentCategory;
  documentDate: string | null;
  detectedPatientName: string | null;
  profileMatchConfidence: ProfileMatchConfidence;
  ingestionStatus: IngestionStatus;
  ingestionError: string | null;
  source: DocumentSource;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalDocumentDetailDto extends MedicalDocumentSummaryDto {
  summary: DocumentSummaryDto | null;
}

export interface MatchedDocumentChunkDto {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  documentDate: string | null;
  detectedPatientName: string | null;
  profileName: string;
  content: string;
  similarity: number;
}

export interface ChatThreadDto {
  id: string;
  userId: string;
  profileId: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultCitationRef {
  documentId: string;
  title: string;
  documentDate: string | null;
  profileName: string;
}

export interface WebCitationRef {
  title: string;
  url: string;
  domain: string;
}

export interface CalendarEventArtifact {
  eventId: string;
  title: string;
  startIso: string;
  endIso: string;
  timezone: string;
  location: string | null;
  htmlLink: string;
}

export interface ChatMessageDto {
  id: string;
  threadId: string;
  role: ChatRole;
  content: string;
  vaultCitations: VaultCitationRef[];
  webCitations: WebCitationRef[];
  calendarEventCreated: CalendarEventArtifact | null;
  createdAt: string;
}

export interface ShareLinkDto {
  id: string;
  documentId: string;
  token: string;
  durationPreset: ShareDurationPreset;
  expiresAt: string;
  revokedAt: string | null;
  viewCount: number;
  lastAccessedAt: string | null;
  createdAt: string;
}

export interface ResolvedShareLinkDto {
  documentId: string;
  title: string;
  mimeType: AllowedDocumentMimeType;
  storagePath: string;
  expiresAt: string;
}

export interface ActivityEventDto {
  id: string;
  userId: string;
  profileId: string | null;
  documentId: string | null;
  eventType: ActivityEventType;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationItemDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  gmailMessageId: string | null;
  emailSubject: string | null;
  emailSender: string | null;
  hasAttachments: boolean;
  isRead: boolean;
  importedDocumentId: string | null;
  createdAt: string;
}

export interface PushSubscriptionDto {
  id: string;
  userId: string;
  endpoint: string;
  deviceLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}
