import { consumeRateLimit, scanAttachment } from './_security.js';
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
 */

const MAX_SUBJECT_LENGTH = 180;
const MAX_TEXT_LENGTH = 20000;
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

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function str(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeFilename(value) {
  return String(value || "")
    .replace(/[\/\\:*?"<>|]/g, "_")
    .replace(/\.\./g, "_")
    .trim()
    .slice(0, 180);
}

function base64Size(value) {
  if (typeof value !== "string") return 0;
  const s = value.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
  return s ? Math.floor((s.length * 3) / 4) : 0;
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
  if (!process.env.TURNSTILE_SECRET_KEY) return { configured: false, success: true };
  if (!token) return { configured: true, success: false, error: "Verifica anti-spam mancante." };

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
    ...(ip ? { remoteip: ip } : {})
  });

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) return { configured: true, success: false, error: "Verifica anti-spam non disponibile." };
  const result = await response.json();

  return {
    configured: true,
    success: Boolean(result.success),
    error: result.success ? null : "Verifica anti-spam non superata."
  };
}

async function verifyRecaptcha(token, ip) {
  if (!process.env.RECAPTCHA_SECRET_KEY) return { configured: false, success: true };
  if (!token) return { configured: true, success: false, error: "Verifica anti-spam mancante." };

  const body = new URLSearchParams({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: token,
    ...(ip ? { remoteip: ip } : {})
  });

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) return { configured: true, success: false, error: "Verifica anti-spam non disponibile." };
  const result = await response.json();

  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || "0.5");
  const scoreOk = typeof result.score !== "number" || result.score >= minScore;

  return {
    configured: true,
    success: Boolean(result.success && scoreOk),
    score: result.score,
    error: result.success && scoreOk ? null : "Verifica anti-spam non superata."
  };
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

    const customerName = str(body.customerName || body.name || body.contactName);
    const phone = str(body.phone || body.contactPhone);
    const requestTypeName = str(body.requestTypeName || body.typeName);
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

    const provider = str(body.captchaProvider).toLowerCase();
    const token = str(body.captchaToken || body.turnstileToken || body.recaptchaToken);

    let captcha = { configured: false, success: true };
    if (provider === "turnstile" || process.env.TURNSTILE_SECRET_KEY) {
      captcha = await verifyTurnstile(token, ip);
    } else if (provider === "recaptcha" || process.env.RECAPTCHA_SECRET_KEY) {
      captcha = await verifyRecaptcha(token, ip);
    }

    if (!captcha.success) {
      return json(res, 403, {
        ok: false,
        error: { code: "ANTI_SPAM_FAILED", message: captcha.error || "Verifica anti-spam non superata." }
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
      const content = item.content;
      const type = str(item.contentType || item.type || "application/octet-stream").toLowerCase();

      if (!filename || !content) {
        return json(res, 400, {
          ok: false,
          error: { code: "INVALID_ATTACHMENT", message: "Nome o contenuto di un allegato non valido." }
        });
      }

      if (!ALLOWED_ATTACHMENT_TYPES.has(type)) {
        return json(res, 400, {
          ok: false,
          error: { code: "ATTACHMENT_TYPE_NOT_ALLOWED", message: `Tipo di file non consentito: ${type}.` }
        });
      }

      const size = base64Size(content);
      if (size > MAX_ATTACHMENT_SIZE) {
        return json(res, 400, {
          ok: false,
          error: { code: "ATTACHMENT_TOO_LARGE", message: `L'allegato "${filename}" è troppo grande.` }
        });
      }

      totalSize += size;
      if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
        return json(res, 400, {
          ok: false,
          error: { code: "TOTAL_ATTACHMENTS_TOO_LARGE", message: "La dimensione complessiva degli allegati è troppo elevata." }
        });
      }

      const scan = await scanAttachment({ filename, content, contentType: type });
      if (!scan.clean) {
        console.warn('CM Consulting API - attachment rejected:', filename, scan.reason);
        return json(res, 400, { ok: false, error: { code: 'ATTACHMENT_SECURITY_REJECTED', message: `L’allegato "${filename}" non ha superato i controlli di sicurezza.` } });
      }

      safeAttachments.push({ filename, content });
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
          company: str(body.company) || null,
          email: email || null,
          phone: phone || null,
          request_type: requestTypeName || subject,
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
      `Tipologia: ${requestTypeName || '—'}`,
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
      const confirmationText = [
        `Gentile ${customerName || 'cliente'},`,
        "",
        "abbiamo ricevuto correttamente la tua richiesta di valutazione.",
        `Tipologia: ${requestTypeName || 'Valutazione generica'}`,
        `Allegati ricevuti: ${safeAttachments.length}`,
        "",
        "Riepilogo della richiesta:",
        text,
        "",
        "CM Consulting valuterà la documentazione e ti contatterà per i prossimi passaggi.",
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
      request: { type: body.requestType || '', typeName: requestTypeName, subject, text },
      attachmentsCount: safeAttachments.length,
      submittedAt: new Date().toISOString()
    });

    const message = safeAttachments.length
      ? "Richiesta inviata correttamente."
      : "Richiesta inviata. Per velocizzare l’istruttoria puoi inviarci i documenti via email o WhatsApp.";

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
