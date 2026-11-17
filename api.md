```markdown
# API & Integration Specification: MedBay (`API.md`)

| Field | Detail |
| :--- | :--- |
| **Product Name** | MedBay (`medbay`) |
| **API Architecture** | Hybrid Next.js App Router (Server Actions + HTTP Route Handlers + SSE Streaming) |
| **Data Format** | JSON (`camelCase` transport DTOs mapped to `snake_case` PostgreSQL columns) & `multipart/form-data` |
| **Authentication** | Supabase Auth PKCE Cookies (`HttpOnly`, `Secure`, `SameSite=Lax`) & Bearer `CRON_SECRET` |
| **External Providers** | OpenRouter (`deepseek-v4.1-flash`, `gpt-oss-20b:free`, `mistral-ocr`), Google AI, Tavily, Google Calendar & Gmail, Web Push |
| **Source of Truth** | Aligned 1:1 with `PRD.md` v1.0, `ARCHITECTURE.md` v1.0, and `DATABASE.md` v1.0 |

---

## 1. API Design Philosophy & Global Conventions

### 1.1 Communication Paradigm
MedBay uses a pragmatic, type-safe hybrid communication model tailored to Next.js App Router:
* **Server Component Direct Reads:** Initial data loads for authenticated pages (`/vault`, `/vault/[documentId]`, `/timeline`, `/profiles`, `/notifications`, `/chat`) and the public share shell (`/share/[token]`) execute directly inside Server Components via `src/server/repositories/*.repo.ts`, eliminating redundant `GET` JSON wrapper endpoints.
* **Next.js Server Actions (`src/server/actions/*.action.ts`):** Handle all standard authenticated JSON mutations (family sub-profile CRUD, document metadata updates, profile reassignment, expiring share link creation/revocation, notification actions, and Gmail attachment imports) with automatic cache revalidation.
* **HTTP Route Handlers (`src/app/api/**/route.ts`):** Handle operations requiring raw HTTP streams, binary file uploads/downloads, Server-Sent Events (SSE) AI streaming, Web Push subscription management, OAuth callbacks, and scheduled cron execution.

### 1.2 Base URL & Versioning
* **Base URL:** Configured via `NEXT_PUBLIC_APP_URL` (e.g., `https://medbay.app` in production, `http://localhost:3000` locally).
* **Route Naming & Versioning:** Internal API endpoints reside under `/api/...` without a `/v1` prefix (MVP v1.0 is a closed first-party PWA with no external third-party API consumers). All route segments use `kebab-case` plural nouns (`/api/documents/upload`, `/api/share/[token]/file`) with **no trailing slashes**.

### 1.3 Data Formatting & Casing Conventions
* **Property Casing Bridge:** Transport payloads (Server Action arguments/returns and HTTP JSON bodies) use `camelCase` (`profileId`, `fullName`, `expiresAt`, `ingestionStatus`). Repositories in `src/server/repositories/*.repo.ts` map these deterministically 1:1 to `snake_case` PostgreSQL columns in `DATABASE.md` (`profile_id`, `full_name`, `expires_at`, `ingestion_status`).
* **Enum Literal Preservation:** Enum string values are preserved verbatim across client, API, and database boundaries (e.g., `'Lab Report'`, `'needs_review'`, `'24h'`, `'CALENDAR_APPOINTMENT_BOOKED'`).
* **Timestamps & Units:** All timestamps serialize as ISO-8601 UTC strings (`YYYY-MM-DDTHH:mm:ss.sssZ`). Dates without times (`date_of_birth`, `document_date`) serialize as `YYYY-MM-DD`. File sizes are integer byte counts (`fileSizeBytes`).
* **Nullability:** Nullable database columns serialize explicitly as `null` in JSON responses (never omitted or `undefined`).

### 1.4 Standard HTTP Headers
* **Request Headers:**
  * `Content-Type: application/json` (JSON routes) or `multipart/form-data` (file uploads).
  * `Authorization: Bearer <CRON_SECRET>` (required exclusively on `/api/cron/gmail-scan`).
  * `X-Request-ID: <uuid>` (optional client trace ID; generated server-side if omitted).
* **Response Headers:**
  * `X-Request-ID: <uuid>` (echoed on every response for log correlation).
  * `Cache-Control: no-store, no-cache, must-revalidate` (enforced on all medical document, chat, and `/share/[token]` routes).
  * `X-Robots-Tag: noindex, nofollow` (enforced on all `/share/[token]` routes).

---

## 2. Standard Response Envelopes & Error Format

### 2.1 Success Envelope
All non-streaming Route Handlers and Server Actions return a discriminated union envelope:

* **Single-Item / Mutation Success:**
  ```json
  {
    "success": true,
    "data": { "...": "Typed resource payload" },
    "requestId": "8f14e45f-ea3b-4c9a-9f1a-2b3c4d5e6f70"
  }

```

* **Paginated List Envelope (Server Component / List DTOs):**
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalCount": 42,
      "hasMore": true
    }
  },
  "requestId": "8f14e45f-ea3b-4c9a-9f1a-2b3c4d5e6f70"
}

```



### 2.2 Error Envelope

All failures normalize `AppError` subclasses into a deterministic structure so UI components can render field-level inline errors or toast banners:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File size exceeds the 25 MB maximum limit.",
    "fieldErrors": {
      "file": ["Maximum allowed file size is 26,214,400 bytes (25 MB)."]
    }
  },
  "requestId": "8f14e45f-ea3b-4c9a-9f1a-2b3c4d5e6f70"
}

```

### 2.3 HTTP Status Code Matrix

| Status Code | Semantic Meaning | When Returned in MedBay |
| --- | --- | --- |
| `200 OK` | Request succeeded | Streaming chat initiation, retry trigger, Web Push subscribe/unsubscribe, cron completion. |
| `201 Created` | Resource created | Document uploaded and queued for Agent 1 (`POST /api/documents/upload`). |
| `204 No Content` | Succeeded with empty body | Deleting a Web Push subscription (`DELETE /api/push/subscribe`). |
| `302 Found` | Temporary redirect | OAuth callback completion (`/auth/callback`) or short-lived Storage signed URL redirect. |
| `400 Bad Request` | Malformed input or file | Unsupported MIME type, corrupted magic bytes, file `> 25 MB`, or invalid JSON syntax. |
| `401 Unauthorized` | Missing or invalid credentials | Unauthenticated request to protected route, expired JWT, or invalid `CRON_SECRET`. |
| `403 Forbidden` | Authenticated but unauthorized | Attempting to mutate another user's resource or revoked Google OAuth scopes. |
| `404 Not Found` | Resource does not exist | Non-existent `documentId`, `profileId`, `threadId`, or `notificationId`. |
| `409 Conflict` | Business rule or uniqueness conflict | Exceeding the maximum 15 managed dependent sub-profiles or attempting to delete the primary `Self` profile. |
| `410 Gone` | Resource permanently expired/revoked | Opening an expired or owner-revoked `/share/[token]` link. |
| `422 Unprocessable Entity` | Schema validation failed | Valid JSON syntax that fails Zod field rules (e.g., blank `fullName`, future `dateOfBirth`). |
| `429 Too Many Requests` | Rate limit exceeded | Exceeding sliding-window quotas on `/api/chat`, `/api/documents/upload`, or `/api/share/[token]/file`. |
| `500 Internal Server Error` | Unexpected server exception | Unhandled database or runtime failure (redacted generic message returned to client). |
| `502 Bad Gateway` | Upstream provider failure | OpenRouter, Google AI, Tavily, or Google Workspace failed after all retries and fallbacks. |

---

## 3. Authentication, Authorization & RBAC Enforcement

### 3.1 Credential & Token Transport

* **Browser / PWA Users:** Authenticated via Supabase Auth session cookies (`sb-<project>-auth-token`) marked `HttpOnly`, `Secure`, and `SameSite=Lax`. Every protected Server Action and Route Handler calls `supabase.auth.getUser()` on the server to verify the cryptographic JWT signature against Supabase Auth—never trusting client-supplied `userId` parameters.
* **Scheduled Cron Worker:** `GET /api/cron/gmail-scan` requires `Authorization: Bearer <CRON_SECRET>`, validated using constant-time buffer comparison (`crypto.timingSafeEqual`).
* **Public Share Link Viewers:** Require zero cookies, logins, or PINs; access is governed solely by the 192-bit URL-safe `token` parameter in `/share/[token]` and `/api/share/[token]/file`.

### 3.2 Server-Side Authorization Matrix

| Operation Category | Identity Verification | Ownership & RBAC Enforcement |
| --- | --- | --- |
| **Account & Profile Mutations** | `supabase.auth.getUser()` (`authenticated_owner`) | Enforces `user_id = auth.uid()` via RLS; blocks deletion where `is_primary = true`; enforces max 15 dependents per `user_id`. |
| **Document Upload, Read & Mutations** | `supabase.auth.getUser()` (`authenticated_owner`) | Verifies target `profile_id` belongs to `auth.uid()`; storage keys prefixed with `{auth.uid()}/`; RLS enforces `user_id = auth.uid()`. |
| **RAG Chat & Calendar Tooling** | `supabase.auth.getUser()` (`authenticated_owner`) | Vector RPC `match_document_chunks` strictly filters `user_id = auth.uid()` AND `profile_id = activeProfileId`; Calendar tool decrypts `auth.uid()`'s own `encrypted_google_refresh_token`. |
| **Share Link Creation & Revocation** | `supabase.auth.getUser()` (`authenticated_owner`) | Verifies `document_id` belongs to `auth.uid()` before inserting into `share_links` or setting `revoked_at`. |
| **Public Share Link File Access** | None (`public_share_viewer`) | Executes `SECURITY DEFINER` RPC `resolve_active_share_link(token)` verifying `revoked_at IS NULL AND expires_at > now()`; mints 5-minute signed URL strictly for raw file binary. |
| **24-Hour Gmail Scanner Cron** | `Bearer CRON_SECRET` (`service_worker`) | Iterates only users with `gmail_scan_enabled = true AND google_scopes_valid = true`; enforces `UNIQUE(user_id, gmail_message_id)` idempotency. |

---

## 4. Complete Internal Endpoint / Action Inventory

### 4.1 Authentication & Account Lifecycle

#### `GET /auth/callback`

* **Purpose:** Exchanges Google OAuth 2.0 PKCE authorization code for a Supabase session, encrypts and stores `provider_refresh_token`, and provisions the primary `Self` `family_profiles` row on initial sign-up (`US-01`).
* **Access Level:** `Public` (OAuth redirect endpoint)
* **Query Parameters:** `code` (`string`, required), `next` (`string`, optional internal redirect path, defaults to `'/vault'`).
* **Response:** `302 Found` redirect to `/vault` with `HttpOnly` session cookies set (or `302` to `/login?error=oauth_failed` if code exchange fails).
* **Failure Cases:** `400 INVALID_OAUTH_CODE`, `502 OAUTH_EXCHANGE_FAILED`.

#### `Action: signOut`

* **Purpose:** Terminates the user's Supabase session and clears `HttpOnly` auth cookies (`PRD.md` Section 11.9).
* **Access Level:** `Authenticated User`
* **Input Payload:** None (`void`).
* **Response Payload:** `{ success: true, data: { redirectTo: "/login" } }`.

#### `Action: updateAccountPreferences`

* **Purpose:** Toggles the 24-hour Gmail medical scanner (`gmail_scan_enabled`) on `/profiles` (`US-06`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ gmailScanEnabled: boolean }`
* **Response Payload:** `{ id: string, gmailScanEnabled: boolean, lastGmailScanAt: string | null }`
* **Failure Cases:** `401 UNAUTHORIZED`, `422 VALIDATION_ERROR`.

#### `Action: deleteUserAccount`

* **Purpose:** Permanently deletes all user binaries in `vault-files` Storage and cascades deletion across `auth.users` and all 11 application tables (`DATABASE.md` Section 12).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ confirmationText: "DELETE" }`
* **Response Payload:** `{ deleted: true }`
* **Failure Cases:** `401 UNAUTHORIZED`, `422 INVALID_CONFIRMATION`.

---

### 4.2 Family Sub-Profiles

#### `Action: createFamilyProfile`

* **Purpose:** Creates a managed dependent sub-profile (spouse, child, parent) with name and relationship only—no email or login (`US-02`, `FR-103`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:**
* `fullName`: `string` (required, trimmed `1–160` chars)
* `relationship`: `'Spouse' | 'Child' | 'Parent' | 'Dependent' | 'Other'` (required; `'Self'` disallowed via this action)
* `dateOfBirth`: `string | null` (optional ISO date `YYYY-MM-DD`, must be `<= today`)


* **Response Payload:** `{ id: string, userId: string, fullName: string, relationship: string, dateOfBirth: string | null, isPrimary: false, colorIndex: number, createdAt: string }`
* **Failure Cases:** `401 UNAUTHORIZED`, `409 MAX_PROFILES_EXCEEDED` (user already has 15 dependents), `422 VALIDATION_ERROR`.

#### `Action: updateFamilyProfile`

* **Purpose:** Updates a family member's name, relationship, or optional date of birth (`FR-103`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:**
* `profileId`: `UUID` (required)
* `fullName`: `string` (required, `1–160` chars)
* `relationship`: `'Self' | 'Spouse' | 'Child' | 'Parent' | 'Dependent' | 'Other'` (required; `'Self'` allowed only if `isPrimary === true`)
* `dateOfBirth`: `string | null` (optional `YYYY-MM-DD`)


* **Response Payload:** Updated `FamilyProfile` DTO.
* **Failure Cases:** `401 UNAUTHORIZED`, `404 PROFILE_NOT_FOUND`, `422 VALIDATION_ERROR`.

#### `Action: deleteFamilyProfile`

* **Purpose:** Deletes a managed dependent sub-profile, purges associated Storage binaries, and cascades deletion to its documents and vector chunks (`FR-105`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ profileId: UUID }`
* **Response Payload:** `{ deletedId: UUID }`
* **Failure Cases:** `401 UNAUTHORIZED`, `404 PROFILE_NOT_FOUND`, `409 CANNOT_DELETE_PRIMARY_PROFILE` (`is_primary = true`).

---

### 4.3 Medical Vault & Agent 1 Ingestion

#### `POST /api/documents/upload`

* **Purpose:** Uploads a medical file (`JPEG`, `PNG`, `WebP`, `PDF`, `DOCX`, `TXT` up to `25 MB`), encrypts it in `vault-files`, logs `DOCUMENT_UPLOADED`, and triggers Agent 1 asynchronously (`US-03`, `FR-201`).
* **Access Level:** `Authenticated User`
* **Request Body (`multipart/form-data`):**
* `file`: `File` (required, magic-byte verified MIME in allowed list, `1` to `26,214,400` bytes)
* `profileId`: `UUID | null` (optional pre-selected target profile; defaults to user's `Self` profile until Agent 1 matches patient name)
* `title`: `string | null` (optional custom title; defaults to sanitized filename without extension)


* **Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "profileId": "uuid",
    "title": "Blood Panel Nov 2026",
    "mimeType": "application/pdf",
    "fileSizeBytes": 482910,
    "category": "Other",
    "ingestionStatus": "queued",
    "profileMatchConfidence": "manual",
    "createdAt": "2026-11-17T16:42:00.000Z"
  },
  "requestId": "uuid"
}

```


* **Failure Cases:** `400 UNSUPPORTED_FILE_TYPE`, `400 FILE_TOO_LARGE`, `401 UNAUTHORIZED`, `404 PROFILE_NOT_FOUND`, `429 RATE_LIMIT_EXCEEDED`.

#### `GET /api/documents/[documentId]/file`

* **Purpose:** Generates a 15-minute (`900s`) private Supabase Storage signed URL for the authenticated owner to view or download their original medical document (`/vault/[documentId]`).
* **Access Level:** `Resource Owner Only`
* **Path Parameters:** `documentId` (`UUID`, required).
* **Query Parameters:** `download` (`'true' | 'false'`, optional, sets `Content-Disposition: attachment` when `'true'`).
* **Response:** `302 Found` redirect to the transient Supabase Storage signed URL (or `{ success: true, data: { signedUrl: string, expiresInSeconds: 900 } }` when `Accept: application/json`).
* **Failure Cases:** `401 UNAUTHORIZED`, `404 DOCUMENT_NOT_FOUND`.

#### `POST /api/documents/[documentId]/retry`

* **Purpose:** Re-queues a document whose `ingestion_status` is `'failed'` so Agent 1 re-runs OCR, summarization, citations, and vector indexing (`PRD.md` Section 8.3).
* **Access Level:** `Resource Owner Only`
* **Path Parameters:** `documentId` (`UUID`, required).
* **Response (`200 OK`):** `{ id: UUID, ingestionStatus: "queued" }`
* **Failure Cases:** `401 UNAUTHORIZED`, `404 DOCUMENT_NOT_FOUND`, `409 INGESTION_ALREADY_IN_PROGRESS`, `429 RATE_LIMIT_EXCEEDED`.

#### `Action: updateDocumentMetadata`

* **Purpose:** Edits a document's title, clinical category, or document date (`FR-204`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:**
* `documentId`: `UUID` (required)
* `title`: `string` (required, `1–240` chars)
* `category`: `'Lab Report' | 'Prescription' | 'Imaging' | 'Discharge Summary' | 'Vaccination' | 'Clinic Note' | 'Other'` (required)
* `documentDate`: `string | null` (optional `YYYY-MM-DD`)


* **Response Payload:** Updated `MedicalDocument` summary DTO (never includes `storagePath` or `extractedText`).
* **Failure Cases:** `401 UNAUTHORIZED`, `404 DOCUMENT_NOT_FOUND`, `422 VALIDATION_ERROR`.

#### `Action: reassignDocumentProfile`

* **Purpose:** Reassigns a document to a different `FamilyProfile`, atomically updates `profile_id` on all `document_chunks`, sets `profile_match_confidence = 'manual'`, and logs `PROFILE_ASSIGNED` (`FR-205`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ documentId: UUID, profileId: UUID }`
* **Response Payload:** `{ documentId: UUID, profileId: UUID, profileMatchConfidence: "manual" }`
* **Failure Cases:** `401 UNAUTHORIZED`, `404 DOCUMENT_OR_PROFILE_NOT_FOUND`.

#### `Action: deleteDocument`

* **Purpose:** Deletes a medical document's binary from `vault-files` Storage and cascades deletion to `medical_documents`, `document_summaries`, `document_chunks`, and `share_links` (`PRD.md` Section 11.5).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ documentId: UUID }`
* **Response Payload:** `{ deletedId: UUID }`
* **Failure Cases:** `401 UNAUTHORIZED`, `404 DOCUMENT_NOT_FOUND`.

---

### 4.4 One-Click Expiring Share Links

#### `Action: createShareLink`

* **Purpose:** Generates a PIN-free, one-click expiring share URL (`/share/[token]`) with a `24h`, `7d`, or `30d` TTL and logs `SHARE_LINK_CREATED` (`US-07`, `FR-601`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:**
* `documentId`: `UUID` (required)
* `durationPreset`: `'24h' | '7d' | '30d'` (required)


* **Response Payload:** `{ id: UUID, documentId: UUID, shareUrl: string, durationPreset: "24h" | "7d" | "30d", expiresAt: string, viewCount: 0, createdAt: string }`
* **Failure Cases:** `401 UNAUTHORIZED`, `404 DOCUMENT_NOT_FOUND`, `422 VALIDATION_ERROR`.

#### `Action: revokeShareLink`

* **Purpose:** Immediately revokes an active share link by setting `revoked_at = now()` and logging `SHARE_LINK_REVOKED` (`FR-604`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ shareLinkId: UUID }`
* **Response Payload:** `{ id: UUID, revokedAt: string }`
* **Failure Cases:** `401 UNAUTHORIZED`, `404 SHARE_LINK_NOT_FOUND`.

#### `GET /api/share/[token]/file`

* **Purpose:** Unauthenticated public endpoint validating `token` via `resolve_active_share_link` RPC and streaming/redirecting **only** the original raw binary via a 5-minute (`300s`) signed Storage URL (`FR-602`, `FR-603`).
* **Access Level:** `Public` (Token-gated; zero login or PIN)
* **Path Parameters:** `token` (`string`, 32-char URL-safe Base64 token).
* **Query Parameters:** `download` (`'true' | 'false'`, optional).
* **Response:** `302 Found` redirect to the 5-minute raw file signed URL. Strictly omits `document_summaries`, `extracted_text`, `family_profiles`, and owner metadata.
* **Failure Cases:** `400 INVALID_TOKEN_FORMAT`, `410 Gone` (`LINK_EXPIRED_OR_REVOKED`), `429 RATE_LIMIT_EXCEEDED`.

---

### 4.5 Personalized RAG & Calendar Action Chat

#### `POST /api/chat`

* **Purpose:** Streams profile-isolated RAG responses with inline vault/Tavily citations and executes Google Calendar appointment booking tool calls (`US-04`, `US-05`).
* **Access Level:** `Authenticated User`
* **Request Body (`application/json`):**
* `threadId`: `UUID | null` (optional; creates a new `chat_threads` row if `null`)
* `profileId`: `UUID | null` (active family profile scope; `null` explicitly queries across all user profiles)
* `message`: `string` (required, trimmed `1–4000` chars)
* `useHeavyReasoning`: `boolean` (optional, default `false`; routes to `google/gemini-4-carbon` when `true`)


* **Response:** `200 OK` (`Content-Type: text/event-stream; charset=utf-8`) streaming Vercel AI SDK chunks (detailed in Section 6.1).
* **Failure Cases:** `401 UNAUTHORIZED`, `404 THREAD_OR_PROFILE_NOT_FOUND`, `422 VALIDATION_ERROR`, `429 RATE_LIMIT_EXCEEDED`, `502 AI_PROVIDER_UNAVAILABLE`.

#### `Action: deleteChatThread`

* **Purpose:** Deletes a saved conversation thread and all its messages (`FR-407`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ threadId: UUID }`
* **Response Payload:** `{ deletedId: UUID }`
* **Failure Cases:** `401 UNAUTHORIZED`, `404 THREAD_NOT_FOUND`.

---

### 4.6 Notifications, Web Push & 24-Hour Gmail Scanner

#### `Action: markNotificationsRead`

* **Purpose:** Marks one or all in-app notifications as `is_read = true` (`PRD.md` Section 11.10).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ notificationId?: UUID, markAll?: boolean }`
* **Response Payload:** `{ updatedCount: number }`
* **Failure Cases:** `401 UNAUTHORIZED`, `422 VALIDATION_ERROR`.

#### `Action: dismissNotification`

* **Purpose:** Deletes an alert from the user's Notification Center (`PRD.md` Section 11.10).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ notificationId: UUID }`
* **Response Payload:** `{ deletedId: UUID }`
* **Failure Cases:** `401 UNAUTHORIZED`, `404 NOTIFICATION_NOT_FOUND`.

#### `Action: importGmailAttachment`

* **Purpose:** Fetches medical attachment(s) from the flagged `gmail_message_id` via `gmail.readonly`, saves them into `vault-files` Storage, triggers Agent 1 ingestion, and links `imported_document_id` on `notification_items` (`FR-504`).
* **Access Level:** `Resource Owner Only`
* **Input Payload:** `{ notificationId: UUID, profileId?: UUID | null }`
* **Response Payload:** `{ importedDocuments: Array<{ id: UUID, title: string, ingestionStatus: "queued" }> }`
* **Failure Cases:** `401 UNAUTHORIZED`, `403 GOOGLE_SCOPES_REVOKED`, `404 NOTIFICATION_NOT_FOUND`, `409 ALREADY_IMPORTED`.

#### `POST /api/push/subscribe` & `DELETE /api/push/subscribe`

* **Purpose:** Registers or removes a browser/PWA Web Push VAPID endpoint in `push_subscriptions` (`FR-505`).
* **Access Level:** `Authenticated User`
* **POST Request Body:** `{ endpoint: string (URL), keys: { p256dh: string, auth: string }, deviceLabel?: string }`
* **DELETE Request Body:** `{ endpoint: string (URL) }`
* **Response:** `200 OK` `{ subscribed: true }` (POST) or `204 No Content` (DELETE).
* **Failure Cases:** `401 UNAUTHORIZED`, `422 VALIDATION_ERROR`.

#### `GET /api/cron/gmail-scan`

* **Purpose:** Daily scheduled background job scanning connected Gmail inboxes (`newer_than:1d`) for medical emails and dispatching **in-app + Web Push notifications only** (zero outbound emails sent) (`US-06`, `FR-501`, `FR-503`).
* **Access Level:** `System Cron Only` (`Authorization: Bearer <CRON_SECRET>`)
* **Response (`200 OK`):** `{ usersScanned: number, alertsCreated: number, pushNotificationsSent: number, staleEndpointsPurged: number }`
* **Failure Cases:** `401 INVALID_CRON_SECRET`, `500 CRON_EXECUTION_ERROR`.

---

## 5. Pagination, Filtering, Sorting & Search Conventions

Because list views (`/vault`, `/timeline`, `/notifications`, `/chat` thread drawer) are rendered via Next.js Server Components, pagination and filtering are driven by validated URL search parameters:

| Parameter | Allowed Values / Type | Default | Max | Applicable Views & Behavior |
| --- | --- | --- | --- | --- |
| `page` | Positive integer (`>= 1`) | `1` | `500` | Offset page index (`offset = (page - 1) * pageSize`). |
| `pageSize` | Positive integer (`1–50`) | `20` | `50` | Prevents unbounded full-table scans on mobile connections. |
| `profileId` | `UUID` or `'all'` | `'all'` | N/A | Filters `/vault` and `/timeline` strictly by `family_profiles.id`. |
| `category` | `document_category` enum or `'all'` | `'all'` | N/A | Filters `/vault` by clinical document category. |
| `eventType` | `activity_event_type` enum or `'all'` | `'all'` | N/A | Filters `/timeline` by event category. |
| `q` | `string` (`1–100` chars) | `""` | `100` | Sanitized search query passed to PostgreSQL GIN full-text index (`websearch_to_tsquery`) across `title` and `extracted_text`. |
| `sortOrder` | `'desc'` (fixed in MVP) | `'desc'` | N/A | All feeds sort newest-first (`created_at DESC`); chat messages sort chronologically (`created_at ASC`). |

---

## 6. Streaming, Real-Time & Async Operations

### 6.1 AI Chat SSE Streaming Protocol (`POST /api/chat`)

`POST /api/chat` uses the **Vercel AI SDK Data Stream Protocol** over `text/event-stream`:

1. **Header Metadata:** Returns `X-Thread-Id: <uuid>` in response headers so newly created threads immediately bind to the client URL/state.
2. **Stream Frame Types:**
* `status-step` (custom data part): Emits live progress pills before text tokens arrive (`"Searching [Profile]'s records..."`, `"Verifying medical sources..."`, `"Booking on Google Calendar..."`).
* `text-delta`: Incremental Markdown tokens streamed smoothly as OpenRouter generates them.
* `tool-call` & `tool-result`: Structured payloads for `search_medical_authorities` and `book_calendar_appointment` (rendering the Emerald Calendar Confirmation Card inline).
* `citations-bundle` (custom data part): Emitted before stream completion containing `{ vaultCitations: VaultCitation[], webCitations: WebCitation[] }` so clickable source chips render beneath the assistant bubble.
* `finish` / `error`: Signals clean stream termination or normalized stream error.


3. **Client Cancellation:** Clicking "Stop Generating" or navigating away triggers the browser `AbortController`, propagating `request.signal` directly to OpenRouter and aborting upstream token generation immediately.

### 6.2 Multipart Binary Upload & Non-Blocking Ingestion (`POST /api/documents/upload`)

1. **Transport:** Client submits `FormData` directly to `POST /api/documents/upload` (avoiding base64 JSON bloat).
2. **Validation:** Server inspects the first `4,100` bytes of the binary stream for magic-number signatures (`%PDF`, JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `RIFF...WEBP`, ZIP/DOCX `50 4B 03 04`, or valid UTF-8 text) and verifies size `<= 26,214,400` bytes (`25 MB`).
3. **Immediate Persistence:** Binary uploads to Supabase Storage `vault-files/{userId}/{documentId}/{sanitizedFilename}` and inserts `medical_documents` with `ingestion_status = 'queued'`.
4. **Post-Response Async Worker:** Registers `runAgent1Ingestion(documentId)` inside Next.js `after()` and immediately returns `201 Created`. The client polls/revalidates lightweight status updates (`queued` -> `extracting` -> `summarizing` -> `indexing` -> `ready`) without blocking navigation.

---

## 7. External APIs & Third-Party Service Integrations

All third-party calls are isolated inside `src/server/integrations/*.adapter.ts` and are **never** invoked from UI components or Transport routes directly.

| External Service | Direction & Adapter | Endpoint / SDK Method | Timeout & Retry Policy | Fallback & Degradation Behavior |
| --- | --- | --- | --- | --- |
| **OpenRouter API** | Outbound (`openrouter.adapter.ts`) | `POST https://openrouter.ai/api/v1/chat/completions` (`file-parser` plugin with `mistral-ocr` for PDFs) | `45s` for Agent 1 OCR/summary; `30s` TTFT for Agent 2 stream; `1` retry on socket reset | Native OpenRouter fallback chain: `deepseek/deepseek-v4.1-flash` -> `openai/gpt-oss-20b:free` (or `google/gemini-4-carbon` -> `deepseek/deepseek-v4.1-flash` -> `openai/gpt-oss-20b:free` in heavy mode). |
| **Google AI Studio** | Outbound (`google-ai.adapter.ts`) | `@google/genai` `models.embedContent` (`gemini-embedding-001`, `1536` dims) | `15s` timeout; `3` retries with exponential backoff (`500ms`, `1.5s`, `3s`) | Marks Agent 1 job `'failed'` with retry button if all 3 attempts fail; returns `502` on chat query if unreachable. |
| **Tavily Search API** | Outbound (`tavily.adapter.ts`) | `POST https://api.tavily.com/search` | `10s` timeout; `1` retry on `5xx` | Tier-1 restricted to `who.int`, `nhs.uk`, `cdc.gov`, `nih.gov`, `medlineplus.gov`, `mayoclinic.org`, `clevelandclinic.org`, `msdmanuals.com`. Falls back to Tier-2 open-web query if `< 1` result; degrades gracefully to empty citations if offline. |
| **Google Calendar API** | Outbound (`google-workspace.adapter.ts`) | `googleapis` `calendar.events.insert` (`calendarId: 'primary'`) | `12s` timeout; auto-refreshes expired access token once using decrypted refresh token | If refresh token is revoked (`invalid_grant`), sets `users.google_scopes_valid = false` and prompts user in chat to reconnect Google. |
| **Gmail API (`gmail.readonly`)** | Outbound (`google-workspace.adapter.ts`) | `googleapis` `gmail.users.messages.list` (`q: 'newer_than:1d ...'`) & `messages.get` | `12s` per user; skips user on transient `5xx` and retries next 24h cycle | Sets `google_scopes_valid = false` on `invalid_grant` without crashing the batch cron loop for other users. |
| **Supabase Storage** | Outbound (`storage.adapter.ts`) | `@supabase/supabase-js` `storage.from('vault-files')` (`upload`, `createSignedUrl`, `remove`) | `30s` upload; `5s` signed URL generation; `1` retry on transient error | Cleans up orphan DB row if initial binary upload fails; blocks share access if signed URL minting fails. |
| **Web Push (VAPID)** | Outbound (`web-push.adapter.ts`) | `web-push` `sendNotification` | `8s` timeout; no retries on `404`/`410` | Automatically deletes expired endpoints (`410 Gone`) from `push_subscriptions` while preserving the in-app notification item. |

---

## 8. Webhooks & Inbound Event Verification

### 8.1 External SaaS Webhooks (`N/A` in MVP v1.0)

MedBay v1.0 has **no** payment gateway webhooks (Stripe/Paystack are out of scope) and uses a scheduled 24-hour pull cron rather than Google Cloud Pub/Sub Gmail push webhooks.

### 8.2 Inbound Machine & Callback Verification Contracts

1. **Scheduled Cron Trigger (`GET /api/cron/gmail-scan`):**
* **Cryptographic Verification:** Extracts the `Authorization` header, verifies the `Bearer ` prefix, and compares the token against `process.env.CRON_SECRET` using constant-time `crypto.timingSafeEqual` to prevent timing attacks. Any mismatch returns `401 Unauthorized` before touching the database.
* **Idempotency & Replay Protection:** Every scanned email is inserted with its `gmail_message_id` under the composite unique index `uq_notification_items_user_gmail_msg (user_id, gmail_message_id)`. If the cron job is manually re-triggered within the same 24-hour window, PostgreSQL `ON CONFLICT DO NOTHING` guarantees duplicate alerts and duplicate Web Push notifications are never sent.


2. **Google OAuth Callback (`GET /auth/callback`):**
* **State & PKCE Verification:** `@supabase/ssr` validates the `code_verifier` stored in the user's `HttpOnly` PKCE cookie against the authorization `code` returned by Google, preventing CSRF login injection.



---

## 9. Rate Limiting, Abuse Prevention & Quotas

Sliding-window rate limits are enforced atomically via a PostgreSQL RPC against `rate_limit_buckets` (`bucket_key`, `window_start`, `request_count`):

| Tier | Protected Endpoints / Actions | Window & Quota | Bucket Key | Rate-Limit Response Headers |
| --- | --- | --- | --- | --- |
| **Strict (AI & Binary Ingestion)** | `POST /api/chat`<br>

<br>`POST /api/documents/upload`<br>

<br>`POST /api/documents/[documentId]/retry` | `20 req / 60s`<br>

<br>`10 req / 60s`<br>

<br>`5 req / 60s` | `chat:{userId}`<br>

<br>`upload:{userId}`<br>

<br>`retry:{userId}` | `X-RateLimit-Limit`<br>

<br>`X-RateLimit-Remaining`<br>

<br>`X-RateLimit-Reset`<br>

<br>`Retry-After` (on `429`) |
| **Standard (Authenticated Mutations)** | All Server Actions (`createFamilyProfile`, `createShareLink`, `importGmailAttachment`, etc.) | `60 req / 60s` | `action:{userId}` | `X-RateLimit-Limit`<br>

<br>`X-RateLimit-Remaining` |
| **Relaxed Public (Token-Gated)** | `GET /api/share/[token]/file`<br>

<br>`GET /share/[token]` | `60 req / 60s` | `share:{sha256(clientIp)}` | `X-RateLimit-Limit`<br>

<br>`X-RateLimit-Remaining`<br>

<br>`Retry-After` (on `429`) |

---

## 10. Data Privacy, Sanitization & Secret Boundaries

### 10.1 Server-Only Secret Enforcement

* Third-party API keys (`OPENROUTER_API_KEY`, `GOOGLE_AI_API_KEY`, `TAVILY_API_KEY`, `GOOGLE_CLIENT_SECRET`, `VAPID_PRIVATE_KEY`), `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_SECRET`, and `CRON_SECRET` exist exclusively in server runtime memory (`src/lib/env.ts`) and are never prefixed with `NEXT_PUBLIC_`.
* `users.encrypted_google_refresh_token` is explicitly excluded from all Repository `SELECT` projections returned to Server Components, Server Actions, or Route Handlers—accessed solely inside `google-workspace.adapter.ts` via the `service_role` client.

### 10.2 Input Sanitization & Output Redaction

* **Filename & Path Sanitization:** Uploaded filenames strip directory traversal segments (`../`), null bytes, and special characters (`[^a-zA-Z0-9._-]`), always nesting inside `{userId}/{documentId}/`.
* **Markdown XSS Prevention:** Assistant Markdown responses in `/chat` and plain-English summaries in `/vault/[documentId]` are rendered through a strict Markdown renderer with raw HTML execution disabled (`skipHtml: true`) and external citation URLs restricted strictly to `https://` schemes.
* **Share Link Zero-Leak Boundary:** `/api/share/[token]/file` never joins `document_summaries`, `document_chunks`, `chat_messages`, or `family_profiles`, guaranteeing external recipients cannot inspect AI commentary even via raw network inspection.
* **Log Redaction:** `src/lib/logger.ts` strips clinical text, patient names, email subjects, and tokens before writing structured JSON logs.

---

## 11. Required API Environment Variables

| Variable Name | Scope | Example / Format | Purpose & Adapter Consumer |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public | `https://medbay.app` | Base URL for OAuth redirects and generated `/share/[token]` links. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | `https://xyz.supabase.co` | Supabase project REST, Auth, and Storage endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | `eyJhbGci...` | Browser/SSR anon key governed by PostgreSQL RLS. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public | `BEl62iUYg...` | Public VAPID key passed to `pushManager.subscribe()` in PWA service worker. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | `eyJhbGci...` | Privileged key for Agent 1 `after()` workers, cron jobs, and share token RPCs. |
| `OPENROUTER_API_KEY` | Server-Only | `sk-or-v1-...` | Authenticates `openrouter.adapter.ts` (`deepseek-v4.1-flash`, `gpt-oss-20b:free`, `mistral-ocr`). |
| `GOOGLE_AI_API_KEY` | Server-Only | `AIzaSy...` | Authenticates `google-ai.adapter.ts` for `gemini-embedding-001` (`1536` dims). |
| `TAVILY_API_KEY` | Server-Only | `tvly-...` | Authenticates `tavily.adapter.ts` for domain-locked medical citation searches. |
| `GOOGLE_CLIENT_ID` | Server-Only | `123456.apps.googleusercontent.com` | Google Cloud OAuth 2.0 Client ID for Calendar & Gmail API token refresh. |
| `GOOGLE_CLIENT_SECRET` | Server-Only | `GOCSPX-...` | Google Cloud OAuth 2.0 Client Secret. |
| `ENCRYPTION_SECRET` | Server-Only | `64-char hex string (32 bytes)` | AES-256-GCM master key encrypting `users.encrypted_google_refresh_token`. |
| `VAPID_PRIVATE_KEY` | Server-Only | `UUxI4O8...` | Private VAPID key used by `web-push.adapter.ts` to sign push alerts. |
| `VAPID_SUBJECT` | Server-Only | `mailto:security@medbay.app` | Administrative contact URI required by Web Push protocol. |
| `CRON_SECRET` | Server-Only | `32+ char random secret` | Bearer token authenticating Vercel's 24-hour `/api/cron/gmail-scan` trigger. |

```



```