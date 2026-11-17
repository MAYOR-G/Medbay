-- ============================================================================
-- MedBay Migration 0003: Row-Level Security & Private Storage Bucket
-- Aligned 1:1 with DATABASE.md v1.0 Section 8 & Section 10.2
-- ============================================================================

-- Enable and force RLS across all 12 tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

ALTER TABLE public.family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents FORCE ROW LEVEL SECURITY;

ALTER TABLE public.document_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_summaries FORCE ROW LEVEL SECURITY;

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks FORCE ROW LEVEL SECURITY;

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads FORCE ROW LEVEL SECURITY;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links FORCE ROW LEVEL SECURITY;

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events FORCE ROW LEVEL SECURITY;

ALTER TABLE public.notification_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_items FORCE ROW LEVEL SECURITY;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets FORCE ROW LEVEL SECURITY;

-- 1. users policies
CREATE POLICY users_select_own ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY users_insert_own ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY users_delete_own ON public.users
  FOR DELETE TO authenticated
  USING (id = auth.uid());

-- 2. family_profiles policies
CREATE POLICY family_profiles_select_own ON public.family_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY family_profiles_insert_own ON public.family_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY family_profiles_update_own ON public.family_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY family_profiles_delete_dependent ON public.family_profiles
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND is_primary = false);

-- 3. medical_documents policies
CREATE POLICY medical_documents_select_own ON public.medical_documents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY medical_documents_insert_own ON public.medical_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.family_profiles fp
      WHERE fp.id = profile_id AND fp.user_id = auth.uid()
    )
  );

CREATE POLICY medical_documents_update_own ON public.medical_documents
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.family_profiles fp
      WHERE fp.id = profile_id AND fp.user_id = auth.uid()
    )
  );

CREATE POLICY medical_documents_delete_own ON public.medical_documents
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 4. document_summaries policies (read/delete only for authenticated; written via Agent 1 RPC)
CREATE POLICY document_summaries_select_own ON public.document_summaries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY document_summaries_delete_own ON public.document_summaries
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 5. document_chunks policies (read/delete only for authenticated; written via Agent 1 RPC)
CREATE POLICY document_chunks_select_own ON public.document_chunks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY document_chunks_delete_own ON public.document_chunks
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 6. chat_threads policies
CREATE POLICY chat_threads_select_own ON public.chat_threads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY chat_threads_insert_own ON public.chat_threads
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      profile_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.family_profiles fp
        WHERE fp.id = profile_id AND fp.user_id = auth.uid()
      )
    )
  );

CREATE POLICY chat_threads_update_own ON public.chat_threads
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY chat_threads_delete_own ON public.chat_threads
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 7. chat_messages policies
CREATE POLICY chat_messages_select_own ON public.chat_messages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY chat_messages_insert_own ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chat_threads ct
      WHERE ct.id = thread_id AND ct.user_id = auth.uid()
    )
  );

CREATE POLICY chat_messages_update_own ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY chat_messages_delete_own ON public.chat_messages
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 8. share_links policies (anon denied directly; resolves solely via resolve_active_share_link RPC)
CREATE POLICY share_links_select_own ON public.share_links
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY share_links_insert_own ON public.share_links
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.medical_documents md
      WHERE md.id = document_id AND md.user_id = auth.uid()
    )
  );

CREATE POLICY share_links_update_own ON public.share_links
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY share_links_delete_own ON public.share_links
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 9. activity_events policies (append-only for authenticated)
CREATE POLICY activity_events_select_own ON public.activity_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY activity_events_insert_own ON public.activity_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 10. notification_items policies
CREATE POLICY notification_items_select_own ON public.notification_items
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notification_items_update_own ON public.notification_items
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_items_delete_own ON public.notification_items
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 11. push_subscriptions policies
CREATE POLICY push_subscriptions_select_own ON public.push_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY push_subscriptions_insert_own ON public.push_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY push_subscriptions_update_own ON public.push_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY push_subscriptions_delete_own ON public.push_subscriptions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 12. rate_limit_buckets: zero policies for anon/authenticated (service_role / RPC only)

-- ============================================================================
-- Private Encrypted Storage Bucket: vault-files
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault-files',
  'vault-files',
  false,
  26214400,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY vault_files_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'vault-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY vault_files_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vault-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY vault_files_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'vault-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- RPC Execution Grants
-- ============================================================================
REVOKE ALL ON FUNCTION public.resolve_active_share_link(VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_active_share_link(VARCHAR) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.match_document_chunks(UUID, UUID, extensions.vector, FLOAT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_document_chunks(UUID, UUID, extensions.vector, FLOAT, INT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.complete_document_ingestion(
  UUID, UUID, UUID, VARCHAR, VARCHAR, DATE, VARCHAR, VARCHAR, TEXT, TEXT, JSONB, JSONB, JSONB, VARCHAR, JSONB
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_document_ingestion(
  UUID, UUID, UUID, VARCHAR, VARCHAR, DATE, VARCHAR, VARCHAR, TEXT, TEXT, JSONB, JSONB, JSONB, VARCHAR, JSONB
) TO service_role;

REVOKE ALL ON FUNCTION public.check_rate_limit(VARCHAR, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(VARCHAR, INT, INT) TO authenticated, service_role;
