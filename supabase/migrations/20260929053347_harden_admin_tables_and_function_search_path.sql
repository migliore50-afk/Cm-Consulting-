-- Hardening of admin tables and trigger function search paths.
-- This migration mirrors the already-applied production change.

revoke all on table public.admin_practices from anon, authenticated;
revoke all on table public.admin_requests from anon, authenticated;
revoke all on table public.admin_intermediaries from anon, authenticated;
revoke all on table public.admin_practice_documents from anon, authenticated;

alter function public.set_admin_practices_updated_at()
  set search_path = pg_catalog;

alter function public.set_admin_requests_updated_at()
  set search_path = pg_catalog;
