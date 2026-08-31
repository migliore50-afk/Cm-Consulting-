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
