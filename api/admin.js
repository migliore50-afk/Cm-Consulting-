/**
 * CM Consulting — API di amministrazione protetta
 * Accesso diretto con password (MFA disabilitato permanentemente)
 */

import crypto from 'node:crypto';

const COOKIE = 'cm_admin_session';
const SESSION_TTL = 8 * 60 * 60;
const IDLE_TTL = 15 * 60;
const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW = 15 * 60;

function str(v) { return typeof v === 'string' ? v.trim() : ''; }
function json(res, status, payload) { return res.status(status).json(payload); }
function token() { return crypto.randomBytes(32).toString('base64url'); }
function now() { return Math.floor(Date.now() / 1000); }

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : String(req.headers['x-real-ip'] || 'unknown');
}

function parseCookies(req) {
  const raw = String(req.headers.cookie || '');
  return Object.fromEntries(
    raw.split(';')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => {
        const i = v.indexOf('=');
        return i < 0 ? [v, ''] : [v.slice(0, i), decodeURIComponent(v.slice(i + 1))];
      })
  );
}

function clearCookie(res, name) {
  res.setHeader(
    'Set-Cookie',
    `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`
  );
}

function cookieString(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

function supabaseConfig() {
  const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
  const key = str(process.env.SUPABASE_ANON_KEY);
  if (!url || !key) throw new Error('Supabase non configurabile.');
  return { url, key };
}

async function supabaseFetch(path, { method = 'GET', accessToken, body } = {}) {
  const { url, key } = supabaseConfig();
  const h = { apikey: key, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) };
  if (body !== undefined) h['Content-Type'] = 'application/json';

  const response = await fetch(`${url}${path}`, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

async function redis(path, { method = 'GET', body } = {}) {
  const url = str(process.env.UPSTASH_REDIS_REST_URL).replace(/\/$/, '');
  const tokenValue = str(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !tokenValue) throw new Error('Redis non configurabile.');

  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${tokenValue}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    },
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  });

  const data = await response.json().catch(() => ({}));
  return data.result;
}

async function redisGet(key) { return redis(`/get/${encodeURIComponent(key)}`); }
async function redisSet(key, value, ttl) { return redis(`/set/${encodeURIComponent(key)}?EX=${ttl}`, { method: 'POST', body: value }); }
async function redisDel(key) { return redis(`/del/${encodeURIComponent(key)}`); }
async function redisIncr(key, ttl) {
  const value = Number(await redis(`/incr/${encodeURIComponent(key)}`));
  if (value === 1) await redis(`/expire/${encodeURIComponent(key)}/${ttl}`);
  return value;
}

async function rateLimitLogin(ip, email) {
  const keys = [`cm:admin:login:ip:${ip}`, `cm:admin:login:email:${email.toLowerCase()}`];
  const counts = [];
  for (const key of keys) counts.push(Number(await redisGet(key) || 0));
  return { blocked: counts.some(n => n >= MAX_LOGIN_FAILURES) };
}

async function recordLoginFailure(ip, email) {
  await Promise.all([
    redisIncr(`cm:admin:login:ip:${ip}`, LOGIN_WINDOW),
    redisIncr(`cm:admin:login:email:${email.toLowerCase()}`, LOGIN_WINDOW)
  ]);
}

async function clearLoginFailures(ip, email) {
  await Promise.all([
    redisDel(`cm:admin:login:ip:${ip}`),
    redisDel(`cm:admin:login:email:${email.toLowerCase()}`)
  ]);
}

function originAllowed(req) {
  const origin = str(req.headers.origin);
  if (!origin) return true;
  const configured = str(process.env.SITE_URL).replace(/\/$/, '');
  if (configured) return origin === configured;
  const proto = str(req.headers['x-forwarded-proto'] || 'https');
  const host = str(req.headers.host);
  return origin === `${proto}://${host}`;
}

async function createStoredSession({ userId, email, accessToken, refreshToken }) {
  const id = token();
  const ts = now();
  const record = { userId, email, accessToken, refreshToken, aal: 'aal2', createdAt: ts, lastActivityAt: ts };
  await redisSet(`cm:admin:session:${id}`, JSON.stringify(record), SESSION_TTL);
  return id;
}

async function getStoredSession(id) {
  if (!id) return null;
  const raw = await redisGet(`cm:admin:session:${id}`);
  if (!raw) return null;
  try { return { key: id, ...JSON.parse(raw) }; } catch { return null; }
}

async function touchSession(session) {
  session.lastActivityAt = now();
  const remaining = Math.max(60, SESSION_TTL - (session.lastActivityAt - session.createdAt));
  await redisSet(`cm:admin:session:${session.key}`, JSON.stringify(session), remaining);
}

async function requireAdmin(req, res) {
  const cookies = parseCookies(req);
  const session = await getStoredSession(cookies[COOKIE]);
  if (!session) { clearCookie(res, COOKIE); return null; }

  const current = now();
  if ((current - Number(session.lastActivityAt || 0)) > IDLE_TTL || (current - Number(session.createdAt || 0)) > SESSION_TTL) {
    await redisDel(`cm:admin:session:${session.key}`);
    clearCookie(res, COOKIE);
    return null;
  }

  let userResult = await supabaseFetch('/auth/v1/user', { accessToken: session.accessToken });
  if (userResult.response.status === 401 && session.refreshToken) {
    const refreshed = await supabaseFetch('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: session.refreshToken }
    });
    if (!refreshed.response.ok || !refreshed.data?.access_token) {
      await redisDel(`cm:admin:session:${session.key}`);
      clearCookie(res, COOKIE);
      return null;
    }
    session.accessToken = refreshed.data.access_token;
    session.refreshToken = refreshed.data.refresh_token || session.refreshToken;
    userResult = await supabaseFetch('/auth/v1/user', { accessToken: session.accessToken });
  }

  if (!userResult.response.ok || userResult.data?.email?.toLowerCase() !== str(process.env.CM_ADMIN_EMAIL).toLowerCase()) {
    await redisDel(`cm:admin:session:${session.key}`);
    clearCookie(res, COOKIE);
    return null;
  }

  await touchSession(session);
  return { session, user: userResult.data };
}

async function dbRequest(path, { method = 'GET', body } = {}) {
  const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
  const serviceKey = str(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

function cleanPractice(body) {
  const client = str(body.client);
  const type = str(body.type);
  const expiry = str(body.expiry);
  const email = str(body.email);
  const notes = str(body.notes);
  const clientPrice = body.clientPrice === '' || body.clientPrice == null ? null : Number(body.clientPrice);
  const reviewerCost = body.reviewerCost === '' || body.reviewerCost == null ? null : Number(body.reviewerCost);

  if (!client || client.length > 180 || !type || type.length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
    throw new Error('Dati pratica non validi.');
  }
  return { client, type, expiry, email: email || null, client_price: clientPrice, reviewer_cost: reviewerCost, notes: notes || null };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!originAllowed(req)) return json(res, 403, { ok: false, error: { code: 'BAD_ORIGIN', message: 'Origine non consentita.' } });

  const action = str(req.query?.action || 'session');

  try {
    if (action === 'public-config' && req.method === 'GET') {
      const { url, key } = supabaseConfig();
      return json(res, 200, { ok: true, supabaseUrl: url, supabaseAnonKey: key });
    }

    if (action === 'login' && req.method === 'POST') {
      const body = req.body || {};
      const email = str(body.email);
      const password = typeof body.password === 'string' ? body.password : '';

      const ip = getIp(req);
      const limiter = await rateLimitLogin(ip, email);
      if (limiter.blocked) return json(res, 429, { ok: false, error: { code: 'LOGIN_LOCKED', message: 'Troppi tentativi. Riprova più tardi.' } });

      const auth = await supabaseFetch('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: { email, password }
      });

      if (!auth.response.ok || !auth.data?.access_token) {
        await recordLoginFailure(ip, email);
        return json(res, 401, { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenziali non valide.' } });
      }

      const user = auth.data.user;
      if (!user?.email || user.email.toLowerCase() !== str(process.env.CM_ADMIN_EMAIL).toLowerCase()) {
        await recordLoginFailure(ip, email);
        return json(res, 403, { ok: false, error: { code: 'FORBIDDEN', message: 'Non autorizzato.' } });
      }

      await clearLoginFailures(ip, email);

      const sessionId = await createStoredSession({
        userId: user.id,
        email: user.email,
        accessToken: auth.data.access_token,
        refreshToken: auth.data.refresh_token
      });

      res.setHeader('Set-Cookie', cookieString(COOKIE, sessionId, SESSION_TTL));
      return json(res, 200, { ok: true, state: 'authenticated' });
    }

    if (action === 'session' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, authenticated: false });
      return json(res, 200, { ok: true, authenticated: true, user: { id: auth.user.id, email: auth.user.email }, idleTimeoutSeconds: IDLE_TTL });
    }

    if (action === 'logout' && req.method === 'POST') {
      const cookies = parseCookies(req);
      const session = await getStoredSession(cookies[COOKIE]);
      if (session) {
        await supabaseFetch('/auth/v1/logout', { method: 'POST', accessToken: session.accessToken }).catch(() => {});
        await redisDel(`cm:admin:session:${session.key}`);
      }
      clearCookie(res, COOKIE);
      return json(res, 200, { ok: true });
    }

    if (action === 'password' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });

      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      const r = await supabaseFetch('/auth/v1/user', {
        method: 'PUT',
        accessToken: auth.session.accessToken,
        body: { password }
      });
      if (!r.response.ok) return json(res, 400, { ok: false, error: { code: 'PASSWORD_UPDATE_FAILED', message: 'Modifica fallita.' } });
      return json(res, 200, { ok: true });
    }

    if (action === 'practices' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const r = await dbRequest('admin_practices?select=*&order=expiry.asc,created_at.desc');
      if (!r.response.ok) return json(res, 503, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Errore archivio.' } });
      return json(res, 200, { ok: true, practices: r.data || [] });
    }

    if (action === 'practices' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const practice = cleanPractice(req.body || {});
      const r = await dbRequest('admin_practices', { method: 'POST', body: { ...practice, created_by: auth.user.id } });
      if (!r.response.ok) return json(res, 400, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Salvataggio fallito.' } });
      return json(res, 200, { ok: true, practice: r.data?.[0] || null });
    }

    if (action === 'practice' && req.method === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const id = str(req.query?.id);
      const patch = {};
      if ('checked' in (req.body || {})) patch.checked = Boolean(req.body.checked);
      if ('notes' in (req.body || {})) patch.notes = str(req.body.notes).slice(0, 10000);
      const r = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: patch });
      if (!r.response.ok) return json(res, 400, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Aggiornamento fallito.' } });
      return json(res, 200, { ok: true, practice: r.data?.[0] || null });
    }

    if (action === 'practice' && req.method === 'DELETE') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const id = str(req.query?.id);
      const r = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!r.response.ok) return json(res, 400, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Cancellazione fallita.' } });
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'Non trovato.' } });
  } catch (error) {
    return json(res, 503, { ok: false, error: { code: 'SERVER_ERROR', message: 'Errore temporaneo.' } });
  }
}
