-- CM Consulting — collegamento percorsi allegati richieste
-- Allinea il repository allo schema già applicato al database di produzione.

alter table public.admin_requests
  add column if not exists attachment_paths text[] not null default '{}'::text[];

comment on column public.admin_requests.attachment_paths is
  'Percorsi (pathname) degli allegati su Vercel Blob privato collegati a questa richiesta. Usata da api/cleanup-attachments.js per non cancellare allegati ancora collegati a una richiesta salvata.';
