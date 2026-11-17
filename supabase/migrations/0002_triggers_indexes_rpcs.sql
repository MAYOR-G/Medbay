-- ============================================================================
-- MedBay Migration 0002: Triggers, Query Indexes & Security-Definer RPCs
-- Aligned 1:1 with DATABASE.md v1.0 & IMPLEMENTATION_PLAN.md
-- ============================================================================

-- 1. Shared updated_at Trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_family_profiles_updated_at
  BEFORE UPDATE ON public.family_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_medical_documents_updated_at
  BEFORE UPDATE ON public.medical_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_chat_threads_updated_at
  BEFORE UPDATE ON public.chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Maximum 15 Managed Dependents Guard (1 Self + 15 Dependents = 16 Total)
CREATE OR REPLACE FUNCTION public.enforce_max_family_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  profile_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));

  SELECT COUNT(*) INTO profile_count
  FROM public.family_profiles
  WHERE user_id = NEW.user_id;

  IF profile_count >= 16 THEN
    RAISE EXCEPTION 'MAX_PROFILES_EXCEEDED: Maximum of 15 dependent family profiles allowed per account'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_family_profiles_max_limit
  BEFORE INSERT ON public.family_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_max_family_profiles();

-- 3. Atomic Vector Chunk profile_id Sync on Document Reassignment
CREATE OR REPLACE FUNCTION public.sync_document_chunks_profile_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
    UPDATE public.document_chunks
    SET profile_id = NEW.profile_id
    WHERE document_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_medical_documents_sync_chunks_profile
  AFTER UPDATE OF profile_id ON public.medical_documents
  FOR EACH ROW EXECUTE FUNCTION public.sync_document_chunks_profile_id();

-- 4. Query-Driven Indexes (DATABASE.md Section 7)
CREATE INDEX idx_family_profiles_user_primary
  ON public.family_profiles (user_id, is_primary DESC, created_at ASC);

CREATE INDEX idx_medical_docs_user_profile_created
  ON public.medical_documents (user_id, profile_id, created_at DESC);

CREATE INDEX idx_medical_docs_user_category_created
  ON public.medical_documents (user_id, category, created_at DESC);

CREATE INDEX idx_medical_docs_search_gin
  ON public.medical_documents
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(extracted_text, '')));

CREATE INDEX hnsw_document_chunks_embedding
  ON public.document_chunks
  USING hnsw (embedding extensions.vector_cosine_ops);

CREATE INDEX idx_document_chunks_user_profile
  ON public.document_chunks (user_id, profile_id, document_id);

CREATE INDEX idx_chat_threads_user_updated
  ON public.chat_threads (user_id, updated_at DESC);

CREATE INDEX idx_chat_messages_thread_created
  ON public.chat_messages (thread_id, created_at ASC);

CREATE INDEX idx_share_links_document_active
  ON public.share_links (document_id, expires_at DESC)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_activity_events_user_created
  ON public.activity_events (user_id, created_at DESC);

CREATE INDEX idx_activity_events_user_profile_type
  ON public.activity_events (user_id, profile_id, event_type, created_at DESC);

CREATE INDEX idx_notifications_user_unread_created
  ON public.notification_items (user_id, is_read, created_at DESC);

CREATE INDEX idx_users_gmail_scan_eligible
  ON public.users (last_gmail_scan_at ASC NULLS FIRST)
  WHERE gmail_scan_enabled = true AND google_scopes_valid = true;

-- 5. RPC: Profile-Isolated Vector Search (match_document_chunks)
CREATE OR REPLACE FUNCTION public.match_document_chunks(
  p_user_id UUID,
  p_profile_id UUID,
  p_query_embedding extensions.vector(1536),
  p_match_threshold FLOAT DEFAULT 0.45,
  p_match_count INT DEFAULT 8
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_title VARCHAR(240),
  document_date DATE,
  detected_patient_name VARCHAR(160),
  profile_name VARCHAR(160),
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: Cross-user vector search is not permitted'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    dc.id AS chunk_id,
    md.id AS document_id,
    md.title AS document_title,
    md.document_date,
    md.detected_patient_name,
    fp.full_name AS profile_name,
    dc.content,
    (1 - (dc.embedding <=> p_query_embedding))::FLOAT AS similarity
  FROM public.document_chunks dc
  INNER JOIN public.medical_documents md ON md.id = dc.document_id
  INNER JOIN public.family_profiles fp ON fp.id = dc.profile_id
  WHERE dc.user_id = p_user_id
    AND (p_profile_id IS NULL OR dc.profile_id = p_profile_id)
    AND md.ingestion_status = 'ready'
    AND (1 - (dc.embedding <=> p_query_embedding)) >= p_match_threshold
  ORDER BY dc.embedding <=> p_query_embedding ASC
  LIMIT GREATEST(1, LEAST(p_match_count, 50));
END;
$$;

-- 6. RPC: Public Share Link Isolation Resolver (resolve_active_share_link)
CREATE OR REPLACE FUNCTION public.resolve_active_share_link(
  p_token VARCHAR(64)
)
RETURNS TABLE (
  document_id UUID,
  title VARCHAR(240),
  mime_type VARCHAR(120),
  storage_path TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link public.share_links%ROWTYPE;
  v_doc public.medical_documents%ROWTYPE;
BEGIN
  SELECT * INTO v_link
  FROM public.share_links sl
  WHERE sl.token = p_token
    AND sl.revoked_at IS NULL
    AND sl.expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO v_doc
  FROM public.medical_documents md
  WHERE md.id = v_link.document_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.share_links
  SET
    view_count = view_count + 1,
    last_accessed_at = now()
  WHERE id = v_link.id;

  INSERT INTO public.activity_events (
    user_id,
    profile_id,
    document_id,
    event_type,
    description,
    metadata
  ) VALUES (
    v_link.user_id,
    v_doc.profile_id,
    v_doc.id,
    'SHARE_LINK_ACCESSED',
    'Shared medical document viewed via expiring link',
    jsonb_build_object(
      'share_link_id', v_link.id,
      'duration_preset', v_link.duration_preset
    )
  );

  RETURN QUERY
  SELECT
    v_doc.id,
    v_doc.title,
    v_doc.mime_type,
    v_doc.storage_path,
    v_link.expires_at;
END;
$$;

-- 7. RPC: Atomic Agent 1 Ingestion Completion (complete_document_ingestion)
CREATE OR REPLACE FUNCTION public.complete_document_ingestion(
  p_document_id UUID,
  p_user_id UUID,
  p_profile_id UUID,
  p_title VARCHAR(240),
  p_category VARCHAR(40),
  p_document_date DATE,
  p_detected_patient_name VARCHAR(160),
  p_profile_match_confidence VARCHAR(20),
  p_extracted_text TEXT,
  p_overview TEXT,
  p_key_findings JSONB,
  p_doctor_questions JSONB,
  p_citations JSONB,
  p_model_used VARCHAR(100),
  p_chunks JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_chunk JSONB;
BEGIN
  UPDATE public.medical_documents
  SET
    profile_id = p_profile_id,
    title = COALESCE(NULLIF(trim(p_title), ''), title),
    category = p_category,
    document_date = p_document_date,
    detected_patient_name = p_detected_patient_name,
    profile_match_confidence = p_profile_match_confidence,
    extracted_text = p_extracted_text,
    ingestion_status = 'ready',
    ingestion_error = NULL
  WHERE id = p_document_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DOCUMENT_NOT_FOUND: Target document does not exist for user'
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.document_summaries (
    document_id,
    user_id,
    overview,
    key_findings,
    doctor_questions,
    citations,
    model_used
  ) VALUES (
    p_document_id,
    p_user_id,
    p_overview,
    p_key_findings,
    p_doctor_questions,
    p_citations,
    p_model_used
  )
  ON CONFLICT (document_id) DO UPDATE SET
    overview = EXCLUDED.overview,
    key_findings = EXCLUDED.key_findings,
    doctor_questions = EXCLUDED.doctor_questions,
    citations = EXCLUDED.citations,
    model_used = EXCLUDED.model_used;

  DELETE FROM public.document_chunks WHERE document_id = p_document_id;

  IF p_chunks IS NOT NULL AND jsonb_typeof(p_chunks) = 'array' THEN
    FOR v_chunk IN SELECT * FROM jsonb_array_elements(p_chunks)
    LOOP
      INSERT INTO public.document_chunks (
        document_id,
        user_id,
        profile_id,
        chunk_index,
        content,
        embedding
      ) VALUES (
        p_document_id,
        p_user_id,
        p_profile_id,
        (v_chunk->>'chunkIndex')::INTEGER,
        v_chunk->>'content',
        (v_chunk->>'embedding')::extensions.vector(1536)
      );
    END LOOP;
  END IF;

  INSERT INTO public.activity_events (
    user_id,
    profile_id,
    document_id,
    event_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_profile_id,
    p_document_id,
    'AI_SUMMARY_GENERATED',
    'Plain-English summary and clinical highlights generated',
    jsonb_build_object(
      'model_used', p_model_used,
      'profile_match_confidence', p_profile_match_confidence
    )
  );
END;
$$;

-- 8. RPC: Serverless Sliding-Window Rate Limiter (check_rate_limit)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_bucket_key VARCHAR(180),
  p_max_requests INT,
  p_window_seconds INT DEFAULT 60
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INT,
  reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window INTERVAL := make_interval(secs => p_window_seconds);
  v_row public.rate_limit_buckets%ROWTYPE;
BEGIN
  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, request_count)
  VALUES (p_bucket_key, v_now, 1)
  ON CONFLICT (bucket_key) DO UPDATE SET
    window_start = CASE
      WHEN public.rate_limit_buckets.window_start + v_window <= v_now THEN v_now
      ELSE public.rate_limit_buckets.window_start
    END,
    request_count = CASE
      WHEN public.rate_limit_buckets.window_start + v_window <= v_now THEN 1
      ELSE public.rate_limit_buckets.request_count + 1
    END
  RETURNING * INTO v_row;

  RETURN QUERY
  SELECT
    (v_row.request_count <= p_max_requests) AS allowed,
    GREATEST(0, p_max_requests - v_row.request_count) AS remaining,
    (v_row.window_start + v_window) AS reset_at;
END;
$$;
