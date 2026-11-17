-- ============================================================================
-- MedBay Migration 0001: Core Relational & Vector Schema
-- Aligned 1:1 with DATABASE.md v1.0
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 1. users (Application Account Root, 1:1 with auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  email VARCHAR(320) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL CHECK (length(trim(full_name)) > 0),
  avatar_url TEXT NULL,
  encrypted_google_refresh_token TEXT NULL,
  google_scopes_valid BOOLEAN NOT NULL DEFAULT true,
  gmail_scan_enabled BOOLEAN NOT NULL DEFAULT true,
  last_gmail_scan_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. family_profiles (Self & Managed Dependents)
CREATE TABLE public.family_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  full_name VARCHAR(160) NOT NULL CHECK (length(trim(full_name)) > 0),
  relationship VARCHAR(32) NOT NULL CHECK (
    relationship IN ('Self', 'Spouse', 'Child', 'Parent', 'Dependent', 'Other')
  ),
  date_of_birth DATE NULL CHECK (date_of_birth <= CURRENT_DATE),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  color_index SMALLINT NOT NULL DEFAULT 0 CHECK (color_index >= 0 AND color_index <= 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_family_profiles_single_primary
  ON public.family_profiles (user_id)
  WHERE (is_primary = true);

-- 3. medical_documents (Vault File Metadata & Ingestion State)
CREATE TABLE public.medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.family_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR(240) NOT NULL CHECK (length(trim(title)) > 0),
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL CHECK (
    mime_type IN (
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    )
  ),
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 26214400),
  storage_path TEXT NOT NULL UNIQUE,
  category VARCHAR(40) NOT NULL DEFAULT 'Other' CHECK (
    category IN (
      'Lab Report',
      'Prescription',
      'Imaging',
      'Discharge Summary',
      'Vaccination',
      'Clinic Note',
      'Other'
    )
  ),
  document_date DATE NULL,
  detected_patient_name VARCHAR(160) NULL,
  profile_match_confidence VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (
    profile_match_confidence IN ('high', 'needs_review', 'manual')
  ),
  ingestion_status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (
    ingestion_status IN ('queued', 'extracting', 'summarizing', 'indexing', 'ready', 'failed')
  ),
  ingestion_error TEXT NULL,
  extracted_text TEXT NULL,
  source VARCHAR(24) NOT NULL DEFAULT 'manual_upload' CHECK (
    source IN ('manual_upload', 'gmail_import')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. document_summaries (Agent 1 Plain-English Output, 1:1 with medical_documents)
CREATE TABLE public.document_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL UNIQUE REFERENCES public.medical_documents(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  overview TEXT NOT NULL CHECK (length(trim(overview)) > 0),
  key_findings JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(key_findings) = 'array'),
  doctor_questions JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(doctor_questions) = 'array'),
  citations JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(citations) = 'array'),
  model_used VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. document_chunks (Profile-Isolated pgvector Index)
CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.medical_documents(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.family_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  embedding extensions.vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_document_chunks_doc_chunk_idx UNIQUE (document_id, chunk_index)
);

-- 6. chat_threads (Agent 2 Conversation Sessions)
CREATE TABLE public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  profile_id UUID NULL REFERENCES public.family_profiles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  title VARCHAR(160) NOT NULL DEFAULT 'New Health Consultation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. chat_messages (Streaming RAG Messages & Tool Artifacts)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  vault_citations JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(vault_citations) = 'array'),
  web_citations JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(web_citations) = 'array'),
  calendar_event_created JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. share_links (One-Click Expiring Document Access)
CREATE TABLE public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.medical_documents(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  token VARCHAR(64) NOT NULL CONSTRAINT uq_share_links_token UNIQUE,
  duration_preset VARCHAR(8) NOT NULL CHECK (duration_preset IN ('24h', '7d', '30d')),
  expires_at TIMESTAMPTZ NOT NULL CHECK (expires_at > created_at),
  revoked_at TIMESTAMPTZ NULL,
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  last_accessed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. activity_events (Chronological Timeline Audit Log)
CREATE TABLE public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  profile_id UUID NULL REFERENCES public.family_profiles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  document_id UUID NULL REFERENCES public.medical_documents(id) ON DELETE SET NULL ON UPDATE CASCADE,
  event_type VARCHAR(40) NOT NULL CHECK (
    event_type IN (
      'DOCUMENT_UPLOADED',
      'AI_SUMMARY_GENERATED',
      'PROFILE_ASSIGNED',
      'SHARE_LINK_CREATED',
      'SHARE_LINK_ACCESSED',
      'SHARE_LINK_REVOKED',
      'CALENDAR_APPOINTMENT_BOOKED',
      'GMAIL_MEDICAL_DETECTED'
    )
  ),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. notification_items (24-Hour Gmail Scanner & System Alerts)
CREATE TABLE public.notification_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  type VARCHAR(32) NOT NULL CHECK (type IN ('gmail_medical_found', 'ingestion_failed')),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  gmail_message_id VARCHAR(128) NULL,
  email_subject VARCHAR(300) NULL,
  email_sender VARCHAR(320) NULL,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  imported_document_id UUID NULL REFERENCES public.medical_documents(id) ON DELETE SET NULL ON UPDATE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_notification_items_user_gmail_msg
  ON public.notification_items (user_id, gmail_message_id)
  WHERE (gmail_message_id IS NOT NULL);

-- 11. push_subscriptions (Mobile & Desktop PWA Web Push Endpoints)
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_label VARCHAR(120) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. rate_limit_buckets (Serverless Sliding-Window Rate Limiter)
CREATE TABLE public.rate_limit_buckets (
  bucket_key VARCHAR(180) PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count >= 1)
);
