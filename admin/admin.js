const $ = (id) => document.getElementById(id);
const state = { mode: null, factorId: null, practices: [] };
const $ = (id) => document.getElementById(id);
const state = { mode: null, factorId: null, practices: [] };

funzione msg(el, testo, tipo = '') { el.textContent = testo || ''; el.className = `messaggio ${tipo}`; }
funzione show(view) { ['loginView','mfaView','appView'].forEach(id => $(id).classList.toggle('hidden', id !== view)); }
funzione asincrona api(azione, opzioni = {}) {
  const response = await fetch(`/api/admin?action=${encodeURIComponent(action)}${options.query || ''}`, {
    metodo: options.method || 'GET', credenziali: 'same-origin', intestazioni: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    corpo: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) lancia un nuovo Error(data?.error?.message || 'Operazione non riuscita.');
  restituire i dati;
}
funzione daysUntil(date) { return Math.ceil((new Date(`${date}T23:59:59`) - new Date()) / 86400000); }
stato della funzione(data) { const d = daysUntil(data); if (d < 0) return ['Scaduta','cattivo']; if (d <= 30) return ['In scadenza','warn']; ritorno ['Attiva','ok']; }
funzione escapeHtml(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&','<':'<','>':'>',"'):''','"':'"'}[c])); }

funzione renderPractices() {
  const righe = pratiche statali;
  $('practiceBody').innerHTML = rows.length ? rows.map(p => {
    const s = status(p.expiry);
    return `<tr><td><strong>${escapeHtml(p.client)}</strong></td><td>${escapeHtml(p.type)}</td><td>${new Date(`${p.expiry}T00:00:00`).toLocaleDateString('it-IT')}</td><td><span class="status ${s[1]}">${s[0]}</span></td><td><button class="small-btn" data-open="${p.id}">APRI</button></td></tr>`;
  }).join('') : '<tr><td colspan="5" style="text-align:center;padding:36px;color:#65717d"> Nessuna pratica registrata.</td></tr>';
  $('mTot').textContent = rows.length;
  $('mSoon').textContent = rows.filter(p => daysUntil(p.expiry) >= 0 && daysUntil(p.expiry) <= 30).length;
  $('mOpen').textContent = rows.filter(p => !p.checked).length;
}
funzione openDetail(id) {
  const p = state.practices.find(x => x.id === id); if (!p) return;
  const s = status(p.expiry); const d = $('detail'); d.classList.remove('hidden');
  d.innerHTML = `<div class="section-head"><div><div class="eyebrow">PRATICA</div><h2>${escapeHtml(p.client)}</h2><p class="muted">${escapeHtml(p.type)} · scadenza ${new Date(`${p.expiry}T00:00:00`).toLocaleDateString('it-IT')}</p></div><button class="small-btn" id="closeDetail">CHIUDI</button></div><div class="metrics"><div><b>€ ${Number(p.client_price || 0).toFixed(2)}</b><span>Prezzo cliente</span></div><div><b>€ ${Number(p.reviewer_cost || 0).toFixed(2)}</b><span>Costo revisore</span></div><div><b><span class="status ${s[1]}">${s[0]}</span></b><span>Stato</span></div></div><p><strong>Email:</strong> ${escapeHtml(p.email || '—')}</p><p><strong>Nota:</strong> ${escapeHtml(p.notes || '—')}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="small-btn" id="toggleChecked">${p.checked ? 'SEGNA DA VERIFICARE' : 'SEGNA VERIFICATA'}</button><button class="small-btn" id="deletePractice">ELIMINA</button></div>`;
  $('closeDetail').onclick = () => d.classList.add('hidden');
  $('toggleChecked').onclick = async () => { try { await api('practice', { method:'PATCH', query:`&id=${encodeURIComponent(p.id)}`, body:{ checked: !p.checked } }); await loadPractices(); openDetail(id); } catch(e) { alert(e.message); } };
  $('deletePractice').onclick = async () => { if (!confirm('Eliminare definitivamente la pratica?')) return; try { await api('practice', { method:'DELETE', query:`&id=${encodeURIComponent(p.id)}` }); d.classList.add('hidden'); await loadPractices(); } catch(e) { alert(e.message); } };
}
async function loadPractices() { const data = await api('practices'); state.practices = data.practices || []; renderPractices(); }
async function enterApp(email) { $('userEmail').textContent = email || ''; show('appView'); await loadPractices(); }

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault(); msg($('loginMsg'), '');
  Tentativo {
    const data = await api('login', { method:'POST', body:{ email:$('loginEmail').value.trim(), password:$('loginPassword').value } });
    stato.modalità = dati.stato; stato.fattoreId = dati.fattoreId || null;
    $('loginPassword').value = '';
    se (data.state === 'mfa_setup') {
      $('mfaTitle').textContent = 'Configura il secondo fattore';
      $('mfaIntro').textContent = 'Scansiona il QR con Google Authenticator, Authy o un'app TOTP compatibile, quindi inserisci il codice di 6 cifre.';
      $('qrWrap').classList.remove('hidden'); $('qrImage').src = data.qrCode || ''; $('mfaSecret').textContent = data.secret || '';
      mostra('mfaView');
    } altro {
      $('mfaTitle').textContent = 'Verifica il secondo fattore';
      $('mfaIntro').textContent = 'Inserisci il codice di 6 cifre generato dall'app Authenticator.';
      $('qrWrap').classList.add('hidden'); show('mfaView');
    }
    $('mfaCode').focus();
  } catch(e) { msg($('loginMsg'), e.message, 'errore'); }
});
$('mfaForm').addEventListener('submit', async e => {
  e.preventDefault(); msg($('mfaMsg'), 'Verifica in corso...');
  Tentativo {
    const action = state.mode === 'mfa_setup' ? 'mfa-setup-verify' : 'mfa-verify';
    await api(action, { method:'POST', body:{ code:$('mfaCode').value.trim() } });
    $('mfaCode').valore=''; msg($('mfaMsg'), 'Accesso autorizzato.', 'ok');
    await enterApp($('loginEmail').value.trim());
  } catch(e) { msg($('mfaMsg'), e.message, 'errore'); }
});
$('backLoginBtn').onclick = async () => { await api('logout', {method:'POST'}).catch(()=>{}); show('loginView'); $('qrWrap').classList.add('hidden'); msg($('mfaMsg'),''); };
$('forgotBtn').onclick = async () => { const email = prompt('Inserisci l'email dell'account amministratore:'); if (!email) return; try { const d = await api('forgot-password',{method:'POST',body:{email:email.trim()}}); msg($('loginMsg'), d.message, 'ok'); } catch(e) { msg($('loginMsg'), e.message, 'errore'); } };
$('logoutBtn').onclick = async () => { await api('logout',{method:'POST'}).catch(()=>{}); show('loginView'); };
$('newPracticeBtn').onclick = () => { $('practiceModal').classList.remove('hidden'); $('practiceMsg').textContent=''; };
$('closeModal').onclick = () => $('practiceModal').classList.add('hidden');
$('practiceBody').addEventListener('click', e => { const btn = e.target.closest('[data-open]'); if (btn) openDetail(btn.dataset.open); });
$('practiceForm').addEventListener('submit', async e => { e.preventDefault(); const f = new FormData(e.target); try { await api('practices',{method:'POST',body:Object.fromEntries(f.entries())}); e.target.reset(); $('practiceModal').classList.add('hidden'); await loadPractices(); } catch(err) { msg($('practiceMsg'),err.message,'errore'); } });
$('passwordForm').addEventListener('submit', async e => { e.preventDefault(); msg($('passwordMsg'),''); const p=$('newPassword').value, c=$('confirmPassword').value; if(p!==c){msg($('passwordMsg'),'Le nuove password non coincidono.','error');return;} try{await api('password',{method:'POST',body:{currentPassword:$('currentPassword').value,password:p}});e.target.reset();msg($('passwordMsg'),'Password modificata correttamente.','ok');}catch(err){msg($('passwordMsg'),err.message,'error');} });
$('addMfaBtn').onclick = async () => { try { const d=await api('mfa-enroll',{method:'POST'}); $('settingsQr').classList.remove('hidden'); $('settingsQrImage').src=d.qrCode||''; $('settingsSecret').textContent=d.secret||''; $('settingsMfaForm').dataset.factorId=d.factorId; } catch(e){msg($('mfaSettingsMsg'),e.message,'errore');} };
$('settingsMfaForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('mfa-add-verify',{method:'POST',body:{factorId:e.currentTarget.dataset.factorId,code:$('settingsMfaCode').value.trim()}});e.currentTarget.reset();$('settingsQr').classList.add('hidden');msg($('mfaSettingsMsg'),'Nuovo dispositivo MFA verificato.','ok');}catch(err){msg($('mfaSettingsMsg'),err.message,'errore');}});
document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('practicesSection').classList.toggle('hidden',btn.dataset.section!=='practices');$('settingsSection').classList.toggle('hidden',btn.dataset.section!=='settings');}));
(async()=>{try{const s=await api('session');if(s.authenticated) await enterApp(s.user.email);else show('loginView');}catch{show('loginView');}})();

lascia inattivoTimer;
const IDLE_MS = 15 * 60 * 1000;
funzione resetIdleTimer(){
  clearTimeout(idleTimer);
  se ($('appView').classList.contains('hidden')) restituisce;
  idleTimer=setTimeout(async()=>{ await api('logout',{method:'POST'}).catch(()=>{}); alert('Sessione chiusa per inattività.'); location.reload(); },IDLE_MS);
}
['click','keydown','mousemove','touchstart','scroll'].forEach(ev=>document.addEventListener(ev,resetIdleTimer,{passive:true}));
const originaleEnterApp=enterApp;
enterApp=async function(email){ await originalEnterApp(email); resetIdleTimer(); };
funzione msg(el, testo, tipo = '') { el.textContent = testo || ''; el.className = `messaggio ${tipo}`; }
funzione show(view) { ['loginView','mfaView','appView'].forEach(id => $(id).classList.toggle('hidden', id !== view)); }
funzione asincrona api(azione, opzioni = {}) {
  const response = await fetch(`/api/admin?action=${encodeURIComponent(action)}${options.query || ''}`, {
    metodo: options.method || 'GET', credenziali: 'same-origin', intestazioni: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    corpo: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) lancia un nuovo Error(data?.error?.message || 'Operazione non riuscita.');
  restituire i dati;
}
funzione daysUntil(date) { return Math.ceil((new Date(`${date}T23:59:59`) - new Date()) / 86400000); }
stato della funzione(data) { const d = daysUntil(data); if (d < 0) return ['Scaduta','cattivo']; if (d <= 30) return ['In scadenza','warn']; ritorno ['Attiva','ok']; }
funzione escapeHtml(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&','<':'<','>':'>',"'):''','"':'"'}[c])); }

funzione renderPractices() {
  const righe = pratiche statali;
  $('practiceBody').innerHTML = rows.length ? rows.map(p => {
    const s = status(p.expiry);
    return `<tr><td><strong>${escapeHtml(p.client)}</strong></td><td>${escapeHtml(p.type)}</td><td>${new Date(`${p.expiry}T00:00:00`).toLocaleDateString('it-IT')}</td><td><span class="status ${s[1]}">${s[0]}</span></td><td><button class="small-btn" data-open="${p.id}">APRI</button></td></tr>`;
  }).join('') : '<tr><td colspan="5" style="text-align:center;padding:36px;color:#65717d"> Nessuna pratica registrata.</td></tr>';
  $('mTot').textContent = rows.length;
  $('mSoon').textContent = rows.filter(p => daysUntil(p.expiry) >= 0 && daysUntil(p.expiry) <= 30).length;
  $('mOpen').textContent = rows.filter(p => !p.checked).length;
}
funzione openDetail(id) {
  const p = state.practices.find(x => x.id === id); if (!p) return;
  const s = status(p.expiry); const d = $('detail'); d.classList.remove('hidden');
  d.innerHTML = `<div class="section-head"><div><div class="eyebrow">PRATICA</div><h2>${escapeHtml(p.client)}</h2><p class="muted">${escapeHtml(p.type)} · scadenza ${new Date(`${p.expiry}T00:00:00`).toLocaleDateString('it-IT')}</p></div><button class="small-btn" id="closeDetail">CHIUDI</button></div><div class="metrics"><div><b>€ ${Number(p.client_price || 0).toFixed(2)}</b><span>Prezzo cliente</span></div><div><b>€ ${Number(p.reviewer_cost || 0).toFixed(2)}</b><span>Costo revisore</span></div><div><b><span class="status ${s[1]}">${s[0]}</span></b><span>Stato</span></div></div><p><strong>Email:</strong> ${escapeHtml(p.email || '—')}</p><p><strong>Nota:</strong> ${escapeHtml(p.notes || '—')}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="small-btn" id="toggleChecked">${p.checked ? 'SEGNA DA VERIFICARE' : 'SEGNA VERIFICATA'}</button><button class="small-btn" id="deletePractice">ELIMINA</button></div>`;
  $('closeDetail').onclick = () => d.classList.add('hidden');
  $('toggleChecked').onclick = async () => { try { await api('practice', { method:'PATCH', query:`&id=${encodeURIComponent(p.id)}`, body:{ checked: !p.checked } }); await loadPractices(); openDetail(id); } catch(e) { alert(e.message); } };
  $('deletePractice').onclick = async () => { if (!confirm('Eliminare definitivamente la pratica?')) return; try { await api('practice', { method:'DELETE', query:`&id=${encodeURIComponent(p.id)}` }); d.classList.add('hidden'); await loadPractices(); } catch(e) { alert(e.message); } };
}
async function loadPractices() { const data = await api('practices'); state.practices = data.practices || []; renderPractices(); }
async function enterApp(email) { $('userEmail').textContent = email || ''; show('appView'); await loadPractices(); }

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault(); msg($('loginMsg'), '');
  Tentativo {
    const data = await api('login', { method:'POST', body:{ email:$('loginEmail').value.trim(), password:$('loginPassword').value } });
    stato.modalità = dati.stato; stato.fattoreId = dati.fattoreId || null;
    $('loginPassword').value = '';
    se (data.state === 'mfa_setup') {
      $('mfaTitle').textContent = 'Configura il secondo fattore';
      $('mfaIntro').textContent = 'Scansiona il QR con Google Authenticator, Authy o un'app TOTP compatibile, quindi inserisci il codice di 6 cifre.';
      $('qrWrap').classList.remove('hidden'); $('qrImage').src = data.qrCode || ''; $('mfaSecret').textContent = data.secret || '';
      mostra('mfaView');
    } altro {
      $('mfaTitle').textContent = 'Verifica il secondo fattore';
      $('mfaIntro').textContent = 'Inserisci il codice di 6 cifre generato dall'app Authenticator.';
      $('qrWrap').classList.add('hidden'); show('mfaView');
    }
    $('mfaCode').focus();
  } catch(e) { msg($('loginMsg'), e.message, 'errore'); }
});
$('mfaForm').addEventListener('submit', async e => {
  e.preventDefault(); msg($('mfaMsg'), 'Verifica in corso...');
  Tentativo {
    const action = state.mode === 'mfa_setup' ? 'mfa-setup-verify' : 'mfa-verify';
    await api(action, { method:'POST', body:{ code:$('mfaCode').value.trim() } });
    $('mfaCode').valore=''; msg($('mfaMsg'), 'Accesso autorizzato.', 'ok');
    await enterApp($('loginEmail').value.trim());
  } catch(e) { msg($('mfaMsg'), e.message, 'errore'); }
});
$('backLoginBtn').onclick = async () => { await api('logout', {method:'POST'}).catch(()=>{}); show('loginView'); $('qrWrap').classList.add('hidden'); msg($('mfaMsg'),''); };
$('forgotBtn').onclick = async () => { const email = prompt('Inserisci l'email dell'account amministratore:'); if (!email) return; try { const d = await api('forgot-password',{method:'POST',body:{email:email.trim()}}); msg($('loginMsg'), d.message, 'ok'); } catch(e) { msg($('loginMsg'), e.message, 'errore'); } };
$('logoutBtn').onclick = async () => { await api('logout',{method:'POST'}).catch(()=>{}); show('loginView'); };
$('newPracticeBtn').onclick = () => { $('practiceModal').classList.remove('hidden'); $('practiceMsg').textContent=''; };
$('closeModal').onclick = () => $('practiceModal').classList.add('hidden');
$('practiceBody').addEventListener('click', e => { const btn = e.target.closest('[data-open]'); if (btn) openDetail(btn.dataset.open); });
$('practiceForm').addEventListener('submit', async e => { e.preventDefault(); const f = new FormData(e.target); try { await api('practices',{method:'POST',body:Object.fromEntries(f.entries())}); e.target.reset(); $('practiceModal').classList.add('hidden'); await loadPractices(); } catch(err) { msg($('practiceMsg'),err.message,'errore'); } });
$('passwordForm').addEventListener('submit', async e => { e.preventDefault(); msg($('passwordMsg'),''); const p=$('newPassword').value, c=$('confirmPassword').value; if(p!==c){msg($('passwordMsg'),'Le nuove password non coincidono.','error');return;} try{await api('password',{method:'POST',body:{currentPassword:$('currentPassword').value,password:p}});e.target.reset();msg($('passwordMsg'),'Password modificata correttamente.','ok');}catch(err){msg($('passwordMsg'),err.message,'error');} });
$('addMfaBtn').onclick = async () => { try { const d=await api('mfa-enroll',{method:'POST'}); $('settingsQr').classList.remove('hidden'); $('settingsQrImage').src=d.qrCode||''; $('settingsSecret').textContent=d.secret||''; $('settingsMfaForm').dataset.factorId=d.factorId; } catch(e){msg($('mfaSettingsMsg'),e.message,'errore');} };
$('settingsMfaForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('mfa-add-verify',{method:'POST',body:{factorId:e.currentTarget.dataset.factorId,code:$('settingsMfaCode').value.trim()}});e.currentTarget.reset();$('settingsQr').classList.add('hidden');msg($('mfaSettingsMsg'),'Nuovo dispositivo MFA verificato.','ok');}catch(err){msg($('mfaSettingsMsg'),err.message,'errore');}});
document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('practicesSection').classList.toggle('hidden',btn.dataset.section!=='practices');$('settingsSection').classList.toggle('hidden',btn.dataset.section!=='settings');}));
(async()=>{try{const s=await api('session');if(s.authenticated) await enterApp(s.user.email);else show('loginView');}catch{show('loginView');}})();

lascia inattivoTimer;
const IDLE_MS = 15 * 60 * 1000;
funzione resetIdleTimer(){
  clearTimeout(idleTimer);
  se ($('appView').classList.contains('hidden')) restituisce;
  idleTimer=setTimeout(async()=>{ await api('logout',{method:'POST'}).catch(()=>{}); alert('Sessione chiusa per inattività.'); location.reload(); },IDLE_MS);
}
['click','keydown','mousemove','touchstart','scroll'].forEach(ev=>document.addEventListener(ev,resetIdleTimer,{passive:true}));
const originaleEnterApp=enterApp;
enterApp=async function(email){ await originalEnterApp(email); resetIdleTimer(); };
