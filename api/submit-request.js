import { issueSignedToken, presignUrl } from '@vercel/blob';
import { consumeRateLimit, scanBlobAttachment } from './_security.js';
/**
 * CM Consulting - secure request submission endpoint
 * POST /api/submit-request
 *
 * Required environment variables:
 *   RESEND_API_KEY
 *   CM_DESTINATION_EMAIL
 *
 * Optional:
 *   CM_FROM_EMAIL (required in production)
 *   CM_WHATSAPP_WEBHOOK_URL (optional: Make/Zapier/Twilio-compatible webhook)
 *   CM_WHATSAPP_WEBHOOK_SECRET (optional)
 *   TURNSTILE_SECRET_KEY
 *   RECAPTCHA_SECRET_KEY
 *   RECAPTCHA_MIN_SCORE (default 0.5)
 *
 * Anti-spam:
 *   In produzione (VERCEL_ENV === "production") almeno uno tra
 *   TURNSTILE_SECRET_KEY e RECAPTCHA_SECRET_KEY è OBBLIGATORIO:
 *   senza, l'endpoint rifiuta le richieste (fail-closed).
 *   In Preview/sviluppo il captcha viene verificato solo se configurato.
 *   La scelta del provider dipende SOLO dalle variabili d'ambiente,
 *   mai da parametri inviati dal browser.
 */

const MAX_SUBJECT_LENGTH = 180;
const MAX_TEXT_LENGTH = 20000;
const MAX_NAME_LENGTH = 120;
const MAX_GREETING_NAME_LENGTH = 80;
const MAX_PHONE_LENGTH = 40;
const MAX_COMPANY_LENGTH = 200;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

// Tipologie ammesse: il nome mostrato nelle email e salvato nel database
// viene calcolato lato server e non viene mai preso dal browser.
const REQUEST_TYPE_NAMES = {
  appalti: "Appalti pubblici",
  locazioni: "Locazioni",
  dogane: "Dogane",
  ambiente: "Ambiente",
  contributi: "Contributi e agevolazioni",
  urbanistica: "Urbanistica ed edilizia",
  fiscali: "Garanzie fiscali",
  "contratti-privati": "Contratti privati",
  altro: "Altra fideiussione",
  generica: "Valutazione generica",
  capacita: "Capacità finanziaria"
};
const DEFAULT_REQUEST_TYPE = "generica";

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function str(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Testo su una sola riga, senza caratteri di controllo, con lunghezza massima.
function singleLine(value, maxLength) {
  return str(value)
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Il nome compare nel saluto della mail di conferma inviata a un indirizzo
// non verificato: viene usato solo se ha l'aspetto di un nome/ragione sociale.
// In ogni altro caso il saluto diventa "Gentile cliente".
function greetingName(value) {
  const name = singleLine(value, MAX_NAME_LENGTH);
  if (!name || name.length > MAX_GREETING_NAME_LENGTH) return "cliente";
  if (/\d/.test(name)) return "cliente";
  if (/https?:|www\.|:\/\/|@|[<>{}\[\]\\|]/i.test(name)) return "cliente";
  if (/\.[a-z]{2,}(?:\/|$|\s)/i.test(name)) return "cliente";
  return name;
}

function resolveRequestType(value) {
  const key = str(value).toLowerCase();
  return Object.prototype.hasOwnProperty.call(REQUEST_TYPE_NAMES, key) ? key : DEFAULT_REQUEST_TYPE;
}

function safeFilename(value) {
  return String(value || "")
    .replace(/[\/\\:*?"<>|]/g, "_")
    .replace(/\.\./g, "_")
    .trim()
    .slice(0, 180);
}

async function sendWhatsAppWebhook(payload) {
  const url = str(process.env.CM_WHATSAPP_WEBHOOK_URL);
  if (!url) return { configured: false, sent: false };

  try {
    const headers = { "Content-Type": "application/json" };
    if (process.env.CM_WHATSAPP_WEBHOOK_SECRET) {
      headers["x-cm-webhook-secret"] = process.env.CM_WHATSAPP_WEBHOOK_SECRET;
    }
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error("CM Consulting API - WhatsApp webhook error:", response.status);
      return { configured: true, sent: false };
    }
    return { configured: true, sent: true };
  } catch (error) {
    console.error("CM Consulting API - WhatsApp webhook unavailable:", error);
    return { configured: true, sent: false };
  }
}

async function verifyTurnstile(token, ip) {
  if (!token) return { success: false, error: "Verifica anti-spam mancante." };

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
    ...(ip ? { remoteip: ip } : {})
  });

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!response.ok) return { success: false, error: "Verifica anti-spam non disponibile." };
    const result = await response.json().catch(() => ({}));
    return {
      success: result.success === true,
      error: result.success === true ? null : "Verifica anti-spam non superata."
    };
  } catch {
    return { success: false, error: "Verifica anti-spam non disponibile." };
  }
}

async function verifyRecaptcha(token, ip) {
  if (!token) return { success: false, error: "Verifica anti-spam mancante." };

  const body = new URLSearchParams({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: token,
    ...(ip ? { remoteip: ip } : {})
  });

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!response.ok) return { success: false, error: "Verifica anti-spam non disponibile." };
    const result = await response.json().catch(() => ({}));

    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || "0.5");
    const scoreOk = typeof result.score !== "number" || result.score >= minScore;
    const ok = result.success === true && scoreOk;

    return {
      success: ok,
      score: result.score,
      error: ok ? null : "Verifica anti-spam non superata."
    };
  } catch {
    return { success: false, error: "Verifica anti-spam non disponibile." };
  }
}

// Selezione del captcha basata esclusivamente sulla configurazione server.
async function verifyCaptcha(token, ip) {
  if (str(process.env.TURNSTILE_SECRET_KEY)) return verifyTurnstile(token, ip);
  if (str(process.env.RECAPTCHA_SECRET_KEY)) return verifyRecaptcha(token, ip);

  if (process.env.VERCEL_ENV === "production") {
    // Fail-closed: in produzione il modulo non accetta invii senza anti-spam.
    console.error("CM Consulting API: captcha not configured in production.");
    return { success: false, notConfigured: true, error: "Servizio momentaneamente non disponibile." };
  }

  // Preview / sviluppo: captcha non configurato, invio consentito per i test.
  return { success: true, notConfigured: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, {
      ok: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Metodo non consentito." }
    });
  }

  const destinationEmail = str(process.env.CM_DESTINATION_EMAIL) || "info@cm-consulting.info";

  const rate = await consumeRateLimit(req, 'submit-request', 12, 900);
  if (!rate.allowed) {
    return json(res, 429, { ok: false, error: { code: 'RATE_LIMITED', message: 'Troppe richieste. Riprova tra qualche minuto.' } });
  }

  if (!process.env.RESEND_API_KEY || !process.env.CM_FROM_EMAIL) {
    console.error("CM Consulting API: missing email configuration.");
    return json(res, 503, {
      ok: false,
      error: { code: "EMAIL_SERVICE_NOT_CONFIGURED", message: "Servizio momentaneamente non disponibile." }
    });
  }

  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    return json(res, 415, {
      ok: false,
      error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "La richiesta deve essere JSON." }
    });
  }

  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};

    // Honeypot: any non-empty bot-only field rejects the request.
    const honeypot = [
      body.website, body.company_website, body.companyWebsite,
      body.homepage, body.url
    ].some(v => typeof v === "string" && v.trim() !== "");

    if (honeypot) {
      return json(res, 400, {
        ok: false,
        error: { code: "INVALID_REQUEST", message: "Non è stato possibile elaborare la richiesta." }
      });
    }

    const subject = str(body.subject);
    const text = str(body.text);

    if (!subject) {
      return json(res, 400, {
        ok: false,
        error: { code: "SUBJECT_REQUIRED", message: "L'oggetto della richiesta è obbligatorio." }
      });
    }
    if (subject.length > MAX_SUBJECT_LENGTH) {
      return json(res, 400, {
        ok: false,
        error: { code: "SUBJECT_TOO_LONG", message: "L'oggetto della richiesta è troppo lungo." }
      });
    }
    if (body.privacyAccepted !== true) {
      return json(res, 400, {
        ok: false,
        error: { code: "PRIVACY_REQUIRED", message: "È necessario accettare l’informativa privacy per inviare la richiesta." }
      });
    }

    if (!text) {
      return json(res, 400, {
        ok: false,
        error: { code: "MESSAGE_REQUIRED", message: "Il contenuto della richiesta è obbligatorio." }
      });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return json(res, 400, {
        ok: false,
        error: { code: "MESSAGE_TOO_LONG", message: "Il contenuto della richiesta è troppo lungo." }
      });
    }

    const customerName = singleLine(body.customerName || body.name || body.contactName, MAX_NAME_LENGTH);
    const phone = singleLine(body.phone || body.contactPhone, MAX_PHONE_LENGTH);
    const company = singleLine(body.company, MAX_COMPANY_LENGTH);
    const requestType = resolveRequestType(body.requestType);
    const requestTypeName = REQUEST_TYPE_NAMES[requestType];
    const email = str(body.email || body.emailAddress || body.customerEmail);
    if (email && !validEmail(email)) {
      return json(res, 400, {
        ok: false,
        error: { code: "INVALID_EMAIL", message: "L'indirizzo email non è valido." }
      });
    }

    const forwarded = req.headers["x-forwarded-for"];
    const ip = typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : String(req.headers["x-real-ip"] || "");

    const token = str(body.captchaToken || body.turnstileToken || body.recaptchaToken);
    const captcha = await verifyCaptcha(token, ip);

    if (!captcha.success) {
      return json(res, captcha.notConfigured ? 503 : 403, {
        ok: false,
        error: {
          code: captcha.notConfigured ? "ANTI_SPAM_NOT_CONFIGURED" : "ANTI_SPAM_FAILED",
          message: captcha.error || "Verifica anti-spam non superata."
        }
      });
    }

    const attachments = Array.isArray(body.attachments) ? body.attachments : [];

    if (attachments.length > MAX_ATTACHMENTS) {
      return json(res, 400, {
        ok: false,
        error: { code: "TOO_MANY_ATTACHMENTS", message: `Sono consentiti massimo ${MAX_ATTACHMENTS} allegati.` }
      });
    }

    let totalSize = 0;
    const safeAttachments = [];

    for (const item of attachments) {
      if (!item || typeof item !== "object") {
        return json(res, 400, {
          ok: false,
          error: { code: "INVALID_ATTACHMENT", message: "Un allegato non è valido." }
        });
      }

      const filename = safeFilename(item.filename);
      const pathname = str(item.pathname);
      const type = str(item.contentType || item.type || "application/octet-stream").toLowerCase();

      if (!filename || !pathname) {
        return json(res, 400, {
          ok: false,
          error: { code: "INVALID_ATTACHMENT", message: "Riferimento o nome di un allegato non valido." }
        });
      }

      if (!ALLOWED_ATTACHMENT_TYPES.has(type)) {
        return json(res, 400, {
          ok: false,
          error: { code: "ATTACHMENT_TYPE_NOT_ALLOWED", message: `Tipo di file non consentito: ${type}.` }
        });
      }

      const scan = await scanBlobAttachment({
        pathname,
        filename,
        contentType: type
      });

      if (!scan.clean) {
        console.warn(
          'CM Consulting API - Blob attachment rejected:',
          filename,
          scan.reason
        );

        return json(res, 400, {
          ok: false,
          error: {
            code: 'ATTACHMENT_SECURITY_REJECTED',
            message: `L’allegato "${filename}" non ha superato i controlli di sicurezza.`
          }
        });
      }

      const size = Number(scan.size);

      if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_ATTACHMENT_SIZE) {
        return json(res, 400, {
          ok: false,
          error: {
            code: "ATTACHMENT_TOO_LARGE",
            message: `L'allegato "${filename}" ha una dimensione non consentita.`
          }
        });
      }

      totalSize += size;

      if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
        return json(res, 400, {
          ok: false,
          error: {
            code: "TOTAL_ATTACHMENTS_TOO_LARGE",
            message: "La dimensione complessiva degli allegati è troppo elevata."
          }
        });
      }

      const validUntil = Date.now() + 10 * 60 * 1000;

      const signedToken = await issueSignedToken({
        pathname,
        operations: ['get'],
        validUntil,
        oidcToken: process.env.VERCEL_OIDC_TOKEN,
        storeId: process.env.BLOB_STORE_ID
      });

      const { presignedUrl } = await presignUrl(signedToken, {
        pathname,
        operation: 'get',
        access: 'private',
        validUntil,
        useCache: false
      });

      safeAttachments.push({
        filename,
        path: presignedUrl
      });
    }

    const requestSave = await fetch(
      `${str(process.env.SUPABASE_URL).replace(/\/$/, '')}/rest/v1/admin_requests`,
      {
        method: "POST",
        headers: {
          apikey: str(process.env.SUPABASE_SERVICE_ROLE_KEY),
          Authorization: `Bearer ${str(process.env.SUPABASE_SERVICE_ROLE_KEY)}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          customer_name: customerName || null,
          company: company || null,
          email: email || null,
          phone: phone || null,
          request_type: requestTypeName,
          subject,
          request_text: text,
          attachments_count: safeAttachments.length,
          attachment_names: safeAttachments.map(item => item.filename),
          status: "Nuova"
        })
      }
    );

    if (!requestSave.ok) {
      console.error("CM Consulting API - request database save failed:", requestSave.status);
      return json(res, 503, {
        ok: false,
        error: {
          code: "REQUEST_SAVE_FAILED",
          message: "La richiesta non è stata registrata. Riprova tra poco."
        }
      });
    }

    const from = process.env.CM_FROM_EMAIL;
    const internalText = [
      `Nome e cognome: ${customerName || '—'}`,
      `Email: ${email || '—'}`,
      `Telefono: ${phone || '—'}`,
      `Tipologia: ${requestTypeName}`,
      `Allegati ricevuti: ${safeAttachments.length}`,
      "",
      "RICHIESTA",
      text
    ].join("\n");

    const payload = {
      from,
      to: [destinationEmail],
      subject,
      ...(email ? { reply_to: email } : {}),
      text: internalText,
      attachments: safeAttachments
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let result = {};
    try { result = await response.json(); } catch {}

    if (!response.ok) {
      console.error("CM Consulting API - email provider error:", result);
      return json(res, 502, {
        ok: false,
        error: { code: "EMAIL_SEND_FAILED", message: "La richiesta non è stata inviata. Riprova tra poco." }
      });
    }

    let confirmation = { sent: false, reason: "NO_CUSTOMER_EMAIL" };
    if (email) {
      // La conferma va a un indirizzo non verificato: contiene SOLO testo
      // fisso, la tipologia calcolata lato server e un saluto validato.
      // Nessun contenuto libero inserito nel modulo viene ripetuto.
      const confirmationText = [
        `Gentile ${greetingName(customerName)},`,
        "",
        "la tua richiesta è stata presa in carico.",
        `Tipologia: ${requestTypeName}`,
        "",
        "CM Consulting verificherà le informazioni ricevute e ti contatterà se saranno necessari ulteriori dati o documenti per completare l'istruttoria.",
        "",
        "CM Consulting di Carmelo Migliore",
        "Intermediazione assicurativa"
      ].join("\n");

      const confirmationResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: "Conferma ricezione richiesta — CM Consulting",
          text: confirmationText
        })
      });
      let confirmationResult = {};
      try { confirmationResult = await confirmationResponse.json(); } catch {}
      confirmation = { sent: confirmationResponse.ok, id: confirmationResult.id || null };
      if (!confirmationResponse.ok) console.error("CM Consulting API - customer confirmation error:", confirmationResult);
    }

    const whatsapp = await sendWhatsAppWebhook({
      event: "cm_request_submitted",
      destination: "+393286382612",
      customer: { name: customerName, email, phone },
      request: { type: requestType, typeName: requestTypeName, subject, text },
      attachmentsCount: safeAttachments.length,
      submittedAt: new Date().toISOString()
    });

    const message = "Richiesta inviata correttamente.";

    return json(res, 200, {
      ok: true,
      message,
      id: result.id || null,
      attachmentsReceived: safeAttachments.length,
      missingDocuments: safeAttachments.length === 0,
      customerConfirmationSent: confirmation.sent,
      whatsappWebhookConfigured: whatsapp.configured,
      whatsappWebhookSent: whatsapp.sent
    });
  } catch (error) {
    console.error("CM Consulting API - internal error:", error);
    return json(res, 500, {
      ok: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Si è verificato un errore interno. Riprova più tardi." }
    });
  }
}