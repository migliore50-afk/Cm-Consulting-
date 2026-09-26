import crypto from 'node:crypto';
import { issueSignedToken, presignUrl } from '@vercel/blob';
import { consumeRateLimit } from './_security.js';

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeFilename(value) {
  const filename = str(value).normalize('NFKC');

  if (!filename || filename.length > 180) return '';
  if (filename === '.' || filename === '..') return '';
  if (/[\u0000-\u001f\u007f]/.test(filename)) return '';
  if (filename.includes('/') || filename.includes('\\')) return '';

  return filename;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({
      error: 'Metodo non consentito.'
    });
  }

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return res.status(415).json({
      error: 'La richiesta deve essere JSON.',
      code: 'UNSUPPORTED_MEDIA_TYPE'
    });
  }

  const rate = await consumeRateLimit(req, 'attachment-upload-url', 20, 900);
  if (!rate.allowed) {
    return res.status(429).setHeader('Retry-After', '900').json({
      error: 'Troppe richieste. Riprova più tardi.',
      code: 'RATE_LIMITED'
    });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Richiesta non valida.' });
  }

  const filename = safeFilename(body.filename);
  const requestedType = str(body.contentType).toLowerCase();
  const size = Number(body.size);

  if (!filename || !ALLOWED_TYPES.has(requestedType)) {
    return res.status(400).json({
      error: 'Tipo di allegato non consentito.',
      code: 'ATTACHMENT_TYPE_NOT_ALLOWED'
    });
  }

  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_ATTACHMENT_SIZE) {
    return res.status(400).json({
      error: "La dimensione dell'allegato non è consentita.",
      code: 'ATTACHMENT_TOO_LARGE'
    });
  }

  const pathname = `requests/${crypto.randomUUID()}/${filename}`;
  const validUntil = Date.now() + 15 * 60 * 1000;

  try {
    const signedToken = await issueSignedToken({
      pathname,
      operations: ['put'],
      validUntil,
      allowedContentTypes: [requestedType],
      maximumSizeInBytes: MAX_ATTACHMENT_SIZE,
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
      storeId: process.env.BLOB_STORE_ID,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      operation: 'put',
      pathname,
      access: 'private',
      validUntil,
      allowedContentTypes: [requestedType],
      maximumSizeInBytes: MAX_ATTACHMENT_SIZE,
      allowOverwrite: false,
    });

    return res.status(200).json({
      uploadUrl: presignedUrl,
      pathname,
      filename,
      contentType: requestedType,
      size,
      expiresAt: validUntil,
    });
  } catch (error) {
    console.error('attachment_upload_url_error', error?.message || error);

    return res.status(503).json({
      error: 'Servizio di caricamento temporaneamente non disponibile.'
    });
  }
}
