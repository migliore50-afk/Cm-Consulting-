import { generateMupDocx } from './mup-docx.js';
import { generateMupPdf } from './mup-pdf.js';
import { issueSignedToken, presignUrl, get } from '@vercel/blob';
import { extractFacsimile } from './facsimile-extract.js';
/**
 * CM Consulting — API di amministrazione protetta
 * Autenticazione con password + MFA TOTP obbligatorio
 */

import crypto from 'node:crypto';

const COOKIE = 'cm_admin_session';
const MFA_COOKIE = 'cm_admin_mfa';

const SESSION_TTL = 8 * 60 * 60;
const IDLE_TTL = 15 * 60;
const MFA_PENDING_TTL = 14 * 60;

const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW = 15 * 60;

const MAX_MFA_FAILURES = 5;
const MFA_WINDOW = 15 * 60;

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function token() {
  return crypto.randomBytes(32).toString('base64url');
}

function now() {
  return Math.floor(Date.now() / 1000);
}

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
        if (i < 0) return [v, ''];
        let value = '';
        try {
          value = decodeURIComponent(v.slice(i + 1));
        } catch {
          value = '';
        }
        return [v.slice(0, i), value];
      })
  );
}

function clearCookie(res, name) {
  res.setHeader(
    'Set-Cookie',
    `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`
  );
}

function clearCookies(res) {
  res.setHeader('Set-Cookie', [
    `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`,
    `${MFA_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`
  ]);
}

function cookieString(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

function supabaseConfig() {
  const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
  const key = str(process.env.SUPABASE_ANON_KEY);
  if (!url || !key) {
    throw new Error('Supabase non configurabile.');
  }
  return { url, key };
}

async function supabaseFetch(path, { method = 'GET', accessToken, body } = {}) {
  const { url, key } = supabaseConfig();
  const headers = {
    apikey: key,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${url}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

async function supabaseMfaFetch(path, { method = 'GET', accessToken, body } = {}) {
  return supabaseFetch(`/auth/v1${path}`, { method, accessToken, body });
}

async function supabaseFactors(accessToken) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`
    }
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
}

async function redis(path, { method = 'GET', body } = {}) {
  const url = str(process.env.UPSTASH_REDIS_REST_URL).replace(/\/$/, '');
  const tokenValue = str(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !tokenValue) {
    throw new Error('Redis non configurabile.');
  }
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${tokenValue}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    },
    body: body !== undefined
      ? (typeof body === 'string' ? body : JSON.stringify(body))
      : undefined
  });
  const data = await response.json().catch(() => ({}));
  return data.result;
}

async function redisGet(key) { return redis(`/get/${encodeURIComponent(key)}`); }
async function redisSet(key, value, ttl) {
  return redis(`/set/${encodeURIComponent(key)}?EX=${ttl}`, { method: 'POST', body: value });
}
async function redisDel(key) { return redis(`/del/${encodeURIComponent(key)}`); }
async function redisIncr(key, ttl) {
  const value = Number(await redis(`/incr/${encodeURIComponent(key)}`));
  if (value === 1) {
    await redis(`/expire/${encodeURIComponent(key)}/${ttl}`);
  }
  return value;
}

async function rateLimitLogin(ip, email) {
  const keys = [
    `cm:admin:login:ip:${ip}`,
    `cm:admin:login:email:${email.toLowerCase()}`
  ];
  const counts = [];
  for (const key of keys) {
    counts.push(Number(await redisGet(key) || 0));
  }
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

async function rateLimitMfa(userId, ip) {
  const keys = [
    `cm:admin:mfa:user:${userId}`,
    `cm:admin:mfa:ip:${ip}`
  ];
  const counts = [];
  for (const key of keys) {
    counts.push(Number(await redisGet(key) || 0));
  }
  return { blocked: counts.some(n => n >= MAX_MFA_FAILURES) };
}

async function recordMfaFailure(userId, ip) {
  await Promise.all([
    redisIncr(`cm:admin:mfa:user:${userId}`, MFA_WINDOW),
    redisIncr(`cm:admin:mfa:ip:${ip}`, MFA_WINDOW)
  ]);
}

async function clearMfaFailures(userId, ip) {
  await Promise.all([
    redisDel(`cm:admin:mfa:user:${userId}`),
    redisDel(`cm:admin:mfa:ip:${ip}`)
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

function jwtPayload(accessToken) {
  if (!accessToken) return null;
  const parts = accessToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function jwtAal(accessToken) { return str(jwtPayload(accessToken)?.aal); }
function jwtSubject(accessToken) { return str(jwtPayload(accessToken)?.sub); }
function isAal2(accessToken) { return jwtAal(accessToken) === 'aal2'; }

function qrDataUrl(qrCode) {
  if (!qrCode) return '';
  if (qrCode.startsWith('data:image/')) return qrCode;
  return `data:image/svg+xml;utf-8,${encodeURIComponent(qrCode)}`;
}

async function createStoredSession({ userId, email, accessToken, refreshToken }) {
  if (!isAal2(accessToken)) {
    throw new Error('Sessione Supabase non AAL2.');
  }
  const id = token();
  const ts = now();
  const record = {
    userId, email, accessToken, refreshToken,
    aal: 'aal2', createdAt: ts, lastActivityAt: ts
  };
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
  if (
    (current - Number(session.lastActivityAt || 0)) > IDLE_TTL ||
    (current - Number(session.createdAt || 0)) > SESSION_TTL
  ) {
    await redisDel(`cm:admin:session:${session.key}`);
    clearCookie(res, COOKIE);
    return null;
  }

  if (!isAal2(session.accessToken)) {
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

    if (!isAal2(session.accessToken)) {
      await redisDel(`cm:admin:session:${session.key}`);
      clearCookie(res, COOKIE);
      return null;
    }

    userResult = await supabaseFetch('/auth/v1/user', { accessToken: session.accessToken });
  }

  if (
    !userResult.response.ok ||
    userResult.data?.email?.toLowerCase() !== str(process.env.CM_ADMIN_EMAIL).toLowerCase()
  ) {
    await redisDel(`cm:admin:session:${session.key}`);
    clearCookie(res, COOKIE);
    return null;
  }

  if (
    jwtSubject(session.accessToken) &&
    jwtSubject(session.accessToken) !== String(userResult.data?.id || '')
  ) {
    await redisDel(`cm:admin:session:${session.key}`);
    clearCookie(res, COOKIE);
    return null;
  }

  await touchSession(session);
  return { session, user: userResult.data };
}

async function createMfaPendingSession({
  userId, email, accessToken, refreshToken, factorId, mode, challengeId = null
}) {
  const id = token();
  const ts = now();
  const record = {
    userId, email, accessToken, refreshToken,
    factorId, mode, challengeId, createdAt: ts
  };
  await redisSet(`cm:admin:mfa:${id}`, JSON.stringify(record), MFA_PENDING_TTL);
  return id;
}

async function getMfaPendingSession(id) {
  if (!id) return null;
  const raw = await redisGet(`cm:admin:mfa:${id}`);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (now() - Number(session.createdAt || 0) > MFA_PENDING_TTL) {
      await redisDel(`cm:admin:mfa:${id}`);
      return null;
    }
    return { key: id, ...session };
  } catch {
    return null;
  }
}

async function touchMfaPendingSession(session) {
  await redisSet(`cm:admin:mfa:${session.key}`, JSON.stringify(session), MFA_PENDING_TTL);
}

async function deleteMfaPendingSession(id) {
  if (!id) return;
  await redisDel(`cm:admin:mfa:${id}`);
}

async function getTotpFactors(accessToken) {
  const result = await supabaseFactors(accessToken);
  if (!result.response.ok) {
    return { ok: false, verified: [], unverified: [] };
  }
  const factors = Array.isArray(result.data?.factors) ? result.data.factors : [];
  const totp = factors.filter(factor => factor?.factor_type === 'totp');
  return {
    ok: true,
    verified: totp.filter(factor => factor?.status === 'verified'),
    unverified: totp.filter(factor => factor?.status === 'unverified')
  };
}

async function enrollTotp(accessToken) {
  const result = await supabaseMfaFetch('/factors', {
    method: 'POST',
    accessToken,
    body: { factor_type: 'totp', friendly_name: 'CM Consulting Admin' }
  });
  if (!result.response.ok || !result.data?.id || !result.data?.totp) {
    return { ok: false, data: result.data };
  }
  return { ok: true, data: result.data };
}

async function createMfaChallenge(accessToken, factorId) {
  const result = await supabaseMfaFetch(`/factors/${encodeURIComponent(factorId)}/challenge`, {
    method: 'POST',
    accessToken
  });
  if (!result.response.ok || !result.data?.id) {
    return { ok: false, data: result.data };
  }
  return { ok: true, data: result.data };
}

async function verifyMfaChallenge({ accessToken, factorId, challengeId, code }) {
  return supabaseMfaFetch(`/factors/${encodeURIComponent(factorId)}/verify`, {
    method: 'POST',
    accessToken,
    body: { challenge_id: challengeId, code }
  });
}

async function finishMfaVerification({ req, res, pending, code }) {
  const ip = getIp(req);

  if (!/^\d{6}$/.test(code)) {
    return json(res, 400, {
      ok: false,
      error: { code: 'MFA_INVALID_CODE', message: 'Il codice TOTP deve contenere 6 cifre.' }
    });
  }

  const limiter = await rateLimitMfa(pending.userId, ip);
  if (limiter.blocked) {
    return json(res, 429, {
      ok: false,
      error: { code: 'MFA_LOCKED', message: 'Troppi tentativi MFA. Riprova più tardi.' }
    });
  }

  let challengeId = pending.challengeId;

  if (!challengeId) {
    const challenge = await createMfaChallenge(pending.accessToken, pending.factorId);
    if (!challenge.ok) {
      return json(res, 503, {
        ok: false,
        error: { code: 'MFA_CHALLENGE_FAILED', message: 'Impossibile preparare la verifica MFA.' }
      });
    }
    challengeId = challenge.data.id;
    pending.challengeId = challengeId;
    await touchMfaPendingSession(pending);
  }

  const verification = await verifyMfaChallenge({
    accessToken: pending.accessToken,
    factorId: pending.factorId,
    challengeId,
    code
  });

  if (!verification.response.ok || !verification.data?.access_token) {
    await recordMfaFailure(pending.userId, ip);

    if (verification.response.status === 401 || verification.response.status === 422) {
      return json(res, 401, {
        ok: false,
        error: { code: 'MFA_INVALID_CODE', message: 'Codice TOTP non valido.' }
      });
    }

    return json(res, 503, {
      ok: false,
      error: { code: 'MFA_VERIFY_FAILED', message: 'Verifica MFA temporaneamente non disponibile.' }
    });
  }

  const verifiedAccessToken = verification.data.access_token;
  const verifiedRefreshToken = verification.data.refresh_token || pending.refreshToken;

  /*
   * Fail-closed:
   * la sessione amministrativa viene creata solamente
   * se il token restituito da Supabase è realmente AAL2.
   */
  if (!isAal2(verifiedAccessToken)) {
    await deleteMfaPendingSession(pending.key);
    clearCookie(res, MFA_COOKIE);
    return json(res, 403, {
      ok: false,
      error: { code: 'MFA_AAL2_NOT_CONFIRMED', message: 'Secondo fattore non confermato.' }
    });
  }

  await clearMfaFailures(pending.userId, ip);

  const sessionId = await createStoredSession({
    userId: pending.userId,
    email: pending.email,
    accessToken: verifiedAccessToken,
    refreshToken: verifiedRefreshToken
  });

  await deleteMfaPendingSession(pending.key);

  res.setHeader('Set-Cookie', [
    cookieString(COOKIE, sessionId, SESSION_TTL),
    `${MFA_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`
  ]);

  return json(res, 200, { ok: true, state: 'authenticated' });
}

async function dbRequest(path, { method = 'GET', body } = {}) {
  const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
  const serviceKey = str(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) {
    throw new Error('Database non configurabile.');
  }
  const headers = {
    apikey: serviceKey,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  // Supabase new opaque secret keys (sb_secret_...) are API keys, not JWTs.
  // Do not send them as a Bearer JWT: let the Supabase API gateway derive
  // the authenticated service-role context from the apikey header.
  if (!serviceKey.startsWith('sb_secret_')) {
    headers.Authorization = `Bearer ${serviceKey}`;
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
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

  const clientPrice = body.clientPrice === '' || body.clientPrice == null
    ? null
    : Number(body.clientPrice);

  const reviewerCost = body.reviewerCost === '' || body.reviewerCost == null
    ? null
    : Number(body.reviewerCost);

  if (
    !client || client.length > 180 ||
    !type || type.length > 120 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(expiry)
  ) {
    throw new Error('Dati pratica non validi.');
  }

  return {
    client, type, expiry,
    email: email || null,
    client_price: clientPrice,
    reviewer_cost: reviewerCost,
    notes: notes || null
  };
}

// 22 settembre 2026 — archivio degli intermediari collaboratori (Sezione A/B)
// usato dal generatore MUP, così i loro dati non restano scritti a mano nel
// codice. partial=true per il PATCH (solo i campi effettivamente inviati
// vengono validati/aggiornati).
function cleanIntermediary(body, { partial = false } = {}) {
  const out = {};

  if (!partial || 'name' in body) {
    const name = str(body.name);
    if (!name || name.length > 180) throw new Error('Denominazione non valida.');
    out.name = name;
  }
  if (!partial || 'rui' in body) {
    const rui = str(body.rui);
    if (!rui || rui.length > 40) throw new Error('Numero RUI non valido.');
    out.rui = rui;
  }
  if (!partial || 'section' in body) {
    const section = str(body.section).toUpperCase();
    if (section !== 'A' && section !== 'B') throw new Error('Sezione non valida: deve essere A o B.');
    out.section = section;
  }
  if (!partial || 'address' in body) {
    const address = str(body.address);
    if (!address || address.length > 300) throw new Error('Sede legale non valida.');
    out.address = address;
  }
  if ('phone' in body) out.phone = str(body.phone) || null;
  if ('email' in body) out.email = str(body.email) || null;
  if ('pec' in body) out.pec = str(body.pec) || null;
  if ('website' in body) out.website = str(body.website) || null;
  if ('active' in body) out.active = Boolean(body.active);

  return out;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const action = str(req.query?.action || 'session');

  // --- MITIGAZIONE TEMPORANEA DI SICUREZZA ---
  // Fail-closed:
  // se ADMIN_LOGIN_DISABLED non esiste o ha un valore
  // diverso da "false", il login resta BLOCCATO.
  if (
    action === 'login' &&
    req.method === 'POST' &&
    process.env.ADMIN_LOGIN_DISABLED !== 'false' && process.env.VERCEL_ENV !== 'preview'
  ) {
    return json(res, 503, {
      ok: false,
      error: {
        code: 'ADMIN_LOGIN_DISABLED',
        message: 'Accesso amministratore temporaneamente disabilitato.'
      }
    });
  }
  // --- FINE MITIGAZIONE TEMPORANEA ---

  if (!originAllowed(req)) {
    return json(res, 403, {
      ok: false,
      error: { code: 'BAD_ORIGIN', message: 'Origine non consentita.' }
    });
  }

  let loginStage = 'request';

  try {
    if (action === 'public-config' && req.method === 'GET') {
      const { url, key } = supabaseConfig();
      return json(res, 200, { ok: true, supabaseUrl: url, supabaseAnonKey: key });
    }

    /*
     * ============================================================
     * LOGIN — PASSWORD -> AAL1 -> MFA
     * ============================================================
     */
    if (action === 'login' && req.method === 'POST') {
      const body = req.body || {};
      const email = str(body.email);
      const password = typeof body.password === 'string' ? body.password : '';

      if (!email || !password) {
        return json(res, 400, {
          ok: false,
          error: { code: 'INVALID_REQUEST', message: 'Email e password sono obbligatorie.' }
        });
      }

      const ip = getIp(req);
      loginStage = 'rate-limit-check';
      const limiter = await rateLimitLogin(ip, email);

      if (limiter.blocked) {
        return json(res, 429, {
          ok: false,
          error: { code: 'LOGIN_LOCKED', message: 'Troppi tentativi. Riprova più tardi.' }
        });
      }

      loginStage = 'supabase-password';
      const auth = await supabaseFetch('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: { email, password }
      });

      if (!auth.response.ok || !auth.data?.access_token) {
        await recordLoginFailure(ip, email);
        return json(res, 401, {
          ok: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Credenziali non valide.' }
        });
      }

      const user = auth.data.user;

      if (
        !user?.email ||
        user.email.toLowerCase() !== str(process.env.CM_ADMIN_EMAIL).toLowerCase()
      ) {
        await recordLoginFailure(ip, email);
        return json(res, 403, {
          ok: false,
          error: { code: 'FORBIDDEN', message: 'Non autorizzato.' }
        });
      }

      /*
       * PASSWORD CORRETTA.
       * NON viene ancora creata alcuna sessione admin.
       * La sessione è ancora AAL1.
       */
      loginStage = 'clear-login-limit';
      await clearLoginFailures(ip, email);

      loginStage = 'mfa-factors';
      const factors = await getTotpFactors(auth.data.access_token);

      if (!factors.ok) {
        return json(res, 503, {
          ok: false,
          error: { code: 'MFA_FACTORS_UNAVAILABLE', message: 'Impossibile verificare lo stato MFA.' }
        });
      }

      /*
       * CASO A — 0 verified / 0 unverified
       * Nessun fattore TOTP: avviamo un nuovo enrollment.
       */
      if (factors.verified.length === 0 && factors.unverified.length === 0) {
        const enrollment = await enrollTotp(auth.data.access_token);

        if (!enrollment.ok || !enrollment.data?.id) {
          return json(res, 503, {
            ok: false,
            error: { code: 'MFA_ENROLL_FAILED', message: 'Impossibile avviare la configurazione MFA.' }
          });
        }

        const factorId = enrollment.data.id;

        const pendingId = await createMfaPendingSession({
          userId: user.id,
          email: user.email,
          accessToken: auth.data.access_token,
          refreshToken: auth.data.refresh_token,
          factorId,
          mode: 'mfa_setup'
        });

        res.setHeader('Set-Cookie', cookieString(MFA_COOKIE, pendingId, MFA_PENDING_TTL));

        return json(res, 200, {
          ok: true,
          state: 'mfa_setup',
          factorId,
          qrCode: qrDataUrl(enrollment.data.totp?.qr_code),
          secret: enrollment.data.totp?.secret || ''
        });
      }

      /*
       * CASO B — 0 verified / >=1 unverified
       * NON creiamo un secondo fattore.
       */
      if (factors.verified.length === 0 && factors.unverified.length > 0) {
        return json(res, 409, {
          ok: false,
          error: {
            code: 'MFA_SETUP_INCOMPLETE',
            message: 'Esiste già una configurazione MFA non completata. Completa o ripristina la configurazione MFA prima di procedere.'
          }
        });
      }

      /*
       * CASO C — esiste almeno un fattore verified
       * Challenge -> Verify -> AAL2.
       */
      const factor = factors.verified[0];
      const challenge = await createMfaChallenge(auth.data.access_token, factor.id);

      if (!challenge.ok) {
        return json(res, 503, {
          ok: false,
          error: { code: 'MFA_CHALLENGE_FAILED', message: 'Impossibile preparare la verifica MFA.' }
        });
      }

      const pendingId = await createMfaPendingSession({
        userId: user.id,
        email: user.email,
        accessToken: auth.data.access_token,
        refreshToken: auth.data.refresh_token,
        factorId: factor.id,
        mode: 'mfa_verify',
        challengeId: challenge.data.id
      });

      res.setHeader('Set-Cookie', cookieString(MFA_COOKIE, pendingId, MFA_PENDING_TTL));

      return json(res, 200, {
        ok: true,
        state: 'mfa_verify',
        factorId: factor.id
      });
    }

    /*
     * ============================================================
     * MFA SETUP VERIFY
     * ============================================================
     */
    if (action === 'mfa-setup-verify' && req.method === 'POST') {
      const cookies = parseCookies(req);
      const pending = await getMfaPendingSession(cookies[MFA_COOKIE]);

      if (!pending || pending.mode !== 'mfa_setup') {
        clearCookie(res, MFA_COOKIE);
        return json(res, 401, {
          ok: false,
          error: {
            code: 'MFA_SESSION_EXPIRED',
            message: 'La sessione di autenticazione è scaduta. Effettua nuovamente il login.'
          }
        });
      }

      return finishMfaVerification({ req, res, pending, code: str(req.body?.code) });
    }

    /*
     * ============================================================
     * MFA VERIFY
     * ============================================================
     */
    if (action === 'mfa-verify' && req.method === 'POST') {
      const cookies = parseCookies(req);
      const pending = await getMfaPendingSession(cookies[MFA_COOKIE]);

      if (!pending || pending.mode !== 'mfa_verify') {
        clearCookie(res, MFA_COOKIE);
        return json(res, 401, {
          ok: false,
          error: {
            code: 'MFA_SESSION_EXPIRED',
            message: 'La sessione di autenticazione è scaduta. Effettua nuovamente il login.'
          }
        });
      }

      return finishMfaVerification({ req, res, pending, code: str(req.body?.code) });
    }

    /*
     * ============================================================
     * SESSION
     * ============================================================
     */
    if (action === 'session' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, { ok: false, authenticated: false });
      }

      return json(res, 200, {
        ok: true,
        authenticated: true,
        user: { id: auth.user.id, email: auth.user.email },
        idleTimeoutSeconds: IDLE_TTL
      });
    }

    /*
     * ============================================================
     * LOGOUT
     * ============================================================
     */
    if (action === 'logout' && req.method === 'POST') {
      const cookies = parseCookies(req);
      const session = await getStoredSession(cookies[COOKIE]);
      const pending = await getMfaPendingSession(cookies[MFA_COOKIE]);

      if (session) {
        await supabaseFetch('/auth/v1/logout', {
          method: 'POST',
          accessToken: session.accessToken
        }).catch(() => {});

        await redisDel(`cm:admin:session:${session.key}`);
      }

      if (pending) {
        await deleteMfaPendingSession(pending.key);
      }

      clearCookies(res);

      return json(res, 200, { ok: true });
    }

    /*
     * ============================================================
     * PASSWORD
     * ============================================================
     */
    if (action === 'password' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const password = typeof req.body?.password === 'string' ? req.body.password : '';

      const r = await supabaseFetch('/auth/v1/user', {
        method: 'PUT',
        accessToken: auth.session.accessToken,
        body: { password }
      });

      if (!r.response.ok) {
        return json(res, 400, {
          ok: false,
          error: { code: 'PASSWORD_UPDATE_FAILED', message: 'Modifica fallita.' }
        });
      }

      return json(res, 200, { ok: true });
    }

    /*
     * ============================================================
     * MFA ENROLL — AREA RISERVATA
     * ============================================================
     */
    if (action === 'mfa-enroll' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const factors = await getTotpFactors(auth.session.accessToken);

      if (!factors.ok) {
        return json(res, 503, {
          ok: false,
          error: { code: 'MFA_FACTORS_UNAVAILABLE', message: 'Impossibile verificare lo stato MFA.' }
        });
      }

      if (factors.unverified.length > 0) {
        return json(res, 409, {
          ok: false,
          error: { code: 'MFA_SETUP_INCOMPLETE', message: 'Esiste già una configurazione MFA non completata.' }
        });
      }

      const enrollment = await enrollTotp(auth.session.accessToken);

      if (!enrollment.ok || !enrollment.data?.id) {
        return json(res, 503, {
          ok: false,
          error: { code: 'MFA_ENROLL_FAILED', message: 'Impossibile avviare la configurazione MFA.' }
        });
      }

      return json(res, 200, {
        ok: true,
        factorId: enrollment.data.id,
        qrCode: qrDataUrl(enrollment.data.totp?.qr_code),
        secret: enrollment.data.totp?.secret || ''
      });
    }

    /*
     * ============================================================
     * MFA ADD VERIFY — AREA RISERVATA
     * ============================================================
     */
    if (action === 'mfa-add-verify' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const factorId = str(req.body?.factorId);
      const code = str(req.body?.code);

      if (!factorId || !/^\d{6}$/.test(code)) {
        return json(res, 400, {
          ok: false,
          error: { code: 'MFA_INVALID_REQUEST', message: 'Fattore MFA o codice non validi.' }
        });
      }

      const factors = await getTotpFactors(auth.session.accessToken);

      if (!factors.ok) {
        return json(res, 503, {
          ok: false,
          error: { code: 'MFA_FACTORS_UNAVAILABLE', message: 'Impossibile verificare lo stato MFA.' }
        });
      }

      const factorExists = [...factors.verified, ...factors.unverified]
        .some(factor => factor.id === factorId);

      if (!factorExists) {
        return json(res, 404, {
          ok: false,
          error: { code: 'MFA_FACTOR_NOT_FOUND', message: 'Fattore MFA non trovato.' }
        });
      }

      const challenge = await createMfaChallenge(auth.session.accessToken, factorId);

      if (!challenge.ok) {
        return json(res, 400, {
          ok: false,
          error: { code: 'MFA_CHALLENGE_FAILED', message: 'Impossibile preparare la verifica del nuovo dispositivo.' }
        });
      }

      const verification = await verifyMfaChallenge({
        accessToken: auth.session.accessToken,
        factorId,
        challengeId: challenge.data.id,
        code
      });

      if (!verification.response.ok || !verification.data?.access_token) {
        return json(res, 401, {
          ok: false,
          error: { code: 'MFA_INVALID_CODE', message: 'Codice TOTP non valido.' }
        });
      }

      const verifiedAccessToken = verification.data.access_token;

      if (!isAal2(verifiedAccessToken)) {
        return json(res, 403, {
          ok: false,
          error: { code: 'MFA_AAL2_NOT_CONFIRMED', message: 'Secondo fattore non confermato.' }
        });
      }

      auth.session.accessToken = verifiedAccessToken;
      auth.session.refreshToken = verification.data.refresh_token || auth.session.refreshToken;
      auth.session.aal = 'aal2';

      await touchSession(auth.session);

      return json(res, 200, { ok: true, state: 'mfa_verified' });
    }

    /*
     * ============================================================
     * DEBUG KEY CHECK — TEMPORANEO, SOLO PREVIEW, SOLO ADMIN AUTENTICATO
     * Diagnostica il caricamento di SUPABASE_SERVICE_ROLE_KEY senza mai
     * esporne il valore: presenza, prefisso, lunghezza, impronta SHA-256,
     * più un'unica chiamata di prova in SOLA LETTURA (nessun INSERT) verso
     * /rest/v1/admin_practices, di cui riportiamo solo lo status HTTP e
     * l'eventuale messaggio d'errore di Supabase (mai la chiave).
     * DA RIMUOVERE una volta risolto il 401 su "Nuova pratica" — vedi
     * STATO-PROGETTO.md.
     * ============================================================
     */
    if (action === 'debug-key-check' && req.method === 'GET') {
      if (process.env.VERCEL_ENV !== 'preview') {
        return json(res, 404, {
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Non trovato.' }
        });
      }

      const auth = await requireAdmin(req, res);
      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
      const serviceKey = str(process.env.SUPABASE_SERVICE_ROLE_KEY);

      let urlHost = '';
      try { urlHost = new URL(url).host; } catch {}

      const fingerprint = serviceKey
        ? crypto.createHash('sha256').update(serviceKey).digest('hex')
        : '';

      let liveTest = { attempted: false };

      if (url && serviceKey) {
        const headers = { apikey: serviceKey };
        if (!serviceKey.startsWith('sb_secret_')) {
          headers.Authorization = `Bearer ${serviceKey}`;
        }
        try {
          const testResponse = await fetch(
            `${url}/rest/v1/admin_practices?select=id&limit=1`,
            { method: 'GET', headers }
          );
          let testData = null;
          try { testData = await testResponse.json(); } catch {}
          liveTest = {
            attempted: true,
            status: testResponse.status,
            code: testData?.code || null,
            message: testData?.message || null
          };
        } catch (err) {
          liveTest = {
            attempted: true,
            status: null,
            code: 'FETCH_ERROR',
            message: String(err?.message || err)
          };
        }
      }

      return json(res, 200, {
        ok: true,
        supabaseUrlPresent: Boolean(url),
        supabaseUrlHost: urlHost,
        serviceKeyPresent: Boolean(serviceKey),
        serviceKeyPrefix: serviceKey ? serviceKey.slice(0, 10) : '',
        serviceKeyLength: serviceKey.length,
        serviceKeyFingerprintSha256: fingerprint,
        vercelEnv: str(process.env.VERCEL_ENV),
        liveTest
      });
    }

    /*
     * ============================================================
     * FACSIMILE — UPLOAD PRIVATO + ESTRAZIONE + CONFERMA
     * ============================================================
     */
    if (action === 'facsimile-upload-url' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok:false, error:{code:'UNAUTHORIZED', message:'Autenticazione richiesta.'} });

      const practiceId = str(req.body?.practiceId);
      const filename = str(req.body?.filename).normalize('NFKC');
      const contentType = str(req.body?.contentType).toLowerCase();
      const size = Number(req.body?.size);
      const allowed = new Set([
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]);

      if (!/^[0-9a-f-]{36}$/i.test(practiceId) || !filename || filename.length > 180 ||
          /[\\/\\:*?"<>|\u0000-\u001f\u007f]/.test(filename) ||
          !allowed.has(contentType) || !Number.isSafeInteger(size) || size <= 0 || size > 10 * 1024 * 1024) {
        return json(res, 400, {ok:false,error:{code:'INVALID_FILE',message:'File non valido. Sono ammessi PDF e Word (.docx), massimo 10 MB.'}});
      }

      const practice = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(practiceId)}&select=id&limit=1`);
      if (!practice.response.ok || !practice.data?.[0]) {
        return json(res, 404, {ok:false,error:{code:'PRACTICE_NOT_FOUND',message:'Pratica non trovata.'}});
      }

      const pathname = `practices/${practiceId}/facsimili/${crypto.randomUUID()}-${filename}`;
      const validUntil = Date.now() + 15 * 60 * 1000;
      const signedToken = await issueSignedToken({
        pathname,
        operations:['put'],
        validUntil,
        allowedContentTypes:[contentType],
        maximumSizeInBytes:10 * 1024 * 1024,
        oidcToken:process.env.VERCEL_OIDC_TOKEN,
        storeId:process.env.BLOB_STORE_ID
      });
      const { presignedUrl } = await presignUrl(signedToken, {
        operation:'put',
        pathname,
        access:'private',
        validUntil,
        allowedContentTypes:[contentType],
        maximumSizeInBytes:10 * 1024 * 1024,
        allowOverwrite:false
      });

      const doc = await dbRequest('admin_practice_documents', {
        method:'POST',
        body:{
          practice_id:practiceId,
          kind:'facsimile',
          filename,
          pathname,
          content_type:contentType,
          size_bytes:size,
          status:'uploaded',
          uploaded_by:auth.user.id
        }
      });
      if (!doc.response.ok || !doc.data?.[0]) {
        return json(res, 503, {ok:false,error:{code:'DOCUMENT_RECORD_FAILED',message:'Impossibile registrare il documento.'}});
      }

      return json(res, 200, {ok:true, document:doc.data[0], uploadUrl:presignedUrl, expiresAt:validUntil});
    }

    if (action === 'facsimile-extract' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, {ok:false,error:{code:'UNAUTHORIZED',message:'Autenticazione richiesta.'}});
      const documentId = str(req.body?.documentId);
      if (!/^[0-9a-f-]{36}$/i.test(documentId)) return json(res,400,{ok:false,error:{code:'INVALID_DOCUMENT_ID',message:'Documento non valido.'}});

      const row = await dbRequest(`admin_practice_documents?id=eq.${encodeURIComponent(documentId)}&select=*`);
      if (!row.response.ok || !row.data?.[0]) return json(res,404,{ok:false,error:{code:'DOCUMENT_NOT_FOUND',message:'Documento non trovato.'}});
      const doc = row.data[0];
      if (!doc.pathname) return json(res,400,{ok:false,error:{code:'DOCUMENT_PATH_MISSING',message:'Percorso documento mancante.'}});

      const blob = await get(doc.pathname, {access:'private', useCache:false});
      if (!blob) return json(res,404,{ok:false,error:{code:'BLOB_NOT_FOUND',message:'File non trovato nello storage.'}});
      const chunks = [];
      for await (const chunk of blob.stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const buffer = Buffer.concat(chunks);

      const extracted = await extractFacsimile(buffer, doc.content_type);
      const patch = {
        status:'extracted',
        extracted_text:extracted.text,
        extracted_data:extracted.data,
        extracted_at:new Date().toISOString()
      };
      const saved = await dbRequest(`admin_practice_documents?id=eq.${encodeURIComponent(documentId)}`, {method:'PATCH', body:patch});
      if (!saved.response.ok) return json(res,503,{ok:false,error:{code:'EXTRACTION_SAVE_FAILED',message:'Dati estratti non salvati.'}});

      return json(res,200,{ok:true,document:saved.data?.[0]||null,extractedData:extracted.data});
    }

    if (action === 'facsimile-confirm' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res,401,{ok:false,error:{code:'UNAUTHORIZED',message:'Autenticazione richiesta.'}});
      const documentId = str(req.body?.documentId);
      const confirmedData = req.body?.confirmedData;
      if (!/^[0-9a-f-]{36}$/i.test(documentId) || !confirmedData || typeof confirmedData !== 'object' || Array.isArray(confirmedData)) {
        return json(res,400,{ok:false,error:{code:'INVALID_CONFIRMATION',message:'Dati di conferma non validi.'}});
      }
      const row = await dbRequest(`admin_practice_documents?id=eq.${encodeURIComponent(documentId)}&select=*`);
      if (!row.response.ok || !row.data?.[0]) return json(res,404,{ok:false,error:{code:'DOCUMENT_NOT_FOUND',message:'Documento non trovato.'}});
      const doc = row.data[0];
      const saved = await dbRequest(`admin_practice_documents?id=eq.${encodeURIComponent(documentId)}`, {
        method:'PATCH',
        body:{status:'confirmed',confirmed_data:confirmedData,confirmed_at:new Date().toISOString()}
      });
      if (!saved.response.ok) return json(res,503,{ok:false,error:{code:'CONFIRMATION_SAVE_FAILED',message:'Conferma non salvata.'}});

      return json(res,200,{ok:true,document:saved.data?.[0]||null});
    }

    if (action === 'facsimile-file' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res,401,{ok:false,error:{code:'UNAUTHORIZED',message:'Autenticazione richiesta.'}});
      const documentId = str(req.query?.id);
      if (!/^[0-9a-f-]{36}$/i.test(documentId)) return json(res,400,{ok:false,error:{code:'INVALID_DOCUMENT_ID',message:'Documento non valido.'}});
      const row = await dbRequest(`admin_practice_documents?id=eq.${encodeURIComponent(documentId)}&select=filename,pathname,content_type,size_bytes,status`);
      if (!row.response.ok || !row.data?.[0]) return json(res,404,{ok:false,error:{code:'DOCUMENT_NOT_FOUND',message:'Documento non trovato.'}});
      const doc = row.data[0];
      const validUntil = Date.now() + 5 * 60 * 1000;
      const signedToken = await issueSignedToken({
        pathname:doc.pathname,
        operations:['get'],
        validUntil,
        oidcToken:process.env.VERCEL_OIDC_TOKEN,
        storeId:process.env.BLOB_STORE_ID
      });
      const { presignedUrl } = await presignUrl(signedToken,{operation:'get',pathname:doc.pathname,access:'private',validUntil});
      return json(res,200,{ok:true,downloadUrl:presignedUrl,filename:doc.filename,contentType:doc.content_type,status:doc.status});
    }

    if (action === 'facsimiles' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res,401,{ok:false,error:{code:'UNAUTHORIZED',message:'Autenticazione richiesta.'}});
      const practiceId = str(req.query?.practiceId);
      if (!/^[0-9a-f-]{36}$/i.test(practiceId)) return json(res,400,{ok:false,error:{code:'INVALID_PRACTICE_ID',message:'Pratica non valida.'}});
      const rows = await dbRequest(`admin_practice_documents?practice_id=eq.${encodeURIComponent(practiceId)}&kind=eq.facsimile&select=id,filename,content_type,size_bytes,status,uploaded_at,extracted_at,confirmed_at&order=uploaded_at.desc`);
      if (!rows.response.ok) return json(res,503,{ok:false,error:{code:'DATABASE_ERROR',message:'Impossibile leggere i facsimili.'}});
      return json(res,200,{ok:true,documents:rows.data||[]});
    }

    /*
     * ============================================================
     * MUP FILES — GENERAZIONE DOCX + PDF
     * ============================================================
     */
    if (action === 'mup-files' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) {
        return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      }

      const id = str(req.query?.id);
      if (!/^[0-9a-f-]{36}$/i.test(id)) {
        return json(res, 400, { ok: false, error: { code: 'INVALID_PRACTICE_ID', message: 'ID pratica non valido.' } });
      }

      const data = req.body || {};
      const documentId = str(data.documentId) || ('MUP-' + new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14));
      const generatedAt = new Date().toISOString();
      const payload = { ...data, documentId, generatedAt };

      const [docx, pdf] = await Promise.all([
        generateMupDocx(payload),
        generateMupPdf(payload)
      ]);

      const docxBase64 = docx.toString('base64');
      const pdfBase64 = pdf.toString('base64');
      const html = str(data.html).slice(0, 500000);

      const r = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: {
          ...(html ? { mup_html: html } : {}),
          mup_generated_at: generatedAt,
          mup_docx_base64: docxBase64,
          mup_docx_generated_at: generatedAt,
          mup_pdf_base64: pdfBase64,
          mup_pdf_generated_at: generatedAt
        }
      });

      if (!r.response.ok) {
        return json(res, 400, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Salvataggio dei file MUP fallito.' } });
      }

      return json(res, 200, {
        ok: true,
        documentId,
        generatedAt,
        docxBase64,
        pdfBase64
      });
    }

    /*
     * ============================================================
     * MUP FILE — DOWNLOAD DI UN DOCUMENTO GIÀ SALVATO
     * ============================================================
     */
    if (action === 'mup-file' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);
      if (!auth) {
        return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      }

      const id = str(req.query?.id);
      const type = str(req.query?.type);
      if (!/^[0-9a-f-]{36}$/i.test(id) || !['word', 'pdf'].includes(type)) {
        return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Richiesta file non valida.' } });
      }

      const column = type === 'word' ? 'mup_docx_base64,mup_generated_at' : 'mup_pdf_base64,mup_generated_at';
      const r = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(id)}&select=${column}`);
      if (!r.response.ok || !r.data?.[0]) {
        return json(res, 404, { ok: false, error: { code: 'MUP_NOT_FOUND', message: 'Documento MUP non trovato.' } });
      }

      const item = r.data[0];
      const base64 = type === 'word' ? item.mup_docx_base64 : item.mup_pdf_base64;
      if (!base64) {
        return json(res, 404, { ok: false, error: { code: 'MUP_NOT_FOUND', message: 'Documento MUP non ancora generato.' } });
      }

      return json(res, 200, { ok: true, type, base64, generatedAt: item.mup_generated_at || null });
    }

    /*
     * ============================================================
     * REQUESTS — GET
     * ============================================================
     */
    if (action === 'requests' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const r = await dbRequest(
        'admin_requests?select=*&order=created_at.desc'
      );

      if (!r.response.ok) {
        return json(res, 503, {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Errore archivio richieste.' }
        });
      }

      return json(res, 200, {
        ok: true,
        requests: r.data || []
      });
    }

    /*
     * ============================================================
     * PRACTICES — GET
     * ============================================================
     */
    if (action === 'practices' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const r = await dbRequest('admin_practices?select=*&order=expiry.asc,created_at.desc');

      if (!r.response.ok) {
        return json(res, 503, {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Errore archivio.' }
        });
      }

      return json(res, 200, { ok: true, practices: r.data || [] });
    }

    /*
     * ============================================================
     * PRACTICES — POST
     * ============================================================
     */
    if (action === 'practices' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const practice = cleanPractice(req.body || {});

      const r = await dbRequest('admin_practices', {
        method: 'POST',
        body: { ...practice, created_by: auth.user.id }
      });

      if (!r.response.ok) {
        if (process.env.VERCEL_ENV === 'preview') {
          return json(res, 503, {
            ok: false,
            error: {
              code: 'PREVIEW_DATABASE_ERROR',
              message: `Salvataggio fallito [HTTP ${r.response.status}]${r.data?.code ? ` [${r.data.code}]` : ''}.${r.data?.message ? ` ${String(r.data.message).slice(0, 240)}` : ''}`
            }
          });
        }
        return json(res, 400, {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Salvataggio fallito.' }
        });
      }

      return json(res, 200, { ok: true, practice: r.data?.[0] || null });
    }

    /*
     * ============================================================
     * PRACTICE — PATCH
     * ============================================================
     */
    if (action === 'practice' && req.method === 'PATCH') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const id = str(req.query?.id);
      const patch = {};

      if ('checked' in (req.body || {})) {
        patch.checked = Boolean(req.body.checked);
      }

      if ('notes' in (req.body || {})) {
        patch.notes = str(req.body.notes).slice(0, 10000);
      }

      // 21 settembre 2026 — su richiesta di Carmelo: il MUP generato resta
      // salvato dentro la pratica, non solo aperto in una scheda temporanea.
      // Limite di lunghezza generoso (il documento generato è tipicamente
      // qualche migliaio di caratteri) solo per sicurezza, non blocca l'uso
      // normale.
      if ('mupHtml' in (req.body || {})) {
        patch.mup_html = str(req.body.mupHtml).slice(0, 500000);
        patch.mup_generated_at = new Date().toISOString();
      }

      const r = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: patch
      });

      if (!r.response.ok) {
        return json(res, 400, {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Aggiornamento fallito.' }
        });
      }

      return json(res, 200, { ok: true, practice: r.data?.[0] || null });
    }

    /*
     * ============================================================
     * PRACTICE — DELETE
     * ============================================================
     */
    if (action === 'practice' && req.method === 'DELETE') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const id = str(req.query?.id);

      const r = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });

      if (!r.response.ok) {
        return json(res, 400, {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Cancellazione fallita.' }
        });
      }

      return json(res, 200, { ok: true });
    }

    /*
     * ============================================================
     * INTERMEDIARIES — GET (elenco completo, attivi e non)
     * Usata sia dalla sezione "Intermediari collaboratori" delle
     * Impostazioni, sia dal generatore MUP (che mostra solo i record
     * con active=true nel menu a tendina).
     * ============================================================
     */
    if (action === 'intermediaries' && req.method === 'GET') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const r = await dbRequest('admin_intermediaries?select=*&order=name.asc');

      if (!r.response.ok) {
        return json(res, 503, {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Errore archivio intermediari.' }
        });
      }

      return json(res, 200, { ok: true, intermediaries: r.data || [] });
    }

    /*
     * ============================================================
     * INTERMEDIARIES — POST (nuovo intermediario)
     * ============================================================
     */
    if (action === 'intermediaries' && req.method === 'POST') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const intermediary = cleanIntermediary(req.body || {});

      const r = await dbRequest('admin_intermediaries', {
        method: 'POST',
        body: { ...intermediary, created_by: auth.user.id }
      });

      if (!r.response.ok) {
        return json(res, 400, {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Salvataggio intermediario fallito.' }
        });
      }

      return json(res, 200, { ok: true, intermediary: r.data?.[0] || null });
    }

    /*
     * ============================================================
     * INTERMEDIARY — PATCH (modifica dati o attiva/disattiva)
     * ============================================================
     */
    if (action === 'intermediary' && req.method === 'PATCH') {
      const auth = await requireAdmin(req, res);

      if (!auth) {
        return json(res, 401, {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' }
        });
      }

      const id = str(req.query?.id);
      const patch = cleanIntermediary(req.body || {}, { partial: true });

      const r = await dbRequest(`admin_intermediaries?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: patch
      });

      if (!r.response.ok) {
        return json(res, 400, {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Aggiornamento intermediario fallito.' }
        });
      }

      return json(res, 200, { ok: true, intermediary: r.data?.[0] || null });
    }

    return json(res, 404, {
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Non trovato.' }
    });
  } catch (error) {
    /*
     * Non esporre mai al client il corpo grezzo
     * degli errori Supabase, Redis o runtime.
     * In Preview restituiamo soltanto lo stadio tecnico,
     * senza messaggi, URL, token o stack trace.
     */
    if (process.env.VERCEL_ENV === 'preview' && typeof loginStage === 'string') {
      return json(res, 503, {
        ok: false,
        error: { code: 'PREVIEW_LOGIN_STAGE', message: `Errore temporaneo [${loginStage}].` }
      });
    }
    return json(res, 503, {
      ok: false,
      error: { code: 'SERVER_ERROR', message: 'Errore temporaneo.' }
    });
  }
}