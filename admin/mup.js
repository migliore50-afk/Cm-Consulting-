(() => {
  const $ = (id) => document.getElementById(id);
  let currentPractice = null;

  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
  const val = (id) => $(id)?.value?.trim() || '';
  const set = (id, value) => { const el = $(id); if (el) el.value = value ?? ''; };

  const DEFAULTS_KEY = 'cm_mup_defaults_v1';

  const PRACTICE_SPECIFIC_IDS = new Set([
    'mupClient', 'mupProduct', 'mupExpiry', 'mupEmail'
  ]);

  function allFieldIds() {
    return Array.from(document.querySelectorAll('#mupOpen .form-grid input, #mupOpen .form-grid select'))
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
    }
  }

  function resetSavedDefaults() {
    try { localStorage.removeItem(DEFAULTS_KEY); } catch {}
    open(currentPractice || {});
    $('mupMsg').textContent = 'Valori salvati azzerati. I campi sono tornati vuoti.';
  }

  // 23 settembre 2026 — Fase 1 della revisione campi MUP, basata sul testo
  // ufficiale verificato dell'Allegato 3 al Regolamento IVASS 40/2018
  // (versione aggiornata al Provvedimento 169/2026, letta direttamente dal
  // PDF ufficiale IVASS, non da un riassunto). Modello di distribuzione,
  // Remunerazione e la tutela delle somme (ex "Pagamento premi") sono ora
  // menu a tendina con le sole formulazioni previste dalla norma, non testo
  // libero. Nessuna modifica alla generazione del documento Word/PDF in
  // questa fase — solo l'interfaccia del modulo. Nessuna modifica alla
  // Sezione VIII, al login o alla sicurezza.
  function updateProductTypeVisibility() {
    const value = val('mupProduct');
    const row = $('mupProductOtherRow');
    if (!row) return;
    const needsOther = value === '__ALTRO__';
    row.classList.toggle('hidden', !needsOther);
    if (!needsOther) {
      set('mupProductOther', '');
      $('mupProductOther')?.classList.remove('field-error');
    }
  }

  function applyProductType(value) {
    const known = [
      'Appalti pubblici',
      'Affitti fra privati',
      'Affitti commerciali',
      "Rami d'azienda",
      'Capacità finanziaria',
      'Dogane',
      'Beneficiari pubblici',
      'Contratti privati'
    ];
    const normalized = String(value || '').trim();
    if (known.includes(normalized)) {
      set('mupProduct', normalized);
      set('mupProductOther', '');
    } else if (normalized) {
      set('mupProduct', '__ALTRO__');
      set('mupProductOther', normalized);
    } else {
      set('mupProduct', '');
      set('mupProductOther', '');
    }
    updateProductTypeVisibility();
  }

  function updateRemunerationAmountVisibility() {
    const value = val('mupRemuneration');
    const needsAmount = value === 'Onorario corrisposto direttamente dal cliente' ||
      value === 'Combinazione delle diverse tipologie di compenso';
    const row = $('mupRemunerationAmountRow');
    if (!row) return;
    row.classList.toggle('hidden', !needsAmount);
    if (!needsAmount) {
      row.classList.remove('field-error');
      $('mupRemunerationAmount')?.classList.remove('field-error');
    }
  }

  function updateDistributionAndTransparencyFields() {
    const distribution = val('mupDistribution');
    const horizontal = val('mupHorizontal');
    const impartial = val('mupImpartial');
    const exclusive = val('mupExclusive');

    const insurerRow = $('mupInsurerRow');
    const horizontalRow = $('mupHorizontalNameRow');
    const nonExclusiveRow = $('mupNonExclusiveRow');

    // Sezione II, lett. a: la denominazione dell'impresa è richiesta quando
    // si agisce in nome o per conto di una o più imprese.
    const needsInsurer = distribution === 'Agisce in nome o per conto di una o più imprese di assicurazione';
    insurerRow?.classList.toggle('hidden', !needsInsurer);
    if (!needsInsurer) {
      set('mupInsurer', '');
      $('mupInsurer')?.classList.remove('field-error');
    }

    // Sezione II, lett. b: identità, sezione e ruolo solo se c'è
    // collaborazione orizzontale.
    const needsHorizontal = horizontal === 'SI';
    horizontalRow?.classList.toggle('hidden', !needsHorizontal);
    if (!needsHorizontal) {
      set('mupHorizontalName', '');
      $('mupHorizontalName')?.classList.remove('field-error');
    }

    // Sezione III: per la Sezione E le partecipazioni societarie non sono
    // una domanda della singola pratica. Il profilo viene valorizzato
    // automaticamente; per CM Consulting il valore attuale è "NO".
    set('mupConflictA', 'NO');
    set('mupConflictAName', '');
    set('mupConflictB', 'NO');
    set('mupConflictBName', '');

    // Sezione IV: l'analisi imparziale è una forma di consulenza
    // personalizzata; quando è SI, il punto c.3 è automaticamente SI.
    if (impartial === 'SI') {
      set('mupAdvice', 'SI');
      $('mupAdvice').disabled = true;
    } else {
      $('mupAdvice').disabled = false;
    }

    // Punto d: è applicabile solo quando non c'è esclusiva e non viene
    // fornita analisi imparziale e personale.
    const nonExclusive = exclusive === 'NO' && impartial === 'NO';
    set('mupNonExclusive', nonExclusive ? 'SI' : 'NO');
    nonExclusiveRow?.classList.toggle('hidden', !nonExclusive);

    // Le denominazioni delle imprese con rapporti d'affari servono nel caso
    // previsto dal punto d.
    if (!nonExclusive) set('mupBusinessRelationships', '');
  }

  function open(practice = {}) {
    currentPractice = practice;
    $('mupPracticeTitle').textContent = practice.client || 'Pratica';
    set('mupClient', practice.client);
    applyProductType(practice.type);
    set('mupExpiry', practice.expiry);
    set('mupEmail', practice.email);

    const saved = loadDefaults();

    const stableDefaults = {
      mupDistributorName: 'Carmelo Migliore',
      mupDistributorRui: 'E000437237',
      mupDistributorDate: '24/01/2013',
      mupDistributorSection: 'E',
      mupDistributorRole: 'Collaboratore di intermediario iscritto nella sezione A/B',
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
      mupRemunerationAmount: '',
      mupClientFee: '',
      mupRcAuto: '',
      mupHorizontalCompensation: '',
      mupPayment: '',
      mupSegregatedAssets: '',
      // 23 settembre 2026 — testo fisso, dal testo ufficiale IVASS (Sezione
      // VI, lettera b): le modalità di pagamento ammesse per legge sono le
      // stesse per tutti, non variano per pratica — non ha senso lasciarle
      // vuote ogni volta.
      mupPaymentMethods: 'Assegni bancari, postali o circolari non trasferibili, intestati o girati all’impresa di assicurazione o all’intermediario espressamente in tale qualità; bonifici e altri strumenti di pagamento bancario, postale o elettronico con lo stesso beneficiario; denaro contante solo per polizze RC Auto (e relative garanzie accessorie riferite allo stesso veicolo) oppure, per gli altri rami danni, entro il limite di € 750 annui per contratto.',
      mupSectionBPayment: '',
      mupRc: '',
      mupComplaints: 'Reclamo a CM Consulting via email (info@cm-consulting.info), PEC (carmelo.migliore@legalmail.it) o posta ordinaria (Via Spinoza n. 49, 00137 Roma) — risposta entro 45 giorni. Se non soddisfatto, reclamo all’IVASS (Via del Quirinale 21, 00187 Roma).',
      mupArbitro: 'Diritto di ricorso all’Arbitro Assicurativo per le controversie in materia assicurativa e/o di intermediazione, operativo dal 15 gennaio 2026 — dettagli e modalità sulla pagina “Reclami e Arbitro Assicurativo” di cm-consulting.info.',
      mupFinNet: '',
      mupOtherAdr: '',
      mupOncology: 'Non applicabile: CM Consulting non colloca prodotti assicurativi vita/salute per i quali sia richiesta una dichiarazione sullo stato di salute del contraente.'
    };

    Object.entries(stableDefaults).forEach(([id, fallback]) => {
      set(id, Object.prototype.hasOwnProperty.call(saved, id) && saved[id] ? saved[id] : fallback);
    });

    populateIntermediarySelect();
    updateProductTypeVisibility();
    updateRemunerationAmountVisibility();
    updateDistributionAndTransparencyFields();

    document.querySelectorAll('#mupOpen .field-error').forEach(el => el.classList.remove('field-error'));
    $('mupMsg').textContent = '';
    $('mupOpen').classList.remove('hidden');
    $('mupClient').focus();
  }

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
      set('mupRc', '');
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
    set('mupRc', 'Attività di distribuzione garantita dalla copertura di responsabilità civile professionale prevista per l’intermediario principale e per l’attività svolta in Sezione E.');
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

  function requiredValues() {
    const product = val('mupProduct') === '__ALTRO__' ? val('mupProductOther') : val('mupProduct');
    const productFieldId = val('mupProduct') === '__ALTRO__' ? 'mupProductOther' : 'mupProduct';
    const fields = [
      ['Tipologia / prodotto', productFieldId, product],
      ['Nome distributore', 'mupDistributorName'],
      ['RUI distributore', 'mupDistributorRui'],
      ['Sezione distributore', 'mupDistributorSection'],
      ['Sede legale / domicilio professionale', 'mupDistributorAddress'],
      ['Intermediario principale per cui opera la Sezione E', 'mupMainIntermediary'],
      ['RUI intermediario principale', 'mupMainRui'],
      ['Sezione intermediario principale', 'mupMainSection'],
      ['Sede legale intermediario principale', 'mupMainAddress'],
      ['Modello di distribuzione', 'mupDistribution'],
      ['Remunerazione', 'mupRemuneration'],
      ['Tutela delle somme versate dal cliente', 'mupPayment'],
      ['RC professionale', 'mupRc'],
      ['Reclami', 'mupComplaints'],
      ['Arbitro Assicurativo', 'mupArbitro']
    ];
    // 23 settembre 2026 — l'importo/metodo di calcolo dell'onorario è
    // obbligatorio solo quando la remunerazione lo prevede (onorario diretto
    // o combinazione), come indicato dalla Sezione V, lettera b, del testo
    // IVASS — non è un campo sempre richiesto.
    const remuneration = val('mupRemuneration');
    if (val('mupDistribution') === 'Agisce in nome o per conto di una o più imprese di assicurazione') {
      fields.push(['Impresa/e di assicurazione', 'mupInsurer']);
    }
    if (val('mupHorizontal') === 'SI') {
      fields.push(['Intermediario/i collaborazione orizzontale', 'mupHorizontalName']);
    }

    if (remuneration === 'Onorario corrisposto direttamente dal cliente' ||
        remuneration === 'Combinazione delle diverse tipologie di compenso') {
      fields.push(['Importo del compenso o metodo per calcolarlo', 'mupRemunerationAmount']);
    }
    return fields.map(([label, id, explicitValue]) => [label, id, explicitValue !== undefined ? explicitValue : val(id)]);
  }

  // 22 settembre 2026 — su segnalazione di Carmelo: su iPhone il secondo di
  // due download avviati uno subito dopo l'altro veniva bloccato dal
  // sistema, che riconosce solo il primo come azione legittima dell'utente.
  // Piccola pausa (350ms) prima del secondo download: soluzione standard e
  // affidabile per questo comportamento, cross-browser.
  function downloadBase64(base64, mime, filename) {
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
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function generate() {
    const fields = requiredValues();
    fields.forEach(([, id]) => $(id)?.classList.remove('field-error'));
    const missing = fields.filter(x => !x[2]);
    if (missing.length) {
      missing.forEach(([, id]) => $(id)?.classList.add('field-error'));
      $('mupMsg').textContent = missing.length + (missing.length === 1 ? ' campo obbligatorio' : ' campi obbligatori') + ' da compilare prima di generare il MUP: ' + missing.map(x => x[0]).join(', ') + '.';
      $(missing[0][1])?.focus();
      return;
    }

    saveDefaults();

    const now = new Date();
    const documentId = 'MUP-' + now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14);

    const payload = {};
    document.querySelectorAll('#mupOpen input, #mupOpen select, #mupOpen textarea').forEach(el => {
      if (el.id) payload[el.id] = el.value || '';
    });
    payload.mupProduct = val('mupProduct') === '__ALTRO__' ? val('mupProductOther') : val('mupProduct');
    payload.documentId = documentId;

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

      const safeClient = String(val('mupClient') || 'pratica').replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').trim().replace(/\s+/g, '_') || 'pratica';

      downloadBase64(result.pdfBase64, 'application/pdf', result.documentId + '_' + safeClient + '.pdf');
      await wait(350);
      downloadBase64(result.docxBase64, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', result.documentId + '_' + safeClient + '.docx');

      if (typeof loadPractices === 'function') await loadPractices();
      $('mupMsg').textContent = 'MUP generato e salvato nella pratica. Se uno dei due file (in genere il Word) non si è scaricato, apri la pratica e usa "Scarica Word" / "Scarica PDF" per riprenderlo singolarmente. Nota: il nuovo campo "Importo del compenso" non è ancora incluso nel documento generato — arriva nella prossima fase.';
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

  $('mupMainIntermediarySelect')?.addEventListener('change', function () {
    applyIntermediarySelection(this.value);
  });

  // 23 settembre 2026 — mostra/nasconde il campo "Importo del compenso"
  // quando cambia il tipo di remunerazione selezionato.
  $('mupProduct')?.addEventListener('change', updateProductTypeVisibility);
  $('mupRemuneration')?.addEventListener('change', updateRemunerationAmountVisibility);
  ['mupDistribution','mupHorizontal']
    .forEach(id => $(id)?.addEventListener('change', updateDistributionAndTransparencyFields));

  $('mupOpen')?.addEventListener('input', e => {
    if (e.target?.classList?.contains('field-error')) e.target.classList.remove('field-error');
  });
  $('mupOpen')?.addEventListener('change', e => {
    if (e.target?.classList?.contains('field-error')) e.target.classList.remove('field-error');
  });

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'link-btn';
  resetBtn.textContent = 'Svuota i valori ricordati';
  resetBtn.style.marginTop = '8px';
  resetBtn.addEventListener('click', resetSavedDefaults);
  $('mupMsg')?.after(resetBtn);
})();