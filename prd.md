```markdown
# Product Requirements Document (PRD): MedBay

| Field | Detail |
| :--- | :--- |
| **Product Name** | MedBay (`medbay`) |
| **Document Version** | 1.0 (MVP Specification) |
| **Status** | Draft — Ready for Final Sign-Off |
| **Platform** | Mobile-First Progressive Web App (PWA) & Responsive Web |
| **Primary Stack** | Next.js (App Router), Tailwind CSS, Vercel AI SDK, Mastra / LangGraph.js, Supabase, OpenRouter, Google AI, Tavily |

---

## 1. Project Overview & Executive Summary

### 1.1 Problem Statement
Individuals and families rarely carry physical medical records during daily travel, clinic visits, or unexpected emergencies. For caregivers managing health records for spouses and children, critical documents (lab results, prescriptions, imaging reports, discharge summaries) are fragmented across paper folders, camera rolls, and email attachments. Furthermore, medical documents are written in dense clinical terminology that laypeople struggle to interpret, leaving patients unprepared to ask informed questions during time-constrained doctor consultations.

### 1.2 Value Proposition
**MedBay** is a mobile-first, encrypted family medical vault powered by a coordinated dual-agent AI architecture:
1. **Instant Family Readiness:** Stores medical files for the primary user and managed family dependents (spouse, children) in one pocket-accessible vault, with one-click time-limited share links for doctors or emergency responders.
2. **Plain-English Medical Clarity:** Automatically transcribes uploaded images, PDFs, and documents, identifies which family member the record belongs to, translates clinical jargon into a concise plain-English summary, flags critical findings, suggests brief questions for the doctor, and backs claims with verified citations from trusted medical authorities.
3. **Profile-Isolated RAG & Calendar Action:** Enables conversational Q&A across each family member's medical history without cross-profile data leakage, paired with direct Google Calendar appointment booking and automated 24-hour Gmail medical scanning.

### 1.3 Target Users & Personas
* **Primary Family Caregiver (Primary Account Holder):** Manages medical records for themselves, their spouse, and their children. Needs fast mobile access on the go, clear explanations of complex lab/diagnostic reports, automated detection of incoming medical emails, and quick appointment scheduling.
* **Individual Health Consumer (Primary Account Holder):** Tracks personal health records, prescriptions, and specialist notes over time. Wants a searchable, trustworthy AI assistant grounded in authoritative medical sources.
* **External Medical Recipient (Doctor / Emergency Responder — Unauthenticated Viewer):** Opens a time-limited share link sent by the primary user during an appointment or emergency. Needs immediate, zero-friction access to the original medical document without creating an account or entering a PIN.

### 1.4 Approved Tech Stack

| Layer | Technology / Service | Role & Responsibility |
| :--- | :--- | :--- |
| **Frontend & PWA** | Next.js (App Router) + Tailwind CSS | Mobile-first responsive UI, installable PWA manifest, service worker, and Web Push client. |
| **API & Streaming** | Next.js Route Handlers + Vercel AI SDK | Server-side API routes, token-by-token LLM streaming, structured UI payloads, and tool-calling. |
| **Agent Orchestration** | Mastra or LangGraph.js | Deterministic state orchestration separating Agent 1 (Ingestion & Summarization) from Agent 2 (RAG & Calendar Actions). |
| **Database & Vectors** | Supabase (PostgreSQL + `pgvector`) | Relational metadata storage, Row-Level Security (RLS), and profile-isolated vector similarity search. |
| **Auth & File Storage** | Supabase Auth + Supabase Storage | Google OAuth 2.0 login, encrypted private storage buckets, and time-limited signed URLs. |
| **LLM & OCR Gateway** | OpenRouter API | Primary model: `deepseek/deepseek-v4.1-flash`; heavy multi-doc reasoning option: `google/gemini-4-carbon`; automatic fallback: `openai/gpt-oss-20b:free`; scanned PDF OCR via OpenRouter `file-parser` (`mistral-ocr`). |
| **Embeddings** | Google AI API (`gemini-embedding-001`) | Generates `1536`-dimensional vector embeddings (`RETRIEVAL_DOCUMENT` and `RETRIEVAL_QUERY` task types). |
| **Citation Grounding** | Tavily Search API | Domain-locked search across authoritative medical sites (`who.int`, `nhs.uk`, `cdc.gov`, `nih.gov`, `medlineplus.gov`, `mayoclinic.org`, `clevelandclinic.org`, `msdmanuals.com`) with open-web fallback. |
| **Google Workspace** | Google Calendar API & Gmail API | Direct appointment creation on the user's primary calendar and 24-hour read-only Gmail medical email scanning. |
| **Notifications** | In-App Notification Center + Web Push (VAPID) | Alerts users on mobile and desktop when the 24-hour Gmail scan detects medical correspondence. |

---

## 2. Core User Journeys & User Stories

### 2.1 End-to-End User Journeys

1. **Journey A — Onboarding & Family Vault Setup:**
   User opens MedBay on mobile or desktop -> Signs in with Google OAuth (granting profile, Calendar, and read-only Gmail permissions) -> Lands on the Vault Dashboard with their default "Self" profile active -> Creates managed sub-profiles for dependents (e.g., "David — Son", "Sarah — Spouse") using only name and relationship.
2. **Journey B — Document Upload, Auto-Routing & Plain-English Summary:**
   User taps the primary Upload action -> Captures a photo or uploads a PDF/DOCX/TXT file -> File is encrypted and stored in a private Supabase Storage bucket -> Agent 1 automatically extracts text (using `mistral-ocr` for scanned PDFs or multimodal vision for images), identifies the patient name on the document, matches it to the corresponding family profile, generates a concise plain-English summary with critical flags and doctor questions, attaches verified medical citations via Tavily, indexes chunks into `pgvector`, and logs the event to the Activity Timeline.
3. **Journey C — Personalized RAG Chat & Appointment Booking:**
   User selects a family profile filter (e.g., "Self" or "David") in AI Chat -> Asks a question about past lab trends or medication instructions -> Agent 2 retrieves only chunks matching that `profile_id`, verifies medical facts via Tavily, and streams a structured response with inline clickable citations -> User asks MedBay to schedule a follow-up visit with their doctor on Friday at 10:00 AM -> Agent 2 invokes the Google Calendar tool, creates the event, confirms details in chat, and logs the booking on the Timeline.
4. **Journey D — Automated 24-Hour Gmail Medical Scanner:**
   Scheduled background job runs every 24 hours for active users -> Queries Gmail (`gmail.readonly`) for medical keywords, lab portals, pharmacy notices, or clinic confirmations received in the past 24 hours -> When a relevant email is detected, MedBay creates an in-app notification and dispatches a Web Push alert to the user's mobile/desktop device (without sending any outbound email) -> User taps the notification to review the detected email details and import attachments into the vault if desired.
5. **Journey E — One-Click Expiring Document Sharing & Timeline Audit:**
   User opens a stored document -> Taps "Share" and selects an expiration window (`24 Hours`, `7 Days`, or `30 Days`) -> MedBay generates a unique, time-limited signed link -> Recipient opens the link in one click without a PIN/password and views **only the original raw document** (no AI summary or chat history exposed) -> Every creation and view event is recorded on the Activity Timeline.

### 2.2 User Stories & Acceptance Criteria

* **US-01 (Google Authentication & Workspace Connection):**
  *As a primary user, I want to sign in with my Google account and authorize Calendar and read-only Gmail access, so that my vault is secured and ready for appointment booking and medical email alerts.*
  * **Acceptance Criteria:**
    * Google OAuth 2.0 completes smoothly on mobile PWA and desktop browsers.
    * User's primary "Self" profile is automatically provisioned upon first login.
    * Refresh tokens are securely encrypted at rest for background 24-hour Gmail scans and Calendar tool calls.

* **US-02 (Managed Family Sub-Profiles):**
  *As a primary caregiver, I want to create sub-profiles for my spouse and children using just their name and relationship, so that I can manage everyone's medical records under one account without needing separate emails or logins.*
  * **Acceptance Criteria:**
    * Sub-profile creation requires only `Full Name` and `Relationship` (e.g., Spouse, Child, Parent, Other), with optional `Date of Birth`.
    * Sub-profiles do not trigger email invitations or require password setup.
    * Users can switch active profiles across the Vault and AI Chat via a single tap.

* **US-03 (Multi-Format Upload & Automatic AI Ingestion):**
  *As a user, I want to upload medical photos, PDFs, or document files and automatically receive a brief plain-English summary with critical flags, doctor questions, and medical citations, so that I can understand complex medical records without deciphering jargon.*
  * **Acceptance Criteria:**
    * Accepts JPEG, PNG, WebP, PDF, DOCX, and TXT files up to 25 MB.
    * Raw file is saved to private encrypted storage immediately; Agent 1 runs asynchronously and updates the document status from `Processing` to `Ready`.
    * Summary output is strictly concise and structured into: (1) What This Document Is About, (2) Key Findings & Critical Flags, (3) Brief Questions to Ask Your Doctor, and (4) Verified Citations.
    * Agent 1 detects the patient name in the text and automatically assigns the document to the matching family profile (or prompts the user to confirm if no exact match exists).

* **US-04 (Profile-Isolated Streaming RAG Chat):**
  *As a user, I want to chat with an AI agent that knows all uploaded documents for a selected family member and streams well-structured, cited responses, so that I get accurate answers tailored to the right person.*
  * **Acceptance Criteria:**
    * Vector search strictly enforces a `profile_id` filter; documents belonging to Profile A are never retrieved when chatting under Profile B (unless "All Family" is explicitly toggled).
    * Responses stream token-by-token in clean Markdown with clickable inline source citations sourced via Tavily.
    * Chat distinguishes clearly between facts extracted from the user's uploaded records and general medical context from external citations.

* **US-05 (Automated Google Calendar Appointment Booking):**
  *As a user, I want to tell the chat agent to book a doctor's appointment on my Google Calendar, so that I can schedule follow-ups directly from my medical conversation.*
  * **Acceptance Criteria:**
    * When the user requests an appointment, Agent 2 extracts event title, date, start time, duration (default 30 minutes if unspecified), and location/notes.
    * Agent 2 confirms ambiguous dates/times before executing the calendar write tool, then creates the event via Google Calendar API and displays a confirmation card with the event link.

* **US-06 (24-Hour Gmail Medical Scanner & In-App/Push Alerts):**
  *As a user, I want MedBay to scan my Gmail every 24 hours for medical-related emails and notify me inside the app and on my device, so that I never miss lab results or clinic updates.*
  * **Acceptance Criteria:**
    * Cron job executes every 24 hours per connected account, inspecting messages received in the last 24 hours via `gmail.readonly`.
    * Detected medical emails generate an in-app notification badge/item and trigger a Web Push notification on subscribed mobile/desktop devices.
    * MedBay never sends an email notification to the user's inbox for scan findings.

* **US-07 (One-Click Expiring Share Links):**
  *As a user, I want to share a medical document using a link that expires in 24 hours, 7 days, or 30 days and opens in one click without a PIN, showing only the original document, so that doctors or emergency responders can view it effortlessly.*
  * **Acceptance Criteria:**
    * User chooses expiration duration: `24 Hours`, `7 Days`, or `30 Days`.
    * Opening the link requires zero login, zero PIN, and zero password.
    * Public share view renders **only** the original uploaded file (PDF/image/document) and strictly hides all AI summaries, doctor questions, chat history, and other family profiles.
    * Expired or revoked links immediately return an expired access screen and block file retrieval.

* **US-08 (Chronological Activity Timeline):**
  *As a user, I want a dedicated timeline page tracking my uploads, AI summaries, calendar bookings, and document shares, so that I have a clear audit log of all activity across my family vault.*
  * **Acceptance Criteria:**
    * Displays reverse-chronological events grouped by date (`Today`, `Yesterday`, specific dates).
    * Each entry shows event type icon, description, associated family profile badge, and timestamp.

---

## 3. Features & Functional Requirements

### 3.1 Module: Authentication & Family Profile Management
| ID | Requirement | Priority | Business Rules & Edge Cases |
| :--- | :--- | :--- | :--- |
| **FR-101** | Google OAuth 2.0 Sign-In | `P0 - Must Have for MVP` | Authenticate via Supabase Auth Google provider. Request `openid`, `email`, `profile`, `https://www.googleapis.com/auth/calendar.events`, and `https://www.googleapis.com/auth/gmail.readonly`. |
| **FR-102** | Default Self Profile Creation | `P0 - Must Have for MVP` | On initial sign-up, automatically create a primary `FamilyProfile` record marked `is_primary = true` populated with the user's Google display name. |
| **FR-103** | Managed Sub-Profile CRUD | `P0 - Must Have for MVP` | Primary user can create, edit, and delete up to 15 managed sub-profiles (`Spouse`, `Child`, `Parent`, `Dependent`, `Other`). No email address or login credentials are created for sub-profiles. |
| **FR-104** | Global Profile Switcher | `P0 - Must Have for MVP` | Persistent profile selector pill allowing users to filter the Vault and AI Chat by a specific family member or view all profiles together. |
| **FR-105** | Deleting a Sub-Profile | `P1 - Important` | Deleting a sub-profile requires explicit confirmation and cascades deletion to associated documents, vector chunks, and share links. |

### 3.2 Module: Encrypted Vault & Multi-Format Document Upload
| ID | Requirement | Priority | Business Rules & Edge Cases |
| :--- | :--- | :--- | :--- |
| **FR-201** | Supported File Formats & Limits | `P0 - Must Have for MVP` | Support `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX), and `text/plain` (TXT). Maximum file size: **25 MB** per file. |
| **FR-202** | Mobile Camera Capture & File Picker | `P0 - Must Have for MVP` | Upload flow supports native mobile camera capture (`capture="environment"`) as well as multi-file selection from device storage. |
| **FR-203** | Encrypted Private Storage | `P0 - Must Have for MVP` | Store raw binaries in a private Supabase Storage bucket encrypted at rest (AES-256) under user-scoped paths (`/{user_id}/{document_id}/{filename}`). Direct public bucket access is permanently disabled. |
| **FR-204** | Document Metadata & Search | `P0 - Must Have for MVP` | Store title, document category (e.g., Lab Report, Prescription, Imaging, Discharge Summary, Vaccination, Other), upload date, document date (extracted by AI), and assigned `profile_id`. Support keyword search and profile filtering. |
| **FR-205** | Manual Profile Reassignment | `P0 - Must Have for MVP` | Users can manually reassign any document to another family profile; reassignment immediately updates `profile_id` metadata on all associated vector chunks. |

### 3.3 Module: Agent 1 — Ingestion, OCR & Plain-English Summarizer
| ID | Requirement | Priority | Business Rules & Edge Cases |
| :--- | :--- | :--- | :--- |
| **FR-301** | Automated Ingestion Pipeline | `P0 - Must Have for MVP` | Triggered immediately upon upload completion. Updates document processing state (`queued` -> `extracting` -> `summarizing` -> `indexing` -> `ready`, or `failed`). |
| **FR-302** | Multimodal & OCR Text Extraction | `P0 - Must Have for MVP` | Scanned or multi-page PDFs use OpenRouter's `file-parser` plugin (`mistral-ocr` engine). Images use `deepseek/deepseek-v4.1-flash` vision transcription (with reasoning disabled for verbatim accuracy). DOCX/TXT files are parsed cleanly server-side. |
| **FR-303** | Automatic Patient Name Detection & Routing | `P0 - Must Have for MVP` | Agent 1 extracts the patient name from the document text and compares it against existing `FamilyProfile` names (fuzzy match). If confidence is high, auto-assigns `profile_id`; if unrecognized or ambiguous, assigns to the user-selected profile (or `Self` by default) and flags `"Verify Patient Profile"` on the document card. |
| **FR-304** | Concise Plain-English Summary | `P0 - Must Have for MVP` | Generates a brief, jargon-free summary (target 120–220 words) structured into three scannable blocks: **Overview** (what the document is), **Key Findings & Critical Flags** (highlighting abnormal values or urgent indicators), and **Questions for Your Doctor** (2–4 concise, actionable questions). |
| **FR-305** | Authoritative Medical Citations | `P0 - Must Have for MVP` | Agent 1 queries Tavily Search API restricted to trusted medical domains (`who.int`, `nhs.uk`, `cdc.gov`, `nih.gov`, `medlineplus.gov`, `mayoclinic.org`, `clevelandclinic.org`, `msdmanuals.com`) to ground clinical terms/flags, attaching 1–4 verified source links. If authoritative domain results return fewer than 1 relevant hit, falls back to general Tavily web search. |
| **FR-306** | Model Failover Routing | `P0 - Must Have for MVP` | Primary LLM calls route to `deepseek/deepseek-v4.1-flash` via OpenRouter. On rate-limit (`429`), timeout, or upstream `5xx` error, automatically fail over to `openai/gpt-oss-20b:free`. |
| **FR-307** | Chunking & Vector Indexing | `P0 - Must Have for MVP` | Splits extracted text into overlapping semantic chunks (500–800 tokens, 100-token overlap), embeds via Google AI `gemini-embedding-001` (`1536` dims, `RETRIEVAL_DOCUMENT`), and upserts into `pgvector` with `user_id`, `profile_id`, and `document_id`. |

### 3.4 Module: Agent 2 — Personalized RAG & Google Calendar Action Agent
| ID | Requirement | Priority | Business Rules & Edge Cases |
| :--- | :--- | :--- | :--- |
| **FR-401** | Profile-Scoped Vector Retrieval | `P0 - Must Have for MVP` | Embeds user query with `gemini-embedding-001` (`RETRIEVAL_QUERY`) and executes cosine similarity search filtered strictly by `user_id` AND active `profile_id`. Never mixes family members' records unless the user explicitly chooses "All Family Profiles". |
| **FR-402** | Streaming Structured Responses | `P0 - Must Have for MVP` | Streams responses token-by-token via Vercel AI SDK using clean Markdown formatting (bullet points, bold key terms, structured callouts) with real-time status indicators during retrieval/search/tool steps. |
| **FR-403** | Inline Citations (Vault + Web) | `P0 - Must Have for MVP` | Every medical explanation or claim includes inline references distinguishing **Your Vault Source** (document title + date) and **External Medical Source** (Tavily domain-locked citation link). |
| **FR-404** | Cross-Document Identity Guardrail | `P0 - Must Have for MVP` | If an uploaded document inside a profile contains a different patient name (e.g., a third-party referral note), Agent 2 explicitly notes the patient name found on the source document so facts are never misattributed. |
| **FR-405** | Google Calendar Appointment Booking | `P0 - Must Have for MVP` | Exposes a `book_calendar_appointment` tool to Agent 2. When a user asks to schedule a medical appointment, Agent 2 parses title, date, time, timezone, and optional doctor/clinic location, calls Google Calendar API `events.insert`, and renders a structured appointment confirmation card in chat. |
| **FR-406** | Heavy Multi-Document Reasoning Option | `P1 - Important` | Allows routing complex multi-document synthesis queries to `google/gemini-4-carbon` via OpenRouter while retaining `openai/gpt-oss-20b:free` as automatic fallback. |
| **FR-407** | Persistent Chat Threads | `P1 - Important` | Saves conversation history per user/profile so users can revisit prior AI consultations and appointment confirmations. |

### 3.5 Module: 24-Hour Gmail Medical Scanner & Notification Center
| ID | Requirement | Priority | Business Rules & Edge Cases |
| :--- | :--- | :--- | :--- |
| **FR-501** | Scheduled 24-Hour Gmail Scan | `P0 - Must Have for MVP` | Automated cron job runs every 24 hours for users with active Gmail OAuth tokens, querying `gmail.readonly` for messages received in the preceding 24 hours matching medical classifiers/keywords (e.g., lab results, prescription, appointment, diagnosis, hospital, clinic, radiology, pharmacy). |
| **FR-502** | Duplicate Prevention | `P0 - Must Have for MVP` | Tracks scanned `gmail_message_id` hashes per user so the same email is never flagged or notified more than once. |
| **FR-503** | In-App & Web Push Notifications Only | `P0 - Must Have for MVP` | When medical email(s) are found, creates an unread record in the in-app Notification Center and dispatches a Web Push notification to the user's registered mobile/desktop push endpoints. **Strictly prohibited from sending outbound notification emails.** |
| **FR-504** | Notification Review & One-Tap Import | `P1 - Important` | Tapping a Gmail scan notification opens a preview drawer showing email subject, sender, snippet, and attachment count, allowing the user to dismiss it or import attachments directly into the Vault (triggering Agent 1). |
| **FR-505** | Web Push Opt-In & Token Refresh Handling | `P0 - Must Have for MVP` | Prompts user to enable browser/PWA push notifications after login; gracefully surfaces a reconnect banner in-app if Google OAuth refresh token is revoked. |

### 3.6 Module: One-Click Expiring Share Links
| ID | Requirement | Priority | Business Rules & Edge Cases |
| :--- | :--- | :--- | :--- |
| **FR-601** | Expiration Presets | `P0 - Must Have for MVP` | Users generate share links by selecting one of three strict TTL windows: **24 Hours**, **7 Days**, or **30 Days**. |
| **FR-602** | Zero-Friction One-Click Access | `P0 - Must Have for MVP` | Share URLs (`/share/[token]`) require **no login, no PIN, and no password**. Cryptographically random high-entropy tokens (minimum 128-bit URL-safe token) prevent guessing. |
| **FR-603** | Raw Document Isolation | `P0 - Must Have for MVP` | The public `/share/[token]` viewer renders **only the original raw uploaded file** via a short-lived storage signed URL. All AI summaries, doctor questions, citations, chat history, and family profile lists are strictly omitted from both the UI and API payload. |
| **FR-604** | Instant Link Revocation | `P0 - Must Have for MVP` | Users can view active share links on any document and revoke a link immediately at any time, invalidating access prior to its scheduled expiration. |
| **FR-605** | Access Logging | `P1 - Important` | Increments a `view_count` and records `last_accessed_at` whenever an external recipient opens an active share link, logging a view event to the Activity Timeline. |

### 3.7 Module: Activity Timeline & Audit Trail
| ID | Requirement | Priority | Business Rules & Edge Cases |
| :--- | :--- | :--- | :--- |
| **FR-701** | Chronological Activity Feed | `P0 - Must Have for MVP` | Dedicated `/timeline` screen displaying all user and system actions in reverse-chronological order grouped by date. |
| **FR-702** | Tracked Event Types | `P0 - Must Have for MVP` | Automatically records: `DOCUMENT_UPLOADED`, `AI_SUMMARY_GENERATED`, `PROFILE_ASSIGNED`, `SHARE_LINK_CREATED`, `SHARE_LINK_ACCESSED`, `SHARE_LINK_REVOKED`, `CALENDAR_APPOINTMENT_BOOKED`, and `GMAIL_MEDICAL_DETECTED`. |
| **FR-703** | Timeline Filtering | `P1 - Important` | Users can filter timeline entries by family profile or event category (Uploads, Shares, Appointments, Gmail Alerts). |
| **FR-704** | Deep-Link Navigation | `P0 - Must Have for MVP` | Tapping any timeline entry navigates directly to the underlying document detail view, chat thread, or notification item. |

---

## 4. Pages, Screens & Navigation Flow

### 4.1 Navigation Architecture
* **Mobile-First PWA Shell (less than 768px):** Fixed bottom navigation bar with 4 primary destinations (**Vault**, **AI Chat**, **Timeline**, **Family**) plus a prominent floating or centered **Upload (`+`)** action button. Top sticky header displays the active **Family Profile Switcher** pill and **Notification Bell** with unread badge.
* **Desktop Shell (768px and above):** Collapsible left navigation rail housing the same 4 destinations, Upload CTA, Profile Switcher, and Notification Bell.

### 4.2 Complete Screen & Modal Inventory

| Route / View | Screen / Modal Name | Access | Core Components & Actions | Connects To |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Landing / PWA Entry | Public | Value proposition overview, security highlights, "Continue with Google" CTA, PWA install prompt. Auto-redirects authenticated users to `/vault`. | `/login`, `/vault` |
| `/login` | Authentication Screen | Public | Google OAuth 2.0 sign-in trigger, scope explanation (Vault, Calendar, Read-Only Gmail), medical disclaimer notice. | `/vault` |
| `/vault` | Family Medical Vault (Home) | Auth | Profile Switcher pills (`All`, `Self`, dependents), search bar, category filter chips, document cards (title, patient badge, date, AI status badge, critical flag indicator), Floating Upload CTA. | `/vault/upload` (Modal), `/vault/[documentId]`, `/notifications` |
| `/vault/upload` | Document Upload Modal / Sheet | Auth | Camera capture button, drag-and-drop / file picker (Image, PDF, DOCX, TXT), optional target profile pre-selector, upload progress bar. | `/vault/[documentId]` |
| `/vault/[documentId]` | Document Detail & AI Summary | Auth | Segmented tabs or split view: **AI Plain-English Summary** (Overview, Critical Flags, Doctor Questions, Verified Citations) and **Original Document Viewer**; Patient Profile reassignment dropdown; "Share Document" button; Delete action. | `/vault`, Share Modal, `/chat` ("Ask AI about this document") |
| `Modal: Share` | Expiring Share Link Modal | Auth | Expiration radio selector (`24 Hours`, `7 Days`, `30 Days`), "Generate Link" button, one-tap copy URL button, native mobile Web Share trigger, active links list with "Revoke" buttons. | `/share/[token]` (external) |
| `/chat` | Personalized RAG & Action Chat | Auth | Active Family Profile lock indicator, thread selector drawer, streaming Markdown message feed, inline vault & Tavily citation pills, Google Calendar booking confirmation cards, prompt input bar. | `/vault/[documentId]` (via citation click) |
| `/timeline` | Activity Timeline | Auth | Date-grouped chronological audit log, profile & event-type filters, event cards with timestamps and action links. | `/vault/[documentId]`, `/chat`, `/notifications` |
| `/profiles` | Family Profiles & Settings | Auth | Primary profile card, "Add Family Member" modal (Name + Relationship), Google Calendar & Gmail connection status + reconnect controls, Web Push notification toggle, Sign Out. | `/vault` |
| `/notifications` | Notification Center Drawer / Page | Auth | Unread/read list of 24-hour Gmail scan alerts, email subject/sender preview, "Import Attachment to Vault" CTA, "Mark All Read". | `/vault/[documentId]` |
| `/share/[token]` | Public Raw Document Viewer | Public (Token) | Minimal, distraction-free header showing document title and expiration countdown; embedded raw PDF/image/document viewer + download button; **zero AI summary or user account data**. | N/A (Standalone public view) |

### 4.3 Navigation Flow Diagram

```text
[ / Landing ] ---> [ /login (Google OAuth) ]
                         |
                         v
       +-------> [ /vault (Home) ] <-------+
       |           |     |     |           |
       |           v     |     v           |
[ /notifications ] |     |  [ /vault/upload ]
                   |     |     |
                   v     |     v
         [ /vault/[documentId] ] ---> [ Share Modal ] ---> [ /share/[token] (Public Raw File) ]
                   |     |
                   v     v
            [ /chat (RAG + Calendar) ]
                   |
                   v
            [ /timeline ] <---> [ /profiles & Settings ]

```

---

## 5. Roles, Authentication & Permissions

### 5.1 Role Definitions

1. **Primary Account Holder (`authenticated_owner`):** Authenticated via Google OAuth 2.0. Owns the root account, all managed family sub-profiles, uploaded documents, AI summaries, vector embeddings, chat threads, share links, and activity logs.
2. **Managed Dependent Profile (`managed_profile`):** Non-login entity representing a spouse, child, or dependent created by the Primary Account Holder. Has zero credentials or direct login access.
3. **External Share Recipient (`public_share_viewer`):** Unauthenticated visitor holding an active, unexpired `ShareLink` token. Granted transient read-only access strictly to the single raw file referenced by that token.
4. **System Background Worker (`service_worker`):** Privileged server-side execution context running asynchronous Agent 1 ingestion jobs and the 24-hour Gmail scanner strictly scoped to the owning `user_id`.

### 5.2 Access-Control Matrix

| Resource / Action | Primary Account Holder | Managed Dependent Profile | External Share Recipient | System Background Worker |
| --- | --- | --- | --- | --- |
| **Account & OAuth Settings** | View, Update, Delete | No Access | No Access | Read OAuth Tokens (Scoped) |
| **Family Sub-Profiles** | Create, View, Update, Delete | No Access | No Access | Read (For Name Matching) |
| **Raw Vault Files (Storage)** | Create, View, Download, Delete | No Access | View/Download **Only** via Active Token | Create (Gmail Import), Read (OCR) |
| **AI Summaries & Citations** | View, Regenerate, Delete | No Access | **Strictly Denied** | Create, Update |
| **Vector Embeddings (`pgvector`)** | Query (Scoped by `profile_id`), Delete | No Access | **Strictly Denied** | Create, Update `profile_id`, Delete |
| **RAG Chat & Calendar Booking** | Create, View, Book Events | No Access | **Strictly Denied** | Execute Tool Calls (User-Initiated) |
| **Expiring Share Links** | Create (24h/7d/30d), View, Revoke | No Access | Read Single Active Link Only | Auto-Expire by Timestamp |
| **Activity Timeline & Alerts** | View, Filter, Mark Read | No Access | **Strictly Denied** | Append System Events & Alerts |

---

## 6. Data Requirements & Core Entities

All relational entities reside in Supabase PostgreSQL with Row-Level Security (RLS) enforced on `user_id` so no user can ever query another user's records.

### 6.1 Core Entity Specifications

* **`User` (Account Root)**
* **Key Attributes:** `id` (UUID, matches Supabase Auth UID), `email`, `full_name`, `avatar_url`, `encrypted_google_refresh_token`, `gmail_scan_enabled` (boolean, default `true`), `last_gmail_scan_at` (timestamp), `created_at`.
* **Relationships:** Has many `FamilyProfile`, `MedicalDocument`, `ChatThread`, `ShareLink`, `ActivityEvent`, `NotificationItem`, and `PushSubscription` records.


* **`FamilyProfile` (Self & Managed Dependents)**
* **Key Attributes:** `id` (UUID), `user_id` (FK -> `User`), `full_name` (string, required), `relationship` (enum: `Self`, `Spouse`, `Child`, `Parent`, `Dependent`, `Other`), `date_of_birth` (date, optional), `is_primary` (boolean), `created_at`.
* **Relationships:** Belongs to one `User`; has many `MedicalDocument`, `DocumentChunk`, and `ChatThread` records.


* **`MedicalDocument` (Vault File Metadata)**
* **Key Attributes:** `id` (UUID), `user_id` (FK -> `User`), `profile_id` (FK -> `FamilyProfile`), `title` (string), `original_filename` (string), `mime_type` (string), `file_size_bytes` (integer), `storage_path` (string, private bucket path), `category` (enum: `Lab Report`, `Prescription`, `Imaging`, `Discharge Summary`, `Vaccination`, `Clinic Note`, `Other`), `document_date` (date, nullable), `detected_patient_name` (string, nullable), `profile_match_confidence` (enum: `high`, `needs_review`, `manual`), `ingestion_status` (enum: `queued`, `extracting`, `summarizing`, `indexing`, `ready`, `failed`), `extracted_text` (text), `source` (enum: `manual_upload`, `gmail_import`), `created_at`.
* **Relationships:** Belongs to `User` and `FamilyProfile`; has one `DocumentSummary`; has many `DocumentChunk` and `ShareLink` records.


* **`DocumentSummary` (Agent 1 Output)**
* **Key Attributes:** `id` (UUID), `document_id` (FK -> `MedicalDocument`, unique), `overview` (text, plain-English explanation), `key_findings` (list of structured finding items with severity flag: `normal`, `attention`, `critical`), `doctor_questions` (list of 2–4 brief strings), `citations` (list of verified sources containing `title`, `url`, `domain`, `snippet`), `model_used` (string, e.g., `deepseek/deepseek-v4.1-flash` or `openai/gpt-oss-20b:free`), `created_at`.
* **Relationships:** Belongs to one `MedicalDocument`.


* **`DocumentChunk` (Profile-Isolated Vector Index)**
* **Key Attributes:** `id` (UUID), `document_id` (FK -> `MedicalDocument`), `user_id` (FK -> `User`), `profile_id` (FK -> `FamilyProfile`, indexed for strict pre-filtering), `chunk_index` (integer), `content` (text), `embedding` (vector of `1536` dimensions from `gemini-embedding-001`), `created_at`.
* **Relationships:** Belongs to `MedicalDocument`, `FamilyProfile`, and `User`.


* **`ChatThread` & `ChatMessage` (Agent 2 Conversations)**
* **ChatThread Attributes:** `id` (UUID), `user_id` (FK -> `User`), `profile_id` (FK -> `FamilyProfile`, nullable when "All Family" scope is selected), `title` (string), `updated_at`.
* **ChatMessage Attributes:** `id` (UUID), `thread_id` (FK -> `ChatThread`), `role` (enum: `user`, `assistant`), `content` (Markdown text), `vault_citations` (list of referenced `document_id` + document title), `web_citations` (list of Tavily source `title` + `url`), `calendar_event_created` (nullable event summary + Google Calendar link), `created_at`.


* **`ShareLink` (One-Click Expiring Access)**
* **Key Attributes:** `id` (UUID), `document_id` (FK -> `MedicalDocument`), `user_id` (FK -> `User`), `token` (unique URL-safe random string), `duration_preset` (enum: `24h`, `7d`, `30d`), `expires_at` (timestamp), `revoked_at` (timestamp, nullable), `view_count` (integer, default `0`), `last_accessed_at` (timestamp, nullable), `created_at`.
* **Relationships:** Belongs to `MedicalDocument` and `User`.


* **`ActivityEvent` (Timeline Audit Log)**
* **Key Attributes:** `id` (UUID), `user_id` (FK -> `User`), `profile_id` (FK -> `FamilyProfile`, nullable), `document_id` (FK -> `MedicalDocument`, nullable), `event_type` (enum of tracked actions), `description` (human-readable summary), `metadata` (key-value details), `created_at`.


* **`NotificationItem` & `PushSubscription` (Gmail Scanner Alerts)**
* **NotificationItem Attributes:** `id` (UUID), `user_id` (FK -> `User`), `type` (enum: `gmail_medical_found`, `ingestion_failed`), `title` (string), `body` (string), `gmail_message_id` (string, unique per user for deduplication), `email_subject` (string), `email_sender` (string), `has_attachments` (boolean), `is_read` (boolean, default `false`), `imported_document_id` (FK -> `MedicalDocument`, nullable), `created_at`.
* **PushSubscription Attributes:** `id` (UUID), `user_id` (FK -> `User`), `endpoint` (URL), `p256dh_key` (string), `auth_key` (string), `device_label` (string), `created_at`.



---

## 7. External Integrations & APIs

| Integration | Purpose | Inbound Data (Sent to Service) | Outbound Data (Returned to MedBay) | Failure & Fallback Handling |
| --- | --- | --- | --- | --- |
| **OpenRouter API** | Primary & fallback LLM inference + scanned PDF OCR | Extracted text, page images, system prompts, RAG context, tool definitions; `file-parser` (`mistral-ocr`) plugin flag for PDFs. | Structured JSON summaries, patient name extraction, streaming chat tokens, tool-call arguments. | Automatic fallback chain: `deepseek/deepseek-v4.1-flash` -> `openai/gpt-oss-20b:free`. Retry once on transient network errors. |
| **Google AI API** | Vector embeddings for RAG | Document chunks (`RETRIEVAL_DOCUMENT`) and user chat queries (`RETRIEVAL_QUERY`) using `gemini-embedding-001` (`1536` dims). | `1536`-float embedding vectors. | Exponential backoff retry (up to 3 attempts); marks document status `failed` with one-tap retry if unreachable. |
| **Tavily Search API** | Grounded medical citations | Clinical terms, abnormal lab flags, or user health queries with Tier-1 `include_domains` allowlist (`who.int`, `nhs.uk`, `cdc.gov`, `nih.gov`, `medlineplus.gov`, `mayoclinic.org`, `clevelandclinic.org`, `msdmanuals.com`). | Verified URLs, page titles, and relevant medical snippets. | Tier-2 open-web Tavily query if Tier-1 returns zero results; if Tavily is unavailable, returns response with a "External citations temporarily unavailable" note. |
| **Google Calendar API** | Automated appointment booking | Event summary, start/end ISO timestamps, timezone, description/clinic details using user's OAuth token. | Created Google Calendar `event_id` and `htmlLink`. | If token is expired, refresh via OAuth refresh token; if revoked, prompt user in chat to reconnect Google permissions. |
| **Gmail API (`gmail.readonly`)** | 24-hour background medical email scanner | Query filter (`newer_than:1d`) + medical keyword/sender heuristics via scheduled 24-hour cron job. | Matching message IDs, subject lines, sender addresses, snippets, and attachment metadata. | Skips user silently on transient API error and retries on next cycle; flags in-app reconnect banner if OAuth consent is revoked. |
| **Supabase Storage** | Private encrypted file hosting & signed URLs | Binary medical uploads (`user_id/document_id/file`) and short-lived signed URL generation requests. | Encrypted object storage confirmation and time-bounded signed URLs (e.g., 15-minute streaming URLs when `/share/[token]` is opened). | Validates file size (less than or equal to 25 MB) and MIME type prior to upload; blocks access immediately if `ShareLink` is expired or revoked. |
| **Web Push (VAPID)** | Mobile & desktop push alerts | Push subscription endpoint, VAPID keys, and notification payload (`title`, `body`, deep-link URL `/notifications`). | Push delivery receipt (`201 Created`). | Removes stale/unsubscribed endpoints (`410 Gone`) automatically while keeping the alert visible in the in-app Notification Center. |

---

## 8. UI/UX States (Loading, Empty & Error States)

### 8.1 Loading States

* **Vault & Timeline Lists:** Shimmering card/row skeleton placeholders matching card dimensions while initial data loads.
* **Document Ingestion Progress:** Real-time step badge progression on newly uploaded cards (`Uploading` -> `Reading Document` -> `Writing Plain-English Summary` -> `Ready`) so users see immediate progress without blocking navigation.
* **AI Streaming Chat:** Immediate assistant message bubble with pulsing cursor, live tool-status pills (`"Searching [Profile]'s records..."`, `"Checking WHO & NHS sources..."`, `"Booking on Google Calendar..."`), and smooth token-by-token Markdown rendering.
* **Public Share Viewer (`/share/[token]`):** Clean centered spinner with `"Decrypting shared document..."` until the short-lived signed URL renders.

### 8.2 Empty States

* **Empty Vault (New User):** Welcoming illustration with `"Your family's medical vault is ready"` copy, primary **"Upload First Document"** button, and secondary **"Add Family Member"** button.
* **Empty Sub-Profile Filter:** `"No medical documents assigned to [Profile Name] yet"` with a direct **"Upload for [Profile Name]"** CTA.
* **Empty AI Chat:** Personalized greeting showing the active profile (`"Ask anything about [Profile Name]'s health records"`) with 3 clickable starter chips (e.g., *"Summarize recent lab results"*, *"List current medications"*, *"Book a doctor check-up on my calendar"*).
* **Empty Notifications:** `"All caught up — MedBay scans your Gmail every 24 hours for medical updates."`
* **Empty Timeline:** `"No activity recorded yet. Upload a document or book an appointment to see your timeline."`

### 8.3 Error & Fallback States

* **Invalid File Type or Oversized Upload:** Inline toast/banner before upload starts (`"Unsupported format. Please upload a JPEG, PNG, WebP, PDF, DOCX, or TXT file under 25 MB."`).
* **Ingestion / OCR Failure:** Document remains safely stored in the vault with an `"AI Summary Failed"` badge and a one-tap **"Retry Analysis"** button; users can still view and share the raw file.
* **Expired or Revoked Share Link (`/share/[token]`):** Clean, neutral error page stating `"This medical share link has expired or been revoked by the owner"` with zero metadata leaked.
* **Google OAuth Scope Revoked:** Non-intrusive top banner on Vault/Settings (`"Google Calendar & Gmail sync paused. Reconnect your Google account to resume."`) with a one-click re-authorization trigger.
* **Offline PWA State:** Top status pill indicating `"Offline Mode — Viewing cached screens. Uploads and AI chat will resume when reconnected."`

---

## 9. Non-Functional Requirements

* **Performance Targets:**
* Initial PWA shell load (First Contentful Paint): under `1.5s` on 4G mobile connections.
* RAG vector retrieval + first streamed chat token (TTFT): under `2.5s` P95.
* Agent 1 background ingestion (upload to `ready` summary): under `15s` for standard 1–5 page documents.
* Public one-click share link (`/share/[token]`) load time: under `1.5s`.


* **Responsiveness & PWA Standards:**
* Mobile-first layout designed primarily for `360px–430px` mobile viewports, scaling fluidly to tablet (`768px`) and desktop (`1280px+`).
* Valid `manifest.json` with app icons, standalone display mode, and service worker supporting Web Push notifications on iOS Safari (16.4+ Home Screen PWA), Android Chrome, and desktop browsers.


* **Accessibility (a11y):**
* WCAG 2.1 AA color contrast compliance across light/dark surfaces and severity badges (`Normal`, `Attention`, `Critical`).
* Minimum `44px x 44px` touch targets on all mobile buttons, profile pills, and citation links.
* Semantic ARIA labels on streaming regions, modals, and status badges.


* **Security & Privacy Constraints:**
* **Encryption:** TLS 1.3 in transit; AES-256 encryption at rest for Supabase Storage objects, PostgreSQL tables, and stored Google OAuth refresh tokens.
* **Strict Row-Level Security (RLS):** Every table (`FamilyProfile`, `MedicalDocument`, `DocumentSummary`, `DocumentChunk`, `ChatThread`, `ShareLink`, `ActivityEvent`, `NotificationItem`) enforces database-level RLS policies restricting access strictly to `auth.uid() = user_id`.
* **Public Share Isolation:** The `/share/[token]` backend endpoint queries only `ShareLink` and generates a transient signed storage URL solely if `revoked_at IS NULL` and `expires_at > now()`, never querying `DocumentSummary` or `FamilyProfile`.
* **Medical Disclaimer:** Persistent subtle footer disclaimer on AI Summaries and AI Chat stating: *"MedBay AI provides plain-English explanations for informational purposes only and is not a substitute for professional medical advice."*



---

## 10. MVP Scope, Out-of-Scope & Success Criteria

### 10.1 Strictly In-Scope (MVP v1.0)

* Google OAuth 2.0 authentication (with Calendar and `gmail.readonly` scopes).
* Managed family sub-profiles (name + relationship, no separate emails/logins).
* Encrypted private storage for images (JPEG/PNG/WebP), PDFs, DOCX, and TXT files.
* **Agent 1:** Automatic OCR/multimodal extraction, patient name matching, concise plain-English summary, critical flags, brief doctor questions, Tavily domain-locked + fallback citations, and `gemini-embedding-001` indexing into `pgvector`.
* **Agent 2:** Profile-isolated streaming RAG chat with inline vault + web citations and direct Google Calendar appointment booking.
* OpenRouter primary (`deepseek/deepseek-v4.1-flash`) + automatic free fallback (`openai/gpt-oss-20b:free`) + `mistral-ocr` PDF parsing.
* Automated 24-hour Gmail medical scanner triggering **in-app + Web Push notifications only**.
* One-click expiring share links (`24 Hours`, `7 Days`, `30 Days`) with no PIN/password, displaying **only the original raw document**.
* Chronological Activity Timeline tracking uploads, AI summaries, shares, calendar bookings, and Gmail alerts.
* Mobile-first PWA packaging with Web Push support.

### 10.2 Strictly Out-of-Scope (Non-Goals for v1.0)

* Separate login accounts, email invites, or role permissions for spouses or family members.
* PIN, password, or OTP challenges on shared document links.
* Displaying AI summaries, chat transcripts, or profile lists on public share links.
* Sending outbound email alerts to the user when the 24-hour Gmail scanner detects medical emails.
* Native App Store / Google Play wrapper builds (PWA covers mobile installability in v1).
* Medication reminder alarms, symptom trackers, wearable device integrations, or telehealth video calls.

### 10.3 Definition of Done & Success Metrics

* **Functional Definition of Done:**
1. A user can sign in with Google, create a child/spouse sub-profile, upload a scanned medical PDF or photo, and view a plain-English summary with verified medical citations in under 20 seconds.
2. Asking a question in AI Chat while filtered to "Child" retrieves zero facts from "Self" documents and streams a cited answer.
3. Asking AI Chat to schedule a doctor visit creates a verified event on the user's Google Calendar and logs it on `/timeline`.
4. Opening a generated 24h/7d/30d share link in an incognito browser renders the raw file in one click with zero AI summary visibility, and blocks access immediately after revocation or expiration.
5. The 24-hour Gmail cron job detects a test medical email and delivers an in-app + Web Push notification without sending an email.


* **Key Product Metrics:**
* Document ingestion & summarization success rate greater than `98%`.
* Zero cross-profile vector retrieval leaks (`100%` profile filter enforcement).
* Share link open-to-render latency under `1.5s`.



---

## 11. Assumptions & Open Decisions Requiring Approval

### 11.1 Assumptions

* **Hosting & Scheduled Jobs:** The Next.js application will be deployed on Vercel (or an equivalent Node host supporting scheduled cron jobs every 24 hours for the Gmail scanner).
* **Email Attachment Import:** When the 24-hour Gmail scanner detects a medical email with a PDF/image attachment, it notifies the user first rather than auto-importing unverified emails into the vault, keeping the vault free of promotional health newsletters while letting the user import with one tap.
* **Default Timezone for Calendar Booking:** Google Calendar events booked via AI Chat will use the primary timezone configured on the user's Google Calendar profile unless the user specifies another timezone in chat.

### 11.2 Open Decisions Requiring Final Sign-Off

Before we move to **`design.md`** (UI/UX wireframes, component architecture, and design system), please confirm or adjust these 3 items:

1. **Gmail Scan One-Tap Import vs. Auto-Import:** Confirm that you want the 24-hour Gmail scanner to **notify the user in-app / via push with a one-tap "Import to Vault" button** (preventing health marketing emails from cluttering the vault), rather than auto-saving every flagged email directly.
2. **Share Link View Counter Privacy:** Confirm whether you want external recipients opening `/share/[token]` to see **only the raw file + document title**, while `view_count` is visible strictly to the owner on the Activity Timeline.
3. **Default Profile on Ambiguous Uploads:** When a user uploads a document whose patient name does not match any existing family profile, should MedBay assign it to **"Self"** with a `"Verify Patient"` badge, or prompt the user to pick/create a profile right in the upload modal?

