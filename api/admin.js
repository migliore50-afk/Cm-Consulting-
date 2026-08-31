const $ = (id) => document.getElementById(id);
const state = { mode: null, factorId: null, practices: [] };

funzione msg(el, testo, tipo = '') {
  el.textContent = testo || '';
  el.className = `messaggio ${type}`;
}

funzione mostra(vista) {
  ['loginView', 'mfaView', 'appView'].forEach(id =>
    $(id).classList.toggle('nascosto', id !== view)
  );
}

funzione normalizeQr(valore) {
  const qr = String(value ?? '').trim();
  se (!qr) restituisci '';
  se (/^data:image\//i.test(qr)) restituisci qr;

  se (/^<\?xml[\s\S]*<svg[\s>]/i.test(qr) || /^<svg[\s>]/i.test(qr)) {
    restituisci `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`;
  }

  se (/^https?:\/\//i.test(qr)) restituisci qr;
  returnqr;
}

funzione asincrona api(azione, opzioni = {}) {
  const response = await fetch(
    `/api/admin?action=${encodeURIComponent(action)}${options.query || ''}`,
    {
      metodo: opzioni.metodo || 'GET',
      credenziali: 'stessa origine',
      intestazioni: {
        'Content-Type': 'application/json',
        ...(opzioni intestazioni || {})
      },
      corpo: options.body === undefined ? undefined : JSON.stringify(options.body)
    }
  );

  const data = await response.json().catch(() => ({}));

  se (!risposta.ok) {
    lancia un nuovo Error(data?.error?.message || 'Operazione non riuscita.');
  }

  restituire i dati;
}

funzione giorniFinoA(data) {
  restituisci Math.ceil(
    (nuovo Date(`${date}T23:59:59`) - nuovo Date()) / 86400000
  );
}

funzione stato(data) {
  const d = daysUntil(date);
  se (d < 0) restituisci ['Scaduta', 'cattivo'];
  if (d <= 30) return ['In scadenza', 'avvisa'];
  restituisci ['Attiva', 'ok'];
}

funzione escapeHtml(v) {
  restituisci String(v ?? '').replace(/[&<>'"]/g, c => ({
    '&': '&',
    '<': '<',
    '>': '>',
    "'": ''',
    '"': '"'
  }[C]));
}

funzione renderPractices() {
  const righe = pratiche statali;

  $('practiceBody').innerHTML = rows.length
    ? righe.map(p => {
        const s = status(p.expiry);
        restituisci `<tr>
          <td><strong>${escapeHtml(p.client)}</strong></td>
          <td>${escapeHtml(p.type)}</td>
          <td>${new Date(`${p.expiry}T00:00:00`).toLocaleDateString('it-IT')}</td>
          <td><span class="status ${s[1]}">${s[0]}</span></td>
          <td><button class="small-btn" data-open="${p.id}">APRI</button></td>
        </tr>`;
      }).giuntura('')
    : '<tr><td colspan="5" style="text-align:center;padding:36px;color:#65717d"> Nessuna pratica registrata.</td></tr>';

  $('mTot').textContent = rows.length;
  $('mSoon').textContent = righe.filter(
    p => daysUntil(p.expiry) >= 0 && daysUntil(p.expiry) <= 30
  ).lunghezza;
  $('mOpen').textContent = rows.filter(p => !p.checked).length;
}

funzione openDetail(id) {
  const p = state.practices.find(x => x.id === id);
  se (!p) restituisci;

  const s = status(p.expiry);
  const d = $('dettaglio');
  d.classList.remove('hidden');

  d.innerHTML = `<div class="section-head">
    <div>
      <div class="eyebrow">PRATICA</div>
      <h2>${escapeHtml(p.client)}</h2>
      <p class="muted">${escapeHtml(p.type)} · scadenza ${new Date(`${p.expiry}T00:00:00`).toLocaleDateString('it-IT')}</p>
    </div>
    <button class="small-btn" id="closeDetail">CHIUDI</button>
  </div>
  <div class="metrics">
    <div><b>€ ${Number(p.client_price || 0).toFixed(2)}</b><span>Prezzo cliente</span></div>
    <div><b>€ ${Number(p.reviewer_cost || 0).toFixed(2)}</b><span>Costo revisore</span></div>
    <div><b><span class="status ${s[1]}">${s[0]}</span></b><span>Stato</span></div>
  </div>
  <p><strong>Email:</strong> ${escapeHtml(p.email || '—')}</p>
  <p><strong>Nota:</strong> ${escapeHtml(p.notes || '—')}</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="small-btn" id="toggleChecked">${p.controllato ? 'SEGNA DA VERIFICARE' : 'SEGNA VERIFICATA'}</button>
    <button class="small-btn" id="deletePractice">ELIMINA</button>
  </div>`;

  $('closeDetail').onclick = () => d.classList.add('hidden');

  $('toggleChecked').onclick = async () => {
    Tentativo {
      attendi api('pratica', {
        metodo: 'PATCH',
        query: `&id=${encodeURIComponent(p.id)}`,
        corpo: { controllato: !p.controllato }
      });
      attendi loadPractices();
      openDetail(id);
    } catch (e) {
      avviso(messaggio);
    }
  };

  $('deletePractice').onclick = async () => {
    if (!confirm('Eliminare definitivamente la pratica?')) return;

    Tentativo {
      attendi api('pratica', {
        metodo: 'CELERA',
        query: `&id=${encodeURIComponent(p.id)}`
      });
      d.classList.add('nascosto');
      attendi loadPractices();
    } catch (e) {
      avviso(messaggio);
    }
  };
}

funzione asincrona loadPractices() {
  const data = await api('practices');
  state.practices = data.practices || [];
  renderPractice();
}

funzione asincrona enterApp(email) {
  $('userEmail').textContent = email || '';
  mostra('appView');
  attendi loadPractices();
}

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  msg($('loginMsg'), '');

  Tentativo {
    const data = await api('login', {
      metodo: 'POST',
      corpo: {
        email: $('loginEmail').value.trim(),
        password: $('loginPassword').value
      }
    });

    stato.modalità = stato dati;
    state.factorId = data.factorId || null;
    $('loginPassword').value = '';

    se (data.state === 'mfa_setup') {
      $('mfaTitle').textContent = 'Configura il secondo fattore';
      $('mfaIntro').textContent =
        'Scansiona il QR con Google Authenticator, Authy o un'app TOTP compatibile, quindi inserisci il codice di 6 cifre.';

      const qr = normalizeQr(data.qrCode);
      $('qrWrap').classList.toggle('nascosto', !qr);
      $('qrImage').src = qr;
      $('mfaSecret').textContent = data.secret || '';
      mostra('mfaView');
    } altro {
      $('mfaTitle').textContent = 'Verifica il secondo fattore';
      $('mfaIntro').textContent =
        'Inserisci il codice di 6 cifre generato dall'app Authenticator.';
      $('qrWrap').classList.add('hidden');
      mostra('mfaView');
    }

    $('mfaCode').focus();
  } catch (e) {
    msg($('loginMsg'), e.message, 'errore');
  }
});

$('mfaForm').addEventListener('submit', async e => {
  e.preventDefault();
  msg($('mfaMsg'), 'Verifica in corso...');

  Tentativo {
    azione costante =
      state.mode === 'mfa_setup' ? 'mfa-setup-verify' : 'mfa-verify';

    attendi l'API(azione, {
      metodo: 'POST',
      corpo: { codice: $('mfaCode').value.trim() }
    });

    $('mfaCode').value = '';
    msg($('mfaMsg'), 'Accesso autorizzato.', 'ok');
    await enterApp($('loginEmail').value.trim());
  } catch (e) {
    msg($('mfaMsg'), e.message, 'errore');
  }
});

$('backLoginBtn').onclick = async () => {
  await api('logout', { method: 'POST' }).catch(() => {});
  mostra('loginView');
  $('qrWrap').classList.add('hidden');
  msg($('mfaMsg'), '');
};

$('forgotBtn').onclick = async () => {
  const email = prompt('Inserisci l'email dell'account amministratore:');
  se (!email) restituisci;

  Tentativo {
    const d = await api('forgot-password', {
      metodo: 'POST',
      corpo: { email: email.trim() }
    });
    msg($('loginMsg'), d.message, 'ok');
  } catch (e) {
    msg($('loginMsg'), e.message, 'errore');
  }
};

$('logoutBtn').onclick = async () => {
  await api('logout', { method: 'POST' }).catch(() => {});
  mostra('loginView');
};

$('newPracticeBtn').onclick = () => {
  $('practiceModal').classList.remove('hidden');
  $('practiceMsg').textContent = '';
};

$('closeModal').onclick = () => $('practiceModal').classList.add('hidden');

$('practiceBody').addEventListener('click', e => {
  const btn = e.target.closest('[data-open]');
  if (btn) openDetail(btn.dataset.open);
});

$('practiceForm').addEventListener('submit', async e => {
  e.preventDefault();

  const f = new FormData(e.target);

  Tentativo {
    attendi api('pratiche', {
      metodo: 'POST',
      corpo: Object.fromEntries(f.entries())
    });

    e.target.reset();
    $('practiceModal').classList.add('hidden');
    attendi loadPractices();
  } catch (err) {
    msg($('practiceMsg'), err.message, 'errore');
  }
});

$('passwordForm').addEventListener('submit', async e => {
  e.preventDefault();
  msg($('passwordMsg'), '');

  const p = $('newPassword').value;
  const c = $('confirmPassword').value;

  se (p !== c) {
    msg($('passwordMsg'), 'Le nuove password non coincidono.', 'error');
    ritorno;
  }

  Tentativo {
    attendi api('password', {
      metodo: 'POST',
      corpo: {
        password corrente: $('password corrente').valore,
        password: p
      }
    });

    e.target.reset();
    msg($('passwordMsg'), 'Password modificata correttamente.', 'ok');
  } catch (err) {
    msg($('passwordMsg'), err.message, 'errore');
  }
});

$('addMfaBtn').onclick = async () => {
  Tentativo {
    const d = await api('mfa-enroll', { method: 'POST' });
    const qr = normalizeQr(d.qrCode);

    $('settingsQr').classList.toggle('nascosto', !qr);
    $('settingsQrImage').src = qr;
    $('settingsSecret').textContent = d.secret || '';
    $('settingsMfaForm').dataset.factorId = d.factorId || '';
  } catch (e) {
    msg($('mfaSettingsMsg'), e.message, 'errore');
  }
};

$('settingsMfaForm').addEventListener('submit', async e => {
  e.preventDefault();

  Tentativo {
    attendi api('mfa-add-verify', {
      metodo: 'POST',
      corpo: {
        factorId: e.currentTarget.dataset.factorId,
        codice: $('settingsMfaCode').value.trim()
      }
    });

    e.currentTarget.reset();
    $('settingsQr').classList.add('hidden');
    msg($('mfaSettingsMsg'), 'Nuovo dispositivo MFA verificato.', 'ok');
  } catch (err) {
    msg($('mfaSettingsMsg'), err.message, 'errore');
  }
});

document.querySelectorAll('.nav-btn').forEach(btn =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $('practicesSection').classList.toggle(
      'nascosto',
      btn.dataset.section !== 'practices'
    );
    $('settingsSection').classList.toggle(
      'nascosto',
      btn.dataset.section !== 'settings'
    );
  })
);

(asincrono () => {
  Tentativo {
    const s = await api('session');
    se (s.autenticato) {
      attendi enterApp(s.user.email);
    } altro {
      mostra('loginView');
    }
  } presa {
    mostra('loginView');
  }
})();

lascia inattivoTimer;
const IDLE_MS = 15 * 60 * 1000;

funzione resetIdleTimer() {
  clearTimeout(idleTimer);

  se ($('appView').classList.contains('hidden')) restituisce;

  idleTimer = setTimeout(async () => {
    await api('logout', { method: 'POST' }).catch(() => {});
    alert('Sessione chiusa per inattività.');
    location.reload();
  }, IDLE_MS);
}

['click', 'keydown', 'mousemove', 'touchstart', 'scroll'].forEach(ev =>
  document.addEventListener(ev, resetIdleTimer, { passive: true })
);

const originaleEnterApp = enterApp;

enterApp = funzione asincrona(email) {
  attendi originalEnterApp(email);
  resetIdleTimer();
};
