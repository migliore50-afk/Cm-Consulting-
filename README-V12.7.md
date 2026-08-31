# CM Consulting V12.7 — Final Deployment

## Funzionalità
- Assistente CM: routing verticale, valutazione generica, voce TTS/STT.
- Form generico: descrizione libera obbligatoria e allegati PDF/immagini/DOC/DOCX/XLS/XLSX/WEBP.
- Endpoint: `/api/submit-request`.
- Email interna: `info@cm-consulting.info` (override opzionale con `CM_DESTINATION_EMAIL`).
- Conferma automatica al cliente tramite Resend.
- WhatsApp: pulsante `wa.me` nella schermata di successo e webhook server-side opzionale.
- Navigazione servizi: Appalti → Capacità Finanziaria → Locazioni → Dogane → Ambiente → Appalti.

## Variabili Vercel
Obbligatorie:
- `RESEND_API_KEY`
- `CM_FROM_EMAIL`

Opzionale:
- `CM_DESTINATION_EMAIL`
- `CM_WHATSAPP_WEBHOOK_URL`
- `CM_WHATSAPP_WEBHOOK_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RECAPTCHA_SECRET_KEY`
- `RECAPTCHA_MIN_SCORE`

### Webhook WhatsApp
Se `CM_WHATSAPP_WEBHOOK_URL` è valorizzato, `/api/submit-request` invia un POST JSON con:
- evento `cm_request_submitted`;
- destinatario `+393286382612`;
- nome/email/telefono cliente;
- tipologia e testo richiesta;
- numero allegati;
- timestamp.

Il webhook è non bloccante: un suo eventuale errore non annulla l'invio email della richiesta.

## Note operative
Il pulsante WhatsApp apre direttamente una conversazione verso `+393286382612` con testo precompilato. L'invio automatico server-side via WhatsApp richiede la configurazione di un provider/webhook esterno.
