```markdown
# System Architecture Specification: MedBay (`ARCHITECTURE.md`)

| Field | Detail |
| :--- | :--- |
| **Product Name** | MedBay (`medbay`) |
| **Architectural Style** | Modular Monolithic Full-Stack PWA with Event-Driven Dual-Agent AI |
| **Primary Stack** | Next.js (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel AI SDK · LangGraph.js |
| **AI & Grounding** | OpenRouter (`deepseek-v4.1-flash` + `gpt-oss-20b:free` + `mistral-ocr`) · Google AI (`gemini-embedding-001`) · Tavily |
| **Deployment Target** | Vercel (Serverless Functions + Edge Middleware + Cron) & Supabase Cloud |
| **Source of Truth** | Aligned 1:1 with `PRD.md` v1.0 and `DESIGN.md` v1.0 |

---

## 1. Architecture Overview & Core Philosophy

### 1.1 High-Level Architectural Pattern
**MedBay** is structured as a **Modular Monolithic Full-Stack Progressive Web App (PWA)** backed by **Supabase (PostgreSQL + `pgvector` + Auth + Private Storage)** and **Vercel Serverless & Cron Infrastructure**. Rather than splitting the system into separate frontend and backend repositories or deploying premature microservices, all UI routes, Server Actions, streaming AI endpoints, and background agent workflows reside inside a single strictly typed Next.js App Router codebase with explicit internal layer boundaries.

```text
+-----------------------------------------------------------------------------------+
|                         CLIENT LAYER (Mobile PWA & Desktop)                       |
|  Next.js Client Islands · Service Worker (Offline + Web Push) · DESIGN.md Tokens  |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS / SSE Token Stream
                                          v
+-----------------------------------------------------------------------------------+
|                       EDGE & TRANSPORT LAYER (Next.js / Vercel)                   |
|  Edge Middleware (Session Refresh & Route Guard) · Server Actions · Route Handlers|
+-------------------+---------------------+---------------------+-------------------+
                    |                     |                     |
                    v                     v                     v
+-------------------------+   +-----------------------+   +-------------------------+
|    AGENT 1 PIPELINE     |   |    AGENT 2 ENGINE     |   |   24H GMAIL SCANNER     |
|  LangGraph.js (Async)   |   |  Vercel AI SDK Stream |   |  Vercel Cron -> Gmail   |
|  OCR -> Match -> Cite   |   |  Profile RAG + Cal    |   |  In-App + Web Push      |
+------------+------------+   +-----------+-----------+   +------------+------------+
             |                            |                            |
             +----------------------------+----------------------------+
                                          | Typed Repository & Adapter Interfaces
                                          v
+-----------------------------------------------------------------------------------+
|                      DATA & EXTERNAL INTEGRATION LAYER                            |
|  Supabase Postgres + pgvector (RLS) · Private Encrypted Storage · OpenRouter      |
|  Google AI Embeddings · Tavily Medical Search · Google Calendar & Gmail APIs      |
+-----------------------------------------------------------------------------------+

```

### 1.2 Core Engineering Principles

1. **Simplicity & Pragmatism First:** Build one cohesive TypeScript application. Use Next.js post-response execution (`after()`) for immediate asynchronous document ingestion and Vercel Cron for 24-hour Gmail scanning—eliminating external message brokers (RabbitMQ/Kafka) or Redis caches in v1.0.
2. **Database-Enforced Isolation:** Every user record is protected by PostgreSQL Row-Level Security (`auth.uid() = user_id`), and every vector similarity query enforces a mandatory `profile_id` filter at the database RPC level so family members' medical records never cross-contaminate.
3. **Strict End-to-End Type Safety:** All external inputs, API payloads, environment variables, and LLM structured outputs are validated at runtime with **Zod** and typed against auto-generated Supabase database schemas.
4. **Non-Blocking Ingestion UX:** Document uploads persist the raw binary immediately and transition asynchronously through ingestion states (`queued` -> `extracting` -> `summarizing` -> `indexing` -> `ready`), ensuring mobile users never stare at a frozen upload spinner.
5. **Zero-Leak Public Sharing:** Public share links (`/share/[token]`) execute through an isolated repository path that resolves a time-limited storage signed URL strictly for the raw binary, physically incapable of querying AI summaries or family profile records.

---

## 2. Approved Tech Stack & Dependency Manifest

### 2.1 Technology Stack Breakdown

| Layer | Approved Technology | Architectural Justification |
| --- | --- | --- |
| **Frontend Framework** | **Next.js 15+ (App Router)** & **React 19** | Hybrid Server/Client rendering minimizes mobile JS bundle size while supporting streaming AI responses and PWA service workers. |
| **Language** | **TypeScript 5 (Strict Mode)** | Prevents null/undefined runtime failures across clinical status flags, profile filters, and tool-calling payloads. |
| **Styling & UI Primitives** | **Tailwind CSS v4** + **Radix UI** | Maps `DESIGN.md` CSS custom properties cleanly to utility classes; Radix provides accessible modals, bottom sheets, tabs, and switches. |
| **Client State & Forms** | **Zustand** + **React Hook Form** + **Zod** | Minimal global client store solely for active `FamilyProfile` filter selection and toast queues; RHF + Zod handle deterministic form validation. |
| **Backend & Streaming** | **Next.js Server Actions & Route Handlers** | Server Actions power standard CRUD mutations with automatic cache revalidation; Route Handlers power SSE streaming chat, binary uploads, and cron jobs. |
| **AI & Agent Orchestration** | **Vercel AI SDK (`ai`)** + **LangGraph.js (`@langchain/langgraph`)** | LangGraph models Agent 1's multi-step ingestion state machine cleanly; Vercel AI SDK powers token-by-token chat streaming and Calendar tool execution. |
| **Database & Vectors** | **Supabase PostgreSQL 16 + `pgvector**` | Single managed database hosting relational records, strict RLS policies, and `1536`-dimensional cosine similarity vector search. |
| **Auth & File Storage** | **Supabase Auth** + **Supabase Storage** | Built-in Google OAuth 2.0 PKCE flow plus private AES-256 encrypted storage buckets with short-lived signed URLs. |
| **LLM & OCR Gateway** | **OpenRouter API (`@openrouter/ai-sdk-provider`)** | Unified routing to `deepseek/deepseek-v4.1-flash` (primary), `google/gemini-4-carbon` (heavy synthesis), automatic fallback to `openai/gpt-oss-20b:free`, and `file-parser` (`mistral-ocr`) for scanned PDFs. |
| **Embeddings & Citations** | **Google AI (`@google/genai`)** & **Tavily (`@tavily/core`)** | `gemini-embedding-001` (`1536` dims) for high-recall medical retrieval; Tavily domain-locked search for `who.int`, `nhs.uk`, `cdc.gov`, and `nih.gov` citations. |
| **Workspace & Push** | **Google APIs (`googleapis`)** & **`web-push`** | Official Google Calendar & Gmail API client plus VAPID Web Push delivery for mobile and desktop PWA alerts. |
| **Hosting & CI/CD** | **Vercel** + **GitHub Actions** | Zero-config preview deployments, Edge middleware, and scheduled 24-hour cron invocation (`/api/cron/gmail-scan`). |

### 2.2 Approved Core Libraries vs. Banned Dependencies

Coding agents must use **only** the approved packages below and must never introduce banned duplicates:

| Domain | Approved Package | Explicitly Banned Packages (Do Not Install) |
| --- | --- | --- |
| **Icons** | `lucide-react` | `react-icons`, `@heroicons/react`, `@fortawesome/*`, `material-icons` |
| **Date & Time** | `date-fns` | `moment`, `dayjs`, `luxon` |
| **Schema Validation** | `zod` | `yup`, `joi`, `class-validator`, `superstruct` |
| **Database Client** | `@supabase/supabase-js`, `@supabase/ssr` | `prisma`, `drizzle-orm`, `typeorm`, `pg` (direct pool) |
| **Global Client State** | `zustand` | `redux`, `@reduxjs/toolkit`, `mobx`, `recoil`, `jotai` |
| **LLM & Embeddings** | `ai`, `@openrouter/ai-sdk-provider`, `@langchain/langgraph`, `@google/genai` | `openai` (direct SDK), `llamaindex`, `pinecone`, `chromadb` |
| **DOCX Parsing** | `mammoth` | `puppeteer`, `playwright` (in production bundle), `pdf-parse` |
| **Class Merging** | `clsx`, `tailwind-merge` | `classnames`, `styled-components`, `@emotion/*` |

---

## 3. Frontend & Backend System Architecture

### 3.1 Frontend Architecture

* **Rendering Strategy:**
* **Server Components (Default):** All primary authenticated screens (`/vault`, `/vault/[documentId]`, `/timeline`, `/profiles`, `/notifications`) fetch initial user data on the server via Repository calls, guaranteeing zero client-side waterfall requests and fast First Contentful Paint (`< 1.5s`).
* **Client Components (`"use client"`):** Strictly isolated to interactive leaves: `ChatWorkspace` (Vercel AI SDK `useChat` streaming), `DocumentUploadSheet` (camera/file dropzone), `ShareLinkModal` (expiration presets & clipboard copy), `ProfileSwitcherBar`, `DocumentViewerPane` (zoomable PDF/image canvas), and `PushPermissionBanner`.
* **Public Share Route (`/share/[token]`):** Server-rendered minimal shell validating the token server-side before mounting the isolated dark document viewer.


* **State Management Boundaries:**
* **Server & URL State:** Document lists, search queries, category filters, and timeline filters live in URL search parameters (`?profileId=...&category=...&q=...`) so views are bookmarkable and back-button friendly.
* **Global Client State (`src/stores/use-vault-store.ts`):** Lightweight Zustand store holding the currently selected `activeProfileId` (`"all"` or UUID), upload drawer open state, and active toast notifications.


* **Design System Integration (`DESIGN.md`):**
* All semantic color tokens (`--bg-canvas: #F5F5F0`, `--bg-surface: #FFFFFF`, `--bg-viewer-dark: #0E1513`, `--accent-primary: #1B5E4B`, etc.), font family variables (`Outfit`, `Source Sans 3`, `JetBrains Mono`), spacing scale, and radius tokens are defined in `src/styles/tokens.css` and mapped into Tailwind theme utilities.



### 3.2 Backend Architecture

The backend enforces a strict three-tier unidirectional dependency flow (`Transport` -> `Service / Agent` -> `Repository / Integration`):

1. **Transport Layer (`src/app/api/**/route.ts` & `src/server/actions/*.action.ts`):** Extracts authenticated `userId` from session cookies, validates incoming payloads with Zod schemas, invokes a single Service or Agent method, and returns standardized responses or revalidates Next.js cache tags. Contains **zero** SQL/Supabase queries or raw LLM prompts.
2. **Service & Agent Layer (`src/server/services/*.service.ts` & `src/server/agents/**`):** Implements all business logic (share link TTL calculations, patient fuzzy matching, Gmail medical keyword classification, activity timeline logging) and LangGraph agent workflows.
3. **Repository & Integration Layer (`src/server/repositories/*.repo.ts` & `src/server/integrations/*.adapter.ts`):** Encapsulates all Supabase PostgreSQL/Storage operations and third-party API calls behind clean TypeScript interfaces.

---

## 4. End-to-End Data Flow & State Lifecycle

### 4.1 Read Flow (Vault Feed & Profile-Isolated RAG Chat)

```text
[User Opens /vault or Sends /chat Prompt]
       |
       v
[Edge Middleware] ---> Refreshes Supabase JWT cookie; rejects unauthenticated requests
       |
       +---> (/vault RSC) ---> [DocumentRepository.listByUser(userId, filters)]
       |                              |
       |                              v
       |                       [Supabase Postgres (RLS: auth.uid() = user_id)]
       |                              |
       |                              v
       |                       [Streams HTML + Skeleton-Free Cards to Client]
       |
       +---> (/api/chat POST) ---> [Zod Validation: message, threadId, profileId]
                                      |
                                      v
                               [Agent 2: RAG & Calendar Graph]
                                 1. Embed query via Google AI (RETRIEVAL_QUERY)
                                 2. Call Postgres RPC match_document_chunks(userId, profileId)
                                 3. Optional Tavily medical citation search
                                 4. Stream tokens via OpenRouter (deepseek-v4.1-flash)
                                 5. Persist ChatMessage + citations on stream finish

```

### 4.2 Write & Asynchronous Ingestion Flow (Document Upload -> Agent 1)

```text
[User Selects File in Upload Sheet]
       |
       v
[Client Validation] ---> Checks MIME (JPEG/PNG/WebP/PDF/DOCX/TXT) & Size <= 25 MB
       |
       v
[POST /api/documents/upload]
  1. Verify auth session & validate server-side magic bytes
  2. Upload binary to Supabase Private Bucket: /{userId}/{documentId}/{sanitizedName}
  3. Insert MedicalDocument row (ingestion_status = 'queued')
  4. Insert ActivityEvent ('DOCUMENT_UPLOADED')
  5. Schedule Agent 1 via Next.js after() & return HTTP 201 immediately
       |
       v (Background Non-Blocking Worker)
[Agent 1: Ingestion & Summarizer Graph]
  Step 1: Update status -> 'extracting' | Run OCR (mistral-ocr / vision / mammoth)
  Step 2: Match patient name to FamilyProfile (auto-assign or flag 'needs_review')
  Step 3: Update status -> 'summarizing' | Query Tavily medical domains -> Generate JSON summary
  Step 4: Update status -> 'indexing' | Chunk text -> Embed via gemini-embedding-001 -> Upsert pgvector
  Step 5: Transactional RPC: Save DocumentSummary + set status = 'ready' + log ActivityEvent

```

---

## 5. Exact Project Folder & File Structure

```text
medbay/
├── public/
│   ├── manifest.json                     # PWA manifest (icons, theme #1B5E4B, background #F5F5F0)
│   ├── sw.js                             # Service Worker (offline shell cache + Web Push listener)
│   └── icons/                            # PWA app icons (192x192, 512x512, maskable)
├── supabase/
│   ├── config.toml                       # Local Supabase CLI project config
│   └── migrations/                       # Timestamped SQL migrations (tables, RLS, pgvector RPCs)
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (Outfit, Source Sans 3, JetBrains Mono fonts)
│   │   ├── page.tsx                      # Public Landing & PWA entry (/)
│   │   ├── error.tsx                     # Global runtime error boundary
│   │   ├── not-found.tsx                 # Custom 404 screen
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx            # Google OAuth sign-in screen (/login)
│   │   │   └── auth/callback/route.ts    # OAuth PKCE code exchange + initial Self profile setup
│   │   ├── (app)/
│   │   │   ├── layout.tsx                # Authenticated App Shell (Mobile Bottom Nav + Desktop Rail)
│   │   │   ├── vault/
│   │   │   │   ├── page.tsx              # Family Medical Vault home (/vault)
│   │   │   │   └── [documentId]/page.tsx # Document Detail & AI Summary (/vault/[documentId])
│   │   │   ├── chat/page.tsx             # Personalized RAG & Calendar Chat (/chat)
│   │   │   ├── timeline/page.tsx         # Chronological Activity Timeline (/timeline)
│   │   │   ├── profiles/page.tsx         # Family Sub-Profiles & Google Settings (/profiles)
│   │   │   └── notifications/page.tsx    # Gmail Scanner Notification Center (/notifications)
│   │   ├── share/
│   │   │   └── [token]/page.tsx          # Public One-Click Raw Document Viewer (/share/[token])
│   │   └── api/
│   │       ├── documents/
│   │       │   ├── upload/route.ts       # Multipart binary upload + Agent 1 trigger
│   │       │   └── [documentId]/
│   │       │       ├── file/route.ts     # Authenticated short-lived signed file stream
│   │       │       └── retry/route.ts    # Re-trigger Agent 1 on failed ingestion
│   │       ├── share/
│   │       │   └── [token]/file/route.ts # Public unauthenticated raw file stream (token-gated)
│   │       ├── chat/route.ts             # Streaming RAG & Calendar tool-calling endpoint
│   │       ├── push/subscribe/route.ts   # Register/remove Web Push VAPID subscriptions
│   │       └── cron/
│   │           └── gmail-scan/route.ts   # 24-hour scheduled Gmail medical scanner
│   ├── components/
│   │   ├── ui/                           # Reusable design system primitives (Button, Card, Badge, Modal, Sheet, Toast)
│   │   ├── layout/                       # AppShell, MobileBottomNav, DesktopSidebar, TopHeader, ProfileSwitcher
│   │   ├── vault/                        # DocumentCard, UploadSheet, DocumentViewerPane, SummaryPanel, ShareModal
│   │   ├── chat/                         # ChatWorkspace, MessageBubble, CitationChip, CalendarEventCard
│   │   ├── timeline/                     # TimelineFeed, TimelineGroup, TimelineRow
│   │   ├── profiles/                     # ProfileCard, AddProfileModal, GoogleSyncCard
│   │   └── notifications/                # NotificationList, NotificationCard
│   ├── server/
│   │   ├── actions/                      # Next.js Server Actions (profile, document, share, notification mutations)
│   │   ├── agents/
│   │   │   ├── ingestion.graph.ts        # Agent 1 LangGraph workflow (OCR -> Match -> Cite -> Summarize -> Embed)
│   │   │   ├── rag-chat.graph.ts         # Agent 2 RAG retrieval + Tavily + Google Calendar tool orchestration
│   │   │   └── prompts/                  # Versioned pure prompt builder functions
│   │   ├── services/                     # Business logic (document, profile, share, timeline, gmail-scanner, push)
│   │   ├── repositories/                 # Pure Supabase data-access layer (*.repo.ts)
│   │   └── integrations/                 # External API wrappers (openrouter, google-ai, tavily, google-workspace, storage)
│   ├── stores/
│   │   └── use-vault-store.ts            # Global active profile filter, modal states, toast queue
│   ├── lib/
│   │   ├── supabase/                     # client.ts (browser), server.ts (user RLS), admin.ts (service role)
│   │   ├── schemas/                      # Shared Zod validation schemas (*.schema.ts)
│   │   ├── crypto.ts                     # AES-256-GCM OAuth token encryption & high-entropy share token generator
│   │   ├── env.ts                        # Startup Zod environment validator
│   │   ├── errors.ts                     # Typed AppError hierarchy
│   │   └── logger.ts                     # Structured JSON logger with automatic PHI/PII redaction
│   ├── types/
│   │   ├── database.types.ts             # Auto-generated Supabase PostgreSQL types
│   │   └── domain.types.ts               # Clean application domain interfaces & enums
│   └── styles/
│       └── tokens.css                    # DESIGN.md CSS custom properties & typography rules
├── middleware.ts                         # Edge session refresh & route access guard
└── tests/
    ├── unit/                             # Vitest unit tests (schemas, fuzzy matching, chunking, crypto)
    ├── integration/                      # Vitest DB RLS isolation & share-link boundary tests
    └── e2e/                              # Playwright critical user flow smoke tests

```

### 5.1 File Naming Conventions

* **Routes & Folders:** Strictly `kebab-case` (e.g., `gmail-scan/route.ts`), with Next.js dynamic segments in brackets (`[documentId]`, `[token]`).
* **React Components:** Strictly `PascalCase.tsx` matching the exported component name (e.g., `DocumentVaultCard.tsx`).
* **Server Modules:** `kebab-case` suffixed by architectural role: `*.action.ts`, `*.service.ts`, `*.repo.ts`, `*.adapter.ts`, `*.graph.ts`, `*.prompt.ts`, `*.schema.ts`.

---

## 6. Database Interaction & Data Access Layer

### 6.1 Client & Connection Strategy

* **Connection Pooling:** All queries execute over Supabase's managed PgBouncer connection pooler / PostgREST HTTPS layer via `@supabase/ssr`, avoiding connection exhaustion across serverless cold starts.
* **Dual Client Rule:**
1. **User-Scoped Client (`src/lib/supabase/server.ts`):** Created per request using HTTP-only session cookies. Every query runs under the authenticated user's JWT so PostgreSQL Row-Level Security (`auth.uid() = user_id`) enforces data isolation automatically.
2. **Service-Role Admin Client (`src/lib/supabase/admin.ts`):** Bypasses RLS and is **strictly forbidden** inside user-facing page components or Server Actions. Permitted solely inside: (a) `/api/cron/gmail-scan`, (b) `after()` background Agent 1 ingestion workers, and (c) `/share/[token]` public file resolution.



### 6.2 Repository Rules & Transactional Integrity

* **Zero Queries Outside Repositories:** Direct `.from(...)` or `.rpc(...)` calls are strictly prohibited inside `src/app/` or `src/components/`. All database reads and writes must pass through `src/server/repositories/*.repo.ts`.
* **Atomic Multi-Table Writes:** Operations that mutate multiple tables simultaneously—such as completing Agent 1 ingestion (`DocumentSummary` upsert + `MedicalDocument.ingestion_status = 'ready'` + `ActivityEvent` insert) or reassigning a document's `profile_id` (`MedicalDocument` update + `DocumentChunk` bulk `profile_id` update + `ActivityEvent` insert)—must execute inside PostgreSQL `SECURITY DEFINER` RPC functions so partial writes never occur.
* **Vector Search RPC (`match_document_chunks`):** Semantic retrieval executes via a parameterized PostgreSQL function taking `(p_user_id, p_profile_id, p_query_embedding, p_match_count)` that pre-filters `WHERE user_id = p_user_id AND (p_profile_id IS NULL OR profile_id = p_profile_id)` before computing `<=>` cosine distance on `pgvector`.

---

## 7. Authentication, Authorization & Session Architecture

### 7.1 Google OAuth 2.0 & Token Lifecycle

1. User initiates login via `supabase.auth.signInWithOAuth({ provider: 'google' })` requesting scopes: `openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.readonly` with `access_type: 'offline'` and `prompt: 'consent'`.
2. `/auth/callback/route.ts` exchanges the authorization code for a Supabase session, extracts `session.provider_refresh_token`, encrypts it using AES-256-GCM (`src/lib/crypto.ts`), stores it in `User.encrypted_google_refresh_token`, and ensures the default `Self` `FamilyProfile` exists.
3. Session JWTs are stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies managed automatically by `@supabase/ssr`.

### 7.2 Edge Middleware & Access Control Enforcement

* **Edge Guard (`middleware.ts`):** Runs on every matched request to refresh expiring Supabase cookies.
* Unauthenticated requests to `/vault/*`, `/chat`, `/timeline`, `/profiles`, or `/notifications` redirect immediately to `/login`.
* Authenticated requests to `/` or `/login` redirect to `/vault`.
* Public routes (`/share/[token]`, `/api/share/[token]/file`) pass through without requiring user cookies.
* Cron route (`/api/cron/gmail-scan`) rejects any request lacking a valid `Authorization: Bearer <CRON_SECRET>` header with `401 Unauthorized`.


* **Public Share Link Isolation (`/share/[token]`):**
* Tokens are generated using 24 cryptographically random bytes encoded as URL-safe Base64 (`192` bits of entropy).
* Lookup verifies `token = $1 AND revoked_at IS NULL AND expires_at > NOW()`.
* The repository projection selects **only** `storage_path`, `title`, `mime_type`, and `expires_at`—never joining `DocumentSummary`, `ChatThread`, or `FamilyProfile`.



---

## 8. API Architecture & Communication Contracts

### 8.1 Server Actions vs. Route Handlers

* **Next.js Server Actions (`src/server/actions/`):** Used for standard authenticated UI mutations (`createFamilyProfile`, `updateFamilyProfile`, `deleteFamilyProfile`, `reassignDocumentProfile`, `deleteDocument`, `createShareLink`, `revokeShareLink`, `markNotificationsRead`, `importGmailAttachment`). Every action validates input with Zod and calls `revalidatePath()` on affected routes.
* **Next.js Route Handlers (`src/app/api/`):** Reserved for operations requiring raw HTTP streaming, multipart binary streams, or external webhooks/crons:
* `POST /api/documents/upload`: Accepts `multipart/form-data`, validates binary magic bytes and `<= 25 MB` size, stores file, triggers Agent 1 via `after()`, and returns `201 Created`.
* `GET /api/documents/[documentId]/file`: Verifies session ownership and streams/redirects to a 15-minute Supabase Storage signed URL.
* `GET /api/share/[token]/file`: Verifies active unexpired share token, increments `view_count`, logs `SHARE_LINK_ACCESSED`, and streams/redirects to a 5-minute Storage signed URL for the raw file only.
* `POST /api/chat`: Accepts `{ messages, threadId, profileId, useHeavyReasoning }`, executes Agent 2 RAG + tools, and streams SSE chunks via Vercel AI SDK.
* `POST /api/push/subscribe`: Stores or deletes browser Web Push subscription keys.
* `GET /api/cron/gmail-scan`: Triggered every 24 hours by Vercel Cron to scan eligible users' Gmail inboxes.



### 8.2 Standard Response Envelope & Rate Limiting

* **JSON Response Envelope:** All non-streaming endpoints return `{ success: true, data: T }` on success or `{ success: false, error: { code: string, message: string } }` on failure.
* **Pagination:** List endpoints and initial Server Component queries paginate via cursor/offset (`pageSize = 20`) ordered by `created_at DESC`.
* **Rate Limiting:** Lightweight database-backed sliding-window checks protect expensive endpoints: `/api/chat` (`20 requests / minute / user`), `/api/documents/upload` (`10 requests / minute / user`), and `/api/share/[token]/file` (`60 requests / minute / IP`).

---

## 9. External Services & Third-Party Integrations

Every external provider is isolated behind an adapter in `src/server/integrations/` enforcing strict timeouts (`AbortSignal.timeout`), retry policies, and normalized error handling:

| Adapter File | External Service | Timeout & Retry Policy | Key Responsibilities |
| --- | --- | --- | --- |
| `openrouter.adapter.ts` | OpenRouter API | `45s` timeout for OCR/summaries; `30s` TTFT for chat; 1 retry on network reset | Routes requests to `deepseek/deepseek-v4.1-flash` (or `google/gemini-4-carbon`) with OpenRouter native `models` fallback to `openai/gpt-oss-20b:free` and `file-parser` (`mistral-ocr`) plugin for PDFs. |
| `google-ai.adapter.ts` | Google AI Studio (`@google/genai`) | `15s` timeout; 3 exponential backoff retries (`500ms`, `1500ms`, `3000ms`) | Generates `1536`-dimensional embeddings via `gemini-embedding-001` (`RETRIEVAL_DOCUMENT` for chunks, `RETRIEVAL_QUERY` for chat). |
| `tavily.adapter.ts` | Tavily Search API | `10s` timeout; 1 retry; graceful empty-array degradation | Tier-1 search locked via `includeDomains` to `who.int`, `nhs.uk`, `cdc.gov`, `nih.gov`, `medlineplus.gov`, `mayoclinic.org`, `clevelandclinic.org`, `msdmanuals.com`; Tier-2 open-web fallback if Tier-1 returns `< 1` result. |
| `google-workspace.adapter.ts` | Google Calendar & Gmail APIs | `12s` timeout; automatic OAuth access-token refresh via stored encrypted refresh token | Inserts events into primary Google Calendar (`events.insert`); queries Gmail `messages.list` (`newer_than:1d`) with medical classifiers (`gmail.readonly`). |
| `storage.adapter.ts` | Supabase Private Storage | `30s` upload timeout; `5s` signed URL generation | Uploads binaries to `vault-files` private bucket, generates short-lived signed URLs (`300s–900s`), and deletes orphaned objects on document deletion. |
| `web-push.adapter.ts` | Web Push (VAPID) | `8s` timeout; automatically purges `410 Gone` stale endpoints | Dispatches encrypted push payloads (`title`, `body`, `url: '/notifications'`) to registered mobile and desktop PWA endpoints. |

---

## 10. AI / LLM Architecture

### 10.1 Agent 1: Asynchronous Ingestion & Plain-English Summarizer (`ingestion.graph.ts`)

Modeled as a deterministic 6-node **LangGraph.js** state machine executed inside Next.js `after()` upon upload:

1. **`extractTextNode`:** Inspects `mime_type`. Routes PDFs to OpenRouter's `file-parser` plugin (`mistral-ocr`), images (`JPEG`/`PNG`/`WebP`) to `deepseek/deepseek-v4.1-flash` multimodal vision with reasoning disabled for verbatim transcription, DOCX to `mammoth`, and TXT to UTF-8 decoding.
2. **`classifyAndMatchProfileNode`:** Uses structured JSON output (Zod schema) to extract `document_date`, `category`, and `detected_patient_name`. Compares `detected_patient_name` against the user's `FamilyProfile` names (case-insensitive token/Levenshtein matching): auto-assigns `profile_id` with `high` confidence on exact/strong match, or retains user-selected profile and sets `profile_match_confidence = 'needs_review'` if unrecognized.
3. **`gatherCitationsNode`:** Extracts top 2–3 clinical conditions, medications, or abnormal lab terms from the text and queries `tavily.adapter.ts` (Tier-1 trusted medical domains -> Tier-2 open-web fallback) to gather 1–4 verified URLs and snippets.
4. **`summarizeDocumentNode`:** Generates a strict Zod-validated JSON object containing:
* `overview`: Concise plain-English explanation (`120–220` words, zero unexplained jargon).
* `key_findings`: Array of `{ label, value, severity: 'normal' | 'attention' | 'critical', explanation }`.
* `doctor_questions`: Array of 2–4 brief, actionable questions for the patient's physician.
* `citations`: Verified source links mapped from `gatherCitationsNode`.


5. **`chunkAndEmbedNode`:** Splits `extracted_text` into overlapping semantic chunks (`650` tokens target, `100` tokens overlap), embeds batches via `gemini-embedding-001` (`1536` dims, `RETRIEVAL_DOCUMENT`), and attaches `user_id`, `profile_id`, and `document_id`.
6. **`finalizeIngestionNode`:** Calls the atomic Postgres RPC to persist `DocumentSummary` and `DocumentChunk` rows, set `MedicalDocument.ingestion_status = 'ready'`, and record `AI_SUMMARY_GENERATED` on `/timeline`.

### 10.2 Agent 2: Profile-Isolated RAG & Calendar Action Agent (`rag-chat.graph.ts`)

Powered by Vercel AI SDK `streamText` with server-side tool execution:

* **Context & Profile Isolation:** Before LLM invocation, embeds the user's latest message via `gemini-embedding-001` (`RETRIEVAL_QUERY`) and executes `match_document_chunks` scoped strictly to `user_id` and active `profile_id` (top `8` chunks, similarity threshold `>= 0.45`).
* **Cross-Document Identity Guardrail:** System prompt instructs Agent 2 to inspect the `detected_patient_name` metadata attached to every retrieved chunk and explicitly clarify if a document belongs to a different person than the active profile.
* **Registered Tools:**
1. `search_medical_authorities`: Queries Tavily medical domains when the user asks general medical questions or requests external verification, returning structured citation objects rendered as `Info` chips in the UI.
2. `book_calendar_appointment`: Validates appointment title, ISO start/end datetime, timezone, and clinic location via Zod; invokes `google-workspace.adapter.ts` to create the Google Calendar event; logs `CALENDAR_APPOINTMENT_BOOKED` to `/timeline`; and returns event metadata rendered as the Emerald Confirmation Card in `/chat`.


* **Token & Cost Guardrails:** Truncates conversation history to the most recent `12` messages and caps injected RAG context chunks at `6,000` tokens so total input stays well under `16,000` tokens per turn.
* **Automatic Model Fallback:** Every OpenRouter request specifies `models: ['deepseek/deepseek-v4.1-flash', 'openai/gpt-oss-20b:free']` (or `['google/gemini-4-carbon', 'deepseek/deepseek-v4.1-flash', 'openai/gpt-oss-20b:free']` when heavy multi-document synthesis is toggled) so provider throttling fails over transparently without breaking the stream.

---

## 11. Environment Configuration & Secrets Management

### 11.1 Environment Variable Inventory (`.env.example` Blueprint)

| Variable Name | Visibility | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public (`NEXT_PUBLIC_*`) | Yes | Canonical base URL for OAuth callbacks and generated `/share/[token]` links. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (`NEXT_PUBLIC_*`) | Yes | Supabase project REST/Auth endpoint URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (`NEXT_PUBLIC_*`) | Yes | Supabase public anonymous key (safe for browser; governed by RLS). |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public (`NEXT_PUBLIC_*`) | Yes | Public VAPID key used by browser service worker to subscribe to Web Push. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only Secret** | Yes | Privileged Supabase admin key for cron jobs, background ingestion, and public share lookup. |
| `OPENROUTER_API_KEY` | **Server-Only Secret** | Yes | API key for OpenRouter LLM routing (`deepseek-v4.1-flash`, `gpt-oss-20b:free`, `mistral-ocr`). |
| `GOOGLE_AI_API_KEY` | **Server-Only Secret** | Yes | Google AI Studio key for `gemini-embedding-001` vector generation. |
| `TAVILY_API_KEY` | **Server-Only Secret** | Yes | Tavily Search API key for domain-locked medical citations. |
| `GOOGLE_CLIENT_ID` | **Server-Only Secret** | Yes | Google Cloud OAuth 2.0 Client ID for Workspace token refresh. |
| `GOOGLE_CLIENT_SECRET` | **Server-Only Secret** | Yes | Google Cloud OAuth 2.0 Client Secret. |
| `ENCRYPTION_SECRET` | **Server-Only Secret** | Yes | 64-character hex string (32 bytes) for AES-256-GCM encryption of stored Google refresh tokens. |
| `VAPID_PRIVATE_KEY` | **Server-Only Secret** | Yes | Private VAPID key for signing outbound Web Push alerts. |
| `VAPID_SUBJECT` | **Server-Only Secret** | Yes | Contact `mailto:` URI required by Web Push VAPID specification. |
| `CRON_SECRET` | **Server-Only Secret** | Yes | Bearer secret authenticating Vercel's 24-hour `/api/cron/gmail-scan` trigger. |

### 11.2 Fail-Fast Startup Validation

`src/lib/env.ts` parses `process.env` through a strict Zod schema on server initialization. If any required secret is missing, empty, or malformed (e.g., `ENCRYPTION_SECRET` not 64 hex characters), the server throws an explicit startup error immediately rather than failing silently mid-request.

---

## 12. Error Handling, Logging & Observability

### 12.1 Standardized Error Hierarchy (`src/lib/errors.ts`)

All internal services throw typed subclasses of `AppError`, which Transport handlers map cleanly to HTTP status codes:

* `ValidationError` (`400`) — Invalid file format, oversized file (`> 25 MB`), or malformed request body.
* `UnauthorizedError` (`401`) — Missing/expired user session or invalid `CRON_SECRET`.
* `ForbiddenError` (`403`) — Attempted access to another user's resource or revoked Google OAuth scope.
* `NotFoundError` (`404`) — Non-existent document or profile ID.
* `LinkExpiredError` (`410 Gone`) — Expired or owner-revoked `/share/[token]`.
* `RateLimitError` (`429`) — Exceeded per-user chat/upload or per-IP share link rate threshold.
* `ExternalProviderError` (`502`) — Upstream OpenRouter, Google AI, Tavily, or Google Workspace failure after fallback/retry exhaustion.

### 12.2 Structured Logging & Strict PHI/PII Redaction

`src/lib/logger.ts` emits single-line structured JSON logs (`timestamp`, `level`, `service`, `event`, `userId`, `documentId`, `durationMs`, `errorCode`) compatible with Vercel Log Drains.

* **Mandatory Redaction Policy:** Application logs must **never** record raw OCR extracted text, plain-English medical summaries, patient names, clinical findings, chat prompt contents, Gmail email subjects/snippets, or OAuth tokens. Only opaque UUIDs, MIME types, byte sizes, model identifiers, and status transitions are permitted in logs.

---

## 13. Security Boundaries & Hardening Rules

* **Trust Boundary Validation:** Every Server Action, Route Handler, and structured LLM output is validated with Zod before touching the database or UI.
* **Binary File Upload Verification:** `/api/documents/upload` inspects actual file header magic bytes (not merely the client-supplied `Content-Type` header) to confirm the file is a genuine JPEG, PNG, WebP, PDF, DOCX, or UTF-8 TXT file under `25 MB`, and generates a fresh UUID storage key to prevent path traversal attacks.
* **HTTP Security Headers (`next.config.ts`):**
* Enforce `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and strict `Content-Security-Policy` restricting script/connect origins to `'self'`, Supabase, and Google OAuth endpoints.
* Set `X-Frame-Options: DENY` globally, relaxing `frame-ancestors 'self'` solely on `/share/[token]` so embedded PDF previews render cleanly in the dark viewer without allowing third-party sites to iframe MedBay.


* **Share Link Cache & Indexing Prevention:** `/share/[token]` and `/api/share/[token]/file` always send `Cache-Control: no-store, no-cache, must-revalidate` and `X-Robots-Tag: noindex, nofollow` headers so shared medical files are never cached by shared proxies or indexed by search engines.
* **OAuth Token Protection:** Google refresh tokens are encrypted at rest with AES-256-GCM using unique random 12-byte IVs per write and are never serialized to client components or browser storage.

---

## 14. Testing, Deployment & Scalability Roadmap

### 14.1 Pragmatic Testing Strategy

* **Unit Tests (`tests/unit/` via Vitest):** Test pure deterministic modules—Zod input schemas, patient name fuzzy-matching confidence scoring, semantic text chunking boundaries, AES-256-GCM encryption/decryption round-trips, and share link TTL expiration math.
* **Integration Tests (`tests/integration/` via Vitest + Local Supabase):** Verify database Row-Level Security (User A cannot read User B's documents or summaries), `match_document_chunks` `profile_id` isolation (querying Child profile returns zero rows from Self profile), and `/api/share/[token]/file` returning `410 Gone` immediately upon revocation or expiry while excluding `DocumentSummary` fields.
* **End-to-End Smoke Tests (`tests/e2e/` via Playwright):** Automate the 5 core journeys: (1) Google OAuth login & sub-profile creation, (2) Document upload -> `Ready` summary card, (3) Profile-scoped RAG chat + mock Calendar booking card, (4) One-click share link opening in incognito context without AI summary, and (5) Timeline event verification.

### 14.2 Deployment & Migration Pipeline

1. **Local Development:** Next.js dev server (`localhost:3000`) connected to local Supabase CLI stack (`supabase start`) with `.env.local`.
2. **Pull Request Verification:** GitHub Actions runs `tsc --noEmit`, `eslint`, unit tests, and builds a Vercel Preview deployment automatically.
3. **Production Promotion:** Merging to `main` executes `supabase db push` to apply pending SQL migrations cleanly before Vercel promotes the production build and activates the daily Vercel Cron schedule (`0 8 * * *` UTC) for `/api/cron/gmail-scan`.

### 14.3 MVP v1.0 vs. Future Scale Boundaries

* **Built Now (MVP v1.0):** Modular Next.js monolith on Vercel, Supabase Postgres + `pgvector`, Next.js `after()` post-response ingestion, Vercel 24-hour cron for Gmail scanning, and OpenRouter/Google AI direct API calls. Supports up to `~5,000` active families comfortably with minimal operational overhead.
* **Explicitly Deferred Until Scale Demands It:**
* Dedicated background worker queue (e.g., Trigger.dev / Inngest / BullMQ) — deferred until concurrent document uploads exceed serverless execution limits or require batch multi-file ZIP ingestion.
* Redis edge caching — deferred until read traffic on `/vault` and `/timeline` exceeds Postgres connection pool capacity.
* Multi-region storage replication & HIPAA BAA enterprise tier — deferred until commercial B2B/enterprise healthcare expansion beyond v1.0 consumer launch.



