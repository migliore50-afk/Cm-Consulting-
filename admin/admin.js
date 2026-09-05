 const $ = (id) => document.getElementById(id);
const state = { mode: null, factorId: null, practices: [], requests: [] };

function msg(el, text, type = '') { el.textContent = text || ''; el.className = `message ${type}`; }
function show(view) { ['loginView','mfaView','appView'].forEach(id => $(id).classList.toggle('hidden', id !== view)); }
async function api(action, options = {}) {
  const response = await fetch(`/api/admin?action=${encodeURIComponent(action)}${options.query || ''}`, {
    method: options.method || 'GET', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || 'Operazione non riuscita.');
  return data;
}
function daysUntil(date) { return Math.ceil((new Date(`${date}T23:59:59`) - new Date()) / 86400000); }
function status(date) { const d = daysUntil(date); if (d < 0) return ['Scaduta','bad']; if (d <= 30) return ['In scadenza','warn']; return ['Attiva','ok']; }
function escapeHtml(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function renderPractices() {
  const rows = state.practices;
  $('practiceBody').innerHTML = rows.length ? rows.map(p => {
    const s = status(p.expiry);
    return `<tr><td><strong>${escapeHtml(p.client)}</strong></td><td>${escapeHtml(p.type)}</td><td>${new Date(`${p.expiry}T00:00:00`).toLocaleDateString('it-IT')}</td><td><span class="status ${s[1]}">${s[0]}</span></td><td><button class="small-btn" data-open="${p.id}">APRI</button></td></tr>`;
  }).join('') : '<tr><td colspan="5" style="text-align:center;padding:36px;color:#65717d">Nessuna pratica registrata.</td></tr>';
  $('mTot').textContent = rows.length;
  $('mSoon').textContent = rows.filter(p => daysUntil(p.expiry) >= 0 && daysUntil(p.expiry) <= 30).length;
  $('mOpen').textContent = rows.filter(p => !p.checked).length;
}

function formatRequestDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? escapeHtml(value) : d.toLocaleString('it-IT');
}

function requestValue(r, ...keys) {
  for (const key of keys) {
    const value = r?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') return value;
  }
  return '';
}

function renderRequests() {
  const rows = state.requests;
  $('requestBody').innerHTML = rows.length ? rows.map(r => {
    const customer = requestValue(r, 'customer_name', 'customerName', 'contact', 'name');
    const type = requestValue(r, 'request_type', 'requestTypeName', 'type_name');
    const email = requestValue(r, 'email', 'customer_email', 'emailAddress');
    const attachments = Number(r?.attachments_count ?? 0);
    const requestStatus = requestValue(r, 'status') || 'Nuova';
    return `<tr>
      <td>${formatRequestDate(r?.created_at)}</td>
      <td><strong>${escapeHtml(customer || '—')}</strong></td>
      <td>${escapeHtml(type || '—')}</td>
      <td>${escapeHtml(email || '—')}</td>
      <td>${attachments}</td>
      <td><span class="status ${requestStatus.toLowerCase() === 'nuova' ? 'warn' : 'ok'}">${escapeHtml(requestStatus)}</span></td>
      <td><button class="small-btn" data-request-open="${escapeHtml(r?.id || '')}">APRI</button></td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" style="text-align:center;padding:36px;color:#65717d">Nessuna richiesta ricevuta.</td></tr>';
}

function openRequestDetail(id) {
  const r = state.requests.find(x => String(x?.id) === String(id));
  if (!r) return;
  const customer = requestValue(r, 'customer_name', 'customerName', 'contact', 'name');
  const company = requestValue(r, 'company', 'company_name');
  const type = requestValue(r, 'request_type', 'requestTypeName', 'type_name');
  const email = requestValue(r, 'email', 'customer_email', 'emailAddress');
  const phone = requestValue(r, 'phone', 'customer_phone', 'contactPhone');
  const subject = requestValue(r, 'subject');
  const statusText = requestValue(r, 'status') || 'Nuova';
  const text = requestValue(r, 'text', 'message', 'request_text', 'body');
  const attachments = Array.isArray(r?.attachments) ? r.attachments : [];
  const attachmentsCount = Number(r?.attachments_count ?? attachments.length ?? 0);

  const d = $('requestDetail');
  d.classList.remove('hidden');
  d.innerHTML = `
    <div class="section-head">
      <div>
        <div class="eyebrow">RICHIESTA</div>
        <h2>${escapeHtml(customer || company || 'Richiesta ricevuta')}</h2>
        <p class="muted">${escapeHtml(type || '—')} · ricevuta ${formatRequestDate(r?.created_at)}</p>
      </div>
      <button class="small-btn" id="closeRequestDetail">CHIUDI</button>
    </div>
    <p><strong>Stato:</strong> ${escapeHtml(statusText)}</p>
    <p><strong>Nome e cognome:</strong> ${escapeHtml(customer || '—')}</p>
    <p><strong>Impresa:</strong> ${escapeHtml(company || '—')}</p>
    <p><strong>Email:</strong> ${escapeHtml(email || '—')}</p>
    <p><strong>Telefono:</strong> ${escapeHtml(phone || '—')}</p>
    <p><strong>Tipologia:</strong> ${escapeHtml(type || '—')}</p>
    <p><strong>Oggetto:</strong> ${escapeHtml(subject || '—')}</p>
    <p><strong>Allegati ricevuti:</strong> ${attachmentsCount}</p>
    ${text ? `<div class="panel"><h3>Richiesta</h3><pre style="white-space:pre-wrap;font:inherit;margin:0">${escapeHtml(text)}</pre></div>` : ''}
    ${attachments.length ? `<div class="panel"><h3>Allegati</h3><ul>${attachments.map(a => `<li>${escapeHtml(a?.name || a?.filename || 'Allegato')}</li>`).join('')}</ul></div>` : ''}
  `;
  $('closeRequestDetail').onclick = () => d.classList.add('hidden');
}

async function loadPractices() { const data = await api('practices'); state.practices = data.practices || []; renderPractices(); }
async function loadRequests() { const data = await api('requests'); state.requests = data.requests || []; renderRequests(); }
async function enterApp(email) { $('userEmail').textContent = email || ''; show('appView'); await loadPractices(); await loadRequests(); }

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault(); msg($('loginMsg'), '');
  try {
    const data = await api('login', { method:'POST', body:{ email:$('loginEmail').value.trim(), password:$('loginPassword').value } });
    state.mode = data.state; state.factorId = data.factorId || null;
    $('loginPassword').value = '';
    if (data.state === 'mfa_setup') {
      $('mfaTitle').textContent = 'Configura il secondo fattore';
      $('mfaIntro').textContent = 'Scansiona il QR con Google Authenticator, Authy o un’app TOTP compatibile, poi inserisci il codice di 6 cifre.';
      $('qrWrap').classList.remove('hidden'); $('qrImage').src = data.qrCode || ''; $('mfaSecret').textContent = data.secret || '';
      show('mfaView');
    } else {
      $('mfaTitle').textContent = 'Verifica il secondo fattore';
      $('mfaIntro').textContent = 'Inserisci il codice di 6 cifre generato dall’app Authenticator.';
      $('qrWrap').classList.add('hidden'); show('mfaView');
    }
    $('mfaCode').focus();
  } catch(e) { msg($('loginMsg'), e.message, 'error'); }
});
$('mfaForm').addEventListener('submit', async e => {
  e.preventDefault(); msg($('mfaMsg'), 'Verifica in corso...');
  try {
    const action = state.mode === 'mfa_setup' ? 'mfa-setup-verify' : 'mfa-verify';
    await api(action, { method:'POST', body:{ code:$('mfaCode').value.trim() } });
    $('mfaCode').value=''; msg($('mfaMsg'), 'Accesso autorizzato.', 'ok');
    await enterApp($('loginEmail').value.trim());
  } catch(e) { msg($('mfaMsg'), e.message, 'error'); }
});
$('backLoginBtn').onclick = async () => { await api('logout', {method:'POST'}).catch(()=>{}); show('loginView'); $('qrWrap').classList.add('hidden'); msg($('mfaMsg'),''); };
$('forgotBtn').onclick = async () => { const email = prompt('Inserisci l’email dell’account amministratore:'); if (!email) return; try { const d = await api('forgot-password',{method:'POST',body:{email:email.trim()}}); msg($('loginMsg'), d.message, 'ok'); } catch(e) { msg($('loginMsg'), e.message, 'error'); } };
$('logoutBtn').onclick = async () => { await api('logout',{method:'POST'}).catch(()=>{}); show('loginView'); };
$('newPracticeBtn').onclick = () => { $('practiceModal').classList.remove('hidden'); $('practiceMsg').textContent=''; };
$('closeModal').onclick = () => $('practiceModal').classList.add('hidden');
$('practiceBody').addEventListener('click', e => { const btn = e.target.closest('[data-open]'); if (btn) openDetail(btn.dataset.open); });
$('requestBody').addEventListener('click', e => { const btn = e.target.closest('[data-request-open]'); if (btn) openRequestDetail(btn.dataset.requestOpen); });
$('practiceForm').addEventListener('submit', async e => { e.preventDefault(); const f = new FormData(e.target); try { await api('practices',{method:'POST',body:Object.fromEntries(f.entries())}); e.target.reset(); $('practiceModal').classList.add('hidden'); await loadPractices(); } catch(err) { msg($('practiceMsg'),err.message,'error'); } });
$('passwordForm').addEventListener('submit', async e => { e.preventDefault(); msg($('passwordMsg'),''); const p=$('newPassword').value, c=$('confirmPassword').value; if(p!==c){msg($('passwordMsg'),'Le nuove password non coincidono.','error');return;} try{await api('password',{method:'POST',body:{currentPassword:$('currentPassword').value,password:p}});e.target.reset();msg($('passwordMsg'),'Password modificata correttamente.','ok');}catch(err){msg($('passwordMsg'),err.message,'error');} });
$('addMfaBtn').onclick = async () => { try { const d=await api('mfa-enroll',{method:'POST'}); $('settingsQr').classList.remove('hidden'); $('settingsQrImage').src=d.qrCode||''; $('settingsSecret').textContent=d.secret||''; $('settingsMfaForm').dataset.factorId=d.factorId; } catch(e){msg($('mfaSettingsMsg'),e.message,'error');} };
$('settingsMfaForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('mfa-add-verify',{method:'POST',body:{factorId:e.currentTarget.dataset.factorId,code:$('settingsMfaCode').value.trim()}});e.currentTarget.reset();$('settingsQr').classList.add('hidden');msg($('mfaSettingsMsg'),'Nuovo dispositivo MFA verificato.','ok');}catch(err){msg($('mfaSettingsMsg'),err.message,'error');}});
document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  $('practicesSection').classList.toggle('hidden',btn.dataset.section!=='practices');
  $('requestsSection').classList.toggle('hidden',btn.dataset.section!=='requests');
  $('settingsSection').classList.toggle('hidden',btn.dataset.section!=='settings');
}));
(async()=>{try{const s=await api('session');if(s.authenticated) await enterApp(s.user.email);else show('loginView');}catch{show('loginView');}})();

let idleTimer;
const IDLE_MS = 15 * 60 * 1000;
function resetIdleTimer(){
  clearTimeout(idleTimer);
  if ($('appView').classList.contains('hidden')) return;
  idleTimer=setTimeout(async()=>{ await api('logout',{method:'POST'}).catch(()=>{}); alert('Sessione chiusa per inattività.'); location.reload(); },IDLE_MS);
}
['click','keydown','mousemove','touchstart','scroll'].forEach(ev=>document.addEventListener(ev,resetIdleTimer,{passive:true}));
const originalEnterApp=enterApp;
enterApp=async function(email){ await originalEnterApp(email); resetIdleTimer(); };
