# CM Consulting — Security Architecture V12.8

## Architettura

- **Identity Provider:** Supabase Auth.
- **Password:** gestita esclusivamente da Supabase Auth; Supabase usa bcrypt con salt casuale per gli hash delle password.
- **MFA obbligatoria:** TOTP Authenticator. Al primo accesso l'utente autorizzato deve registrare il primo fattore; gli accessi successivi richiedono il codice TOTP.
- **Sessione browser:** cookie opaco `cm_admin_session`, `HttpOnly`, `Secure`, `SameSite=Strict`, senza JWT nel localStorage.
- **Session store:** Upstash Redis server-side.
- **Timeout:** 15 minuti di inattività; massimo 8 ore per sessione.
- **Rate limit login:** 5 tentativi falliti per IP e account in 15 minuti, persistenti su Redis.
- **Database:** Supabase Postgres, tabella `admin_practices`, RLS attivo; accesso esclusivamente server-side tramite service role.
- **API:** `/api/admin` richiede sessione amministratore AAL2; `/api/submit-request` mantiene rate limiting e controlli allegati.

## Variabili Vercel obbligatorie

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CM_ADMIN_EMAIL
SITE_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

## Upload security

`/api/submit-request` applica:

- allowlist MIME;
- verifica magic bytes/signature;
- rifiuto PDF con JavaScript/OpenAction/Launch/AA;
- rifiuto Office OpenXML con macro/embedding sospetti;
- limiti per file e richiesta;
- webhook antivirus privato opzionale.

Per una scansione AV completa configurare:

```text
CM_ANTIVIRUS_WEBHOOK_URL
CM_ANTIVIRUS_WEBHOOK_SECRET
CM_REQUIRE_ANTIVIRUS=true
```

Il webhook deve essere un servizio privato (es. ClamAV self-hosted) che restituisce JSON con `{"clean":true}` solo dopo una scansione positiva. Non inviare documentazione riservata a servizi pubblici di malware scanning senza una valutazione privacy/compliance.

## Supabase: impostazioni raccomandate

1. Abilitare Email + Password.
2. Abilitare conferma email.
3. Impostare password min. 12 caratteri, complessità elevata e **Leaked Password Protection** se disponibile sul piano.
4. Abilitare MFA/TOTP e verifiche MFA.
5. Configurare `SITE_URL` e la redirect URL `/admin/reset`.
6. Configurare SMTP di produzione per il recupero password.
7. Non esporre mai `SUPABASE_SERVICE_ROLE_KEY` al browser.
8. Eseguire `supabase/admin.sql` nel SQL Editor.

## Vercel WAF / Firewall

La protezione applicativa è inclusa nel codice; il **WAF/Firewall Vercel è una funzione della piattaforma e non viene attivata da un campo del `vercel.json`**. Per il deploy definitivo configurare nella dashboard Vercel regole dedicate almeno a:

- `/admin*` e `/api/admin*`;
- challenge/rate limit su traffico anomalo;
- blocco di pattern bot/credential stuffing;
- logging e alerting sugli errori 401/403/429;
- eventuale allowlist IP se l'Area Amministratore deve essere accessibile solo da reti note.

## Limiti

Questa architettura riduce in modo sostanziale brute force, session theft, XSS, clickjacking, MIME confusion e accessi non autorizzati, ma non costituisce una certificazione di sicurezza o un penetration test. Prima del deploy definitivo è raccomandato un test esterno di sicurezza, soprattutto perché l'Area Amministratore tratta dati aziendali e potenzialmente dati personali.
