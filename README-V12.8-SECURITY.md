# CM Consulting V12.8 — Area Riservata Security

Questa revisione sostituisce il vecchio `area-cm.html` basato su `localStorage` con `/admin`, autenticazione reale Supabase Auth, MFA TOTP obbligatoria, sessione server-side e database Supabase.

### Primo deploy

1. Crea/configura un progetto Supabase.
2. Crea l'utente amministratore con email uguale a `CM_ADMIN_EMAIL`.
3. Esegui `supabase/admin.sql`.
4. Imposta le variabili Vercel indicate in `SECURITY-V12.8.md`.
5. Crea un database Upstash Redis e imposta URL/token.
6. Configura Supabase Auth per Email+Password, email confirmation e MFA/TOTP.
7. Configura la redirect URL `https://www.cm-consulting.info/admin/reset` per il recupero password.
8. Esegui il deploy.

### Test minimo

- password errata 5 volte -> blocco 15 minuti;
- login corretto -> richiesta TOTP;
- primo login -> QR enrollment;
- logout -> cookie invalidato;
- inattività 15 minuti -> sessione chiusa;
- cambio password da Impostazioni;
- recupero password;
- creazione/modifica/eliminazione pratica;
- accesso diretto a `/api/admin?action=practices` senza cookie -> 401;
- upload allegato con firma MIME errata -> rifiuto.
