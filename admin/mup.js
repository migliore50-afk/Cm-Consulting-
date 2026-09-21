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
      mupDistributorAddress: '',
      mupDistributorPhone: '',
      mupDistributorEmail: '',
      mupDistributorPec: '',
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
      mupComplaints: '',
      mupArbitro: '',
      mupFinNet: '',
      mupOtherAdr: '',
      mupOncology: 'Informativa sul diritto all’oblio oncologico ai sensi della Legge 193/2023 e della disciplina IVASS vigente.'
    };

    Object.entries(stableDefaults).forEach(([id, fallback]) => {
      set(id, Object.prototype.hasOwnProperty.call(saved, id) && saved[id] ? saved[id] : fallback);
    });

    $('mupMsg').textContent = '';
    $('mupOpen').classList.remove('hidden');
    $('mupClient').focus();
  }

  function close() { $('mupOpen').classList.add('hidden'); }

  function section(title, rows) {
    return '<h2>' + esc(title) + '</h2><table><tbody>' +
      rows.map(([a,b]) => '<tr><th>' + esc(a) + '</th><td>' + esc(b || 'DA COMPILARE') + '</td></tr>').join('') +
      '</tbody></table>';
  }

  function requiredValues() {
    return [
      ['Nome distributore', val('mupDistributorName')],
      ['RUI distributore', val('mupDistributorRui')],
      ['Sezione distributore', val('mupDistributorSection')],
      ['Sede legale / domicilio professionale', val('mupDistributorAddress')],
      ['Intermediario principale per cui opera la Sezione E', val('mupMainIntermediary')],
      ['RUI intermediario principale', val('mupMainRui')],
      ['Sezione intermediario principale', val('mupMainSection')],
      ['Sede legale intermediario principale', val('mupMainAddress')],
      ['Modello di distribuzione', val('mupDistribution')],
      ['Impresa/e di assicurazione / rapporti rilevanti', val('mupInsurer')],
      ['Remunerazione', val('mupRemuneration')],
      ['Pagamento premi', val('mupPayment')],
      ['RC professionale', val('mupRc')],
      ['Reclami', val('mupComplaints')],
      ['Arbitro Assicurativo', val('mupArbitro')]
    ];
  }

  function generate() {
    const missing = requiredValues().filter(x => !x[1]);
    if (missing.length) {
      $('mupMsg').textContent = 'MUP NON GENERATO: compilare almeno ' + missing.map(x => x[0]).join(', ') + '.';
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

    const w = window.open('', '_blank');
    if (!w) { $('mupMsg').textContent = 'Il browser ha bloccato la finestra del MUP. Consentire i popup per il sito.'; return; }
    w.document.open(); w.document.write(html); w.document.close();
    $('mupMsg').textContent = 'MUP generato in una nuova scheda. Verificare tutti i dati e usare la stampa del browser per il PDF.';
  }

  function openFromDetail() {
    const d = document.getElementById('detail');
    if (!d) return;
    const title = d.querySelector('h2')?.textContent?.trim() || '';
    const meta = d.querySelector('.section-head p')?.textContent?.trim() || '';
    const parts = meta.split(' · scadenza ');
    const type = parts[0] || '';
    const date = parts[1] || '';
    open({ client: title, type, expiry: date ? date.split('/').reverse().join('-') : '' });
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