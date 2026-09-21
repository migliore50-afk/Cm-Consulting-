(() => {
  const $ = (id) => document.getElementById(id);
  let currentPractice = null;

  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));

  const val = (id) => $(id)?.value?.trim() || '';

  function open(practice) {
    currentPractice = practice;
    $('mupPracticeTitle').textContent = practice.client || 'Pratica';
    $('mupClient').value = practice.client || '';
    $('mupType').value = practice.type || '';
    $('mupExpiry').value = practice.expiry || '';
    $('mupEmail').value = practice.email || '';
    $('mupMainIntermediary').value = '';
    $('mupMainRui').value = '';
    $('mupMainSection').value = '';
    $('mupMainAddress').value = '';
    $('mupInsurer').value = '';
    $('mupProduct').value = practice.type || '';
    $('mupDistribution').value = '';
    $('mupAdvice').value = 'NO';
    $('mupImpartial').value = 'NO';
    $('mupExclusive').value = 'NO';
    $('mupRemuneration').value = '';
    $('mupPayment').value = '';
    $('mupComplaints').value = '';
    $('mupRc').value = '';
    $('mupConflict').value = 'NO';
    $('mupHorizontal').value = 'NO';
    $('mupOpen').classList.remove('hidden');
    $('mupClient').focus();
  }

  function close() { $('mupOpen').classList.add('hidden'); }

  function section(title, rows) {
    return '<h2>' + esc(title) + '</h2><table><tbody>' +
      rows.map(([a,b]) => '<tr><th>' + esc(a) + '</th><td>' + esc(b || 'DA COMPILARE') + '</td></tr>').join('') +
      '</tbody></table>';
  }

  function generate() {
    const required = [
      ['Intermediario principale', val('mupMainIntermediary')],
      ['RUI intermediario principale', val('mupMainRui')],
      ['Sezione intermediario principale', val('mupMainSection')],
      ['Impresa di assicurazione', val('mupInsurer')],
      ['Modello di distribuzione', val('mupDistribution')],
      ['Remunerazione', val('mupRemuneration')],
      ['Pagamento premi', val('mupPayment')],
      ['Reclami', val('mupComplaints')],
      ['RC professionale', val('mupRc')]
    ];
    const missing = required.filter(x => !x[1]);
    if (missing.length) {
      $('mupMsg').textContent = 'MUP NON GENERATO: compilare almeno ' + missing.map(x => x[0]).join(', ') + '.';
      return;
    }

    const now = new Date();
    const documentId = 'MUP-' + now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
    const html = '<!doctype html><html lang="it"><head><meta charset="utf-8"><title>' +
      esc(documentId) + ' | MUP CM Consulting</title><style>' +
      '@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#17212b;font-size:10.5pt;line-height:1.45}h1{font-size:18pt;margin:0 0 4px}h2{font-size:12pt;border-bottom:1px solid #b9c2ca;padding-bottom:4px;margin-top:18px}p{margin:6px 0}.meta{color:#5f6b75;font-size:9pt}.warning{border:1px solid #9b6b00;background:#fff8e5;padding:9px;margin:12px 0}table{width:100%;border-collapse:collapse;margin:7px 0 12px}th,td{border:1px solid #c7ced4;padding:6px;vertical-align:top}th{width:35%;text-align:left;background:#f3f5f7}.footer{margin-top:22px;border-top:1px solid #c7ced4;padding-top:8px;font-size:8.5pt;color:#5f6b75}@media print{.no-print{display:none}}' +
      '</style></head><body>' +
      '<div class="no-print warning"><b>Controllo:</b> questo documento è generato dalla pratica amministrativa e deve essere verificato prima della consegna. Non utilizzare se un campo non corrisponde ai dati effettivi della distribuzione.</div>' +
      '<h1>MODULO UNICO PRECONTRATTUALE (MUP)</h1><p><b>CM Consulting — Intermediazione assicurativa</b></p>' +
      '<p class="meta">Documento: ' + esc(documentId) + ' · generato il ' + esc(now.toLocaleString('it-IT')) + '</p>' +
      section('1. Informazioni generali sul distributore che entra in contatto con il contraente', [
        ['Nome e cognome', 'Carmelo Migliore'],
        ['RUI', 'E000437237 — Sezione E'],
        ['Intermediario principale per cui è svolta la distribuzione', val('mupMainIntermediary')],
        ['RUI / Sezione intermediario principale', val('mupMainRui') + ' / ' + val('mupMainSection')],
        ['Sede legale intermediario principale', val('mupMainAddress')],
        ['Sito internet', 'https://www.cm-consulting.info']
      ]) +
      section('2. Informazioni sul modello di distribuzione', [
        ['Modello', val('mupDistribution')],
        ['Collaborazione orizzontale', val('mupHorizontal')],
        ['Impresa/e interessata/e', val('mupInsurer')]
      ]) +
      section('3. Informazioni relative a situazioni di potenziale conflitto d’interesse', [
        ['Partecipazioni rilevanti ≥10%', val('mupConflict')]
      ]) +
      section('4. Informazioni sull’attività di distribuzione e consulenza', [
        ['Consulenza ex art. 119-ter, comma 3 CAP', val('mupAdvice')],
        ['Analisi imparziale e personale ex art. 119-ter, comma 4 CAP', val('mupImpartial')],
        ['Distribuzione esclusiva', val('mupExclusive')]
      ]) +
      section('5. Informazioni sulle remunerazioni', [
        ['Remunerazione', val('mupRemuneration')]
      ]) +
      section('6. Informazioni sul pagamento dei premi', [
        ['Modalità e regime applicabile', val('mupPayment')]
      ]) +
      section('7. Informazioni sugli strumenti di tutela del contraente', [
        ['RC professionale / estremi applicabili', val('mupRc')],
        ['Procedura reclami / recapiti', val('mupComplaints')],
        ['Arbitro Assicurativo', 'Informativa secondo la disciplina vigente e le condizioni di ammissibilità applicabili.']
      ]) +
      section('8. Informazioni sul diritto all’oblio oncologico', [
        ['Informativa', 'Diritto all’oblio oncologico secondo la Legge 193/2023 e la disciplina IVASS vigente.']
      ]) +
      section('Dati della pratica', [
        ['Contraente / cliente', val('mupClient')],
        ['Tipologia / prodotto', val('mupProduct')],
        ['Scadenza pratica', val('mupExpiry')],
        ['E-mail', val('mupEmail')]
      ]) +
      '<div class="footer">Base normativa: Allegato 3 al Regolamento IVASS n. 40/2018, come modificato dai Provvedimenti IVASS n. 163/2025 e n. 169/2026. Il MUP deve essere verificato e trasmesso al contraente nei tempi previsti dalla normativa applicabile.</div>' +
      '</body></html>';

    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) { $('mupMsg').textContent = 'Il browser ha bloccato la finestra del MUP. Consentire i popup per il sito.'; return; }
    w.document.open(); w.document.write(html); w.document.close();
    $('mupMsg').textContent = 'MUP generato in una nuova scheda. Verificare i dati e usare la stampa del browser per creare il PDF.';
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

  window.cmMup = { open, close, generate };
  new MutationObserver(installDetailButton).observe(document.getElementById('detail'), { childList: true, subtree: true, attributes: true });
  installDetailButton();
  $('mupClose').addEventListener('click', close);
  $('mupCancel').addEventListener('click', close);
  $('mupGenerate').addEventListener('click', generate);
})();