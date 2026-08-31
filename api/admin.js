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
  restituisci typeof forwarded === 'stringa'
    ? forwarded.split(',')[0].trim()
    : String(req.headers['x-real-ip'] || 'sconosciuto');
}

funzione parseCookies(req) {
  const raw = String(req.headers.cookie || '');
  restituisci Oggetto da voci(
    raw.split(';')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => {
        const i = v.indexOf('=');
        restituisci i < 0
          ? [v, '']
          : [v.slice(0, i), decodeURIComponent(v.slice(i + 1))];
      })
  );
}

funzione setCookie(res, name, value, maxAge) {
  res.setHeader(
    'Set-Cookie',
    `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`
  );
}

funzione clearCookie(res, name) {
  res.setHeader(
    'Set-Cookie',
    `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`
  );
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

funzione asincrona supabaseFetch(
  sentiero,
  { metodo = 'GET', accessToken, corpo, intestazioni = {} } = {}
) {
  const { url, key } = supabaseConfig();
  const h = { apikey: chiave, ...intestazioni };
  se (accessToken) h.Authorization = `Portatore ${accessToken}`;
  se (body !== undefined) h['Content-Type'] = 'application/json';

  const r = await fetch(`${url}${path}`, {
    metodo,
    intestazioni: h,
    corpo: corpo === undefined ? undefined : JSON.stringify(corpo)
  });

  lascia che i dati siano nulli;
  try { data = await r.json(); } catch {}
  restituisci { risposta: r, dati };
}

funzione asincrona redis(path, { method = 'GET', body } = {}) {
  const url = str(process.env.UPSTASH_REDIS_REST_URL).replace(/\/$/, '');
  const tokenValue = str(process.env.UPSTASH_REDIS_REST_TOKEN);

  se (!url || !tokenValue) {
    lanciare un nuovo errore('Limitatore di velocità Redis non configurato.');
  }

  const r = await fetch(`${url}${path}`, {
    metodo,
    intestazioni: {
      Autorizzazione: `Portatore ${tokenValue}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    },
    corpo: corpo !== undefined ? JSON.stringify(corpo) : undefined
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.error) throw new Error(data.error || 'Errore Redis');
  restituisci i dati.risultato;
}

funzione asincrona redisGet(key) {
  restituisci redis(`/get/${encodeURIComponent(key)}`);
}

funzione asincrona redisSet(chiave, valore, ttl) {
  restituisci redis(`/set/${encodeURIComponent(key)}?EX=${ttl}`, {
    metodo: 'POST',
    corpo: valore
  });
}

funzione asincrona redisDel(key) {
  restituisci redis(`/del/${encodeURIComponent(key)}`);
}

funzione asincrona redisIncr(key, ttl) {
  const valore = Numero(await redis(`/incr/${encodeURIComponent(chiave)}`));
  se (valore === 1) {
    await redis(`/expire/${encodeURIComponent(key)}/${ttl}`);
  }
  valore di ritorno;
}

funzione asincrona rateLimitLogin(ip, email) {
  const keys = [
    `cm:admin:login:ip:${ip}`,
    `cm:admin:login:email:${email.toLowerCase()}`
  ];
  const counts = [];
  per (costante chiave di chiavi) conta.push(Numero(aspetta redisGet(chiave) || 0));
  ritorno {
    bloccato: counts.some(n => n >= MAX_LOGIN_FAILURES),
    conteggi
  };
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

funzione asincrona createStoredSession({
  ID utente,
  e-mail,
  accessToken,
  refreshToken,
  aal = 'aal2'
}) {
  const id = token();
  const ts = now();

  record costante = {
    ID utente,
    e-mail,
    accessToken,
    refreshToken,
    aal,
    creatoIl: ts,
    ultimaAttivitàAlle: ts
  };

  attendi redisSet(
    `cm:admin:session:${id}`,
    JSON.stringify(record),
    SESSIONE_TTL
  );

  restituisci l'ID;
}

funzione asincrona getStoredSession(id) {
  se (!id) restituisce null;

  const raw = await redisGet(`cm:admin:session:${id}`);
  se (!raw) restituisci null;

  Tentativo {
    restituisci { chiave: id, ...JSON.parse(raw) };
  } presa {
    restituisci null;
  }
}

funzione asincrona touchSession(session) {
  sessione.ultimaAttivitàAl = ora();

  const remaining = Math.max(
    60,
    SESSION_TTL - (session.lastActivityAt - session.createdAt)
  );

  attendi redisSet(
    `cm:admin:session:${session.key}`,
    JSON.stringify(session),
    rimanente
  );
}

funzione asincrona requireAdmin(req, res) {
  const cookies = parseCookies(req);
  const session = await getStoredSession(cookies[COOKIE]);

  se (!sessione) {
    clearCookie(res, COOKIE);
    restituisci null;
  }

  const current = now();

  Se (
    (corrente - Numero(session.lastActivityAt || 0)) > IDLE_TTL ||
    (corrente - Numero(session.createdAt || 0)) > SESSION_TTL
  ) {
    await redisDel(`cm:admin:session:${session.key}`);
    clearCookie(res, COOKIE);
    restituisci null;
  }

  let userResult = await supabaseFetch('/auth/v1/user', {
    accessToken: session.accessToken
  });

  se (userResult.response.status === 401 && session.refreshToken) {
    const refreshed = await supabaseFetch(
      '/auth/v1/token?grant_type=refresh_token',
      {
        metodo: 'POST',
        corpo: { refresh_token: session.refreshToken }
      }
    );

    se (!refreshed.response.ok || !refreshed.data?.access_token) {
      await redisDel(`cm:admin:session:${session.key}`);
      clearCookie(res, COOKIE);
      restituisci null;
    }

    session.accessToken = refreshed.data.access_token;
    session.refreshToken =
      dati aggiornati.refresh_token || session.refreshToken;

    userResult = await supabaseFetch('/auth/v1/user', {
      accessToken: session.accessToken
    });
  }

  Se (
    !userResult.response.ok ||
    userResult.data?.email?.toLowerCase() !==
      str(process.env.CM_ADMIN_EMAIL).toLowerCase()
  ) {
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
    metodo: 'POST',
    accessToken,
    corpo: {
      factor_type: 'totp',
      friendly_name: 'Amministratore di CM Consulting',
      emittente: 'CM Consulting'
    }
  });
}

/**
 * Normalizza il codice QR TOTP di Supabase in un URL di dati compatibile con <img>.
 *
 * Supabase può restituire:
 * - un URL esistente data:image/svg+xml;
 * - raw <svg>...</svg>;
 * - una dichiarazione XML seguita da <svg>...</svg>.
 */
funzione qrDataUrl(valore) {
  const qr = str(value);
  se (!qr) restituisci null;

  se (/^data:image\/svg\+xml[,;]/i.test(qr)) {
    returnqr;
  }

  se (/^(?:<\?xml[\s\S]*?\?>\s*)?<svg[\s>]/i.test(qr)) {
    restituisci `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`;
  }

  returnqr;
}

funzione asincrona challenge(accessToken, factorId) {
  restituisci supabaseFetch(
    `/auth/v1/factors/${encodeURIComponent(factorId)}/challenge`,
    {
      metodo: 'POST',
      accessToken,
      corpo: {}
    }
  );
}

funzione asincrona verifica(accessToken, factorId, challengeId, code) {
  restituisci supabaseFetch(
    `/auth/v1/factors/${encodeURIComponent(factorId)}/verify`,
    {
      metodo: 'POST',
      accessToken,
      corpo: {
        challenge_id: challengeId,
        codice
      }
    }
  );
}

funzione asincrona deleteFactor(accessToken, factorId) {
  restituisci supabaseFetch(
    `/auth/v1/factors/${encodeURIComponent(factorId)}`,
    {
      metodo: 'CELERA',
      accessToken
    }
  );
}

funzione asincrona dbRequest(
  sentiero,
  { metodo = 'GET', corpo } = {}
) {
  const url = str(process.env.SUPABASE_URL).replace(/\/$/, '');
  const serviceKey = str(process.env.SUPABASE_SERVICE_ROLE_KEY);

  se (!url || !serviceKey) {
    genera un nuovo errore('Database Supabase non configurabile.');
  }

  const headers = {
    apikey: serviceKey,
    Autorizzazione: `Portatore ${serviceKey}`,
    'Content-Type': 'application/json',
    Preferisci: 'return=representation'
  };

  const r = await fetch(`${url}/rest/v1/${path}`, {
    metodo,
    intestazioni,
    corpo: corpo === undefined ? undefined : JSON.stringify(corpo)
  });

  lascia che i dati siano nulli;
  try { data = await r.json(); } catch {}
  restituisci { risposta: r, dati };
}

funzione cleanPractice(corpo) {
  const client = str(body.client);
  const type = str(body.type);
  const expiry = str(body.expiry);
  const email = str(body.email);
  const notes = str(body.notes);

  const clientPrice =
    body.clientPrice === '' || body.clientPrice == null
      ? null
      : Numero(corpoclientePrezzo);

  const reviewerCost =
    body.reviewerCost === '' || body.reviewerCost == null
      ? null
      : Numero(body.reviewerCost);

  Se (
    !client ||
    client.length > 180 ||
    !tipo ||
    tipo.lunghezza > 120 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(expiry)
  ) {
    lanciare new Error('Dati pratica non validi.');
  }

  Se (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    genera un nuovo errore ('Email non valida');
  }

  se (notes.length > 10000) {
    lanciare un nuovo Error('Note troppo lunghe.');
  }

  Se (
    (clientPrice != null && !Number.isFinite(clientPrice)) ||
    (reviewerCost != null && !Number.isFinite(reviewerCost))
  ) {
    lanciare un nuovo Error('Importi non validi.');
  }

  ritorno {
    cliente,
    tipo,
    scadenza,
    email: email || null,
    prezzo_cliente: prezzo_cliente,
    costo_revisore: costo_revisore,
    note: note || null
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  se (!originAllowed(req)) {
    restituisci json(res, 403, {
      ok: falso,
      errore: {
        codice: 'BAD_ORIGIN',
        messaggio: 'Origine non consentita.'
      }
    });
  }

  const action = str(req.query?.action || 'session');

  Tentativo {
    se (azione === 'public-config' e req.method === 'GET') {
      const { url, key } = supabaseConfig();

      restituisci json(res, 200, {
        ok: vero,
        supabaseUrl: url,
        supabaseAnonKey: chiave
      });
    }

    se (azione === 'login' e req.method === 'POST') {
      corpo costante =
        req.body && typeof req.body === 'object'
          ? corpo richiesto
          : {};

      const email = str(body.email);
      const password =
        typeof body.password === 'string'
          ? bodypassword
          : '';

      Se (
        !email ||
        !password ||
        email.lunghezza > 254 ||
        lunghezza password > 256
      ) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'CREDITI_NON_VALIDI',
            messaggio: 'Credenziali non valide.'
          }
        });
      }

      const ip = getIp(req);
      const limiter = await rateLimitLogin(ip, email);

      se (limitatore bloccato) {
        restituisci json(res, 429, {
          ok: falso,
          errore: {
            codice: 'LOGIN_LOCKED',
            messaggio: 'Troppi tentativi. Riprova tra 15 minuti.'
          }
        });
      }

      const auth = await supabaseFetch(
        '/auth/v1/token?grant_type=password',
        {
          metodo: 'POST',
          corpo: { email, password }
        }
      );

      se (!auth.response.ok || !auth.data?.access_token) {
        attendi recordLoginFailure(ip, email);

        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'CREDITI_NON_VALIDI',
            messaggio: 'Email o password non valida.'
          }
        });
      }

      const utente = auth.data.utente;

      Se (
        !utente?email ||
        user.email.toLowerCase() !==
          str(process.env.CM_ADMIN_EMAIL).toLowerCase()
      ) {
        attendi recordLoginFailure(ip, email);

        restituisci json(res, 403, {
          ok: falso,
          errore: {
            codice: 'VIETATO',
            messaggio: 'Conto non autorizzato.'
          }
        });
      }

      attendi clearLoginFailures(ip, email);

      const factors = await listFactors(auth.data.access_token);

      const verifiedTopp =
        Array.isArray(factors?.totp)
          ? factors.totp.find(f => f.status === 'verified')
          : null;

      const pending = token();

      attendi redisSet(
        `cm:admin:pending:${pending}`,
        JSON.stringify({
          userId: user.id,
          email: user.email,
          accessToken: auth.data.access_token,
          refreshToken: auth.data.refresh_token,
          creato in: ora()
        }),
        IN ATTESA DI TTL
      );

      setCookie(
        res,
        COOKIE IN SOSPESO,
        in attesa di,
        IN ATTESA DI TTL
      );

      se (!verifiedTotp) {
        costante stantio =
          Array.isArray(factors?.totp)
            ? factors.totp.filter(f => f.status === 'unverified')
            : [];

        per (fattore costante di obsoleto) {
          attendi deleteFactor(
            token_di_accesso_ai_dati_di_autenticazione,
            factor.id
          ).catch(() => {});
        }

        costante iscritto =
          attendi l'iscrizione al token di accesso (auth.data.access_token);

        Se (
          !enrolled.response.ok ||
          !enrolled.data?.id
        ) {
          restituisci json(res, 503, {
            ok: falso,
            errore: {
              codice: 'MFA_SETUP_FAILED',
              messaggio:
                'Impossibile avviare la configurazione MFA.'
            }
          });
        }

        attendi redisSet(
          `cm:admin:pending:${pending}`,
          JSON.stringify({
            userId: user.id,
            email: user.email,
            accessToken: auth.data.access_token,
            refreshToken: auth.data.refresh_token,
            creatoIn: ora(),
            factorId: enrolled.data.id
          }),
          IN ATTESA DI TTL
        );

        restituisci json(res, 200, {
          ok: vero,
          stato: 'mfa_setup',
          factorId: enrolled.data.id,
          codice QR: URL dati QR(
            dati_di_iscrizione.totp?.qr_code
          ),
          segreto:
            dati.totp?.segreto || null
        });
      }

      const ch = await challenge(
        token_di_accesso_ai_dati_di_autenticazione,
        verifiedTopp.id
      );

      se (!ch.response.ok || !ch.data?.id) {
        restituisci json(res, 503, {
          ok: falso,
          errore: {
            codice: 'MFA_CHALLENGE_FAILED',
            messaggio:
              "Impossibile avviare la verifica MFA."
          }
        });
      }

      attendi redisSet(
        `cm:admin:pending:${pending}`,
        JSON.stringify({
          userId: user.id,
          email: user.email,
          accessToken: auth.data.access_token,
          refreshToken: auth.data.refresh_token,
          creatoIn: ora(),
          factorId: verifiedTotp.id,
          challengeId: ch.data.id
        }),
        IN ATTESA DI TTL
      );

      restituisci json(res, 200, {
        ok: vero,
        stato: 'mfa_required',
        factorId: verifiedTotp.id,
        challengeId: ch.data.id
      });
    }

    se (azione === 'mfa-verify' e req.method === 'POST') {
      const cookies = parseCookies(req);
      const pendingKey = cookies[PENDING_COOKIE];

      const raw = pendingKey
        ? await redisGet(`cm:admin:pending:${pendingKey}`)
        : null;

      se (!raw) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'MFA_SESSION_EXPIRED',
            messaggio:
              'Sessione di verifica scaduta. Effettua nuovamente il login.'
          }
        });
      }

      const pending = JSON.parse(raw);

      corpo costante =
        req.body && typeof req.body === 'object'
          ? corpo richiesto
          : {};

      const code = str(body.code).replace(/\s/g, '');

      Se (
        !/^\d{6}$/.test(code) ||
        !pendingfactorId ||
        !pending.challengeId
      ) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'INVALID_MFA_CODE',
            messaggio: 'Codice MFA non valido.'
          }
        });
      }

      const verificato = attendi verifica(
        in sospesoaccessToken,
        in sospeso.factorId,
        in sospeso.challengeId,
        codice
      );

      Se (
        !risposta verificata.ok ||
        !dati verificati?.token_di_accesso
      ) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'INVALID_MFA_CODE',
            messaggio:
              'Codice MFA non valido o scaduto.'
          }
        });
      }

      const sessionId =
        attendi createStoredSession({
          userId: in sospeso.userId,
          email: in sospeso.email,
          accessToken: verified.data.access_token,
          refreshToken:
            verified.data.refresh_token ||
            in sospeso.refreshToken,
          aal: 'aal2'
        });

      attendi redisDel(
        `cm:admin:pending:${pendingKey}`
      );

      setMultipleCookies(res, [
        cookieString(
          BISCOTTO,
          ID sessione,
          SESSIONE_TTL
        ),
        cookieString(
          COOKIE IN SOSPESO,
          '',
          0
        )
      ]);

      restituisci json(res, 200, {
        ok: vero,
        stato: 'autenticato'
      });
    }

    Se (
      azione === 'mfa-setup-verify' &&
      req.method === 'POST'
    ) {
      const cookies = parseCookies(req);
      const pendingKey = cookies[PENDING_COOKIE];

      const raw = pendingKey
        ? await redisGet(`cm:admin:pending:${pendingKey}`)
        : null;

      se (!raw) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'MFA_SESSION_EXPIRED',
            messaggio:
              'Sessione di configurazione scaduta.'
          }
        });
      }

      const pending = JSON.parse(raw);
      codice costante =
        str(req.body?.code).replace(/\s/g, '');

      Se (
        !/^\d{6}$/.test(code) ||
        !in sospeso factorId
      ) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'INVALID_MFA_CODE',
            messaggio: 'Codice MFA non valido.'
          }
        });
      }

      const ch = await challenge(
        in sospesoaccessToken,
        in sospeso.factorId
      );

      se (!ch.response.ok || !ch.data?.id) {
        restituisci json(res, 503, {
          ok: falso,
          errore: {
            codice: 'MFA_CHALLENGE_FAILED',
            messaggio:
              "Impossibile avviare la verifica MFA."
          }
        });
      }

      const verificato = attendi verifica(
        in sospesoaccessToken,
        in sospeso.factorId,
        ch.data.id,
        codice
      );

      Se (
        !risposta verificata.ok ||
        !dati verificati?.token_di_accesso
      ) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'INVALID_MFA_CODE',
            messaggio:
              'Codice MFA non valido o scaduto.'
          }
        });
      }

      const sessionId =
        attendi createStoredSession({
          userId: in sospeso.userId,
          email: in sospeso.email,
          accessToken: verified.data.access_token,
          refreshToken:
            verified.data.refresh_token ||
            in sospeso.refreshToken,
          aal: 'aal2'
        });

      attendi redisDel(
        `cm:admin:pending:${pendingKey}`
      );

      setMultipleCookies(res, [
        cookieString(
          BISCOTTO,
          ID sessione,
          SESSIONE_TTL
        ),
        cookieString(
          COOKIE IN SOSPESO,
          '',
          0
        )
      ]);

      restituisci json(res, 200, {
        ok: vero,
        stato: 'autenticato'
      });
    }

    Se (
      azione === 'password dimenticata' &&
      req.method === 'POST'
    ) {
      const email = str(req.body?.email);
      const adminEmail =
        str(process.env.CM_ADMIN_EMAIL).toLowerCase();

      Se (
        !email ||
        email.toLowerCase() !== adminEmail
      ) {
        restituisci json(res, 200, {
          ok: vero,
          messaggio:
            'Se l'account è autorizzato, riceverai le istruzioni via email.'
        });
      }

      sito costante =
        str(process.env.SITE_URL).replace(/\/$/, '');

      const r = await supabaseFetch(
        '/auth/v1/recover',
        {
          metodo: 'POST',
          corpo: {
            e-mail,
            reindirizzamento a: `${site}/admin/reset`
          }
        }
      );

      se (!r.response.ok) {
        console.error(
          'Errore di reimpostazione della password',
          r.data
        );
      }

      restituisci json(res, 200, {
        ok: vero,
        messaggio:
          'Se l'account è autorizzato, riceverai le istruzioni via email.'
      });
    }

    Se (
      azione === 'sessione' &&
      req.method === 'GET'
    ) {
      const auth = await requireAdmin(req, res);

      se (!autenticazione) {
        restituisci json(res, 401, {
          ok: falso,
          autenticato: falso
        });
      }

      restituisci json(res, 200, {
        ok: vero,
        autenticato: vero,
        utente: {
          ID: auth.user.id,
          email: auth.user.email
        },
        timeout inattivo in secondi: IDLE_TTL
      });
    }

    Se (
      azione === 'logout' &&
      req.method === 'POST'
    ) {
      const cookies = parseCookies(req);
      const sessione =
        attendi getStoredSession(cookies[COOKIE]);

      se (sessione) {
        attendi supabaseFetch(
          '/auth/v1/logout',
          {
            metodo: 'POST',
            accessToken: session.accessToken,
            corpo: {}
          }
        ).catch(() => {});

        attendi redisDel(
          `cm:admin:session:${session.key}`
        );
      }

      setMultipleCookies(res, [
        cookieString(COOKIE, '', 0),
        cookieString(PENDING_COOKIE, '', 0)
      ]);

      restituisci json(res, 200, { ok: true });
    }

    Se (
      azione === 'mfa-enroll' &&
      req.method === 'POST'
    ) {
      const auth = await requireAdmin(req, res);

      se (!autenticazione) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'NON AUTORIZZATO',
            messaggio: 'Autenticazione richiesta.'
          }
        });
      }

      const r = await enrollTotp(
        auth.session.accessToken
      );

      se (!r.response.ok) {
        restituisci json(res, r.response.status, {
          ok: falso,
          errore: {
            codice: 'MFA_ENROLL_FAILED',
            messaggio:
              'Impossibile aggiungere il fattore MFA.'
          }
        });
      }

      restituisci json(res, 200, {
        ok: vero,
        factorId: r.data.id,
        codice QR: URL dati QR(
          r.data.totp?.qr_code
        ),
        segreto:
          r.data.totp?.secret || null
      });
    }

    Se (
      azione === 'mfa-add-verify' &&
      req.method === 'POST'
    ) {
      const auth = await requireAdmin(req, res);

      se (!autenticazione) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'NON AUTORIZZATO',
            messaggio: 'Autenticazione richiesta.'
          }
        });
      }

      codice costante =
        str(req.body?.code).replace(/\s/g, '');

      const factorId =
        str(req.body?.factorId);

      Se (
        !factorId ||
        !/^\d{6}$/.test(code)
      ) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'INVALID_MFA_CODE',
            messaggio: 'Codice MFA non valido.'
          }
        });
      }

      const ch = await challenge(
        auth.session.accessToken,
        ID fattore
      );

      se (!ch.response.ok) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'MFA_CHALLENGE_FAILED',
            messaggio:
              'Impossibile creare la verifica MFA.'
          }
        });
      }

      const verificato = attendi verifica(
        auth.session.accessToken,
        ID del fattore,
        ch.data.id,
        codice
      );

      se (!risposta verificata.ok) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'INVALID_MFA_CODE',
            messaggio: 'Codice MFA non valido.'
          }
        });
      }

      se (verificato.data?.access_token) {
        auth.session.accessToken =
          Token di accesso ai dati verificato;
      }

      se (verified.data?.refresh_token) {
        auth.session.refreshToken =
          Token di aggiornamento dati verificato;
      }

      attendi touchSession(auth.session);

      restituisci json(res, 200, { ok: true });
    }

    Se (
      azione === 'password' &&
      req.method === 'POST'
    ) {
      const auth = await requireAdmin(req, res);

      se (!autenticazione) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'NON AUTORIZZATO',
            messaggio: 'Autenticazione richiesta.'
          }
        });
      }

      const password =
        typeof req.body?.password === 'string'
          ? req.body.password
          : '';

      const currentPassword =
        typeof req.body?.currentPassword === 'string'
          ? req.body.currentPassword
          : '';

      Se (
        password.lunghezza < 12 ||
        password.lunghezza > 256 ||
        !/[AZ]/test(password) ||
        !/[az]/.test(password) ||
        !/\d/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'WEAK_PASSWORD',
            messaggio:
              'Usa almeno 12 caratteri con maiuscole, minuscole, numeri e simboli.'
          }
        });
      }

      const r = await supabaseFetch(
        '/auth/v1/user',
        {
          metodo: 'PUT',
          accessToken: auth.session.accessToken,
          corpo: {
            password,
            ...(password attuale
              { current_password: currentPassword }
              : {})
          }
        }
      );

      se (!r.response.ok) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'PASSWORD_UPDATE_FAILED',
            messaggio: 'Password non modificata.'
          }
        });
      }

      restituisci json(res, 200, { ok: true });
    }

    Se (
      azione === 'pratiche' &&
      req.method === 'GET'
    ) {
      const auth = await requireAdmin(req, res);

      se (!autenticazione) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'NON AUTORIZZATO',
            messaggio: 'Autenticazione richiesta.'
          }
        });
      }

      const r = await dbRequest(
        'admin_practices?select=*&order=expiry.asc,created_at.desc'
      );

      se (!r.response.ok) {
        restituisci json(res, 503, {
          ok: falso,
          errore: {
            codice: 'DATABASE_ERROR',
            messaggio: 'Archivio non disponibile.'
          }
        });
      }

      restituisci json(res, 200, {
        ok: vero,
        pratiche: r.data || []
      });
    }

    Se (
      azione === 'pratiche' &&
      req.method === 'POST'
    ) {
      const auth = await requireAdmin(req, res);

      se (!autenticazione) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'NON AUTORIZZATO',
            messaggio: 'Autenticazione richiesta.'
          }
        });
      }

      pratica costante =
        cleanPractice(req.body || {});

      const r = await dbRequest(
        'pratiche_amministrative',
        {
          metodo: 'POST',
          corpo: {
            ...pratica,
            creato_da: auth.user.id
          }
        }
      );

      se (!r.response.ok) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'DATABASE_ERROR',
            messaggio:
              'Impossibile salvare la pratica.'
          }
        });
      }

      restituisci json(res, 200, {
        ok: vero,
        pratica: r.data?.[0] || null
      });
    }

    Se (
      azione === 'pratica' &&
      req.method === 'PATCH'
    ) {
      const auth = await requireAdmin(req, res);

      se (!autenticazione) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'NON AUTORIZZATO',
            messaggio: 'Autenticazione richiesta.'
          }
        });
      }

      const id = str(req.query?.id);

      se (!/^[0-9a-f-]{36}$/i.test(id)) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'ID_INVALIDO',
            messaggio:
              'Identificativo non valido.'
          }
        });
      }

      const patch = {};

      se ('selezionato' in (req.body || {})) {
        patchchecked = Boolean(
          req.bodychecked
        );
      }

      se ('note' in (req.body || {})) {
        patch.notes =
          str(req.body.notes).slice(0, 10000);
      }

      const r = await dbRequest(
        `admin_practices?id=eq.${encodeURIComponent(id)}`,
        {
          metodo: 'PATCH',
          corpo: patch
        }
      );

      se (!r.response.ok) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'DATABASE_ERROR',
            messaggio:
              'Impossibile aggiornare la pratica.'
          }
        });
      }

      restituisci json(res, 200, {
        ok: vero,
        pratica: r.data?.[0] || null
      });
    }

    Se (
      azione === 'pratica' &&
      req.method === 'DELETE'
    ) {
      const auth = await requireAdmin(req, res);

      se (!autenticazione) {
        restituisci json(res, 401, {
          ok: falso,
          errore: {
            codice: 'NON AUTORIZZATO',
            messaggio: 'Autenticazione richiesta.'
          }
        });
      }

      const id = str(req.query?.id);

      se (!/^[0-9a-f-]{36}$/i.test(id)) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'ID_INVALIDO',
            messaggio:
              'Identificativo non valido.'
          }
        });
      }

      const r = await dbRequest(
        `admin_practices?id=eq.${encodeURIComponent(id)}`,
        {
          metodo: 'CELERA'
        }
      );

      se (!r.response.ok) {
        restituisci json(res, 400, {
          ok: falso,
          errore: {
            codice: 'DATABASE_ERROR',
            messaggio:
              'Impossibile eliminare la pratica.'
          }
        });
      }

      restituisci json(res, 200, { ok: true });
    }

    restituisci json(res, 404, {
      ok: falso,
      errore: {
        codice: 'NON_TROVATO',
        messaggio: "Endpoint non trovato."
      }
    });
  } catch (errore) {
    console.error('Errore API di amministrazione CM:', error);

    restituisci json(res, 503, {
      ok: falso,
      errore: {
        codice: 'SERVICE_NOT_CONFIGURED',
        messaggio:
          'Area amministrativa non configurata o temporaneamente non disponibile.'
      }
    });
  }
}
