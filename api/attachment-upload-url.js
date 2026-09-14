import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { consumeRateLimit } from './_security.js';

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const BUCKET = process.env.CM_ATTACHMENT_BUCKET || 'request-attachments';

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeApiKey(value) {
  const key = str(value);
  return key.startsWith('eyJ') ? key.replace(/\s+/g, '') : key;
}

function safeFilename(value) {
  const filename = str(value).normalize('NFKC');

  if (!filename || filename.length > 180) return '';
  if (filename === '.' || filename === '..') return '';
  if (/[\u0000-\u001f\u007f]/.test(filename)) return '';
  if (filename.includes('/') || filename.includes('\\')) return '';

  return filename;
}

function supabaseAdmin() {
  const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
  const serviceRoleKey = normalizeApiKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const secretKey = normalizeApiKey(process.env.SUPABASE_SECRET_KEY);
  const apiKey = secretKey || serviceRoleKey;

  if (!url || !apiKey) {
    throw new Error('Supabase server configuration is missing.');
  }

  return createClient(url, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .setHeader('Allow', 'POST')
      .json({ error: 'Metodo non consentito.' });
  }

  const rate = await consumeRateLimit(req, 'attachment-upload-url', 20, 900);
  if (!rate.allowed) {
    return res
      .status(429)
      .setHeader('Retry-After', '900')
      .json({ error: 'Troppe richieste. Riprova più tardi.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Richiesta non valida.' });
  }

  const filename = safeFilename(body.filename);
  const contentType = str(body.contentType).toLowerCase();
  const size = Number(body.size);

  if (!filename || !ALLOWED_TYPES.has(contentType)) {
    return res.status(400).json({ error: 'Tipo di allegato non consentito.' });
  }

  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_ATTACHMENT_SIZE) {
    return res.status(400).json({ error: "La dimensione dell'allegato non è consentita." });
  }

  const path = `requests/${crypto.randomUUID()}/${filename}`;

  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path, { upsert: false });

    if (error || !data?.token) {
      console.error('CM Consulting API - Supabase signed upload error:', error?.message || error);
      return res.status(503).json({
        error: 'Servizio di caricamento temporaneamente non disponibile.'
      });
    }

    return res.status(200).json({
      bucket: BUCKET,
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      filename,
      contentType,
      size,
      expiresAt: Date.now() + 2 * 60 * 60 * 1000
    });
  } catch (error) {
    console.error('CM Consulting API - attachment upload configuration error:', error?.message || error);
    return res.status(503).json({
      error: 'Servizio di caricamento temporaneamente non disponibile.'
    });
  }
}
