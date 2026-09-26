import { del, list } from '@vercel/blob';

const RETENTION_MS = 24 * 60 * 60 * 1000;
const PREFIX = 'requests/';

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function authorized(req) {
  const secret = String(process.env.CRON_SECRET || '').trim();
  const auth = String(req.headers.authorization || '');
  return Boolean(secret) && auth === `Bearer ${secret}`;
}

async function loadLinkedPaths() {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!base || !key) throw new Error('Supabase cleanup configuration missing');

  const response = await fetch(
    `${base}/rest/v1/admin_requests?select=attachment_paths&attachment_paths=not.is.null`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    }
  );

  if (!response.ok) throw new Error(`Supabase request list failed: ${response.status}`);

  const rows = await response.json().catch(() => []);
  const linked = new Set();

  for (const row of Array.isArray(rows) ? rows : []) {
    for (const pathname of Array.isArray(row?.attachment_paths) ? row.attachment_paths : []) {
      const safe = typeof pathname === 'string' ? pathname.trim() : '';
      if (safe.startsWith(PREFIX)) linked.add(safe);
    }
  }

  return linked;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { ok: false, error: 'Metodo non consentito.' });
  }

  if (!authorized(req)) {
    return json(res, 401, { ok: false, error: 'Unauthorized.' });
  }

  try {
    const linked = await loadLinkedPaths();
    const cutoff = Date.now() - RETENTION_MS;

    let cursor;
    let scanned = 0;
    let deleted = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await list({
        prefix: PREFIX,
        limit: 1000,
        ...(cursor ? { cursor } : {})
      });

      for (const blob of result.blobs || []) {
        scanned += 1;

        const pathname = String(blob?.pathname || '');
        const uploadedAt = new Date(blob?.uploadedAt || 0).getTime();

        if (!pathname.startsWith(PREFIX)) continue;
        if (linked.has(pathname)) continue;
        if (!Number.isFinite(uploadedAt) || uploadedAt > cutoff) continue;

        await del(pathname);
        deleted += 1;
      }

      hasMore = result.hasMore === true;
      cursor = result.cursor;
    }

    return json(res, 200, {
      ok: true,
      scanned,
      deleted,
      retainedLinked: linked.size
    });
  } catch (error) {
    console.error('attachment_cleanup_error', error?.message || error);
    return json(res, 503, {
      ok: false,
      error: 'Pulizia allegati temporaneamente non disponibile.'
    });
  }
}
