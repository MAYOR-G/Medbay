# MedBay AI Coding Agent Operational Rules (`agents_coding_rules.md`)

This document is the binding operational rulebook for all autonomous coding agents (Cursor, Windsurf, Aider, Devin, Claude Code) working on **MedBay (`medbay`)**. You MUST treat **`PRD.md`**, **`DESIGN.md`**, **`ARCHITECTURE.md`**, **`DATABASE.md`**, and **`API.md`** as the single source of truth.

---

## 1. Prime Directives (Agent Behavior Core)

* **Inspect Before Modifying:** You MUST read target files, trace imports, and grep for existing usages across `src/` and `supabase/` *before* proposing or writing any code. Never guess file paths, prop signatures, or database column names.
* **Scope Discipline:** You MUST confine every change strictly to the active task. NEVER refactor unrelated modules, reformat untouched files, rename existing symbols outside your task scope, or alter unrelated styling.
* **No Hallucinations or Feature Creep:** If a UI screen, database column, RPC function, or API endpoint is not defined in `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, or `API.md`, you MUST stop and ask for explicit human approval before inventing it.
* **Enforce Explicit MVP Boundaries:** You MUST strictly honor the non-goals locked in `PRD.md`:
  * NEVER add login credentials, passwords, or email invitations for managed family sub-profiles.
  * NEVER add PINs, passwords, or login walls to `/share/[token]` public links, and NEVER expose AI summaries, doctor questions, or profile metadata on public share views.
  * NEVER send outbound emails to notify users of 24-hour Gmail scan findings (in-app notifications and Web Push alerts only).
  * NEVER introduce microservices, Redis, external message queues, or native mobile wrapper projects.

---

## 2. Code Quality, Naming & Formatting

* **Deterministic Naming Conventions:** You MUST enforce exact casing across every layer:
  * **Directories & App Router Segments:** `kebab-case` (e.g., `gmail-scan/`, `auth/callback/`), with dynamic parameters in brackets (`[documentId]`, `[token]`).
  * **React Components:** `PascalCase.tsx` matching the exported component name (e.g., `DocumentVaultCard.tsx`, `ShareLinkModal.tsx`).
  * **Server Modules:** `kebab-case` suffixed by architectural role (`*.action.ts`, `*.service.ts`, `*.repo.ts`, `*.adapter.ts`, `*.graph.ts`, `*.prompt.ts`, `*.schema.ts`).
  * **TypeScript Variables, Functions & JSON DTOs:** `camelCase` (`profileId`, `ingestionStatus`, `expiresAt`).
  * **Database Tables, Columns, Indexes & RPCs:** `snake_case` (`family_profiles`, `medical_documents`, `detected_patient_name`, `match_document_chunks`).
  * **Enum String Literals:** Exact case-sensitive strings defined in `DATABASE.md` (`'Lab Report'`, `'needs_review'`, `'24h'`, `'CALENDAR_APPOINTMENT_BOOKED'`).
* **Pragmatic DRY Principle:** Extract shared logic into `src/lib/` or `src/components/ui/` only when a pattern is repeated two or more times. NEVER build speculative generic abstractions or wrapper factories for single-use logic.
* **Preserve Existing Annotations:** NEVER delete existing developer comments, `TODO` markers, JSDoc blocks, or structured logger calls unless the specific code they describe is being deleted or updated—and always ensure logs obey the PHI/PII redaction rules in Section 8.

---

## 3. Project Structure & File Placement

You MUST place every new or modified file in its exact designated directory defined in `ARCHITECTURE.md`:

* **`src/app/`:** Next.js App Router pages, layouts, error boundaries, and HTTP Route Handlers (`src/app/api/**/route.ts`). Keep Server Components lean; delegate all mutations and data access downward.
* **`src/components/`:**
  * `src/components/ui/`: Design-system primitives (`Button`, `Card`, `Badge`, `Modal`, `Sheet`, `Toast`, `Skeleton`).
  * `src/components/layout/`: Navigation shells (`AppShell`, `MobileBottomNav`, `DesktopSidebar`, `TopHeader`, `ProfileSwitcher`).
  * `src/components/<domain>/`: Feature-specific components (`vault/`, `chat/`, `timeline/`, `profiles/`, `notifications/`).
* **`src/server/`:**
  * `src/server/actions/*.action.ts`: Authenticated Next.js Server Actions.
  * `src/server/agents/`: LangGraph.js workflows (`ingestion.graph.ts`, `rag-chat.graph.ts`) and pure prompt builders (`src/server/agents/prompts/`).
  * `src/server/services/*.service.ts`: Core domain business logic.
  * `src/server/repositories/*.repo.ts`: Exclusive data-access layer for Supabase PostgreSQL and RPC calls.
  * `src/server/integrations/*.adapter.ts`: External third-party API wrappers (`openrouter`, `google-ai`, `tavily`, `google-workspace`, `storage`, `web-push`).
* **`src/stores/`:** Minimal Zustand client store (`use-vault-store.ts`).
* **`src/lib/`:** Shared utilities (`supabase/`, `schemas/`, `crypto.ts`, `env.ts`, `errors.ts`, `logger.ts`).
* **`src/types/`:** Generated Supabase database types (`database.types.ts`) and clean domain types (`domain.types.ts`).
* **`src/styles/`:** Semantic design tokens (`tokens.css`).
* **`supabase/migrations/`:** Sequential timestamped PostgreSQL migrations (`YYYYMMDDHHMMSS_<name>.sql`).
* **`tests/`:** Test suites split strictly into `tests/unit/`, `tests/integration/`, and `tests/e2e/`.
* **Unidirectional Dependency Rule:** Dependencies MUST flow strictly downward: `Transport (app/ & actions)` -> `Service / Agent` -> `Repository / Integration`. NEVER import UI components into `src/server/`, and NEVER import repositories directly into client components.

---

## 4. Component & UI Pattern Reuse

* **Reuse Existing Primitives First:** Before creating any button, badge, modal, bottom sheet, input, or card, you MUST inspect `src/components/ui/` and `src/components/layout/` to reuse existing primitives and variants.
* **Strict Adherence to `DESIGN.md` Tokens:** You MUST use the semantic CSS variables and Tailwind mappings defined in `src/styles/tokens.css` (*Private Health Atelier — Archival Emerald Vault*):
  * **Surfaces:** `--bg-canvas` (`#F5F5F0`), `--bg-surface` (`#FFFFFF`), `--bg-surface-subtle` (`#ECECE4`), `--bg-viewer-dark` (`#0E1513` strictly inside raw document viewers).
  * **Typography Colors:** `--text-primary` (`#14211D`), `--text-secondary` (`#4B5E58`), `--text-muted` (`#73857F`), `--text-inverted` (`#FFFFFF`).
  * **Brand & Semantic Status:** `--accent-primary` (`#1B5E4B`), `--accent-primary-tint` (`#E6F0EC`), `--border-hairline` (`#DCE2DF`), plus exact `Success`, `Warning`, `Danger`, and `Info` status tokens.
  * **Typography & Numbers:** Use `Outfit` for headings, `Source Sans 3` for body/UI prose, and `JetBrains Mono` with `tabular-nums` for dates, lab values, citation domain chips, and share link countdowns. Enforce `64ch` max measure on AI summaries and chat responses.
  * **Spacing & Radii:** Follow the `4px` spatial grid and exact radius tokens (`6px` small, `10px` medium, `14px` large, `9999px` full).
* **Banned UI Anti-Patterns:**
  * NEVER introduce random hardcoded hex colors, inline style hacks, purple-to-blue gradients, neon glows, glassmorphism blurs, or pure `#000000` black.
  * NEVER render fake health score rings, step counters, or unrequested dashboard charts.
  * NEVER create mobile tap targets smaller than `44px x 44px`.
  * ALWAYS render mobile modals (`< 768px`) as bottom sheets and desktop modals (`>= 768px`) as centered dialogs, and adapt `/vault/[documentId]` between mobile segmented tabs and desktop `50/50` split-screen.

---

## 5. Dependency & Package Management

* **Zero Rogue Installs:** You are STRICTLY PROHIBITED from installing any new npm package without explicit human approval. You MUST build exclusively with the approved dependencies locked in `ARCHITECTURE.md`:
  * **Core:** `next`, `react`, `typescript`, `tailwindcss`, `@radix-ui/*`, `zustand`, `react-hook-form`, `zod`, `clsx`, `tailwind-merge`
  * **Icons & Dates:** `lucide-react`, `date-fns`
  * **Database & Auth:** `@supabase/supabase-js`, `@supabase/ssr`
  * **AI & External Services:** `ai`, `@openrouter/ai-sdk-provider`, `@langchain/langgraph`, `@google/genai`, `@tavily/core`, `googleapis`, `web-push`, `mammoth`
* **Explicitly Banned Libraries:** NEVER install or import `react-icons`, `@heroicons/react`, `@fortawesome/*`, `moment`, `dayjs`, `luxon`, `yup`, `joi`, `prisma`, `drizzle-orm`, `redux`, `openai` (direct SDK), `llamaindex`, `pinecone`, `pdf-parse`, `styled-components`, or `@emotion/*`.
* **Package Manager Consistency:** You MUST use the single package manager and lockfile established in the repository root (`package-lock.json` or `pnpm-lock.yaml`). NEVER generate a second competing lockfile.

---

## 6. Type Safety & Data Validation

* **Zero `any` Policy:** TypeScript `strict: true` is mandatory. NEVER use `any`, `@ts-ignore`, or `@ts-nocheck`. Use `unknown` with explicit Zod parsing or type guards when narrowing external inputs.
* **Validate Every Trust Boundary with Zod:** You MUST define and invoke Zod schemas in `src/lib/schemas/*.schema.ts` for:
  1. All Server Action input arguments.
  2. All HTTP Route Handler bodies, query parameters, and `multipart/form-data` fields.
  3. All URL search parameters on Server Component pages (`page`, `pageSize`, `profileId`, `category`, `eventType`, `q`).
  4. All structured JSON outputs returned by OpenRouter models (Agent 1 patient name extraction and plain-English summary schema).
  5. All environment variables validated at startup in `src/lib/env.ts`.
* **Database Type Alignment:** Always import table row, insert, and update types from `src/types/database.types.ts` and map `snake_case` database records to `camelCase` domain DTOs (`src/types/domain.types.ts`) inside repository modules.

---

## 7. Error Handling & State Management

* **Typed Error Hierarchy:** Services and repositories MUST throw typed `AppError` subclasses (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `LinkExpiredError`, `RateLimitError`, `ExternalProviderError`) from `src/lib/errors.ts`. Transport handlers MUST catch and serialize them into the standard `{ success: false, error: { code, message, fieldErrors }, requestId }` envelope from `API.md`.
* **Required UI Feedback States:** Every view you build or modify MUST implement all three UI states from `DESIGN.md`:
  * **Loading States:** Structural skeleton loaders matching exact card dimensions (`CLS = 0`), step progress pills on uploading documents (`Uploading` -> `Reading & OCR` -> `Writing plain-English summary` -> `Ready`), and streaming status pills in `/chat`.
  * **Empty States:** Centered line-art icon, concise headline, 1–2 sentence helper copy, and a single primary CTA button.
  * **Error States:** Inline field-level validation messages below inputs, top/bottom toast banners for transient action errors, neutral `410 Gone` screen for expired/revoked share links, and a non-blocking offline PWA banner.
* **State Placement Rules:** Keep URL filter/search/pagination state in URL search parameters, server data in Server Components, and transient global UI state (active profile switcher ID, open modal flags, toast queue) exclusively in `src/stores/use-vault-store.ts`.

---

## 8. Security, Secrets & Data Privacy

* **Zero Hardcoded Secrets:** NEVER hardcode API keys, OAuth secrets, VAPID keys, encryption keys, or tokens anywhere in source files or tests. Access environment variables exclusively through validated `src/lib/env.ts`. NEVER prefix server-only secrets with `NEXT_PUBLIC_`.
* **Strict Admin Client Restrictions:** The `service_role` Supabase client (`src/lib/supabase/admin.ts`) bypasses Row-Level Security and is STRICTLY PROHIBITED inside `src/app/(app)/`, `src/components/`, and `src/server/actions/`. You may use it ONLY inside:
  1. `/api/cron/gmail-scan` (verified by `CRON_SECRET`).
  2. Background Agent 1 ingestion workers running inside Next.js `after()`.
  3. `/share/[token]` and `/api/share/[token]/file` via `resolve_active_share_link`.
* **Encryption & Token Protection:** Google OAuth refresh tokens MUST be encrypted with AES-256-GCM (`src/lib/crypto.ts`) before persisting to `users.encrypted_google_refresh_token` and MUST NEVER be selected in client-facing queries or serialized to the browser.
* **File Upload Hardening:** `/api/documents/upload` MUST verify binary magic bytes (not just `Content-Type`), enforce the `25 MB` (`26,214,400` bytes) limit, sanitize filenames, and store objects strictly under `{user_id}/{document_id}/{filename}` in the private `vault-files` bucket.
* **Mandatory PHI/PII Log Redaction:** NEVER pass raw OCR extracted text, plain-English summaries, patient names, clinical findings, chat prompts, Gmail subjects/snippets, or tokens to `console.log` or `src/lib/logger.ts`. Log only opaque UUIDs, MIME types, byte sizes, model names, status transitions, and duration metrics.

---

## 9. Database & API Access Rules

* **Single Data-Access Boundary:** NEVER call `supabase.from(...)` or `supabase.rpc(...)` inside `src/app/` or `src/components/`. Every database query MUST reside inside `src/server/repositories/*.repo.ts`.
* **Strict Profile Isolation in RAG:** Vector similarity queries MUST execute exclusively through the `match_document_chunks` RPC passing both `p_user_id` and `p_profile_id` so one family member's records never leak into another member's chat context.
* **Atomic Multi-Table Operations:** Always use PostgreSQL transactional RPCs or database triggers when updating coupled state (e.g., completing Agent 1 ingestion across `document_summaries`, `medical_documents`, and `activity_events`, or syncing `document_chunks.profile_id` when reassigning a document).
* **Query Efficiency & Quotas:**
  * Eliminate N+1 queries by selecting relational joins in a single repository query.
  * Enforce pagination (`pageSize` default `20`, max `50`) on all list queries.
  * Enforce sliding-window rate limits via `rate_limit_buckets` on `/api/chat`, `/api/documents/upload`, `/api/documents/[documentId]/retry`, Server Actions, and `/api/share/[token]/file`.
* **External Integration Isolation:** NEVER call OpenRouter, Google AI, Tavily, Google Calendar/Gmail, Supabase Storage, or Web Push directly from routes or agents—always call their typed adapter in `src/server/integrations/*.adapter.ts` with configured timeouts, retries, and fallback chains (`deepseek/deepseek-v4.1-flash` -> `openai/gpt-oss-20b:free`).

---

## 10. Testing & QA Expectations

* **Exact Test Placement:**
  * `tests/unit/*.test.ts`: Vitest unit tests for Zod schemas, patient name fuzzy-matching confidence, semantic text chunking, AES-256-GCM encryption/decryption, and share link TTL math.
  * `tests/integration/*.test.ts`: Vitest integration tests against local Supabase verifying PostgreSQL RLS cross-tenant isolation, `match_document_chunks` `profile_id` isolation, and `/api/share/[token]/file` zero-leak and `410 Gone` revocation behavior.
  * `tests/e2e/*.spec.ts`: Playwright smoke tests covering login/sub-profile creation, document upload -> summary card, profile-scoped RAG chat + Calendar booking card, incognito one-click share link access, and timeline logging.
* **Deterministic Execution:** Unit and E2E tests MUST mock external third-party APIs (OpenRouter, Google AI, Tavily, Google Workspace, Web Push) so test suites run offline, deterministically, and without consuming paid API credits.
* **Mandatory Verification Before Completion:** Before finishing any task, you MUST verify that TypeScript typechecking (`tsc --noEmit`), linting, and all unit/integration tests covering modified modules pass with zero errors.

---

## 11. Git, Commit & Changelog Discipline

* **Conventional Commits Format:** Every commit message MUST follow Conventional Commits (`<type>(<scope>): <imperative summary>`), using only standard types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, or `ci` (e.g., `feat(vault): implement multi-format upload route and magic-byte validation`, `fix(rag): enforce profile_id pre-filter in match_document_chunks`).
* **Small, Atomic Commits:** Keep commits focused on a single cohesive vertical slice or bug fix. NEVER bundle schema migrations, unrelated UI polish, and multiple feature modules into a single monolithic commit.
* **Migration & Type Sync:** Whenever you add or modify a SQL migration in `supabase/migrations/`, you MUST regenerate `src/types/database.types.ts` in the same commit so schema and TypeScript types never drift out of sync.