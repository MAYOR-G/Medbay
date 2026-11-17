# Master Implementation Plan: MedBay (`IMPLEMENTATION_PLAN.md`)

| Field | Detail |
| :--- | :--- |
| **Product Name** | MedBay (`medbay`) |
| **Architecture** | Modular Monolithic Full-Stack PWA (Next.js App Router + Supabase + LangGraph.js + Vercel AI SDK) |
| **Visual System** | Private Health Atelier (*"Archival Emerald Vault"*) — `DESIGN.md` v1.0 |
| **Source of Truth** | `PRD.md` · `DESIGN.md` · `ARCHITECTURE.md` · `DATABASE.md` · `API.md` · `agents_coding_rules.md` |

---

## Phase 0: Project Initialization & Design System Foundation

### Phase Goal
Initialize a strictly typed Next.js App Router repository with the exact approved dependencies, environment validation, cryptographic utilities, structured PHI-redacting logger, PWA shell assets, and `DESIGN.md` semantic tokens and base UI primitives.

### Prerequisites / Dependencies
* Node.js 20+ LTS, Supabase CLI, and single package manager lockfile initialized.
* Approved specification documents (`PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `agents_coding_rules.md`) in repository root.

### Actionable Tasks
- [ ] **Task 0.1 — Scaffold Next.js & TypeScript Strict Configuration:** Initialize Next.js 15+ (App Router), React 19, TypeScript 5 (`strict: true`), and Tailwind CSS v4 with path aliases (`@/*` -> `./src/*`) and security headers in `next.config.ts` (`CSP`, `HSTS`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- [ ] **Task 0.2 — Install Approved Dependencies Only:** Install the exact approved package manifest (`@supabase/supabase-js`, `@supabase/ssr`, `ai`, `@openrouter/ai-sdk-provider`, `@langchain/langgraph`, `@google/genai`, `@tavily/core`, `googleapis`, `web-push`, `mammoth`, `lucide-react`, `date-fns`, `zod`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-switch`, `@radix-ui/react-dropdown-menu`, `clsx`, `tailwind-merge`, plus `vitest` and `@playwright/test` as devDependencies). Verify zero banned libraries are present.
- [ ] **Task 0.3 — Environment Blueprint & Fail-Fast Validator:** Create `.env.example` documenting all 14 public and server-only variables from `API.md`, and implement `src/lib/env.ts` using Zod to validate `process.env` at startup.
- [ ] **Task 0.4 — Core Utilities (`errors.ts`, `logger.ts`, `crypto.ts`):** Implement the typed `AppError` hierarchy (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `LinkExpiredError`, `RateLimitError`, `ExternalProviderError`), structured JSON logger with automatic PHI/PII redaction, and AES-256-GCM encryption/decryption + 192-bit `base64url` token generator.
- [ ] **Task 0.5 — Design System Tokens & Fonts (`tokens.css` & `layout.tsx`):** Configure Google Fonts (`Outfit`, `Source Sans 3`, `JetBrains Mono`) in `src/app/layout.tsx` and define all semantic color, typography (`64ch` measure, `tabular-nums`), `4px` spacing, radius, and elevation CSS custom properties from `DESIGN.md` in `src/styles/tokens.css`.
- [ ] **Task 0.6 — Reusable UI Primitives (`src/components/ui/`):** Build accessible, token-driven primitives (`Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, `ModalOrSheet.tsx` adapting mobile bottom sheets vs. desktop dialogs, `Toast.tsx`, `Skeleton.tsx`) enforcing `44px x 44px` minimum touch targets and `2px` `#1B5E4B` focus rings.
- [ ] **Task 0.7 — PWA Manifest & Service Worker Shell:** Create `public/manifest.json` (`theme_color: #1B5E4B`, `background_color: #F5F5F0`, `display: standalone`), placeholder app icons in `public/icons/`, and base `public/sw.js` for offline app-shell caching.

### Target Files / Modules
* `package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`
* `src/lib/env.ts`, `src/lib/errors.ts`, `src/lib/logger.ts`, `src/lib/crypto.ts`
* `src/styles/tokens.css`, `src/app/layout.tsx`
* `src/components/ui/Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, `ModalOrSheet.tsx`, `Toast.tsx`, `Skeleton.tsx`
* `public/manifest.json`, `public/sw.js`, `public/icons/*`

### Database / API Changes
* None (Foundational project and UI primitive setup).

### Testing & Completion Criteria
* `tsc --noEmit` and `npm run lint` pass with zero errors.
* Startup fails fast with a clear Zod message when a required env variable (e.g., `ENCRYPTION_SECRET`) is missing or malformed.
* Unit test in `tests/unit/crypto.test.ts` passes AES-256-GCM round-trip encryption/decryption and token entropy checks.

---

## Phase 1: Database Schema, Migrations, RLS & Data Access Layer

### Phase Goal
Provision the complete PostgreSQL 16 + `pgvector` schema, constraints, triggers, Row-Level Security policies, security-definer RPCs, private encrypted Storage bucket (`vault-files`), local seed data, Zod validation schemas, and typed repository modules.

### Prerequisites / Dependencies
* Phase 0 completed (`src/lib/env.ts`, `src/lib/errors.ts`, `src/lib/crypto.ts` ready).
* Local Supabase CLI stack initialized (`supabase init`).

### Actionable Tasks
- [ ] **Task 1.1 — Core Relational & Vector Schema Migration:** Create `supabase/migrations/0001_initial_schema.sql` enabling `pgcrypto` and `pgvector`, creating all 12 tables (`users`, `family_profiles`, `medical_documents`, `document_summaries`, `document_chunks`, `chat_threads`, `chat_messages`, `share_links`, `activity_events`, `notification_items`, `push_subscriptions`, `rate_limit_buckets`), and enforcing all `CHECK` constraints, foreign keys (`ON DELETE CASCADE` / `SET NULL`), and unique/partial indexes from `DATABASE.md`.
- [ ] **Task 1.2 — Triggers, RPC Functions & Query Indexes Migration:** Create `supabase/migrations/0002_triggers_indexes_rpcs.sql` implementing `set_updated_at()` triggers, the 15-dependent max sub-profile trigger, the `medical_documents.profile_id` -> `document_chunks.profile_id` sync trigger, all B-Tree/GIN/HNSW indexes, and the 4 PostgreSQL RPCs (`match_document_chunks`, `resolve_active_share_link`, `complete_document_ingestion`, `check_rate_limit`).
- [ ] **Task 1.3 — Row-Level Security & Private Storage Bucket Migration:** Create `supabase/migrations/0003_rls_and_storage.sql` enabling `FORCE ROW LEVEL SECURITY` on all 12 tables with exact `authenticated`, `anon`, and `service_role` policies from `DATABASE.md`, plus provisioning the private `vault-files` Storage bucket (`25 MB` limit, 6 allowed MIME types) and user-scoped folder Storage RLS policies.
- [ ] **Task 1.4 — Local Seed Data & Type Generation:** Create `supabase/seed.sql` with the demo caregiver account (`Self`, `Sarah`, `David`), 2 sample ready documents with summaries/chunks, timeline events, and a sample Gmail alert; run `supabase db reset` and generate `src/types/database.types.ts` alongside clean `camelCase` DTOs in `src/types/domain.types.ts`.
- [ ] **Task 1.5 — Shared Zod Validation Schemas (`src/lib/schemas/`):** Create strict Zod schemas (`profile.schema.ts`, `document.schema.ts`, `share.schema.ts`, `chat.schema.ts`, `notification.schema.ts`, `pagination.schema.ts`) matching `DATABASE.md` enums and `API.md` input contracts.
- [ ] **Task 1.6 — Supabase Clients & Repository Modules (`src/server/repositories/`):** Implement `src/lib/supabase/client.ts`, `server.ts`, and `admin.ts`, and build all 7 typed repositories (`user.repo.ts`, `profile.repo.ts`, `document.repo.ts`, `chat.repo.ts`, `share.repo.ts`, `timeline.repo.ts`, `notification.repo.ts`) mapping `snake_case` DB rows to `camelCase` DTOs and enforcing rate limits.

### Target Files / Modules
* `supabase/config.toml`, `supabase/migrations/0001_initial_schema.sql`, `0002_triggers_indexes_rpcs.sql`, `0003_rls_and_storage.sql`, `supabase/seed.sql`
* `src/types/database.types.ts`, `src/types/domain.types.ts`
* `src/lib/schemas/*.schema.ts`
* `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`
* `src/server/repositories/*.repo.ts`

### Database / API Changes
* **Tables Created:** `users`, `family_profiles`, `medical_documents`, `document_summaries`, `document_chunks`, `chat_threads`, `chat_messages`, `share_links`, `activity_events`, `notification_items`, `push_subscriptions`, `rate_limit_buckets`.
* **Storage Bucket Created:** `vault-files` (private, encrypted at rest).
* **RPCs Created:** `match_document_chunks`, `resolve_active_share_link`, `complete_document_ingestion`, `check_rate_limit`.

### Testing & Completion Criteria
* `supabase db reset` applies all migrations and `seed.sql` with zero errors.
* Integration tests in `tests/integration/rls-isolation.test.ts` confirm cross-tenant isolation (User A cannot query User B's rows) and `match_document_chunks` `profile_id` isolation.

---

## Phase 2: Authentication, Edge Middleware & App Shell Navigation

### Phase Goal
Deliver Google OAuth 2.0 authentication (requesting Calendar and `gmail.readonly` scopes), encrypted refresh token persistence, automatic `Self` profile provisioning, Edge session middleware, and the responsive PWA App Shell (Mobile Bottom Nav + Desktop Sidebar + Top Header + Profile Switcher).

### Prerequisites / Dependencies
* Phase 1 completed (`users` and `family_profiles` repositories, `crypto.ts`, and UI primitives ready).
* Google Cloud OAuth 2.0 credentials configured in Supabase Auth.

### Actionable Tasks
- [ ] **Task 2.1 — Google OAuth Login & PKCE Callback:** Implement `/login/page.tsx` (`Auth Centered Card Shell` from `DESIGN.md`) and `GET /auth/callback/route.ts` to exchange the OAuth code, encrypt `provider_refresh_token` via AES-256-GCM into `users`, provision the default `Self` `FamilyProfile` on first login, and redirect to `/vault`.
- [ ] **Task 2.2 — Edge Session Middleware & Route Guard:** Implement `middleware.ts` to refresh Supabase JWT cookies, redirect unauthenticated users away from `(app)/*` routes to `/login`, redirect authenticated users from `/` or `/login` to `/vault`, and allow public `/share/[token]` access without auth cookies.
- [ ] **Task 2.3 — Account Lifecycle Server Actions:** Implement `signOut`, `updateAccountPreferences` (`gmail_scan_enabled` toggle), and `deleteUserAccount` (purging `vault-files` Storage folder before deleting `auth.users`) in `src/server/actions/account.action.ts`.
- [ ] **Task 2.4 — Public Landing & PWA Entry (`/`):** Build `src/app/page.tsx` with the `DESIGN.md` hero section, 3-card value grid, `"Continue with Google"` CTA, and `"Install MedBay App"` PWA install prompt hook.
- [ ] **Task 2.5 — Responsive App Shell & Profile Switcher (`src/components/layout/`):** Create Zustand store `src/stores/use-vault-store.ts` (`activeProfileId`, modal/sheet state, toast queue) and build `AppShell.tsx`, `TopHeader.tsx` (with Profile Switcher pill & unread Notification Bell), `MobileBottomNav.tsx` (4 tabs + elevated center `+` Upload button), and `DesktopSidebar.tsx` (`240px` rail), wired into `src/app/(app)/layout.tsx`.

### Target Files / Modules
* `middleware.ts`, `src/app/page.tsx`
* `src/app/(auth)/login/page.tsx`, `src/app/(auth)/auth/callback/route.ts`
* `src/app/(app)/layout.tsx`
* `src/server/actions/account.action.ts`
* `src/stores/use-vault-store.ts`
* `src/components/layout/AppShell.tsx`, `TopHeader.tsx`, `MobileBottomNav.tsx`, `DesktopSidebar.tsx`, `ProfileSwitcher.tsx`

### Database / API Changes
* **Endpoints / Actions:** `GET /auth/callback`, `Action: signOut`, `Action: updateAccountPreferences`, `Action: deleteUserAccount`.
* **Tables Read/Written:** `users`, `family_profiles`.

### Testing & Completion Criteria
* Unauthenticated navigation to `/vault` redirects to `/login`; `/share/test-token` bypasses login redirect.
* Completing OAuth callback creates `users` row with non-null encrypted refresh token and exactly one `is_primary = true` `Self` profile.
* Mobile (`375px`) and Desktop (`1280px`) navigation shells render without horizontal overflow or layout shift.

---

## Phase 3: Vertical Slice 1 — Family Sub-Profiles & Settings (`/profiles`)

### Phase Goal
Enable primary account holders to create, edit, and delete up to 15 managed dependent sub-profiles (name + relationship only, no separate logins/emails) and manage connected Google services and Web Push toggles on `/profiles`.

### Prerequisites / Dependencies
* Phase 2 completed (App Shell, Profile Switcher, and `profile.repo.ts` ready).

### Actionable Tasks
- [ ] **Task 3.1 — Profile Service & Server Actions:** Implement `src/server/services/profile.service.ts` (deterministic `color_index` assignment `0–6`, max 15 dependents check, Storage cleanup on dependent deletion) and Server Actions (`createFamilyProfile`, `updateFamilyProfile`, `deleteFamilyProfile`) in `src/server/actions/profile.action.ts`.
- [ ] **Task 3.2 — Family Profile Cards & Add/Edit Modal:** Build `src/components/profiles/ProfileCard.tsx` (showing deterministic `DESIGN.md` profile color badge, relationship, optional DOB, document count, edit/delete actions) and `AddProfileModal.tsx` (Name, Relationship selector, optional DOB—zero email/password fields).
- [ ] **Task 3.3 — Google Services & Settings Screen (`/profiles`):** Build `src/components/profiles/GoogleSyncCard.tsx` (Google Calendar active status, 24-hour Gmail scanner toggle switch, last scan timestamp, reconnect button) and assemble `src/app/(app)/profiles/page.tsx`.

### Target Files / Modules
* `src/server/services/profile.service.ts`
* `src/server/actions/profile.action.ts`
* `src/components/profiles/ProfileCard.tsx`, `AddProfileModal.tsx`, `GoogleSyncCard.tsx`
* `src/app/(app)/profiles/page.tsx`

### Database / API Changes
* **Actions:** `createFamilyProfile`, `updateFamilyProfile`, `deleteFamilyProfile`.
* **Tables Read/Written:** `family_profiles`, `users`.

### Testing & Completion Criteria
* Creating a dependent profile (`Spouse`, `Child`) updates both `/profiles` and the global `ProfileSwitcher` immediately without requiring an email address.
* Attempting to create a 16th dependent or delete the primary `Self` profile returns a structured `409 Conflict` error toast.

---

## Phase 4: Vertical Slice 2 — Medical Vault, Multi-Format Upload & Agent 1 Ingestion (`/vault`)

### Phase Goal
Build multi-format medical file uploads (`JPEG`, `PNG`, `WebP`, `PDF`, `DOCX`, `TXT` <= 25MB) with magic-byte validation, private encrypted Storage, the asynchronous 6-node Agent 1 LangGraph pipeline (`mistral-ocr` / vision -> patient name match -> Tavily medical citations -> plain-English summary -> `gemini-embedding-001` indexing), and the `/vault` & `/vault/[documentId]` screens.

### Prerequisites / Dependencies
* Phase 3 completed (`family_profiles` exist for patient name matching).
* API keys configured for OpenRouter, Google AI Studio, and Tavily.

### Actionable Tasks
- [ ] **Task 4.1 — External AI, OCR, Search & Storage Adapters:** Implement `storage.adapter.ts` (private `vault-files` upload, signed URLs, delete), `openrouter.adapter.ts` (`deepseek/deepseek-v4.1-flash` primary -> `openai/gpt-oss-20b:free` fallback + `file-parser` `mistral-ocr`), `google-ai.adapter.ts` (`gemini-embedding-001` `1536` dims), and `tavily.adapter.ts` (Tier-1 trusted medical domain allowlist + Tier-2 fallback) under `src/server/integrations/`.
- [ ] **Task 4.2 — Agent 1 Ingestion LangGraph Pipeline:** Implement `src/server/agents/prompts/ingestion.prompt.ts` and `src/server/agents/ingestion.graph.ts` executing the 6-step workflow (`extractTextNode` -> `classifyAndMatchProfileNode` with Levenshtein/token name matching -> `gatherCitationsNode` -> `summarizeDocumentNode` with Zod validation -> `chunkAndEmbedNode` -> `finalizeIngestionNode` atomic RPC + `AI_SUMMARY_GENERATED` timeline event).
- [ ] **Task 4.3 — Upload, File Stream & Document Mutation Endpoints:** Implement `document.service.ts`, `POST /api/documents/upload/route.ts` (magic-byte MIME verification, `<= 25 MB` check, Storage upload, `DOCUMENT_UPLOADED` timeline log, `after()` Agent 1 trigger), `GET /api/documents/[documentId]/file/route.ts`, `POST /api/documents/[documentId]/retry/route.ts`, and `src/server/actions/document.action.ts` (`updateDocumentMetadata`, `reassignDocumentProfile`, `deleteDocument`).
- [ ] **Task 4.4 — Vault Home Screen & Upload Sheet (`/vault`):** Build `DocumentCard.tsx` (status pills, critical flags, `"Confirm Patient"` badge when `needs_review`), `UploadSheet.tsx` (mobile camera capture + file dropzone + optional profile pre-selector), search bar, and category filter chips in `src/app/(app)/vault/page.tsx`.
- [ ] **Task 4.5 — Document Detail & AI Summary Screen (`/vault/[documentId]`):** Build `DocumentViewerPane.tsx` (isolated `#0E1513` dark canvas PDF/image/text viewer) and `SummaryPanel.tsx` (Overview, Critical/Attention Flags, 2–4 Doctor Questions, Tavily Citation chips, Profile reassignment dropdown, `"Ask AI Follow-Up"` CTA), adapting between mobile segmented tabs and desktop `50/50` split-screen in `src/app/(app)/vault/[documentId]/page.tsx`.

### Target Files / Modules
* `src/server/integrations/storage.adapter.ts`, `openrouter.adapter.ts`, `google-ai.adapter.ts`, `tavily.adapter.ts`
* `src/server/agents/prompts/ingestion.prompt.ts`, `src/server/agents/ingestion.graph.ts`
* `src/server/services/document.service.ts`
* `src/app/api/documents/upload/route.ts`, `src/app/api/documents/[documentId]/file/route.ts`, `src/app/api/documents/[documentId]/retry/route.ts`
* `src/server/actions/document.action.ts`
* `src/components/vault/DocumentCard.tsx`, `UploadSheet.tsx`, `DocumentViewerPane.tsx`, `SummaryPanel.tsx`
* `src/app/(app)/vault/page.tsx`, `src/app/(app)/vault/[documentId]/page.tsx`

### Database / API Changes
* **Endpoints / Actions:** `POST /api/documents/upload`, `GET /api/documents/[documentId]/file`, `POST /api/documents/[documentId]/retry`, `Action: updateDocumentMetadata`, `Action: reassignDocumentProfile`, `Action: deleteDocument`.
* **Tables Read/Written:** `medical_documents`, `document_summaries`, `document_chunks`, `activity_events`, `rate_limit_buckets`.

### Testing & Completion Criteria
* Unit tests in `tests/unit/ingestion.test.ts` pass patient name matching, semantic text chunking, and magic-byte validation checks.
* Uploading a sample PDF or image transitions smoothly from `queued` -> `ready`, populates `document_summaries` with verified domain-locked citations, and indexes `1536`-dim chunks in `document_chunks`.
* Reassigning a document's profile updates `document_chunks.profile_id` atomically.

---

## Phase 5: Vertical Slice 3 — One-Click Expiring Share Links (`/share/[token]`)

### Phase Goal
Allow document owners to generate one-click, PIN-free expiring share links (`24 Hours`, `7 Days`, `30 Days`) and revoke them immediately, paired with an isolated public raw document viewer that strictly excludes all AI summaries and family profile data.

### Prerequisites / Dependencies
* Phase 4 completed (`medical_documents` and `storage.adapter.ts` signed URL generation ready).

### Actionable Tasks
- [ ] **Task 5.1 — Share Service & Server Actions:** Implement `src/server/services/share.service.ts` (TTL calculation for `'24h' | '7d' | '30d'`, 192-bit token generation, `SHARE_LINK_CREATED` and `SHARE_LINK_REVOKED` timeline logging) and `src/server/actions/share.action.ts` (`createShareLink`, `revokeShareLink`).
- [ ] **Task 5.2 — Public Raw File Stream Endpoint (`GET /api/share/[token]/file`):** Implement `src/app/api/share/[token]/file/route.ts` invoking `resolve_active_share_link` RPC, enforcing per-IP sliding-window rate limits, setting `Cache-Control: no-store` and `X-Robots-Tag: noindex`, and issuing a 5-minute Storage signed URL strictly for the raw binary.
- [ ] **Task 5.3 — Expiring Share Link Modal (`ShareModal.tsx`):** Build `src/components/vault/ShareModal.tsx` with `24h` / `7d` / `30d` preset selector, one-tap clipboard copy, native mobile Web Share API trigger, and active links list with expiration countdowns (`tabular-nums`) and `"Revoke"` buttons; wire into `/vault/[documentId]`.
- [ ] **Task 5.4 — Standalone Public Raw Document Viewer (`/share/[token]`):** Build `src/app/share/[token]/page.tsx` with minimal dark header (`56px`, `#14211D`), live expiration countdown, raw document viewer on `#0E1513` canvas, and a clean `410 Gone` expired/revoked fallback screen revealing zero document metadata.

### Target Files / Modules
* `src/server/services/share.service.ts`
* `src/server/actions/share.action.ts`
* `src/app/api/share/[token]/file/route.ts`
* `src/components/vault/ShareModal.tsx`
* `src/app/share/[token]/page.tsx`

### Database / API Changes
* **Endpoints / Actions:** `Action: createShareLink`, `Action: revokeShareLink`, `GET /api/share/[token]/file`.
* **Tables / RPCs Used:** `share_links`, `activity_events`, `resolve_active_share_link`.

### Testing & Completion Criteria
* Integration test in `tests/integration/share-isolation.test.ts` confirms an active token renders the raw file in an unauthenticated session with zero `document_summaries` fields in HTML or network payloads, and returns `410 Gone` immediately after revocation or expiration.

---

## Phase 6: Vertical Slice 4 — Personalized RAG & Google Calendar Action Chat (`/chat`)

### Phase Goal
Deliver profile-isolated conversational RAG across family medical documents with streaming Markdown, inline vault & Tavily citations, and direct Google Calendar appointment booking via tool calling.

### Prerequisites / Dependencies
* Phase 4 completed (`document_chunks` indexed with `1536`-dim embeddings and `match_document_chunks` RPC ready).

### Actionable Tasks
- [ ] **Task 6.1 — Google Workspace Adapter (Calendar Booking):** Implement `src/server/integrations/google-workspace.adapter.ts` with encrypted refresh token decryption, automatic OAuth access-token refresh (`google_scopes_valid = false` flag on `invalid_grant`), and `createCalendarEvent` calling Google Calendar API `events.insert`.
- [ ] **Task 6.2 — Agent 2 RAG & Tool-Calling Orchestrator:** Implement `src/server/agents/prompts/rag-chat.prompt.ts` (enforcing cross-document patient name guardrails and medical disclaimer rules) and `src/server/agents/rag-chat.graph.ts` combining `match_document_chunks` profile-isolated retrieval with `search_medical_authorities` (Tavily) and `book_calendar_appointment` tools.
- [ ] **Task 6.3 — Streaming Chat Endpoint & Thread Actions:** Implement `POST /api/chat/route.ts` using Vercel AI SDK `streamText` (`deepseek/deepseek-v4.1-flash` or `google/gemini-4-carbon` with `openai/gpt-oss-20b:free` fallback), persisting user/assistant messages, citations, and booked calendar artifacts on stream completion, plus `deleteChatThread` in `src/server/actions/chat.action.ts`.
- [ ] **Task 6.4 — Streaming Chat UI (`/chat`):** Build `ChatWorkspace.tsx`, `MessageBubble.tsx` (safe Markdown rendering with `skipHtml: true` and `64ch` measure), `CitationChip.tsx` (emerald Vault chips + sky-blue Tavily chips), `CalendarEventCard.tsx` (emerald confirmation card with Google Calendar link), starter prompt chips, and thread history drawer in `src/app/(app)/chat/page.tsx`.

### Target Files / Modules
* `src/server/integrations/google-workspace.adapter.ts`
* `src/server/agents/prompts/rag-chat.prompt.ts`, `src/server/agents/rag-chat.graph.ts`
* `src/app/api/chat/route.ts`
* `src/server/actions/chat.action.ts`
* `src/components/chat/ChatWorkspace.tsx`, `MessageBubble.tsx`, `CitationChip.tsx`, `CalendarEventCard.tsx`
* `src/app/(app)/chat/page.tsx`

### Database / API Changes
* **Endpoints / Actions:** `POST /api/chat`, `Action: deleteChatThread`.
* **Tables / RPCs Used:** `chat_threads`, `chat_messages`, `document_chunks`, `activity_events`, `users`, `match_document_chunks`.

### Testing & Completion Criteria
* Chatting with `profileId` locked to `"David"` retrieves zero chunks belonging to `"Self"` and streams cited responses smoothly.
* Requesting a doctor appointment invokes `book_calendar_appointment`, renders the Emerald Confirmation Card in `/chat`, and records `CALENDAR_APPOINTMENT_BOOKED` in `activity_events`.

---

## Phase 7: Vertical Slice 5 — Chronological Activity Timeline (`/timeline`)

### Phase Goal
Provide caregivers with a searchable, filterable reverse-chronological audit log grouped by date tracking every upload, AI summary, profile reassignment, share link event, calendar booking, and Gmail alert.

### Prerequisites / Dependencies
* Phases 4, 5, and 6 completed (all domain services emitting `activity_events` records).

### Actionable Tasks
- [ ] **Task 7.1 — Timeline Service & Filtered Queries:** Implement `src/server/services/timeline.service.ts` grouping paginated `activity_events` by relative/formatted date headers (`Today`, `Yesterday`, `MMM d, yyyy`) with `profileId` and `eventType` filter support.
- [ ] **Task 7.2 — Activity Timeline Screen (`/timeline`):** Build `TimelineFeed.tsx`, `TimelineGroup.tsx`, and `TimelineRow.tsx` (event-type icons, Family Profile Pill, `tabular-nums` timestamp, and deep-link navigation to `/vault/[documentId]`, `/chat`, or `/notifications`) in `src/app/(app)/timeline/page.tsx`.

### Target Files / Modules
* `src/server/services/timeline.service.ts`
* `src/components/timeline/TimelineFeed.tsx`, `TimelineGroup.tsx`, `TimelineRow.tsx`
* `src/app/(app)/timeline/page.tsx`

### Database / API Changes
* **Tables Read:** `activity_events`, `family_profiles`, `medical_documents`.

### Testing & Completion Criteria
* `/timeline` displays events grouped accurately by date, filters cleanly by family member and event category, and deep-links to the corresponding document or alert when tapped.

---

## Phase 8: Vertical Slice 6 — 24-Hour Gmail Medical Scanner & Web Push Notifications (`/notifications`)

### Phase Goal
Build the scheduled 24-hour Gmail medical scanner (`gmail.readonly`), VAPID Web Push delivery for mobile and desktop PWAs, and the Notification Center with one-tap attachment import into the vault (strictly zero outbound notification emails).

### Prerequisites / Dependencies
* Phase 4 (Agent 1 ingestion pipeline) and Phase 6 (`google-workspace.adapter.ts`) completed.
* VAPID public/private keys configured in `.env`.

### Actionable Tasks
- [ ] **Task 8.1 — Gmail Scanner & Web Push Adapters:** Extend `google-workspace.adapter.ts` with `scanRecentMedicalEmails` (`newer_than:1d` + medical keyword/sender filters + attachment download helper) and implement `src/server/integrations/web-push.adapter.ts` (VAPID dispatch + automatic `410 Gone` stale subscription cleanup).
- [ ] **Task 8.2 — Gmail Scanner Service & 24-Hour Cron Endpoint:** Implement `src/server/services/gmail-scanner.service.ts` and `GET /api/cron/gmail-scan/route.ts` (constant-time `CRON_SECRET` Bearer verification, idempotent `gmail_message_id` deduplication, `GMAIL_MEDICAL_DETECTED` timeline event, in-app `notification_items` insert, and Web Push dispatch—zero outbound email sending).
- [ ] **Task 8.3 — Web Push Subscription & Notification Actions:** Implement `POST /api/push/subscribe/route.ts`, `DELETE /api/push/subscribe/route.ts`, and `src/server/actions/notification.action.ts` (`markNotificationsRead`, `dismissNotification`, `importGmailAttachment` fetching attachments into `vault-files` and triggering Agent 1).
- [ ] **Task 8.4 — Service Worker Push Handler & Notification Center UI (`/notifications`):** Update `public/sw.js` to handle incoming `push` and `notificationclick` events, wire the unread bell count badge in `TopHeader.tsx`, and build `NotificationList.tsx`, `NotificationCard.tsx` (with one-tap `"Import to Vault"` CTA), and `src/app/(app)/notifications/page.tsx`.

### Target Files / Modules
* `src/server/integrations/google-workspace.adapter.ts`, `src/server/integrations/web-push.adapter.ts`
* `src/server/services/gmail-scanner.service.ts`
* `src/app/api/cron/gmail-scan/route.ts`, `src/app/api/push/subscribe/route.ts`
* `src/server/actions/notification.action.ts`
* `public/sw.js`
* `src/components/notifications/NotificationList.tsx`, `NotificationCard.tsx`
* `src/app/(app)/notifications/page.tsx`

### Database / API Changes
* **Endpoints / Actions:** `GET /api/cron/gmail-scan`, `POST /api/push/subscribe`, `DELETE /api/push/subscribe`, `Action: markNotificationsRead`, `Action: dismissNotification`, `Action: importGmailAttachment`.
* **Tables Read/Written:** `users`, `notification_items`, `push_subscriptions`, `medical_documents`, `activity_events`.

### Testing & Completion Criteria
* Calling `GET /api/cron/gmail-scan` without valid `Bearer CRON_SECRET` returns `401 Unauthorized`; calling with valid secret deduplicates repeat message IDs, creates in-app + Web Push alerts, and sends zero emails.
* Tapping `"Import to Vault"` on an attachment alert creates a `medical_documents` record (`source = 'gmail_import'`) and triggers Agent 1 summarization.

---

## Phase 9: Polish, Comprehensive QA, Security Hardening & Production Deployment

### Phase Goal
Verify every loading, empty, error, and offline state across mobile and desktop viewports, execute unit, integration, and end-to-end Playwright test suites, audit security boundaries, and promote MedBay v1.0 to production.

### Prerequisites / Dependencies
* Phases 0 through 8 completed and verified locally.

### Actionable Tasks
- [ ] **Task 9.1 — Complete Loading, Empty, Error & Offline States:** Audit all screens against `DESIGN.md` Section 7 to verify `CLS = 0` skeletons (`/vault`, `/timeline`, `/notifications`), empty-state illustrations/CTAs, global `src/app/error.tsx`, `src/app/not-found.tsx`, revoked Google OAuth banner, and offline PWA connectivity banner.
- [ ] **Task 9.2 — Accessibility & Mobile Ergonomics Audit:** Verify WCAG 2.1 AA contrast ratios, `44px x 44px` minimum touch targets, `aria-live="polite"` on AI streaming regions, keyboard focus trapping in modals/sheets, and `prefers-reduced-motion` support across `375px` mobile and `1280px` desktop viewports.
- [ ] **Task 9.3 — End-to-End Playwright Smoke Suite (`tests/e2e/`):** Write deterministic Playwright tests (`tests/e2e/medbay-core.spec.ts`) covering all 5 Definition-of-Done journeys from `PRD.md` (OAuth & sub-profile creation, document upload -> `Ready` summary, profile-scoped RAG chat + Calendar booking card, incognito one-click share link isolation & revocation, and timeline audit verification).
- [ ] **Task 9.4 — Security & PHI Redaction Audit:** Verify zero `service_role` imports inside `src/app/(app)/`, `src/components/`, or `src/server/actions/`; confirm `logger.ts` redacts all clinical text and tokens; verify `Cache-Control: no-store` and `X-Robots-Tag: noindex` headers on `/share/[token]`.
- [ ] **Task 9.5 — Production Deployment & Cron Activation:** Configure `vercel.json` with the daily cron schedule (`0 8 * * *` UTC -> `/api/cron/gmail-scan`), push production Supabase migrations (`supabase db push`), set all production secrets in Vercel, and run a final live smoke check against production URLs.

### Target Files / Modules
* `src/app/error.tsx`, `src/app/not-found.tsx`
* `tests/e2e/medbay-core.spec.ts`
* `vercel.json`

### Database / API Changes
* Production Supabase migration push (`supabase db push`) and Vercel Cron registration (`0 8 * * *` UTC).

### Testing & Completion Criteria
* `tsc --noEmit`, `npm run lint`, `vitest run` (unit + integration), and `npx playwright test` pass 100% with zero failures.
* All 5 functional Definition-of-Done criteria in `PRD.md` Section 10.3 are verified in staging/production.