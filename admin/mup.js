(() => {
  const $ = (id) => document.getElementById(id);
  let currentPractice = null;

  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
  const val = (id) => $(id)?.value?.trim() || '';
  const set = (id, value) => { const el = $(id); if (el) el.value = value ?? ''; };

  // 21 settembre 2026 — su richiesta di Carmelo: la maggior parte dei campi del
  // MUP (dati del distributore, intermediario principale, remunerazione,
  // reclami, Arbitro Assicurativo, ecc.) sono identici da una pratica all'altra
  // — solo cliente/prodotto/scadenza/email cambiano, e quelli erano già
  // precompilati dalla pratica. Prima ogni apertura del modulo azzerava tutto,
  // costringendo a riscrivere da capo anche i dati stabili. Ora l'ultima
  // compilazione viene salvata in localStorage (solo sul dispositivo, non sul
  // server) e riproposta automaticamente la volta successiva.
  const DEFAULTS_KEY = 'cm_mup_defaults_v1';

  // Campi che NON vanno mai ricordati: sono specifici della singola pratica,
  // già compilati automaticamente da open(practice).
  const PRACTICE_SPECIFIC_IDS = new Set([
    'mupClient', 'mupProduct', 'mupExpiry', 'mupEmail'
  ]);

  // Tutti gli altri campi del modulo (identità del distributore, intermediario
  // principale, conflitti d'interesse, remunerazione, pagamento premi, tutela
  // del contraente) vengono ricordati.
  function allFieldIds() {
    return Array.from(document.querySelectorAll('#mupOpen .form-grid input'))
      .map(el => el.id)
      .filter(Boolean);
  }

  function loadDefaults() {
    try {
      return JSON.parse(localStorage.getItem(DEFAULTS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveDefaults() {
    const defaults = {};
    allFieldIds().forEach(id => {
      if (PRACTICE_SPECIFIC_IDS.has(id)) return;
      defaults[id] = val(id);
    });
    try {
      localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
    } catch {
      // localStorage non disponibile: non blocchiamo la generazione per questo.
    }
  }

  function resetSavedDefaults() {
    try { localStorage.removeItem(DEFAULTS_KEY); } catch {}
    open(currentPractice || {});
    $('mupMsg').textContent = 'Valori salvati azzerati. I campi sono tornati vuoti.';
  }

  function open(practice = {}) {
    currentPractice = practice;
    $('mupPracticeTitle').textContent = practice.client || 'Pratica';
    set('mupClient', practice.client);
    set('mupProduct', practice.type);
    set('mupExpiry', practice.expiry);
    set('mupEmail', practice.email);

    const saved = loadDefaults();

    // Dati stabili della persona fisica in RUI: valore fisso di partenza,
    // sovrascritto da un eventuale valore salvato in precedenza (per i campi
    // che l'utente può comunque modificare, es. telefono/indirizzo).
    const stableDefaults = {
      mupDistributorName: 'Carmelo Migliore',
      mupDistributorRui: 'E000437237',
      mupDistributorDate: '24/01/2013',
      mupDistributorSection: 'E',
      mupDistributorRole: 'Collaboratore di intermediario iscritto nella sezione A/B',
      // 22 settembre 2026 — su segnalazione di Carmelo/ChatGPT: questi quattro
      // dati sono già noti e stabili (usati in tutto il resto del sito), non
      // c'è motivo di lasciarli vuoti ogni volta.
      mupDistributorAddress: 'Via Spinoza n. 49, 00137 Roma',
      mupDistributorPhone: '328 6382612',
      mupDistributorEmail: 'info@cm-consulting.info',
      mupDistributorPec: 'carmelo.migliore@legalmail.it',
      mupDistributorWebsite: 'https://www.cm-consulting.info',
      mupIvass: 'IVASS — Istituto per la Vigilanza sulle Assicurazioni',
      mupMainIntermediary: '',
      mupMainRui: '',
      mupMainSection: '',
      mupMainRole: '',
      mupMainAddress: '',
      mupMainPhone: '',
      mupMainEmail: '',
      mupMainPec: '',
      mupMainWebsite: '',
      mupInsurer: '',
      mupDistribution: '',
      mupMandate: 'NO',
      mupHorizontal: 'NO',
      mupHorizontalName: '',
      mupConflictA: 'NO',
      mupConflictAName: '',
      mupConflictB: 'NO',
      mupConflictBName: '',
      mupAdvice: 'NO',
      mupImpartial: 'NO',
      mupExclusive: 'NO',
      mupNonExclusive: 'SI',
      mupBusinessRelationships: '',
      mupTransparency: '',
      mupRemuneration: '',
      mupClientFee: '',
      mupRcAuto: '',
      mupHorizontalCompensation: '',
      mupPayment: '',
      mupSegregatedAssets: '',
      mupPaymentMethods: '',
      mupSectionBPayment: '',
      mupRc: '',
      // 22 settembre 2026 — questi due non dipendono dall'intermediario
      // principale della singola pratica: sono il processo reclami e
      // l'informativa sull'Arbitro Assicurativo già pubblicati sulla pagina
      // "Reclami e Arbitro Assicurativo" del sito — dati veri, non inventati,
      // riutilizzabili da subito.
      mupComplaints: 'Reclamo a CM Consulting via email (info@cm-consulting.info), PEC (carmelo.migliore@legalmail.it) o posta ordinaria (Via Spinoza n. 49, 00137 Roma) — risposta entro 45 giorni. Se non soddisfatto, reclamo all’IVASS (Via del Quirinale 21, 00187 Roma).',
      mupArbitro: 'Diritto di ricorso all’Arbitro Assicurativo per le controversie in materia assicurativa e/o di intermediazione, operativo dal 15 gennaio 2026 — dettagli e modalità sulla pagina “Reclami e Arbitro Assicurativo” di cm-consulting.info.',
      mupFinNet: '',
      mupOtherAdr: '',
      mupOncology: 'Informativa sul diritto all’oblio oncologico ai sensi della Legge 193/2023 e della disciplina IVASS vigente.'
    };

    Object.entries(stableDefaults).forEach(([id, fallback]) => {
      set(id, Object.prototype.hasOwnProperty.call(saved, id) && saved[id] ? saved[id] : fallback);
    });

    populateIntermediarySelect();

    document.querySelectorAll('#mupOpen .field-error').forEach(el => el.classList.remove('field-error'));
    $('mupMsg').textContent = '';
    $('mupOpen').classList.remove('hidden');
    $('mupClient').focus();
  }

  // 22 settembre 2026 — su richiesta di Carmelo/ChatGPT: l'intermediario
  // principale non è più un campo di testo libero (rischio di dati inventati
  // o incoerenti), ma un menu che legge dall'archivio "Intermediari
  // collaboratori" gestito nelle Impostazioni. Solo quelli attivi compaiono.
  // state.intermediaries è definita in admin/admin.js, caricato prima di
  // questo file — condivisa perché entrambi sono script classici, non
  // moduli.
  function populateIntermediarySelect() {
    const select = $('mupMainIntermediarySelect');
    if (!select) return;
    const list = (typeof state !== 'undefined' && Array.isArray(state.intermediaries)) ? state.intermediaries : [];
    const active = list.filter(i => i.active);
    const previousValue = select.value;
    select.innerHTML = '<option value="">Seleziona intermediario…</option>' +
      active.map(i => `<option value="${esc(i.id)}">${esc(i.name)} — Sezione ${esc(i.section)}</option>`).join('');

    let toSelect = '';
    if (previousValue && active.some(i => String(i.id) === previousValue)) {
      toSelect = previousValue;
    } else {
      const remembered = (() => { try { return localStorage.getItem('cm_mup_last_intermediary_id') || ''; } catch { return ''; } })();
      if (remembered && active.some(i => String(i.id) === remembered)) toSelect = remembered;
    }

    select.value = toSelect;
    applyIntermediarySelection(toSelect, list);

    if (!active.length) {
      const summary = $('mupMainSummary');
      if (summary) {
        summary.classList.remove('hidden');
        summary.innerHTML = 'Nessun intermediario attivo in archivio. Aggiungine uno da Impostazioni sicurezza → Intermediari collaboratori.';
      }
    }
  }

  function applyIntermediarySelection(id, list) {
    const source = list || (typeof state !== 'undefined' && Array.isArray(state.intermediaries) ? state.intermediaries : []);
    const summary = $('mupMainSummary');
    if (!id) {
      set('mupMainIntermediary', '');
      set('mupMainRui', '');
      set('mupMainSection', '');
      set('mupMainAddress', '');
      set('mupMainPhone', '');
      set('mupMainEmail', '');
      set('mupMainPec', '');
      set('mupMainWebsite', '');
      if (summary) summary.classList.add('hidden');
      return;
    }
    const inter = source.find(i => String(i.id) === String(id));
    if (!inter) return;
    set('mupMainIntermediary', inter.name);
    set('mupMainRui', inter.rui);
    set('mupMainSection', inter.section);
    set('mupMainAddress', inter.address);
    set('mupMainPhone', inter.phone || '');
    set('mupMainEmail', inter.email || '');
    set('mupMainPec', inter.pec || '');
    set('mupMainWebsite', inter.website || '');
    if (summary) {
      summary.classList.remove('hidden');
      summary.innerHTML = '<strong>Intermediario selezionato</strong><br>' + esc(inter.name) +
        '<br>RUI: ' + esc(inter.rui) + ' — Sezione ' + esc(inter.section) +
        '<br>Sede: ' + esc(inter.address) +
        '<br>✓ Dati caricati automaticamente';
    }
    try { localStorage.setItem('cm_mup_last_intermediary_id', String(id)); } catch {}
  }

  function close() { $('mupOpen').classList.add('hidden'); }

  function section(title, rows) {
    return '<h2>' + esc(title) + '</h2><table><tbody>' +
      rows.map(([a,b]) => '<tr><th>' + esc(a) + '</th><td>' + esc(b || 'DA COMPILARE') + '</td></tr>').join('') +
      '</tbody></table>';
  }

  function requiredValues() {
    return [
      ['Nome distributore', 'mupDistributorName'],
      ['RUI distributore', 'mupDistributorRui'],
      ['Sezione distributore', 'mupDistributorSection'],
      ['Sede legale / domicilio professionale', 'mupDistributorAddress'],
      ['Intermediario principale per cui opera la Sezione E', 'mupMainIntermediary'],
      ['RUI intermediario principale', 'mupMainRui'],
      ['Sezione intermediario principale', 'mupMainSection'],
      ['Sede legale intermediario principale', 'mupMainAddress'],
      ['Modello di distribuzione', 'mupDistribution'],
      ['Impresa/e di assicurazione / rapporti rilevanti', 'mupInsurer'],
      ['Remunerazione', 'mupRemuneration'],
      ['Pagamento premi', 'mupPayment'],
      ['RC professionale', 'mupRc'],
      ['Reclami', 'mupComplaints'],
      ['Arbitro Assicurativo', 'mupArbitro']
    ].map(([label, id]) => [label, id, val(id)]);
  }

  async function generate() {
    const fields = requiredValues();
    // 22 settembre 2026 — su proposta di ChatGPT/Carmelo: oltre al messaggio
    // testuale, i campi mancanti vengono evidenziati in rosso direttamente
    // nel modulo, ed evidenziazioni precedenti vengono sempre ripulite prima
    // di ricalcolare quelle nuove.
    fields.forEach(([, id]) => $(id)?.classList.remove('field-error'));
    const missing = fields.filter(x => !x[2]);
    if (missing.length) {
      missing.forEach(([, id]) => $(id)?.classList.add('field-error'));
      $('mupMsg').textContent = missing.length + (missing.length === 1 ? ' campo obbligatorio' : ' campi obbligatori') + ' da compilare prima di generare il MUP: ' + missing.map(x => x[0]).join(', ') + '.';
      $(missing[0][1])?.focus();
      return;
    }

    // Compilazione riuscita: salva i valori stabili per la prossima pratica.
    saveDefaults();

    const now = new Date();
    const documentId = 'MUP-' + now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
    const html = '<!doctype html><html lang="it"><head><meta charset="utf-8"><title>' +
      esc(documentId) + ' | MUP CM Consulting</title><style>' +
      '@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#17212b;font-size:10.5pt;line-height:1.45}h1{font-size:18pt;margin:0 0 4px}h2{font-size:12pt;border-bottom:1px solid #b9c2ca;padding-bottom:4px;margin-top:18px}p{margin:6px 0}.meta{color:#5f6b75;font-size:9pt}.warning{border:1px solid #9b6b00;background:#fff8e5;padding:9px;margin:12px 0}.notice{border:1px solid #c7ced4;padding:9px;margin:12px 0}table{width:100%;border-collapse:collapse;margin:7px 0 12px}th,td{border:1px solid #c7ced4;padding:6px;vertical-align:top}th{width:36%;text-align:left;background:#f3f5f7}.footer{margin-top:22px;border-top:1px solid #c7ced4;padding-top:8px;font-size:8.5pt;color:#5f6b75}@media print{.no-print{display:none}}' +
      '</style></head><body>' +
      '<div class="no-print warning"><b>Verifica obbligatoria:</b> il documento è compilato dalla pratica amministrativa. Prima della consegna verificare che ogni dato corrisponda alla distribuzione effettivamente svolta e alla singola impresa/prodotto.</div>' +
      '<h1>MODULO UNICO PRECONTRATTUALE (MUP)</h1><p><b>CM Consulting — Intermediazione assicurativa</b></p>' +
      '<p class="meta">Documento: ' + esc(documentId) + ' · generato il ' + esc(now.toLocaleString('it-IT')) + '</p>' +
      '<div class="notice"><b>Base del modello:</b> Allegato 3 al Regolamento IVASS n. 40/2018. Il contenuto deve essere verificato rispetto alla versione normativa vigente e alla specifica distribuzione prima della trasmissione al contraente.</div>' +
      section('1. Informazioni generali sul distributore che entra in contatto con il contraente', [
        ['Nome e cognome / denominazione', val('mupDistributorName')],
        ['RUI, data di iscrizione, sezione e ruolo', val('mupDistributorRui') + ' · ' + val('mupDistributorDate') + ' · Sezione ' + val('mupDistributorSection') + ' · ' + val('mupDistributorRole')],
        ['Sede legale / domicilio professionale', val('mupDistributorAddress')],
        ['Telefono', val('mupDistributorPhone')],
        ['E-mail', val('mupDistributorEmail')],
        ['PEC', val('mupDistributorPec')],
        ['Sito internet', val('mupDistributorWebsite')],
        ['Autorità di vigilanza', val('mupIvass')],
        ['Intermediario per il quale è svolta la distribuzione', val('mupMainIntermediary')],
        ['RUI, sezione e ruolo dell’intermediario', val('mupMainRui') + ' · Sezione ' + val('mupMainSection') + ' · ' + val('mupMainRole')],
        ['Sede legale intermediario', val('mupMainAddress')],
        ['Telefono / e-mail / PEC intermediario', [val('mupMainPhone'), val('mupMainEmail'), val('mupMainPec')].filter(Boolean).join(' · ')],
        ['Sito internet intermediario', val('mupMainWebsite')]
      ]) +
      section('2. Informazioni sul modello di distribuzione', [
        ['Mandato del cliente', val('mupMandate')],
        ['Distribuzione per una o più imprese di assicurazione', val('mupDistribution')],
        ['Impresa/e di assicurazione', val('mupInsurer')],
        ['Collaborazione orizzontale', val('mupHorizontal')],
        ['Intermediario della collaborazione orizzontale', val('mupHorizontalName')]
      ]) +
      section('3. Informazioni relative a situazioni di potenziale conflitto d’interesse', [
        ['Intermediario detiene ≥10% di impresa', val('mupConflictA')],
        ['Denominazione impresa interessata', val('mupConflictAName')],
        ['Impresa detiene ≥10% dell’intermediario', val('mupConflictB')],
        ['Denominazione impresa/controllante', val('mupConflictBName')]
      ]) +
      section('4. Informazioni sull’attività di distribuzione e consulenza', [
        ['Consulenza ai sensi dell’art. 119-ter, comma 3, CAP', val('mupAdvice')],
        ['Analisi imparziale e personale ai sensi dell’art. 119-ter, comma 4, CAP', val('mupImpartial')],
        ['Contratto di distribuzione in esclusiva', val('mupExclusive')],
        ['Distribuzione non esclusiva', val('mupNonExclusive')],
        ['Imprese con cui esistono rapporti di affari', val('mupBusinessRelationships')],
        ['Altre informazioni utili alla trasparenza ex art. 119-bis, c.7 CAP', val('mupTransparency')]
      ]) +
      section('5. Informazioni sulle remunerazioni', [
        ['Tipologia e natura della remunerazione', val('mupRemuneration')],
        ['Eventuale compenso pagato direttamente dal cliente', val('mupClientFee')],
        ['Provvigioni RC Auto, se applicabile', val('mupRcAuto')],
        ['Compensi complessivi in caso di collaborazione orizzontale / Sezione E', val('mupHorizontalCompensation')]
      ]) +
      section('6. Informazioni sul pagamento dei premi', [
        ['Regime applicabile', val('mupPayment')],
        ['Gestione separata / garanzia bancaria, se applicabile', val('mupSegregatedAssets')],
        ['Modalità di pagamento ammesse', val('mupPaymentMethods')],
        ['Pagamento a intermediario Sezione B, se applicabile', val('mupSectionBPayment')]
      ]) +
      section('7. Informazioni sugli strumenti di tutela del contraente', [
        ['Assicurazione RC professionale', val('mupRc')],
        ['Reclami: modalità e recapiti', val('mupComplaints')],
        ['Arbitro Assicurativo', val('mupArbitro')],
        ['FIN.NET, se applicabile', val('mupFinNet')],
        ['Altri sistemi ADR, se applicabili', val('mupOtherAdr')]
      ]) +
      section('8. Informazioni sul diritto all’oblio oncologico', [
        ['Informativa', val('mupOncology')]
      ]) +
      section('Dati della pratica — riferimento amministrativo', [
        ['Contraente / cliente', val('mupClient')],
        ['Tipologia / prodotto', val('mupProduct')],
        ['Scadenza pratica', val('mupExpiry')],
        ['E-mail cliente', val('mupEmail')],
        ['Intermediario principale', val('mupMainIntermediary')],
        ['Impresa di assicurazione', val('mupInsurer')]
      ]) +
      '<div class="footer">Modello riferito all’Allegato 3 del Regolamento IVASS n. 40/2018, come modificato dai Provvedimenti IVASS n. 163/2025 e n. 169/2026. Il MUP deve essere consegnato o trasmesso nei tempi e con le modalità previste dalla normativa applicabile. Documento generato per controllo interno: non sostituisce la verifica della modulistica ufficiale e dei dati effettivi della distribuzione.</div>' +
      '</body></html>';

    // Il MUP non viene più aperto come pagina HTML. Il pulsante genera due
    // file reali: DOCX (Word) e PDF. Entrambi vengono salvati nella pratica
    // e resi scaricabili dalla scheda della pratica.
    const payload = {};
    document.querySelectorAll('#mupOpen input, #mupOpen select, #mupOpen textarea').forEach(el => {
      if (el.id) payload[el.id] = el.value || '';
    });
    payload.documentId = documentId;
    payload.html = html;

    $('mupGenerate').disabled = true;
    $('mupMsg').textContent = 'Generazione Word e PDF in corso…';

    try {
      const response = await fetch('/api/admin?action=mup-files&id=' + encodeURIComponent(currentPractice.id), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result?.error?.message || 'Generazione dei file MUP non riuscita.');

      const downloadBase64 = (base64, mime, filename) => {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      };

      const safeClient = String(val('mupClient') || 'pratica').replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').trim().replace(/\\s+/g, '_') || 'pratica';
      downloadBase64(result.docxBase64, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', result.documentId + '_' + safeClient + '.docx');
      downloadBase64(result.pdfBase64, 'application/pdf', result.documentId + '_' + safeClient + '.pdf');

      if (typeof loadPractices === 'function') await loadPractices();
      $('mupMsg').textContent = 'MUP generato e salvato nella pratica. Word (.docx) e PDF sono stati scaricati. Nella pratica resteranno disponibili per un nuovo download.';
    } catch (err) {
      $('mupMsg').textContent = err?.message || 'Generazione dei file MUP non riuscita.';
    } finally {
      $('mupGenerate').disabled = false;
    }
  }

  function openFromDetail() {
    const d = document.getElementById('detail');
    if (!d) return;
    const title = d.querySelector('h2')?.textContent?.trim() || '';
    const meta = d.querySelector('.section-head p')?.textContent?.trim() || '';
    const parts = meta.split(' · scadenza ');
    const type = parts[0] || '';
    const date = parts[1] || '';
    // 21 settembre 2026 — l'id della pratica, esposto da admin.js su
    // #detail.dataset.practiceId, serve a generate() per salvare il MUP
    // nella pratica corretta.
    const id = d.dataset.practiceId || '';
    open({ client: title, type, expiry: date ? date.split('/').reverse().join('-') : '', id });
  }

  function installDetailButton() {
    const detail = document.getElementById('detail');
    if (!detail || detail.querySelector('[data-mup-open]')) return;
    if (!detail.classList.contains('hidden') && detail.querySelector('#deletePractice')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'small-btn';
      button.dataset.mupOpen = '1';
      button.textContent = 'GENERA MUP';
      button.addEventListener('click', openFromDetail);
      detail.querySelector('#deletePractice').before(button);
    }
  }

  window.cmMup = { open, close, generate, resetSavedDefaults };
  const detail = document.getElementById('detail');
  if (detail) new MutationObserver(installDetailButton).observe(detail, { childList: true, subtree: true, attributes: true });
  installDetailButton();
  $('mupClose').addEventListener('click', close);
  $('mupCancel').addEventListener('click', close);
  $('mupGenerate').addEventListener('click', generate);

  // 22 settembre 2026 — alla scelta di un intermediario dal menu, compila
  // automaticamente RUI/sezione/sede/contatti e mostra il riepilogo di
  // conferma.
  $('mupMainIntermediarySelect')?.addEventListener('change', function () {
    applyIntermediarySelection(this.value);
  });

  // 22 settembre 2026 — toglie l'evidenziazione rossa dal campo appena
  // l'utente ricomincia a scriverci, senza aspettare un nuovo tentativo di
  // generazione.
  $('mupOpen')?.addEventListener('input', e => {
    if (e.target?.classList?.contains('field-error')) e.target.classList.remove('field-error');
  });

  // 21 settembre 2026 — pulsante per svuotare i valori ricordati, nel caso
  // servisse ripartire da campi vuoti (es. cambio di intermediario principale).
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'link-btn';
  resetBtn.textContent = 'Svuota i valori ricordati';
  resetBtn.style.marginTop = '8px';
  resetBtn.addEventListener('click', resetSavedDefaults);
  $('mupMsg')?.after(resetBtn);
})();