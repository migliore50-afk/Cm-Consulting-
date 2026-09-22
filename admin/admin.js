const $ = (id) => document.getElementById(id);
const state = { mode: null, factorId: null, practices: [], requests: [], intermediaries: [] };

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

// 21 settembre 2026 — funzione mancante: il pulsante "APRI" sulla riga di ogni
// pratica chiamava openDetail(id), ma la funzione non era mai stata scritta —
// causava un errore silenzioso in console e il click non produceva alcun
// effetto visibile. Ricostruita seguendo lo stesso schema già usato e
// funzionante per openRequestDetail() poco sotto, e la struttura che
// admin/mup.js si aspetta di trovare dentro #detail (un <h2> col nome cliente,
// un paragrafo "<tipologia> · scadenza <data>" dentro .section-head, e un
// pulsante con id="deletePractice" prima del quale mup.js inserisce
// automaticamente il pulsante "GENERA MUP").
function openDetail(id) {
  const p = state.practices.find(x => String(x.id) === String(id));
  if (!p) return;
  const s = status(p.expiry);
  const d = $('detail');
  d.classList.remove('hidden');
  // 21 settembre 2026 — l'id della pratica viene esposto qui, così il
  // generatore MUP (admin/mup.js) può leggerlo e salvare il documento
  // generato dentro la pratica corretta.
  d.dataset.practiceId = p.id;
  d.innerHTML = `
    <div class="section-head">
      <div>
        <div class="eyebrow">PRATICA</div>
        <h2>${escapeHtml(p.client)}</h2>
        <p class="muted">${escapeHtml(p.type)} · scadenza ${new Date(`${p.expiry}T00:00:00`).toLocaleDateString('it-IT')}</p>
      </div>
      <button class="small-btn" id="closeDetail">CHIUDI</button>
    </div>
    <p><strong>Stato:</strong> <span class="status ${s[1]}">${s[0]}</span></p>
    <p><strong>Email cliente:</strong> ${escapeHtml(p.email || '—')}</p>
    <p><strong>Prezzo cliente:</strong> ${p.client_price != null && p.client_price !== '' ? escapeHtml(String(p.client_price)) : '—'}</p>
    <p><strong>Costo revisore:</strong> ${p.reviewer_cost != null && p.reviewer_cost !== '' ? escapeHtml(String(p.reviewer_cost)) : '—'}</p>
    <p><strong>MUP:</strong> ${p.mup_generated_at
      ? `generato il ${new Date(p.mup_generated_at).toLocaleString('it-IT')} — <button class="link-btn" id="downloadMupWord" type="button">Scarica Word</button> <button class="link-btn" id="downloadMupPdf" type="button">Scarica PDF</button>`
      : 'non ancora generato'}</p>
    <div class="panel" id="facsimilePanel">
      <h3>Facsimile collaboratore</h3>
      <p class="muted">Carica il facsimile ricevuto dal collaboratore. Il sistema estrae i dati e li presenta per la tua verifica; nulla diventa ufficiale senza conferma.</p>
      <input id="facsimileFile" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
      <div class="actions" style="margin-top:8px"><button class="small-btn" id="uploadFacsimileBtn" type="button">CARICA E LEGGI</button></div>
      <div id="facsimileUploadMsg" class="message" aria-live="polite"></div>
      <div id="facsimileList"></div>
      <div id="facsimileReview" class="panel hidden" style="margin-top:12px"></div>
    </div>
    <div class="panel">
      <h3>Note interne</h3>
      <textarea id="detailNotes" rows="4" style="width:100%;box-sizing:border-box">${escapeHtml(p.notes || '')}</textarea>
      <div class="actions" style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
        <button class="small-btn" id="saveNotes">SALVA NOTE</button>
      </div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;margin-top:12px">
      <input type="checkbox" id="detailChecked" ${p.checked ? 'checked' : ''}> Pratica verificata
    </label>
    <div class="actions" style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end">
      <button class="small-btn" id="deletePractice" style="color:#b42318;border-color:#b42318">ELIMINA PRATICA</button>
    </div>
  `;

  const FACSIMILE_FIELDS = [
    ['collaborator','Collaboratore / intermediario'],
    ['insurer','Impresa / compagnia'],
    ['risk_type','Tipologia / rischio'],
    ['contractor','Contraente / cliente'],
    ['beneficiary','Beneficiario'],
    ['amount','Importo / somma garantita'],
    ['start_date','Decorrenza'],
    ['end_date','Scadenza'],
    ['policy_number','Numero polizza'],
    ['beneficiary_reference','CIG / CUP / riferimento']
  ];

  function facsimileEsc(value) { return escapeHtml(value); }

  async function loadFacsimiles(practiceId) {
    const panel = $('facsimilePanel');
    if (!panel) return;
    try {
      const data = await api('facsimiles', { query: '&practiceId=' + encodeURIComponent(practiceId) });
      const docs = data.documents || [];
      const list = $('facsimileList');
      list.innerHTML = docs.length ? docs.map(d => {
        const statusLabel = d.status === 'confirmed' ? 'Confermato' : d.status === 'extracted' ? 'Da verificare' : 'Caricato';
        return '<div class="panel" style="margin-top:8px">' +
          '<strong>' + facsimileEsc(d.filename) + '</strong> · ' + facsimileEsc(statusLabel) +
          ' <span class="muted">(' + Math.ceil(Number(d.size_bytes || 0) / 1024) + ' KB)</span>' +
          '<div class="actions" style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="small-btn" type="button" data-fac-download="' + d.id + '">SCARICA ORIGINALE</button>' +
          (d.status === 'extracted' || d.status === 'confirmed' ? '<button class="small-btn" type="button" data-fac-review="' + d.id + '">VERIFICA DATI</button>' : '') +
          '</div></div>';
      }).join('') : '<p class="muted">Nessun facsimile caricato.</p>';
      list.querySelectorAll('[data-fac-download]').forEach(btn => btn.onclick = () => downloadFacsimile(btn.dataset.facDownload));
      list.querySelectorAll('[data-fac-review]').forEach(btn => btn.onclick = () => reviewFacsimile(btn.dataset.facReview));
    } catch (err) {
      $('facsimileList').textContent = err.message;
    }
  }

  async function downloadFacsimile(id) {
    const data = await api('facsimile-file', { query: '&id=' + encodeURIComponent(id) });
    const response = await fetch(data.downloadUrl);
    if (!response.ok) throw new Error('Download documento non riuscito.');
    const blob = await response.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = data.filename || 'facsimile';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  }

  async function reviewFacsimile(id) {
    const data = await api('facsimiles', { query: '&practiceId=' + encodeURIComponent($('detail').dataset.practiceId) });
    const doc = (data.documents || []).find(x => String(x.id) === String(id));
    if (!doc) return;
    const detail = await api('facsimile-file', { query: '&id=' + encodeURIComponent(id) });
    // I dati estratti vengono letti separatamente per evitare di esporli
    // nell'elenco generale dei documenti.
    const full = await api('facsimile-extract', { method:'POST', body:{documentId:id} });
    renderFacsimileReview(full.document || {id}, full.extractedData || {});
  }

  function renderFacsimileReview(doc, extracted) {
    const box = $('facsimileReview');
    if (!box) return;
    box.classList.remove('hidden');
    box.dataset.documentId = doc.id || '';
    box.innerHTML = '<h3>Verifica dati estratti</h3>' +
      '<p class="muted">Questi dati sono una proposta di estrazione. <strong>Non diventano ufficiali finché non premi CONFERMA DATI.</strong></p>' +
      '<div class="form-grid">' +
      FACSIMILE_FIELDS.map(([key,label]) => '<label>' + facsimileEsc(label) + '<input data-fac-field="' + key + '" value="' + facsimileEsc(extracted[key] || '') + '"></label>').join('') +
      '</div>' +
      '<div class="actions" style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">' +
      '<button class="small-btn" type="button" id="cancelFacReview">ANNULLA</button>' +
      '<button class="btn primary" type="button" id="confirmFacReview">CONFERMA DATI</button></div>' +
      '<div id="facsimileReviewMsg" class="message" aria-live="polite"></div>';
    $('cancelFacReview').onclick = () => box.classList.add('hidden');
    $('confirmFacReview').onclick = async () => {
      const confirmedData = {};
      box.querySelectorAll('[data-fac-field]').forEach(input => {
        const key = input.dataset.facField;
        const value = input.value.trim();
        if (value) confirmedData[key] = value;
      });
      if (!Object.keys(confirmedData).length) {
        $('facsimileReviewMsg').textContent = 'Inserisci almeno un dato prima della conferma.';
        return;
      }
      $('confirmFacReview').disabled = true;
      $('facsimileReviewMsg').textContent = 'Salvataggio conferma…';
      try {
        await api('facsimile-confirm', {method:'POST', body:{documentId:box.dataset.documentId, confirmedData}});
        $('facsimileReviewMsg').textContent = 'Dati confermati e collegati alla pratica.';
        await loadPractices();
        await loadFacsimiles($('detail').dataset.practiceId);
      } catch (err) {
        $('facsimileReviewMsg').textContent = err.message;
      } finally {
        $('confirmFacReview').disabled = false;
      }
    };
  }

  async function uploadFacsimile(practiceId, file) {
    const allowed = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]);
    if (!allowed.has(file.type)) throw new Error('Seleziona un PDF oppure un documento Word .docx.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Il file supera il limite di 10 MB.');
    $('facsimileUploadMsg').textContent = 'Preparazione caricamento…';
    const ticket = await api('facsimile-upload-url', {method:'POST', body:{
      practiceId, filename:file.name, contentType:file.type, size:file.size
    }});
    const put = await fetch(ticket.uploadUrl, {method:'PUT', headers:{'Content-Type':file.type}, body:file});
    if (!put.ok) throw new Error('Caricamento del facsimile non riuscito.');
    $('facsimileUploadMsg').textContent = 'Documento caricato. Lettura automatica in corso…';
    const extracted = await api('facsimile-extract', {method:'POST', body:{documentId:ticket.document.id}});
    $('facsimileUploadMsg').textContent = 'Lettura completata: verifica i dati proposti.';
    renderFacsimileReview(extracted.document || ticket.document, extracted.extractedData || {});
    await loadFacsimiles(practiceId);
  }

  async function downloadSavedMup(type) {
    try {
      const response = await fetch('/api/admin?action=mup-file&id=' + encodeURIComponent(p.id) + '&type=' + encodeURIComponent(type), { credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || !data.base64) throw new Error(data?.error?.message || 'File MUP non disponibile.');
      const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
      const mime = type === 'word' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf';
      const extension = type === 'word' ? 'docx' : 'pdf';
      const safeClient = String(p.client || 'pratica').replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').trim().replace(/\s+/g, '_') || 'pratica';
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MUP_' + safeClient + '.' + extension;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      alert(err?.message || 'Download MUP non riuscito.');
    }
  }

  $('downloadMupWord')?.addEventListener('click', () => downloadSavedMup('word'));
  $('downloadMupPdf')?.addEventListener('click', () => downloadSavedMup('pdf'));
  $('closeDetail').onclick = () => d.classList.add('hidden');

  $('uploadFacsimileBtn')?.addEventListener('click', async () => {
    const file = $('facsimileFile')?.files?.[0];
    if (!file) { $('facsimileUploadMsg').textContent = 'Seleziona prima un PDF o un Word .docx.'; return; }
    const btn = $('uploadFacsimileBtn'); btn.disabled = true;
    try { await uploadFacsimile(p.id, file); $('facsimileFile').value = ''; }
    catch (err) { $('facsimileUploadMsg').textContent = err.message || 'Operazione non riuscita.'; }
    finally { btn.disabled = false; }
  });
  loadFacsimiles(p.id);

  $('saveNotes').onclick = async () => {
    try {
      await api('practice', { method: 'PATCH', query: `&id=${encodeURIComponent(p.id)}`, body: { notes: $('detailNotes').value } });
      await loadPractices();
      msg($('detailNotes'), '', '');
    } catch (err) { alert(err.message); }
  };

  $('detailChecked').onchange = async (e) => {
    try {
      await api('practice', { method: 'PATCH', query: `&id=${encodeURIComponent(p.id)}`, body: { checked: e.target.checked } });
      await loadPractices();
    } catch (err) { alert(err.message); }
  };

  $('deletePractice').onclick = async () => {
    if (!confirm(`Eliminare la pratica "${p.client}"? L'azione non è reversibile.`)) return;
    try {
      await api('practice', { method: 'DELETE', query: `&id=${encodeURIComponent(p.id)}` });
      d.classList.add('hidden');
      await loadPractices();
    } catch (err) { alert(err.message); }
  };
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
// 22 settembre 2026 — archivio degli intermediari collaboratori (Sezione A/B)
// usato dal generatore MUP. Gestito qui (Impostazioni sicurezza), letto da
// admin/mup.js tramite state.intermediaries (stessa variabile globale, script
// classici non moduli — vedi nota in mup.js).
function renderIntermediaries() {
  const rows = state.intermediaries;
  $('intermediaryBody').innerHTML = rows.length ? rows.map(i => `<tr>
    <td><strong>${escapeHtml(i.name)}</strong></td>
    <td>${escapeHtml(i.rui)}</td>
    <td>${escapeHtml(i.section)}</td>
    <td><span class="status ${i.active ? 'ok' : 'bad'}">${i.active ? 'Attivo' : 'Non attivo'}</span></td>
    <td>
      <button class="small-btn" data-edit-intermediary="${i.id}">MODIFICA</button>
      <button class="small-btn" data-toggle-intermediary="${i.id}">${i.active ? 'DISATTIVA' : 'ATTIVA'}</button>
    </td>
  </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:24px;color:#65717d">Nessun intermediario registrato.</td></tr>';
}

async function loadIntermediaries() {
  const data = await api('intermediaries');
  state.intermediaries = data.intermediaries || [];
  renderIntermediaries();
}

async function enterApp(email) { $('userEmail').textContent = email || ''; show('appView'); await loadPractices(); await loadRequests(); await loadIntermediaries(); }

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
$('newIntermediaryBtn').onclick = () => {
  const f = $('intermediaryForm');
  f.reset();
  f.elements.id.value = '';
  f.elements.active.checked = true;
  $('intermediaryModalTitle').textContent = 'Nuovo intermediario';
  $('intermediaryMsg').textContent = '';
  $('intermediaryModal').classList.remove('hidden');
};
$('closeIntermediaryModal').onclick = () => $('intermediaryModal').classList.add('hidden');
$('intermediaryBody').addEventListener('click', e => {
  const editBtn = e.target.closest('[data-edit-intermediary]');
  if (editBtn) {
    const i = state.intermediaries.find(x => String(x.id) === editBtn.dataset.editIntermediary);
    if (!i) return;
    const f = $('intermediaryForm');
    f.elements.id.value = i.id;
    f.elements.name.value = i.name;
    f.elements.rui.value = i.rui;
    f.elements.section.value = i.section;
    f.elements.address.value = i.address;
    f.elements.phone.value = i.phone || '';
    f.elements.email.value = i.email || '';
    f.elements.pec.value = i.pec || '';
    f.elements.website.value = i.website || '';
    f.elements.active.checked = i.active;
    $('intermediaryModalTitle').textContent = 'Modifica intermediario';
    $('intermediaryMsg').textContent = '';
    $('intermediaryModal').classList.remove('hidden');
    return;
  }
  const toggleBtn = e.target.closest('[data-toggle-intermediary]');
  if (toggleBtn) {
    const id = toggleBtn.dataset.toggleIntermediary;
    const i = state.intermediaries.find(x => String(x.id) === id);
    if (!i) return;
    if (i.active && !confirm(`Disattivare "${i.name}"? Non comparirà più tra le scelte del generatore MUP finché non lo riattivi.`)) return;
    api('intermediary', { method: 'PATCH', query: `&id=${encodeURIComponent(id)}`, body: { active: !i.active } })
      .then(loadIntermediaries)
      .catch(err => alert(err.message));
  }
});
$('intermediaryForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const id = f.get('id');
  const body = {
    name: f.get('name'), rui: f.get('rui'), section: f.get('section'),
    address: f.get('address'), phone: f.get('phone'), email: f.get('email'),
    pec: f.get('pec'), website: f.get('website'), active: f.get('active') === 'on'
  };
  try {
    if (id) {
      await api('intermediary', { method: 'PATCH', query: `&id=${encodeURIComponent(id)}`, body });
    } else {
      await api('intermediaries', { method: 'POST', body });
    }
    $('intermediaryModal').classList.add('hidden');
    await loadIntermediaries();
  } catch (err) { msg($('intermediaryMsg'), err.message, 'error'); }
});
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