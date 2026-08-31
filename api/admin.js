/**
 * CM Consulting — API di amministrazione protetta
 * Autenticazione: Supabase Auth + autenticazione a più fattori TOTP obbligatoria
 * Sessione: token casuale opaco nel cookie HttpOnly/Secure/SameSite=Strict, stato in Upstash Redis
 * Limite di frequenza: Upstash Redis, massimo 5 tentativi di accesso falliti / 15 min per IP e account
 */

import crypto from 'node:crypto';

const COOKIE = 'cm_admin_session';
const PENDING_COOKIE = 'cm_admin_pending';
const SESSION_TTL = 8 * 60 * 60;
const IDLE_TTL = 15 * 60;
const PENDING_TTL = 10 * 60;
const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW = 15 * 60;

funzione str(v) { restituisci typeof v === 'stringa' ? v.trim() : ''; }
funzione json(res, status, payload) { restituisci res.status(status).json(payload); }
funzione token() { return crypto.randomBytes(32).toString('base64url'); }
funzione now() { return Math.floor(Date.now() / 1000); }
funzione getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : String(req.headers['x-real-ip'] || 'unknown');
}
funzione parseCookies(req) {
  const raw = String(req.headers.cookie || '');
  restituisci Object.fromEntries(raw.split(';').map(v => v.trim()).filter(Boolean).map(v => {
    const i = v.indexOf('=');
    restituisci i < 0 ? [v, ''] : [v.slice(0, i), decodeURIComponent(v.slice(i + 1))];
  }));
}
funzione setCookie(res, name, value, maxAge) {
  res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`);
}
funzione clearCookie(res, name) {
  res.setHeader('Set-Cookie', `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`);
}
funzione appendCookie(res, cookie) {
  const existing = res.getHeader('Set-Cookie');
  const list = existing ? (Array.isArray(existing) ? existing : [existing]) : [];
  res.setHeader('Set-Cookie', [...list, cookie]);
}
funzione setMultipleCookies(res, cookies) {
  res.setHeader('Set-Cookie', cookies);
}
funzione cookieString(nome, valore, età massima) {
  restituisci `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

funzione supabaseConfig() {
  const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
  const key = str(process.env.SUPABASE_ANON_KEY);
  if (!url || !key) throw new Error('Supabase non configurabile.');
  restituisci { url, chiave };
}

funzione asincrona supabaseFetch(path, { method = 'GET', accessToken, body, headers = {} } = {}) {
  const { url, key } = supabaseConfig();
  const h = { apikey: chiave, ...intestazioni };
  se (accessToken) h.Authorization = `Portatore ${accessToken}`;
  se (body !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(`${url}${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  lascia dati = null; prova { dati = await r.json(); } catch {}
  restituisci { risposta: r, dati };
}

funzione asincrona redis(path, { method = 'GET', body } = {}) {
  const url = str(process.env.UPSTASH_REDIS_REST_URL).replace(/\/$/, '');
  const tokenValue = str(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !tokenValue) throw new Error('Rate limiter Redis non configurabile.');
  const r = await fetch(`${url}${path}`, {
    metodo,
    intestazioni: { Autorizzazione: `Portatore ${tokenValue}`, ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    corpo: corpo !== undefined ? JSON.stringify(corpo) : undefined
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.error) throw new Error(data.error || 'Errore Redis');
  restituisci i dati.risultato;
}

async function redisGet(key) { return redis(`/get/${encodeURIComponent(key)}`); }
funzione asincrona redisSet(chiave, valore, ttl) {
  return redis(`/set/${encodeURIComponent(key)}?EX=${ttl}`, { method: 'POST', body: value });
}
async function redisDel(key) { return redis(`/del/${encodeURIComponent(key)}`); }
funzione asincrona redisIncr(key, ttl) {
  const valore = Numero(await redis(`/incr/${encodeURIComponent(chiave)}`));
  if (value === 1) await redis(`/expire/${encodeURIComponent(key)}/${ttl}`);
  valore di ritorno;
}

funzione asincrona rateLimitLogin(ip, email) {
  const keys = [`cm:admin:login:ip:${ip}`, `cm:admin:login:email:${email.toLowerCase()}`];
  const counts = [];
  per (costante chiave di chiavi) conta.push(Numero(aspetta redisGet(chiave) || 0));
  restituisci { bloccato: counts.some(n => n >= MAX_LOGIN_FAILURES), counts };
}
funzione asincrona recordLoginFailure(ip, email) {
  attendi Promise.all([
    redisIncr(`cm:admin:login:ip:${ip}`, LOGIN_WINDOW),
    redisIncr(`cm:admin:login:email:${email.toLowerCase()}`, LOGIN_WINDOW)
  ]);
}
funzione asincrona clearLoginFailures(ip, email) {
  attendi Promise.all([
    redisDel(`cm:admin:login:ip:${ip}`),
    redisDel(`cm:admin:login:email:${email.toLowerCase()}`)
  ]);
}

funzione originAllowed(req) {
  const origin = str(req.headers.origin);
  se (!origine) restituisci vero;
  const configured = str(process.env.SITE_URL).replace(/\/$/, '');
  se (configurato) restituisci origine === configurato;
  const proto = str(req.headers['x-forwarded-proto'] || 'https');
  const host = str(req.headers.host);
  restituisci origine === `${proto}://${host}`;
}

funzione asincrona createStoredSession({ userId, email, accessToken, refreshToken, aal = 'aal2' }) {
  const id = token();
  const ts = now();
  const record = { userId, email, accessToken, refreshToken, aal, createdAt: ts, lastActivityAt: ts };
  await redisSet(`cm:admin:session:${id}`, JSON.stringify(record), SESSION_TTL);
  restituisci l'ID;
}
funzione asincrona getStoredSession(id) {
  se (!id) restituisce null;
  const raw = await redisGet(`cm:admin:session:${id}`);
  se (!raw) restituisci null;
  try { return { key: id, ...JSON.parse(raw) }; } catch { return null; }
}
funzione asincrona touchSession(session) {
  sessione.ultimaAttivitàAl = ora();
  const remaining = Math.max(60, SESSION_TTL - (session.lastActivityAt - session.createdAt));
  await redisSet(`cm:admin:session:${session.key}`, JSON.stringify(session), remaining);
}

funzione asincrona requireAdmin(req, res) {
  const cookies = parseCookies(req);
  const session = await getStoredSession(cookies[COOKIE]);
  se (!sessione) {
    clearCookie(res, COOKIE);
    restituisci null;
  }
  const current = now();
  se ((corrente - Numero(session.lastActivityAt || 0)) > IDLE_TTL || (corrente - Numero(session.createdAt || 0)) > SESSION_TTL) {
    await redisDel(`cm:admin:session:${session.key}`);
    clearCookie(res, COOKIE);
    restituisci null;
  }

  let userResult = await supabaseFetch('/auth/v1/user', { accessToken: session.accessToken });
  se (userResult.response.status === 401 && session.refreshToken) {
    const refreshed = await supabaseFetch('/auth/v1/token?grant_type=refresh_token', {
      metodo: 'POST', corpo: { refresh_token: session.refreshToken }
    });
    se (!refreshed.response.ok || !refreshed.data?.access_token) {
      await redisDel(`cm:admin:session:${session.key}`);
      clearCookie(res, COOKIE);
      restituisci null;
    }
    session.accessToken = refreshed.data.access_token;
    session.refreshToken = refreshed.data.refresh_token || session.refreshToken;
    userResult = await supabaseFetch('/auth/v1/user', { accessToken: session.accessToken });
  }
  se (!userResult.response.ok || userResult.data?.email?.toLowerCase() !== str(process.env.CM_ADMIN_EMAIL).toLowerCase()) {
    await redisDel(`cm:admin:session:${session.key}`);
    clearCookie(res, COOKIE);
    restituisci null;
  }
  attendi touchSession(session);
  restituisci { sessione, utente: userResult.data };
}

funzione asincrona listFactors(accessToken) {
  const r = await supabaseFetch('/auth/v1/factors', { accessToken });
  restituisci r.response.ok ? r.data : null;
}
funzione asincrona enrollTotp(accessToken) {
  restituisci supabaseFetch('/auth/v1/factors', {
    metodo: 'POST', accessToken,
    corpo: { factor_type: 'totp', friendly_name: 'CM Consulting Admin', issuer: 'CM Consulting' }
  });
}

funzione qrDataUrl(valore) {
  const qr = str(value);
  se (!qr) restituisci null;
  se (/^data:image\/svg\+xml[,;]/i.test(qr)) restituisci qr;
  se (/^<svg[\s>]/i.test(qr)) restituisci `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`;
  returnqr;
}
funzione asincrona challenge(accessToken, factorId) {
  return supabaseFetch(`/auth/v1/factors/${encodeURIComponent(factorId)}/challenge`, { method: 'POST', accessToken, body: {} });
}
funzione asincrona verifica(accessToken, factorId, challengeId, code) {
  restituisci supabaseFetch(`/auth/v1/factors/${encodeURIComponent(factorId)}/verify`, {
    metodo: 'POST', accessToken,
    corpo: { challenge_id: challengeId, code }
  });
}
funzione asincrona deleteFactor(accessToken, factorId) {
  return supabaseFetch(`/auth/v1/factors/${encodeURIComponent(factorId)}`, { method: 'DELETE', accessToken });
}

funzione asincrona dbRequest(path, { method = 'GET', body, accessToken } = {}) {
  const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
  const serviceKey = str(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) throw new Error('Database Supabase non configurabile.');
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  const r = await fetch(`${url}/rest/v1/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  lascia dati = null; prova { dati = await r.json(); } catch {}
  restituisci { risposta: r, dati };
}

funzione cleanPractice(corpo) {
  const client = str(body.client);
  const type = str(body.type);
  const expiry = str(body.expiry);
  const email = str(body.email);
  const notes = str(body.notes);
  const clientPrice = body.clientPrice === '' || body.clientPrice == null ? null : Number(body.clientPrice);
  const reviewerCost = body.reviewerCost === '' || body.reviewerCost == null ? null : Number(body.reviewerCost);
  if (!client || client.length > 180 || !type || type.length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) throw new Error('Dati pratici non validi.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email non valida.');
  if (notes.length > 10000) throw new Error('Note troppo lunghe.');
  if ((clientPrice != null && !Number.isFinite(clientPrice)) || (reviewerCost != null && !Number.isFinite(reviewerCost))) throw new Error('Importi non validi.');
  restituisci { cliente, tipo, scadenza, email: email || null, prezzo_cliente: prezzo_cliente, costo_recensore: costo_recensore, note: note || null };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!originAllowed(req)) return json(res, 403, { ok: false, error: { code: 'BAD_ORIGIN', message: 'Origine non consentita.' } });
  const action = str(req.query?.action || 'session');

  Tentativo {
    se (azione === 'public-config' e req.method === 'GET') {
      const { url, key } = supabaseConfig();
      restituisci json(res, 200, { ok: true, supabaseUrl: url, supabaseAnonKey: key });
    }

    se (azione === 'login' e req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const email = str(body.email), password = typeof body.password === 'string' ? body.password : '';
      if (!email || !password || email.length > 254 || password.length > 256) return json(res, 400, { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenziali non valide.' } });
      const ip = getIp(req);
      const limiter = await rateLimitLogin(ip, email);
      if (limiter.blocked) return json(res, 429, { ok: false, error: { code: 'LOGIN_LOCKED', message: 'Troppi tentativi. Riprova tra 15 minuti.' } });

      const auth = await supabaseFetch('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
      se (!auth.response.ok || !auth.data?.access_token) {
        attendi recordLoginFailure(ip, email);
        return json(res, 401, { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email o password non valide.' } });
      }
      const utente = auth.data.utente;
      se (!user?.email || user.email.toLowerCase() !== str(process.env.CM_ADMIN_EMAIL).toLowerCase()) {
        attendi recordLoginFailure(ip, email);
        return json(res, 403, { ok: false, error: { code: 'FORBIDDEN', message: 'Account non autorizzato.' } });
      }
      attendi clearLoginFailures(ip, email);

      const factors = await listFactors(auth.data.access_token);
      const verifiedTotp = Array.isArray(factors?.totp) ? factors.totp.find(f => f.status === 'verified') : null;
      const pending = token();
      await redisSet(`cm:admin:pending:${pending}`, JSON.stringify({ userId: user.id, email: user.email, accessToken: auth.data.access_token, refreshToken: auth.data.refresh_token, createdAt: now() }), PENDING_TTL);
      setCookie(res, PENDING_COOKIE, pending, PENDING_TTL);

      se (!verifiedTotp) {
        const stale = Array.isArray(factors?.totp) ? factors.totp.filter(f => f.status === 'unverified') : [];
        per (const factor of stale) attendi deleteFactor(auth.data.access_token, factor.id).catch(() => {});
        const enrolled = await enrollTotp(auth.data.access_token);
        if (!enrolled.response.ok || !enrolled.data?.id) return json(res, 503, { ok: false, error: { code: 'MFA_SETUP_FAILED', message: 'Impossibile avviare la configurazione MFA.' } });
        await redisSet(`cm:admin:pending:${pending}`, JSON.stringify({ userId: user.id, email: user.email, accessToken: auth.data.access_token, refreshToken: auth.data.refresh_token, createdAt: now(), factorId: enrolled.data.id }), PENDING_TTL);
        restituisci json(res, 200, { ok: true, state: 'mfa_setup', factorId: enrolled.data.id, qrCode: qrDataUrl(enrolled.data.totp?.qr_code), secret: enrolled.data.totp?.secret || null });
      }

      const ch = await challenge(auth.data.access_token, verifiedTotp.id);
      if (!ch.response.ok || !ch.data?.id) return json(res, 503, { ok: false, error: { code: 'MFA_CHALLENGE_FAILED', message: 'Impossibile avviare la verifica MFA.' } });
      await redisSet(`cm:admin:pending:${pending}`, JSON.stringify({ userId: user.id, email: user.email, accessToken: auth.data.access_token, refreshToken: auth.data.refresh_token, createdAt: now(), factorId: verifiedTotp.id, challengeId: ch.data.id }), PENDING_TTL);
      restituisci json(res, 200, { ok: true, state: 'mfa_required', factorId: verifiedTotp.id, challengeId: ch.data.id });
    }

    se (azione === 'mfa-verify' e req.method === 'POST') {
      const cookies = parseCookies(req);
      const pendingKey = cookies[PENDING_COOKIE];
      const raw = pendingKey ? await redisGet(`cm:admin:pending:${pendingKey}`) : null;
      if (!raw) return json(res, 401, { ok: false, error: { code: 'MFA_SESSION_EXPIRED', message: 'Sessione di verifica scaduta. Effettua nuovamente il login.' } });
      const pending = JSON.parse(raw);
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const code = str(body.code).replace(/\s/g, '');
      if (!/^\d{6}$/.test(code) || !pending.factorId || !pending.challengeId) return json(res, 400, { ok: false, error: { code: 'INVALID_MFA_CODE', message: 'Codice MFA non valido.' } });
      const verified = await verify(pending.accessToken, pending.factorId, pending.challengeId, code);
      if (!verified.response.ok || !verified.data?.access_token) return json(res, 401, { ok: false, error: { code: 'INVALID_MFA_CODE', message: 'Codice MFA non valido o scaduto.' } });
      const sessionId = await createStoredSession({ userId: pending.userId, email: pending.email, accessToken: verified.data.access_token, refreshToken: verified.data.refresh_token || pending.refreshToken, aal: 'aal2' });
      await redisDel(`cm:admin:pending:${pendingKey}`);
      setMultipleCookies(res, [cookieString(COOKIE, sessionId, SESSION_TTL), cookieString(PENDING_COOKIE, '', 0)]);
      restituisci json(res, 200, { ok: true, state: 'authenticated' });
    }

    se (azione === 'mfa-setup-verify' e req.method === 'POST') {
      const cookies = parseCookies(req);
      const pendingKey = cookies[PENDING_COOKIE];
      const raw = pendingKey ? await redisGet(`cm:admin:pending:${pendingKey}`) : null;
      if (!raw) return json(res, 401, { ok: false, error: { code: 'MFA_SESSION_EXPIRED', message: 'Sessione di configurazione scaduta.' } });
      const pending = JSON.parse(raw);
      const code = str(req.body?.code).replace(/\s/g, '');
      if (!/^\d{6}$/.test(code) || !pending.factorId) return json(res, 400, { ok: false, error: { code: 'INVALID_MFA_CODE', message: 'Codice MFA non valido.' } });
      const ch = await challenge(pending.accessToken, pending.factorId);
      if (!ch.response.ok || !ch.data?.id) return json(res, 503, { ok: false, error: { code: 'MFA_CHALLENGE_FAILED', message: 'Impossibile avviare la verifica MFA.' } });
      const verified = await verify(pending.accessToken, pending.factorId, ch.data.id, code);
      if (!verified.response.ok || !verified.data?.access_token) return json(res, 401, { ok: false, error: { code: 'INVALID_MFA_CODE', message: 'Codice MFA non valido.' } });
      const sessionId = await createStoredSession({ userId: pending.userId, email: pending.email, accessToken: verified.data.access_token, refreshToken: verified.data.refresh_token || pending.refreshToken, aal: 'aal2' });
      await redisDel(`cm:admin:pending:${pendingKey}`);
      setMultipleCookies(res, [cookieString(COOKIE, sessionId, SESSION_TTL), cookieString(PENDING_COOKIE, '', 0)]);
      restituisci json(res, 200, { ok: true, state: 'authenticated' });
    }

    se (azione === 'password dimenticata' e req.method === 'POST') {
      const email = str(req.body?.email);
      const adminEmail = str(process.env.CM_ADMIN_EMAIL).toLowerCase();
      if (!email || email.toLowerCase() !== adminEmail) return json(res, 200, { ok: true, message: 'Se l'account è autorizzato, riceverai le istruzioni via email.' });
      const site = str(process.env.SITE_URL).replace(/\/$/, '');
      const r = await supabaseFetch('/auth/v1/recover', { method: 'POST', body: { email, redirect_to: `${site}/admin/reset` } });
      if (!r.response.ok) console.error('Errore durante il ripristino della password', r.data);
      return json(res, 200, { ok: true, message: 'Se l'account è autorizzato, riceverai le istruzioni via email.' });
    }

    se (azione === 'sessione' e req.metodo === 'GET') {
      const auth = await requireAdmin(req, res);
      se (!auth) restituisci json(res, 401, { ok: false, authenticated: false });
      restituisci json(res, 200, { ok: true, authenticated: true, user: { id: auth.user.id, email: auth.user.email }, idleTimeoutSeconds: IDLE_TTL });
    }

    se (azione === 'logout' e req.method === 'POST') {
      const cookies = parseCookies(req);
      const session = await getStoredSession(cookies[COOKIE]);
      se (sessione) {
        await supabaseFetch('/auth/v1/logout', { method: 'POST', accessToken: session.accessToken, body: {} }).catch(() => {});
        await redisDel(`cm:admin:session:${session.key}`);
      }
      setMultipleCookies(res, [cookieString(COOKIE, '', 0), cookieString(PENDING_COOKIE, '', 0)]);
      restituisci json(res, 200, { ok: true });
    }

    se (azione === 'mfa-enroll' e req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const r = await enrollTotp(auth.session.accessToken);
      if (!r.response.ok) return json(res, r.response.status, { ok: false, error: { code: 'MFA_ENROLL_FAILED', message: 'Impossibile aggiungere il fattore MFA.' } });
      restituisci json(res, 200, { ok: true, factorId: r.data.id, qrCode: qrDataUrl(r.data.totp?.qr_code), secret: r.data.totp?.secret || null });
    }

    se (azione === 'mfa-add-verify' e req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const code = str(req.body?.code).replace(/\s/g, '');
      const factorId = str(req.body?.factorId);
      if (!factorId || !/^\d{6}$/.test(code)) return json(res, 400, { ok: false, error: { code: 'INVALID_MFA_CODE', message: 'Codice MFA non valido.' } });
      const ch = await challenge(auth.session.accessToken, factorId);
      if (!ch.response.ok) return json(res, 400, { ok: false, error: { code: 'MFA_CHALLENGE_FAILED', message: 'Impossibile creare la verifica MFA.' } });
      const verified = await verify(auth.session.accessToken, factorId, ch.data.id, code);
      if (!verified.response.ok) return json(res, 401, { ok: false, error: { code: 'INVALID_MFA_CODE', message: 'Codice MFA non valido.' } });
      se (verified.data?.access_token) auth.session.accessToken = verified.data.access_token;
      se (verified.data?.refresh_token) auth.session.refreshToken = verified.data.refresh_token;
      attendi touchSession(auth.session);
      restituisci json(res, 200, { ok: true });
    }

    se (azione === 'password' e req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
      if (password.length < 12 || password.length > 256 || !/[AZ]/.test(password) || !/[az]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) return json(res, 400, { ok: false, errore: { codice: 'WEAK_PASSWORD', messaggio: 'Usa almeno 12 caratteri con maiuscole, minuscole, numeri e simboli.' } });
      const r = await supabaseFetch('/auth/v1/user', { method: 'PUT', accessToken: auth.session.accessToken, body: { password, ...(currentPassword ? { current_password: currentPassword } : {}) } });
      if (!r.response.ok) return json(res, 400, { ok: false, error: { code: 'PASSWORD_UPDATE_FAILED', message: 'Password non modificata.' } });
      restituisci json(res, 200, { ok: true });
    }

    se (azione === 'pratiche' e req.method === 'GET') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const r = await dbRequest('admin_practices?select=*&order=expiry.asc,created_at.desc');
      if (!r.response.ok) return json(res, 503, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Archivio non disponibile.' } });
      restituisci json(res, 200, { ok: true, practices: r.data || [] });
    }

    se (azione === 'pratiche' e req.method === 'POST') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const practice = cleanPractice(req.body || {});
      const r = await dbRequest('admin_practices', { method: 'POST', body: { ...practice, created_by: auth.user.id } });
      if (!r.response.ok) return json(res, 400, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Impossibile salvare la pratica.' } });
      restituisci json(res, 200, { ok: true, practice: r.data?.[0] || null });
    }

    se (azione === 'pratica' e req.metodo === 'PATCH') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const id = str(req.query?.id);
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json(res, 400, { ok: false, error: { code: 'INVALID_ID', message: 'Identificativo non valido.' } });
      const patch = {};
      se ('checked' in (req.body || {})) patch.checked = Boolean(req.body.checked);
      se ('note' in (req.body || {})) patch.notes = str(req.body.notes).slice(0, 10000);
      const r = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: patch });
      if (!r.response.ok) return json(res, 400, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Impossibile aggiornare la pratica.' } });
      restituisci json(res, 200, { ok: true, practice: r.data?.[0] || null });
    }

    se (azione === 'pratica' e req.metodo === 'ELIMINA') {
      const auth = await requireAdmin(req, res);
      if (!auth) return json(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Autenticazione richiesta.' } });
      const id = str(req.query?.id);
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json(res, 400, { ok: false, error: { code: 'INVALID_ID', message: 'Identificativo non valido.' } });
      const r = await dbRequest(`admin_practices?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!r.response.ok) return json(res, 400, { ok: false, error: { code: 'DATABASE_ERROR', message: 'Impossibile cancellare la pratica.' } });
      restituisci json(res, 200, { ok: true });
    }

    return json(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'Endpoint non trovato.' } });
  } catch (errore) {
    console.error('Errore API di amministrazione CM:', error);
    return json(res, 503, { ok: false, error: { code: 'SERVICE_NOT_CONFIGURED', message: 'Area amministrativa non configurata o temporaneamente non disponibile.' } });
  }
}
