-- ============================================================================
-- MedBay Migration 0004: Explicit Schema & Table Privileges
-- Ensures authenticated and service_role can query RLS-protected tables even
-- when default schema privileges omit automatic table grants on Supabase.
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Server-only admin client & Edge/Cron jobs
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Public share viewer reads strictly via SECURITY DEFINER RPC (zero direct anon table grants)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Least-privilege table grants for authenticated sessions (still enforced per-row by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.family_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.medical_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.document_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.document_chunks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.chat_threads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.share_links TO authenticated;
GRANT SELECT, INSERT ON TABLE public.activity_events TO authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.notification_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.push_subscriptions TO authenticated;

-- Internal sliding-window rate limiter table is accessible only via check_rate_limit RPC / service_role
REVOKE ALL ON TABLE public.rate_limit_buckets FROM anon, authenticated;
