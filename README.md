# MedBay — Family Health Document Vault & Clinical Context Assistant

MedBay is a privacy-first, mobile-friendly Next.js 16 (App Router) Progressive Web App for organizing family medical records, extracting structured clinical summaries via an AI ingestion pipeline, chatting over profile-isolated records with cited medical guidelines, sharing time-limited read-only documents, and monitoring Gmail for new medical alerts.

---

## Table of Contents

1. [Architecture & Stack Overview](#1-architecture--stack-overview)
2. [Prerequisites](#2-prerequisites)
3. [Quick Start Checklist](#3-quick-start-checklist)
4. [Step 1: Install Dependencies](#4-step-1-install-dependencies)
5. [Step 2: Obtain API Keys, OAuth Credentials & Secrets](#5-step-2-obtain-api-keys-oauth-credentials--secrets)
   - [2.1 Supabase Project & Keys](#21-supabase-project--keys)
   - [2.2 Google Cloud OAuth, Calendar & Gmail APIs](#22-google-cloud-oauth-calendar--gmail-apis)
   - [2.3 OpenRouter API Key (LLM & PDF OCR)](#23-openrouter-api-key-llm--pdf-ocr)
   - [2.4 Google AI Studio API Key (Embeddings)](#24-google-ai-studio-api-key-embeddings)
   - [2.5 Tavily API Key (Medical Citations)](#25-tavily-api-key-medical-citations)
   - [2.6 Local Cryptographic Secrets (`ENCRYPTION_SECRET`, `CRON_SECRET`, VAPID)](#26-local-cryptographic-secrets-encryption_secret-cron_secret-vapid)
6. [Step 3: Configure `.env.local`](#6-step-3-configure-envlocal)
7. [Step 4: Set Up Supabase Database & Storage](#7-step-4-set-up-supabase-database--storage)
   - [Option A: Hosted Supabase Cloud (Recommended)](#option-a-hosted-supabase-cloud-recommended)
   - [Option B: Local Supabase with Docker](#option-b-local-supabase-with-docker)
8. [Step 5: Run & Test Locally](#8-step-5-run--test-locally)
   - [Start the Dev Server](#start-the-dev-server)
   - [End-to-End Local Feature Walkthrough](#end-to-end-local-feature-walkthrough)
   - [Run Automated Checks & Tests](#run-automated-checks--tests)
9. [Step 6: Deploy to Production (Vercel + Supabase)](#9-step-6-deploy-to-production-vercel--supabase)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture & Stack Overview

| Layer | Technology | Where Configured |
| --- | --- | --- |
| **Framework & UI** | Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Zustand, Zod | `package.json`, `src/app/` |
| **Database, Auth & Storage** | Supabase PostgreSQL (`pgcrypto`, `pgvector` 1536-dim), RLS, Private `vault-files` bucket | `supabase/migrations/` |
| **LLMs & PDF OCR** | OpenRouter (`deepseek/deepseek-v4.1-flash`, `google/gemini-4-carbon`, `openai/gpt-oss-20b:free`, `mistral-ocr`) via Vercel AI SDK + LangGraph | `src/server/integrations/openrouter.adapter.ts`, `src/server/agents/` |
| **Vector Embeddings** | Google AI `gemini-embedding-001` (`1536` dimensions) | `src/server/integrations/google-ai.adapter.ts` |
| **Medical Authority Search** | Tavily (`who.int`, `nhs.uk`, `cdc.gov`, `nih.gov`, `medlineplus.gov`, `mayoclinic.org`, `clevelandclinic.org`, `msdmanuals.com`) | `src/server/integrations/tavily.adapter.ts` |
| **Google Workspace** | OAuth 2.0 (`calendar.events`, `gmail.readonly`) with AES-256-GCM encrypted refresh tokens | `src/app/(auth)/auth/callback/route.ts`, `src/server/integrations/google-workspace.adapter.ts` |
| **Notifications & Cron** | Web Push (`web-push` VAPID) + Vercel Cron (`0 8 * * *` UTC on `/api/cron/gmail-scan`) | `vercel.json`, `public/sw.js` |

---

## 2. Prerequisites

Install/create the following before starting:

- **Node.js `20+`** and **`npm`** (`node -v`)
- **Git** (`git --version`)
- **Accounts you will need:**
  1. [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
  2. [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 + Calendar API + Gmail API)
  3. [OpenRouter](https://openrouter.ai/) (LLM chat, structured clinical extraction, PDF OCR)
  4. [Google AI Studio](https://aistudio.google.com/) (Gemini embeddings)
  5. [Tavily](https://app.tavily.com/) (authoritative medical web search)
  6. [Vercel](https://vercel.com/) (production hosting & scheduled cron)
- *(Optional for local-only DB/integration tests)* **Docker Desktop** + **[Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)** (`brew install supabase/tap/supabase` on macOS).

---

## 3. Quick Start Checklist

1. Install dependencies: `npm install`
2. Collect keys from Supabase, Google Cloud, OpenRouter, Google AI Studio, and Tavily
3. Generate `ENCRYPTION_SECRET`, `CRON_SECRET`, and VAPID keys locally
4. Copy `.env.example` to `.env.local` and fill in all 14 variables
5. Run the 3 SQL migrations in `supabase/migrations/`
6. Run `npm run dev` and open `http://localhost:3000`
7. Deploy to Vercel and update redirect URLs in Supabase

---

## 4. Step 1: Install Dependencies

From the `Medbay` project folder:

```bash
cd Medbay
npm install
```

Check that the environment template exists:

```bash
cp .env.example .env.local
```

> **Note:** Never commit `.env.local` to Git (`.env*.local` is already ignored in `.gitignore`).

---

## 5. Step 2: Obtain API Keys, OAuth Credentials & Secrets

MedBay validates all 14 variables strictly on the server in `src/lib/env.ts`. Every variable below must be present when exercising its feature or running server routes.

### 2.1 Supabase Project & Keys

**Variables needed:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Steps (Hosted Supabase Cloud):**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New project**.
2. Choose an organization, enter a project name (e.g. `medbay-dev`), set a strong database password, pick your closest region, and click **Create new project**.
3. Wait for provisioning to finish, then open **Project Settings** (gear icon) -> **API** (or **Data API** / **API Keys**):
   - Copy **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL` (looks like `https://abcdefghijklmno.supabase.co`).
   - Copy **anon / public** key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy **service_role / secret** key -> `SUPABASE_SERVICE_ROLE_KEY`.

> **Security:** Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it with `NEXT_PUBLIC_`.

*(If using local Supabase via Docker instead, `supabase start` prints all three local values in your terminal — see [Option B](#option-b-local-supabase-with-docker).)*

---

### 2.2 Google Cloud OAuth, Calendar & Gmail APIs

MedBay uses Google OAuth via Supabase Auth both to sign users in and to request offline refresh tokens for **Google Calendar** (booking reminders) and **Gmail** (24-hour read-only medical notification scanning).

**Variables needed:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

#### A. Create Project & Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project (e.g., `MedBay`).
2. Open **APIs & Services -> Library**, search for and **Enable** both:
   - **Google Calendar API**
   - **Gmail API**

#### B. Configure OAuth Consent Screen
1. Open **Google Auth Platform** (or **APIs & Services -> OAuth consent screen**).
2. Choose **External** user type (unless using a private Google Workspace org) and click **Create**.
3. Fill in App name (`MedBay`), User support email, and Developer contact email.
4. On **Scopes** (or **Data Access**), add the exact scopes requested by `src/components/layout/GoogleSignInButton.tsx`:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/gmail.readonly`
5. While the app is in **Testing** publishing status, go to **Audience / Test users** and **add every Gmail address you will test with** (otherwise Google blocks sign-in with `Error 403: access_denied`).

#### C. Create OAuth 2.0 Client ID
1. Go to **Credentials** (or **Clients**) -> **Create Credentials -> OAuth client ID**.
2. Application type: **Web application**.
3. Name: `MedBay Web Client`.
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - *(Later for production)* `https://your-production-domain.vercel.app`
5. Under **Authorized redirect URIs**, add your **Supabase Auth callback URL** (this is Supabase's endpoint, *not* `/auth/callback` on localhost):
   - For Hosted Supabase: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     *(You can copy the exact callback URL inside Supabase Dashboard -> Authentication -> Providers -> Google).*
   - For Local Docker Supabase: `http://127.0.0.1:54321/auth/v1/callback`
6. Click **Create** and copy:
   - **Client ID** (`...apps.googleusercontent.com`) -> `GOOGLE_CLIENT_ID`
   - **Client secret** (`GOCSPX-...`) -> `GOOGLE_CLIENT_SECRET`

#### D. Wire Google OAuth into Supabase Auth
1. Open **Supabase Dashboard -> Authentication -> Providers -> Google**.
2. Toggle **Enable Sign in with Google** ON.
3. Paste `GOOGLE_CLIENT_ID` into **Client IDs** and `GOOGLE_CLIENT_SECRET` into **Client Secret (for OAuth)**.
4. Click **Save**.
5. Open **Supabase Dashboard -> Authentication -> URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (update to your Vercel URL when deploying).
   - Under **Redirect URLs**, add:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**`

---

### 2.3 OpenRouter API Key (LLM & PDF OCR)

MedBay uses OpenRouter for structured clinical extraction, PDF OCR (`mistral-ocr`), and RAG chat streaming.

**Variable needed:** `OPENROUTER_API_KEY`

1. Sign in at [openrouter.ai](https://openrouter.ai/).
2. Open **Keys** ([openrouter.ai/keys](https://openrouter.ai/keys)) -> **Create API Key**.
3. Copy the key (`sk-or-v1-...`) -> `OPENROUTER_API_KEY`.
4. Ensure you have a small credit balance in **Credits** (and check **Settings -> Privacy** if you wish to restrict model logging).

---

### 2.4 Google AI Studio API Key (Embeddings)

MedBay generates `1536`-dimensional document and query embeddings using `gemini-embedding-001`.

**Variable needed:** `GOOGLE_AI_API_KEY`

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in with your Google account.
2. Click **Create API key**, select or create a Google Cloud project, and copy the generated key -> `GOOGLE_AI_API_KEY`.

---

### 2.5 Tavily API Key (Medical Citations)

MedBay searches trusted medical authorities (`who.int`, `nhs.uk`, `cdc.gov`, `nih.gov`, `medlineplus.gov`, `mayoclinic.org`, `clevelandclinic.org`, `msdmanuals.com`) for citations during ingestion and Deep Synthesis chat.

**Variable needed:** `TAVILY_API_KEY`

1. Sign up at [app.tavily.com](https://app.tavily.com/).
2. From the dashboard overview, copy your API key (`tvly-...`) -> `TAVILY_API_KEY`. (The free developer tier works for local testing.)

---

### 2.6 Local Cryptographic Secrets (`ENCRYPTION_SECRET`, `CRON_SECRET`, VAPID)

Generate these three secrets locally in your terminal:

1. **`ENCRYPTION_SECRET`** — must be **exactly 64 hex characters** (32 bytes for AES-256-GCM encryption of Google refresh tokens):
   ```bash
   openssl rand -hex 32
   ```
2. **`CRON_SECRET`** — must be **at least 32 characters** (protects `/api/cron/gmail-scan`):
   ```bash
   openssl rand -hex 24
   ```
3. **Web Push VAPID keys** (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`):
   ```bash
   npx web-push generate-vapid-keys
   ```
   Copy **Public Key** -> `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and **Private Key** -> `VAPID_PRIVATE_KEY`.
4. **`VAPID_SUBJECT`** — must start with `mailto:`:
   ```text
   mailto:security@yourdomain.com
   ```

---

## 6. Step 3: Configure `.env.local`

Edit `.env.local` and verify every key against the schema enforced by `src/lib/env.ts`:

```env
# --- Public Client Variables (Safe for Browser, Governed by RLS) ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key

# --- Server-Only Secrets (Never prefix with NEXT_PUBLIC_) ---
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
GOOGLE_AI_API_KEY=your-google-ai-studio-api-key
TAVILY_API_KEY=tvly-your-tavily-api-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-oauth-client-secret
ENCRYPTION_SECRET=replace-with-64-char-hex-from-openssl-rand-hex-32
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=replace-with-32-plus-char-random-secret
```

---

## 7. Step 4: Set Up Supabase Database & Storage

You must apply all four migration files in `supabase/migrations/` in exact numerical order:
1. `supabase/migrations/0001_initial_schema.sql` — enables `pgcrypto` + `vector` (`pgvector`) and creates all 12 core tables.
2. `supabase/migrations/0002_triggers_indexes_rpcs.sql` — adds HNSW vector indexes, triggers, and RPCs (`match_document_chunks`, `complete_document_ingestion`, `resolve_active_share_link`, rate-limiting).
3. `supabase/migrations/0003_rls_and_storage.sql` — enables Row-Level Security on all tables, sets RPC grants, and creates the private `vault-files` storage bucket (`25 MiB` max).
4. `supabase/migrations/0004_table_grants.sql` — grants explicit schema & table permissions to `authenticated` and `service_role` (prevents `42501 permission denied for table users` on `/auth/callback`).

### Option A: Hosted Supabase Cloud (Recommended)

You can push migrations via the **Supabase CLI** or paste them in the **SQL Editor**:

#### Via Supabase CLI:
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

#### Via Supabase Dashboard SQL Editor (no CLI required):
1. Open **Supabase Dashboard -> SQL Editor -> New query**.
2. Copy and **Run** the entire contents of `supabase/migrations/0001_initial_schema.sql`.
3. Open a new query, copy and **Run** `supabase/migrations/0002_triggers_indexes_rpcs.sql`.
4. Open a new query, copy and **Run** `supabase/migrations/0003_rls_and_storage.sql`.
5. Open a new query, copy and **Run** `supabase/migrations/0004_table_grants.sql`.
6. Verify under **Storage -> Buckets** that a private bucket named **`vault-files`** was created (`Public = false`).

> **Optional Demo Seed Data:** For a dev/staging project only (never production), you can run `supabase/seed.sql` in the SQL Editor to insert the sample `demo.caregiver@medbay.test` user, 3 family profiles, and sample records used by `tests/integration/rls-isolation.test.ts`.

### Option B: Local Supabase with Docker

Ensure Docker Desktop is running and Supabase CLI is installed:

```bash
cd Medbay
supabase start
supabase db reset
```

`supabase db reset` runs all 3 migrations in `supabase/migrations/` and applies `supabase/seed.sql`. Run `supabase status` to print your local `API URL`, `anon key`, and `service_role key`, and paste them into `.env.local`.

*(To test Google OAuth against a local Supabase Docker instance, configure the `[auth.external.google]` block in `supabase/config.toml` or follow [Supabase local OAuth docs](https://supabase.com/docs/guides/cli/config#auth.external.google). For full OAuth + Web Push testing, Option A with Hosted Supabase is simpler.)*

---

## 8. Step 5: Run & Test Locally

### Start the Dev Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### End-to-End Local Feature Walkthrough

Once running, verify each feature step by step:

1. **Google Sign-In (`/login` -> `/auth/callback` -> `/vault`):**
   - Click **Continue with Google** and approve `email`, `profile`, `calendar.events`, and `gmail.readonly`.
   - You should land on `/vault`. Your `public.users` row and primary **Self** `family_profiles` row are auto-created on first login, and your encrypted Google refresh token is saved via `ENCRYPTION_SECRET`.
2. **Family Profiles (`/profiles`):**
   - Create a dependent sub-profile (e.g., `Child` or `Parent`) and switch the active profile from the header/sidebar `ProfileSwitcher`.
   - Confirm Google Sync toggles (`Gmail Monitoring` & Calendar status) render properly.
3. **Medical Document Upload & AI Ingestion (`/vault`):**
   - Upload a PDF, image (`JPEG`/`PNG`/`WEBP`), `.docx`, or `.txt` file (up to `25 MiB`) tagged to the active profile.
   - Watch Agent 1 extract clinical text/OCR, structure findings, attach medical guideline citations via Tavily, compute `1536`-dim embeddings via Google AI, and transition the document to `ready`.
   - Open `/vault/[documentId]` to inspect the summary, red flags, extracted entities, and raw document preview.
4. **Profile-Isolated RAG Chat & Calendar Booking (`/chat`):**
   - Ask a question about an uploaded record. Confirm streaming responses show grounded document citations and Tavily medical citations.
   - Toggle **Deep Synthesis** to test the heavier reasoning model (`google/gemini-4-carbon`).
   - Ask to schedule a follow-up appointment or check confirmation UI to test `CalendarEventCard` creation in Google Calendar.
5. **Expiring Share Links (`/vault/[documentId]` -> `/share/[token]`):**
   - Create a temporary share link on a document (with optional expiration/PIN or duration) and open `/share/[token]` in an incognito window.
   - Confirm the document renders in an isolated viewer with zero sidebar, profile list, or user account leaks.
6. **Timeline (`/timeline`):**
   - Verify uploads, share links, and chat/calendar activities appear chronologically with profile & category filters.
7. **Notifications, Web Push & Gmail Cron (`/notifications` & `/api/cron/gmail-scan`):**
   - On `/notifications`, click **Enable Push Alerts** to subscribe the browser service worker (`/sw.js`).
   - Trigger the Gmail scanner locally using your `CRON_SECRET`:
     ```bash
     curl -i -H "Authorization: Bearer YOUR_CRON_SECRET_HERE" \
       http://localhost:3000/api/cron/gmail-scan
     ```
   - A `200 OK` JSON response returns `{ "success": true, "data": { "usersScanned": ..., "alertsCreated": ..., ... } }`. Calling without the bearer token must return `401 Unauthorized`.

### Run Automated Checks & Tests

```bash
# 1. Code formatting check
npm run format:check

# 2. TypeScript strict check
npm run typecheck

# 3. ESLint
npm run lint

# 4. Unit & Security Audit tests (runs offline, no DB needed)
npm run test:unit

# 5. Integration tests (requires live/seeded Supabase URL + keys in env)
npm run test:integration

# 6. Production build verification
npm run build
```

To run the Playwright E2E smoke suite (`mobile-chromium` + `desktop-chromium`):

```bash
# Install Playwright Chromium browser binary once
npx playwright install chromium

# Run Playwright smoke tests (automatically runs `npm run build && npm run start`)
npm run test:e2e
```

---

## 9. Step 6: Deploy to Production (Vercel + Supabase)

Follow this sequence to move cleanly from local testing to a live production deployment:

### 1. Prepare a Dedicated Production Supabase Project (Recommended)
If your local setup used seeded test data, create a clean production Supabase project (or verify no demo rows from `seed.sql` exist) and apply the 3 migrations in `supabase/migrations/` (`npx supabase db push` or SQL Editor).

### 2. Push Your Code to GitHub
Ensure `.env.local` is untracked (`git status` should not list `.env.local`), then push your repository to GitHub/GitLab/Bitbucket.

### 3. Import Project in Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
2. **Framework Preset:** Next.js (auto-detected).
3. **Root Directory:** Set to `Medbay` if this folder lives inside a parent repo, or `.` if `Medbay` is the repo root.
4. Expand **Environment Variables** and add **all 14 variables** from `.env.local` for **Production** (and Preview if desired), updating URL-sensitive keys:
   - `NEXT_PUBLIC_APP_URL` = `https://<your-project>.vercel.app` (or custom domain)
   - `NEXT_PUBLIC_SUPABASE_URL` = Production Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Production Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY` = Production Supabase Service Role Key
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
   - `OPENROUTER_API_KEY`, `GOOGLE_AI_API_KEY`, `TAVILY_API_KEY`
   - `ENCRYPTION_SECRET` (generate a **fresh** `openssl rand -hex 32` for production — note that rotating this invalidates previously encrypted Google refresh tokens)
   - `CRON_SECRET` (generate a **fresh** `openssl rand -hex 24` — Vercel automatically sends `Authorization: Bearer $CRON_SECRET` when invoking `vercel.json` cron routes)
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
5. Click **Deploy** and wait for the build to succeed.

### 4. Wire Production Domain into Supabase & Google Cloud
After Vercel assigns your URL (`https://<your-app>.vercel.app`):

1. **Supabase Dashboard -> Authentication -> URL Configuration:**
   - Update **Site URL** to `https://<your-app>.vercel.app`.
   - Add `https://<your-app>.vercel.app/auth/callback` to **Redirect URLs**.
   - Remove `http://localhost:3000` only if this Supabase project is strictly production (you can keep both during initial rollout).
2. **Google Cloud Console -> OAuth 2.0 Client:**
   - Add `https://<your-app>.vercel.app` under **Authorized JavaScript origins**.
   - Verify `https://<your-prod-project-ref>.supabase.co/auth/v1/callback` is in **Authorized redirect URIs**.
   - Make sure your test users are listed under **OAuth consent screen -> Test users** (or submit the consent screen for Google verification if opening to the public).

### 5. Verify Vercel Cron (`vercel.json`)
[vercel.json](vercel.json) registers the daily cron job:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/gmail-scan",
      "schedule": "0 8 * * *"
    }
  ]
}
```
1. In **Vercel Dashboard -> Project -> Settings -> Cron Jobs**, confirm `/api/cron/gmail-scan` (`0 8 * * *` UTC daily) is active.
2. Test it manually from your terminal using your **production** `CRON_SECRET`:
   ```bash
   curl -i -H "Authorization: Bearer YOUR_PROD_CRON_SECRET" \
     https://<your-app>.vercel.app/api/cron/gmail-scan
   ```

### 6. Production Smoke Checklist
- [ ] Visit `https://<your-app>.vercel.app` — security headers & landing page render cleanly
- [ ] Sign in with Google -> redirects back to `/vault` cleanly
- [ ] Upload a test medical document -> transitions from processing to `ready`
- [ ] Ask a clinical question in `/chat` -> streamed reply + citations work
- [ ] Create an expiring `/share/[token]` link -> loads cleanly in an incognito browser
- [ ] `/api/cron/gmail-scan` rejects unauthenticated requests (`401`) and accepts `Authorization: Bearer <CRON_SECRET>` (`200`)

---

## 10. Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `Invalid MedBay server environment configuration` | Missing/malformed variable in `.env.local` | Check `ENCRYPTION_SECRET` is 64 hex chars, `CRON_SECRET` is `>= 32` chars, and `VAPID_SUBJECT` starts with `mailto:`. |
| Google sign-in fails with `Error 403: access_denied` | Google OAuth consent screen is in **Testing** mode | Add your Google account under Google Cloud Console -> OAuth consent screen -> **Test users**. |
| Google redirect fails with `redirect_uri_mismatch` | Google Cloud Redirect URI points to `localhost:3000` instead of Supabase | Set Google Cloud's Redirect URI to `https://<your-project-ref>.supabase.co/auth/v1/callback`, and add `http://localhost:3000/auth/callback` inside **Supabase** Redirect URLs. |
| Redirected back to `/login?error=oauth_failed` (`ExternalProviderError` / `42501 permission denied`) | Table `GRANT` privileges missing for `authenticated` / `service_role` | Run `supabase/migrations/0004_table_grants.sql` in **Supabase Dashboard -> SQL Editor**. |
| `HTTP ERROR 431` on `http://localhost:3000` | Node's default 16 KB header limit exceeded by chunked Supabase OAuth cookies + accumulated `localhost:3000` cookies from other apps | Clear cookies for `localhost:3000` in browser DevTools (`Application -> Cookies`) and restart `npm run dev` (already configured with `--max-http-header-size=65536`). |
| Upload fails or file preview breaks | Migration `0003_rls_and_storage.sql` didn't run or wrong bucket permissions | Verify the private `vault-files` bucket and `storage.objects` policies exist in Supabase Storage. |
| Gmail scan / Calendar returns scope error | User signed in without granting Calendar/Gmail permissions or token rotated | Sign out and sign back in via **Continue with Google** (requests `access_type=offline` + `prompt=consent`), or reconnect in `/profiles`. |
| `npm run test:integration` skips all tests | No live Supabase credentials set or database not seeded | Start local Supabase (`supabase start && supabase db reset`) or export `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. |
| `npm run test:e2e` says browser executable doesn't exist | Playwright Chromium browser hasn't been installed yet | Run `npx playwright install chromium` and retry `npm run test:e2e`. |
