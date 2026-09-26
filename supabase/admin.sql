-- CM Consulting — schema Area Riservata
-- Eseguire nel Supabase SQL Editor.
-- Il backend Vercel usa SUPABASE_SERVICE_ROLE_KEY server-side; il browser non accede mai direttamente alla tabella.

create table if not exists public.admin_practices (
  id uuid primary key default gen_random_uuid(),
  client text not null check (char_length(client) between 1 and 180),
  type text not null check (char_length(type) between 1 and 120),
  expiry date not null,
  email text,
  client_price numeric(12,2),
  reviewer_cost numeric(12,2),
  notes text,
  checked boolean not null default false,
  created_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_practices_expiry_idx on public.admin_practices (expiry);
create index if not exists admin_practices_created_at_idx on public.admin_practices (created_at desc);

create or replace function public.set_admin_practices_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admin_practices_updated_at on public.admin_practices;
create trigger trg_admin_practices_updated_at
before update on public.admin_practices
for each row execute function public.set_admin_practices_updated_at();

alter table public.admin_practices enable row level security;

-- Nessuna policy browser-side: la tabella non è esposta al client anon/authenticated.
-- Il service role server-side bypassa RLS e viene usato esclusivamente da /api/admin.
revoke all on table public.admin_practices from anon, authenticated;
grant all on table public.admin_practices to service_role;


-- ============================================================================
-- admin_requests — NOTA IMPORTANTE (25/09/2026)
-- ============================================================================
-- Questa tabella è scritta da api/submit-request.js e letta da
-- api/cleanup-attachments.js, ma NON è mai stata definita in questo file:
-- risulta creata direttamente su Supabase (dashboard/SQL editor), in un
-- momento non tracciato qui. Di conseguenza questo repository NON documenta
-- ancora lo schema completo di admin_requests (colonne, tipi, indici,
-- eventuali policy RLS) — solo la singola colonna aggiunta più sotto.
--
-- Prima di considerare chiuso questo punto, andrebbe fatta una migrazione
-- separata che esporti lo schema reale della tabella così com'è oggi su
-- Supabase (ad es. da Database → Tables → admin_requests → "..." → 
-- "Download table definition", oppure con una query su information_schema)
-- e la incolli qui come CREATE TABLE completo. Questa nota resta finché
-- quel passaggio non viene fatto.
--
-- La modifica sotto riguarda SOLO la colonna richiesta per il collegamento
-- sicuro allegato → richiesta (Fase C). È scritta in forma idempotente
-- (IF NOT EXISTS): eseguirla più volte, o su un database dove la colonna
-- esiste già, non produce errori né perdita di dati.
-- ============================================================================

alter table public.admin_requests
  add column if not exists attachment_paths text[] not null default '{}'::text[];

comment on column public.admin_requests.attachment_paths is
  'Percorsi (pathname) degli allegati su Vercel Blob privato collegati a questa richiesta. Usata da api/cleanup-attachments.js per non cancellare allegati ancora collegati a una richiesta salvata.';