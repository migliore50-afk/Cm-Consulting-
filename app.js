const SLIDES = [
  ['appalti', 'APPALTI PUBBLICI', 'Garanzie per le tue gare', 'Per chi deve partecipare a una gara o gestire obblighi contrattuali.'],
  ['autotrasportatori', 'TRASPORTI', "Soluzioni per l'autotrasporto", "Per imprese che operano nel trasporto e nell'autotrasporto."],
  ['locazioni', 'LOCAZIONI', 'Garanzie per il tuo contratto', 'Per esigenze legate a rapporti di locazione.'],
  ['altre-esigenze', 'ALTRE ESIGENZE', 'Garanzie per esigenze specifiche', 'Soluzioni per dogane, ambiente, energia, sanità e altre necessità.']
];

const IMG_WIDTHS = [768, 1280, 1920, 2560, 3840];
const imageSet = stem => IMG_WIDTHS.map(w => `assets/${stem}-retina-${w}.webp ${w}w`).join(', ');
const imageSizes = '(max-width: 760px) 100vw, 56vw';

let slideIndex = 0;
let slideTimer = null;


function initSlider() {
  const stage = document.querySelector('.hero-stage');
  const pictureA = stage?.querySelector('picture');
  const imgA = document.getElementById('heroImage');
  if (!stage || !pictureA || !imgA) return;

  const sourceA = document.getElementById('heroWebp');
  const kicker = document.getElementById('heroKicker');
  const title = document.getElementById('heroTitle');
  const text = document.getElementById('heroText');
  const progress = document.getElementById('heroProgress');
  const dots = document.getElementById('heroDots');

  const pictureB = pictureA.cloneNode(true);
  pictureB.removeAttribute('id');
  pictureB.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  const sourceB = pictureB.querySelector('source');
  const imgB = pictureB.querySelector('img');
  if (!imgB) return;

  stage.style.position = 'relative';
  [pictureA, pictureB].forEach((layer, i) => {
    layer.style.position = 'absolute';
    layer.style.inset = '0';
    layer.style.width = '100%';
    layer.style.height = '100%';
    layer.style.margin = '0';
    layer.style.padding = '0';
    layer.style.lineHeight = '0';
    layer.style.zIndex = '0';
    layer.style.pointerEvents = 'none';
    layer.style.opacity = i === 0 ? '1' : '0';
    layer.style.transition = 'opacity 400ms ease';
  });
  [imgA, imgB].forEach(image => {
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.maxWidth = 'none';
    image.style.objectFit = 'cover';
    image.style.objectPosition = 'center center';
    image.style.marginLeft = '0';
    image.style.transition = 'none';
  });
  imgB.setAttribute('aria-hidden', 'true');
  pictureB.setAttribute('aria-hidden', 'true');
  pictureA.setAttribute('aria-hidden', 'false');
  stage.appendChild(pictureB);

  let activeLayer = 0;
  let isTransitioning = false;
  let transitionFallback = null;
  const layers = [
    { picture: pictureA, source: sourceA, img: imgA },
    { picture: pictureB, source: sourceB, img: imgB }
  ];

  const TRANSITION_MS = 400;
  const FAILSAFE_MS = TRANSITION_MS + 150;

  function setLayerContent(layer, srcset, nextSrc, alt) {
    if (layer.source) {
      layer.source.srcset = srcset;
      layer.source.sizes = imageSizes;
    }
    layer.img.srcset = srcset;
    layer.img.sizes = imageSizes;
    layer.img.src = nextSrc;
    layer.img.alt = alt;
  }

  function prepareLayer(layer, done) {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      layer.img.removeEventListener('load', finish);
      layer.img.removeEventListener('error', finish);
      done();
    };

    layer.img.addEventListener('load', finish, {once: true});
    layer.img.addEventListener('error', finish, {once: true});

    if (typeof layer.img.decode === 'function') {
      layer.img.decode().then(finish).catch(() => {
        if (layer.img.complete && layer.img.naturalWidth > 0) finish();
      });
    } else if (layer.img.complete) {
      finish();
    }
  }

  function finishTransition() {
    if (!isTransitioning) return;
    if (transitionFallback) {
      window.clearTimeout(transitionFallback);
      transitionFallback = null;
    }

    const oldLayer = layers[activeLayer];
    const newLayerIndex = activeLayer === 0 ? 1 : 0;
    const newLayer = layers[newLayerIndex];

    oldLayer.picture.style.opacity = '0';
    newLayer.picture.style.opacity = '1';
    oldLayer.picture.setAttribute('aria-hidden', 'true');
    newLayer.picture.setAttribute('aria-hidden', 'false');
    activeLayer = newLayerIndex;
    isTransitioning = false;
  }

  function crossfadeTo(layerIndex, onComplete) {
    const oldLayer = layers[activeLayer];
    const newLayer = layers[layerIndex];
    isTransitioning = true;
    newLayer.picture.style.opacity = '0';
    newLayer.picture.style.zIndex = '1';
    oldLayer.picture.style.zIndex = '0';

    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      newLayer.picture.removeEventListener('transitionend', finish);
      finishTransition();
      if (onComplete) onComplete();
    };

    newLayer.picture.addEventListener('transitionend', finish, {once: true});
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newLayer.picture.style.opacity = '1';
        oldLayer.picture.style.opacity = '0';
      });
    });
    transitionFallback = window.setTimeout(finish, FAILSAFE_MS);
  }

  if (dots && !dots.children.length) {
    SLIDES.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Vai alla slide ${i + 1}`);
      dot.addEventListener('click', () => paintSlide(i, true));
      dots.appendChild(dot);
    });
  }

  function paintSlide(index, manual = false) {
    if (isTransitioning) return;

    const nextIndex = (index + SLIDES.length) % SLIDES.length;
    if (nextIndex === slideIndex && layers[activeLayer].img.currentSrc) {
      if (manual) restartSlider();
      return;
    }

    slideIndex = nextIndex;
    const [stem, label, heading, description] = SLIDES[slideIndex];
    const srcset = imageSet(stem);
    const nextSrc = `assets/${stem}-retina-1920.webp`;
    const targetLayerIndex = activeLayer === 0 ? 1 : 0;
    const targetLayer = layers[targetLayerIndex];

    targetLayer.picture.style.opacity = '0';
    targetLayer.picture.style.zIndex = '0';
    setLayerContent(targetLayer, srcset, nextSrc, `${label} — ${heading}`);
    isTransitioning = true;

    prepareLayer(targetLayer, () => {
      crossfadeTo(targetLayerIndex, () => {
        if (kicker) kicker.textContent = label;
        if (title) title.textContent = heading;
        if (text) text.textContent = description;
      });
    });

    if (progress) {
      progress.style.width = `${((slideIndex + 1) / SLIDES.length) * 100}%`;
    }

    dots?.querySelectorAll('button').forEach((button, i) => {
      button.classList.toggle('active', i === slideIndex);
      button.setAttribute('aria-current', i === slideIndex ? 'true' : 'false');
    });

    if (manual) restartSlider();
  }

  function restartSlider() {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => paintSlide(slideIndex + 1), 6000);
  }

  document.getElementById('next')?.addEventListener('click', () => paintSlide(slideIndex + 1, true));
  document.getElementById('prev')?.addEventListener('click', () => paintSlide(slideIndex - 1, true));

  pictureA.style.opacity = '1';
  pictureB.style.opacity = '0';
  pictureA.style.zIndex = '0';
  pictureB.style.zIndex = '0';
  slideIndex = 0;
  const [initialStem, initialLabel, initialHeading] = SLIDES[0];
  setLayerContent(layers[0], imageSet(initialStem), `assets/${initialStem}-retina-1920.webp`, `${initialLabel} — ${initialHeading}`);
  if (kicker) kicker.textContent = initialLabel;
  if (title) title.textContent = initialHeading;
  if (text) text.textContent = SLIDES[0][3];
  if (progress) progress.style.width = `${100 / SLIDES.length}%`;
  dots?.querySelectorAll('button').forEach((button, i) => {
    button.classList.toggle('active', i === 0);
    button.setAttribute('aria-current', i === 0 ? 'true' : 'false');
  });
  restartSlider();
}
function initMenu() {
  const menu = document.getElementById('menu');
  const links = document.getElementById('links');
  if (!menu || !links) return;

  menu.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    });
  });
}

function assistantImageMarkup(className = '') {
  return `<img class="${className}" src="assets/assistente-cm-retina-768.webp"
    srcset="assets/assistente-cm-retina-480.webp 480w, assets/assistente-cm-retina-768.webp 768w, assets/assistente-cm-retina-1024.webp 1024w, assets/assistente-cm-retina-1440.webp 1440w, assets/assistente-cm-retina-1920.webp 1920w, assets/assistente-cm-retina-2560.webp 2560w"
    sizes="(max-width: 640px) 100vw, 440px"
    width="768" height="432" loading="lazy" decoding="async" alt="Assistente CM">`;
}

function initAssistantUI() {
  const aiPanel = document.getElementById('aiPanel');
  if (!aiPanel) return;

  aiPanel.innerHTML = `
    <div class="ai-head">
      <div class="ai-title">
        <span class="ai-brand-mark" aria-hidden="true"><img src="assets/images/logo-cm-symbol.png" alt=""></span>
        <div><b>Assistente CM</b><span>Il tuo consulente virtuale</span></div>
      </div>
      <div class="ai-head-actions">
        <button class="ai-voice-toggle" type="button" aria-pressed="false" aria-label="Attiva lettura vocale" title="Attiva lettura vocale">🔊 <span>Voce</span></button>
        <button class="ai-close" type="button" aria-label="Chiudi Assistente CM">×</button>
      </div>
    </div>
    <div class="ai-portrait">${assistantImageMarkup()}</div>
    <div id="aiContent" class="ai-content"></div>
    <div class="ai-note">Assistente digitale di orientamento. Non sostituisce la valutazione professionale né la documentazione richiesta.</div>`;

  aiPanel.querySelector('.ai-close')?.addEventListener('click', closeAI);
  const voiceButton = aiPanel.querySelector('.ai-voice-toggle');
  const enabled = localStorage.getItem('cm_ai_voice') === '1';
  setVoiceState(enabled, voiceButton);
  voiceButton?.addEventListener('click', () => setVoiceState(!isVoiceEnabled(), voiceButton));

  // Su alcuni browser l'elenco delle voci e' vuoto finche' non viene richiesto
  // almeno una volta: lo "scaldiamo" subito, cosi' la prima frase pronunciata
  // ha gia' a disposizione l'elenco per scegliere una voce italiana.
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}

function isVoiceEnabled() {
  return localStorage.getItem('cm_ai_voice') === '1';
}

function setVoiceState(enabled, button) {
  localStorage.setItem('cm_ai_voice', enabled ? '1' : '0');
  if (button) {
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Disattiva lettura vocale' : 'Attiva lettura vocale');
    button.title = enabled ? 'Disattiva lettura vocale' : 'Attiva lettura vocale';
    button.innerHTML = `${enabled ? '🔊' : '🔇'} <span>Voce</span>`;
  }
  if (!enabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function pickItalianVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const italian = voices.filter(v => /^it([-_]|$)/i.test(v.lang));
  if (!italian.length) return null;
  const maleNamePattern = /\b(luca|diego|marco|paolo|alessandro|giorgio|matteo|male|maschile|uomo)\b/i;
  return italian.find(v => maleNamePattern.test(v.name)) || italian[0];
}

function speakAI(text) {
  const portrait = document.querySelector('.ai-portrait');
  if (!isVoiceEnabled() || !('speechSynthesis' in window)) return;
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'it-IT';
  utterance.rate = 0.98;
  utterance.pitch = 1;
  // Preferisce una voce italiana maschile, se il dispositivo del visitatore ne ha una
  // installata (varia da dispositivo a dispositivo, non e' garantito su tutti).
  const preferredVoice = pickItalianVoice();
  if (preferredVoice) utterance.voice = preferredVoice;
  // Dà un riscontro visivo sul ritratto mentre l'assistente sta parlando
  // (bordo dorato fisso + leggero "respiro" lento), cosi' non resta una foto immobile
  // durante l'audio, senza pero' un lampeggio che sembri un difetto.
  utterance.onstart = () => portrait?.classList.add('speaking');
  utterance.onend = () => portrait?.classList.remove('speaking');
  utterance.onerror = () => portrait?.classList.remove('speaking');
  window.speechSynthesis.speak(utterance);
}

function openAI() {
  const panel = document.getElementById('aiPanel');
  panel?.classList.add('open');
  document.getElementById('cm-ai-fab')?.classList.add('hidden');
  startAI();
}

function closeAI() {
  document.getElementById('aiPanel')?.classList.remove('open');
  document.getElementById('cm-ai-fab')?.classList.remove('hidden');
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  document.querySelector('.ai-portrait')?.classList.remove('speaking');
  stopAssistantRecognition();
}

function aiEscape(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[ch]));
}

function aiNormalize(value) {
  return String(value || '')
    .toLocaleLowerCase('it-IT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CM_AI_ROUTES = {
  appalti: { label:'Appalti pubblici', url:'/richiedi-preventivo?tipo=appalti' },
  locazioni: { label:'Locazioni', url:'/richiedi-preventivo?tipo=locazioni' },
  dogane: { label:'Dogane', url:'/richiedi-preventivo?tipo=dogane' },
  ambiente: { label:'Beneficiari pubblici / ambiente', url:'/richiedi-preventivo?tipo=ambiente' },
  contributi: { label:'Contributi e agevolazioni', url:'/richiedi-preventivo?tipo=contributi' },
  urbanistica: { label:'Urbanistica ed edilizia', url:'/richiedi-preventivo?tipo=urbanistica' },
  fiscali: { label:'Garanzie fiscali', url:'/richiedi-preventivo?tipo=fiscali' },
  'contratti-privati': { label:'Contratti privati', url:'/richiedi-preventivo?tipo=contratti-privati' },
  trasporto: { label:'Capacità finanziaria', url:'/capacita-finanziaria' },
  generica: { label:'Valutazione generica', url:'/richiedi-preventivo?esigenza=generica' }
};

function classifyAIRequest(text) {
  const t = aiNormalize(text);
  const rules = {
    appalti: ['appalto','appalti','gara','gare','bando','stazione appaltante','cauzione provvisoria','cauzione definitiva','garanzia definitiva','anticipazione','svincolo ritenute','lavori pubblici','esecuzione contratto'],
    trasporto: ['autotrasporto','autotrasportatore','trasportatore','albo trasportatori','capacita finanziaria','idoneita finanziaria','conto terzi','trasporto merci'],
    locazioni: ['affitto','affitti','locazione','locazioni','locatore','conduttore','canone','negozio','ufficio','capannone','ramo d azienda'],
    dogane: ['dogana','dogane','doganale','deposito fiscale','diritti doganali','aeo','import export','importazione','esportazione'],
    ambiente: ['ambiente','ambientale','rifiuti','discarica','cava','cave','albo gestori ambientali','gestori ambientali','smaltimento'],
    contributi: ['contributo','contributi','agevolazione','agevolazioni','finanziamento pubblico','bando regionale','fondo pubblico'],
    urbanistica: ['urbanistica','urbanizzazione','oneri di urbanizzazione','edilizia','convenzione urbanistica','permesso di costruire'],
    fiscali: ['fiscale','fiscali','fisco','iva','agenzia delle entrate','imposte','tributi','rimborso iva','garanzia iva'],
    'contratti-privati': ['contratto privato','contratti privati','acconto','transazione','fornitura','forniture','prestazione di servizi','servizi continuativi','obbligazione contrattuale']
  };
  const scores = Object.entries(rules).map(([type, words]) => {
    let score = 0;
    for (const word of words) {
      const matched = word.includes(' ')
        ? t.includes(word)
        : new RegExp('\\b' + word + '\\b').test(t);
      if (matched) score += word.includes(' ') ? 3 : 2;
    }
    return { type, score };
  }).sort((a,b)=>b.score-a.score);

  const top=scores[0], second=scores[1];
  if (!top || top.score < 2) return { type:'generica', confidence:'low', scores };
  if (second && top.score === second.score) return { type:'ambiguous', confidence:'medium', candidates:[top.type,second.type], scores };
  return { type:top.type, confidence:top.score >= 4 ? 'high' : 'medium', scores };
}

function saveAIAssistantContext(text, extra = {}) {
  const context = {
    genericDescription: String(text || '').trim(),
    notes: extra.notes || '',
    leaseType: extra.leaseType || '',
    createdAt: new Date().toISOString()
  };
  try {
    sessionStorage.setItem('cm_ai_form_context', JSON.stringify(context));
  } catch {}
}

function goToAIRoute(type, text, extra = {}) {
  const route = CM_AI_ROUTES[type] || CM_AI_ROUTES.generica;
  saveAIAssistantContext(text, extra);
  try { sessionStorage.setItem('cm_ai_route', route.url); } catch {}
  window.location.href = route.url;
}

function renderAIInput(prefill = '') {
  const content = document.getElementById('aiContent');
  if (!content) return;
  content.innerHTML = `
    <div class="bubble ai"><b>Raccontami la tua necessità.</b><br>
      Non devi conoscere il nome tecnico della garanzia. Scrivi con parole tue cosa devi fare e cosa ti è stato richiesto.
    </div>
    <div class="ai-free-input">
      <textarea id="aiNeedInput" rows="4" maxlength="2000" placeholder="Es. Devo partecipare a una gara del Comune e mi chiedono una fideiussione…">${aiEscape(prefill)}</textarea>
      <button class="ai-choice ai-submit" id="aiNeedSubmit" type="button">Continua →</button>
      <div class="ai-free-hint">L'assistente serve a orientare la richiesta; non formula una raccomandazione assicurativa.</div>
    </div>
    <div class="ai-voice-row">
      <button class="ai-mic" id="aiMic" type="button" aria-label="Spiega a voce la tua esigenza">🎙️ <span>Spiega a voce la tua esigenza</span></button>
      <span class="ai-voice-status" id="aiVoiceStatus" role="status" aria-live="polite"></span>
    </div>
    <button class="ai-choice" type="button" id="aiCancelInput">Chiudi percorso</button>`;
  const input=document.getElementById('aiNeedInput');
  document.getElementById('aiNeedSubmit')?.addEventListener('click',()=>handleAIRequest(input?.value||''));
  document.getElementById('aiCancelInput')?.addEventListener('click',startAI);
  input?.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter') handleAIRequest(input.value);
  });
  document.getElementById('aiMic')?.addEventListener('click',startAssistantRecognition);
  input?.focus();
}

function startAI() {
  const content = document.getElementById('aiContent');
  if (!content) return;
  const greeting = `Buongiorno! Sono l'Assistente CM. Posso aiutarti a capire quale percorso di richiesta utilizzare. Raccontami semplicemente cosa ti serve.`;
  content.innerHTML = `
    <div class="bubble ai"><b>Buongiorno.</b><br>
      Non devi conoscere il nome della garanzia.<br><br>
      <b>Scrivimi cosa devi fare o cosa ti è stato richiesto.</b>
    </div>
    <button class="ai-choice" type="button" id="aiStartWriting">Scrivi la tua necessità →</button>
    <div class="ai-voice-row">
      <button class="ai-mic" id="aiMic" type="button" aria-label="Spiega a voce la tua esigenza">🎙️ <span>Oppure spiegala a voce</span></button>
      <span class="ai-voice-status" id="aiVoiceStatus" role="status" aria-live="polite"></span>
    </div>`;
  document.getElementById('aiStartWriting')?.addEventListener('click',()=>renderAIInput());
  document.getElementById('aiMic')?.addEventListener('click',startAssistantRecognition);
  speakAI(greeting);
}

function handleAIRequest(text) {
  const clean=String(text||'').trim();
  if(!clean) {
    renderAIInput();
    const input=document.getElementById('aiNeedInput');
    if(input) { input.classList.add('cm-field-error'); input.focus(); }
    return;
  }
  const result=classifyAIRequest(clean);
  if(result.type==='ambiguous') {
    renderAIAmbiguous(clean,result.candidates);
    return;
  }
  if(result.type==='locazioni') {
    renderAILeaseChoice(clean);
    return;
  }
  if(result.type==='appalti') {
    renderAIAppaltoChoice(clean);
    return;
  }
  renderAIRouteConfirmation(clean,result.type);
}

function renderAIAmbiguous(text,candidates) {
  const content=document.getElementById('aiContent');
  const labels=candidates.map(t=>CM_AI_ROUTES[t]?.label||t);
  content.innerHTML=`
    <div class="bubble ai"><b>Ho individuato più percorsi possibili.</b><br>
      La tua descrizione può rientrare in ${aiEscape(labels.join(' oppure '))}. Quale descrive meglio il caso?
    </div>
    <div class="ai-choices">${candidates.map(t=>`<button class="ai-choice" type="button" data-ai-route="${t}">${aiEscape(CM_AI_ROUTES[t].label)} <span>›</span></button>`).join('')}</div>
    <button class="ai-choice" type="button" id="aiBackToText">← Modifica la descrizione</button>`;
  content.querySelectorAll('[data-ai-route]').forEach(b=>b.addEventListener('click',()=>renderAIRouteConfirmation(text,b.dataset.aiRoute)));
  document.getElementById('aiBackToText')?.addEventListener('click',()=>renderAIInput(text));
}

function renderAILeaseChoice(text) {
  const content=document.getElementById('aiContent');
  content.innerHTML=`
    <div class="bubble ai"><b>Ho capito che si tratta di una locazione.</b><br>Che tipo di locazione è?</div>
    <div class="ai-choices">
      <button class="ai-choice" type="button" data-lease="abitativo">Uso abitativo <span>›</span></button>
      <button class="ai-choice" type="button" data-lease="commerciale">Uso commerciale <span>›</span></button>
      <button class="ai-choice" type="button" data-lease="rami-azienda">Ramo d'azienda <span>›</span></button>
    </div>
    <button class="ai-choice" type="button" id="aiBackToText">← Modifica la descrizione</button>`;
  content.querySelectorAll('[data-lease]').forEach(b=>b.addEventListener('click',()=>renderAIRouteConfirmation(text,'locazioni',{leaseType:b.dataset.lease})));
  document.getElementById('aiBackToText')?.addEventListener('click',()=>renderAIInput(text));
}

function renderAIAppaltoChoice(text) {
  const content=document.getElementById('aiContent');
  content.innerHTML=`
    <div class="bubble ai"><b>Ho capito che si tratta di un appalto.</b><br>Che tipo di garanzia ti è stata richiesta, se lo sai?</div>
    <div class="ai-choices">
      <button class="ai-choice" type="button" data-guarantee="provvisoria">Partecipazione / provvisoria <span>›</span></button>
      <button class="ai-choice" type="button" data-guarantee="definitiva">Definitiva / esecuzione <span>›</span></button>
      <button class="ai-choice" type="button" data-guarantee="anticipazione">Anticipazione <span>›</span></button>
      <button class="ai-choice" type="button" data-guarantee="altro">Non lo so / altro <span>›</span></button>
    </div>
    <button class="ai-choice" type="button" id="aiBackToText">← Modifica la descrizione</button>`;
  content.querySelectorAll('[data-guarantee]').forEach(b=>b.addEventListener('click',()=>{
    const g=b.dataset.guarantee;
    const note=`Garanzia richiesta per appalto: ${g}.`;
    renderAIRouteConfirmation(text,'appalti',{notes:note});
  }));
  document.getElementById('aiBackToText')?.addEventListener('click',()=>renderAIInput(text));
}

function renderAIRouteConfirmation(text,type,extra={}) {
  const content=document.getElementById('aiContent');
  const route=CM_AI_ROUTES[type]||CM_AI_ROUTES.generica;
  content.innerHTML=`
    <div class="bubble ai"><b>Ho individuato il percorso di richiesta.</b><br>
      ${aiEscape(route.label)}.<br><br>
      Ti porto al modulo pertinente, mantenendo nella richiesta la descrizione che hai appena fornito.
    </div>
    <div class="ai-choices">
      <button class="ai-choice" type="button" id="aiGoRoute">Apri il percorso →</button>
      <button class="ai-choice" type="button" id="aiEditRoute">← Modifica la descrizione</button>
      <button class="ai-choice" type="button" id="aiGenericRoute">Preferisco una valutazione generica</button>
    </div>`;
  document.getElementById('aiGoRoute')?.addEventListener('click',()=>goToAIRoute(type,text,extra));
  document.getElementById('aiEditRoute')?.addEventListener('click',()=>renderAIInput(text));
  document.getElementById('aiGenericRoute')?.addEventListener('click',()=>goToAIRoute('generica',text));
  speakAI(`Ho individuato il percorso ${route.label}. Puoi aprirlo oppure scegliere una valutazione generica.`);
}

function startAssistantRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const status = document.getElementById('aiVoiceStatus');
  const mic = document.getElementById('aiMic');
  if (!Recognition) {
    if (status) status.textContent = 'Il riconoscimento vocale non è disponibile in questo browser.';
    return;
  }
  stopAssistantRecognition();
  assistantRecognition = new Recognition();
  assistantRecognition.lang = 'it-IT';
  assistantRecognition.interimResults = false;
  assistantRecognition.maxAlternatives = 1;
  if (status) status.textContent = 'Ascolto in corso…';
  if (mic) mic.classList.add('listening');
  assistantRecognition.onresult = event => {
    const transcript = String(event.results?.[0]?.[0]?.transcript || '').trim();
    if (!transcript) return;
    if (status) status.textContent = 'Richiesta acquisita.';
    renderAIInput(transcript);
    const input=document.getElementById('aiNeedInput');
    if(input) input.value=transcript;
    speakAI('Ho acquisito la tua richiesta. Controlliamola insieme.');
  };
  assistantRecognition.onerror = event => {
    if (status) status.textContent = event.error === 'not-allowed' ? "Consenti l'uso del microfono per parlare con l'assistente." : "Non ho potuto acquisire l'audio. Riprova.";
  };
  assistantRecognition.onend = () => {
    if (mic) mic.classList.remove('listening');
    assistantRecognition = null;
  };
  try { assistantRecognition.start(); } catch {
    if (status) status.textContent = 'Microfono non disponibile. Riprova.';
    if (mic) mic.classList.remove('listening');
  }
}

function stopAssistantRecognition() {
  if (!assistantRecognition) return;
  try { assistantRecognition.abort(); } catch {}
  assistantRecognition = null;
  document.getElementById('aiMic')?.classList.remove('listening');
}

window.openAI = openAI;
window.closeAI = closeAI;
window.startAI = startAI;
window.aiChoose = handleAIRequest;

function initAssistantFab() {
  if (document.getElementById('cm-ai-fab')) return;

  const button = document.createElement('button');
  button.id = 'cm-ai-fab';
  button.className = 'cm-ai-fab';
  button.type = 'button';
  button.setAttribute('aria-label', 'Apri Assistente CM');
  button.setAttribute('title', 'Apri Assistente CM');
  button.innerHTML = '<span class="cm-ai-fab-logo" aria-hidden="true"><img src="assets/assistente-cm-retina-768.webp" alt=""></span><span class="cm-ai-fab-copy"><strong>Assistente CM</strong><small>Posso aiutarti?</small></span><span class="cm-ai-fab-arrow" aria-hidden="true">→</span>';
  button.addEventListener('click', openAI);
  document.body.appendChild(button);
}

function initAssistantFabFooterHide() {
  const fab = document.getElementById('cm-ai-fab');
  const footer = document.querySelector('footer.cm-footer');
  if (!fab || !footer || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      fab.classList.toggle('hidden', entry.isIntersecting);
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0 });

  observer.observe(footer);
}

function initClickableCards() {
  document.querySelectorAll('.card-clickable[data-card-href]').forEach(card => {
    const go = () => { window.location.href = card.dataset.cardHref; };

    card.addEventListener('click', event => {
      if (event.target.closest('a,button,input,select,textarea')) return;
      go();
    });

    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        go();
      }
    });
  });
}

function initBasicFormValidation() {
  document.querySelectorAll('form').forEach(form => {
    form.querySelectorAll('input,select,textarea').forEach(control => {
      control.addEventListener('blur', () => {
        if (control.required && !control.value.trim()) control.classList.add('cm-field-error');
      });
      control.addEventListener('input', () => control.classList.remove('cm-field-error'));
    });
  });
}

function initBackToTop() {
  if (document.getElementById('cm-back-top')) return;
  const btn = document.createElement('button');
  btn.id = 'cm-back-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Torna in cima alla pagina');
  btn.title = 'Torna su';
  btn.innerHTML = '↑ <span>Torna su</span>';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btn);

  // 20 settembre 2026 — evita la sovrapposizione con il widget "Assistente CM" nel
  // footer (segnalata da Carmelo): il pulsante ora tiene conto di due condizioni,
  // scroll sufficiente E footer non visibile, stesso principio gia' usato da
  // initAssistantFabFooterHide() per il widget dell'assistente.
  let scrolledEnough = false;
  let footerVisible = false;
  const updateVisibility = () => {
    btn.classList.toggle('show', scrolledEnough && !footerVisible);
  };

  window.addEventListener('scroll', () => {
    scrolledEnough = window.scrollY > 400;
    updateVisibility();
  }, { passive: true });

  const footer = document.querySelector('footer.cm-footer');
  if (footer && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        footerVisible = entry.isIntersecting;
        updateVisibility();
      });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0 });
    observer.observe(footer);
  }
}

// 19 settembre 2026 — riquadro "Dati societari e iscrizione" nel footer, restyle su
// richiesta di Carmelo ispirato al footer di un competitor (fideiussioni.online):
// da blocco centrato/impilato a riga unica compatta, allineata a sinistra, con
// separatori "·" e link "Verificabile su IVASS". Applicato via JS su ogni pagina
// (stesso approccio delle altre correzioni footer), cosi' non serve toccare i
// singoli file HTML. Usa cssText con !important per avere la priorita' sulle regole
// storiche di v9-final.css (centrato/grid/max-width), senza doverle rimuovere.
function simplifyLegalBar() {
  document.querySelectorAll('.cm-footer-legalbar').forEach(bar => {
    if (bar.dataset.cmCompact === '1') return;
    bar.innerHTML = '<p>CM Consulting di Carmelo Migliore &ndash; P.IVA/C.F. 14416401009 / MGLCML71M25L219S &middot; REA RM &ndash; 1519347 &middot; Carmelo Migliore, R.U.I. Sezione E n. E000437237 dal 24/01/2013 &middot; <a href="https://www.ivass.it/consumatori/rui/index.html" target="_blank" rel="noopener noreferrer">Verificabile su IVASS</a></p>';
    bar.style.cssText = 'display:block!important;text-align:left!important;justify-items:normal!important;grid-template-columns:none!important;max-width:none!important;margin:28px 0 0!important;padding:16px 24px!important;border-top:1px solid rgba(255,255,255,.15)!important;box-sizing:border-box!important';
    const p = bar.querySelector('p');
    if (p) p.style.cssText = 'margin:0!important;color:#8fa2b3!important;font-size:11.5px!important;line-height:1.6!important';
    const a = bar.querySelector('a');
    if (a) a.style.cssText = 'color:#e0b84e!important;text-decoration:none!important;font-weight:700!important';
    bar.dataset.cmCompact = '1';
  });
}

// 20 settembre 2026 — rimozione dei due pulsanti arancioni ridondanti nella colonna
// "Contatti" del footer ("Verifica iscrizione RUI", "Reclami e Arbitro Assicurativo").
// Non sono richiesti in quella forma dalla normativa IVASS: entrambe le informazioni
// restano comunque accessibili altrove (link "Verificabile su IVASS" nella riga
// compatta del footer, voce "Reclami e Arbitro Assicurativo" nella colonna
// "Informazioni" dello stesso footer). Rimozione via JS, non tocca l'HTML statico.
function removeRedundantFooterButtons() {
  document.querySelectorAll('.cm-footer-contact .cm-rui-link').forEach(a => a.remove());
}

// 21 settembre 2026 — barra di navigazione fissa in fondo, solo su mobile, su
// richiesta di Carmelo (ispirata a un pattern comune nel settore, es.
// mondocauzioni.it): 5 voci sempre a portata di pollice, con "Preventivo" in
// evidenza al centro. WhatsApp volutamente assente — nessun numero attivo
// ancora, vedi registro tecnico (eSIM non ancora attiva).
function initMobileBottomNav() {
  if (document.getElementById('cmMobileNav')) return;
  const icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>',
    servizi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 13h20"/></svg>',
    preventivo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><circle cx="8" cy="11" r=".7" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r=".7" fill="currentColor" stroke="none"/><circle cx="16" cy="11" r=".7" fill="currentColor" stroke="none"/><circle cx="8" cy="15" r=".7" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r=".7" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r=".7" fill="currentColor" stroke="none"/><circle cx="8" cy="19" r=".7" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r=".7" fill="currentColor" stroke="none"/></svg>',
    contatti: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };
  const nav = document.createElement('nav');
  nav.id = 'cmMobileNav';
  nav.className = 'cm-mobile-nav';
  nav.setAttribute('aria-label', 'Navigazione rapida');
  nav.innerHTML = `
    <a href="/" class="cm-mn-item"><span class="cm-mn-icon" aria-hidden="true">${icons.home}</span><span>Home</span></a>
    <a href="/fideiussioni" class="cm-mn-item"><span class="cm-mn-icon" aria-hidden="true">${icons.servizi}</span><span>Servizi</span></a>
    <a href="/richiedi-preventivo" class="cm-mn-item cm-mn-cta"><span class="cm-mn-icon" aria-hidden="true">${icons.preventivo}</span><span>Preventivo</span></a>
    <a href="/contatti" class="cm-mn-item"><span class="cm-mn-icon" aria-hidden="true">${icons.contatti}</span><span>Contatti</span></a>
    <button type="button" class="cm-mn-item" id="cmMobileNavMenu"><span class="cm-mn-icon" aria-hidden="true">${icons.menu}</span><span>Menu</span></button>
  `;
  document.body.appendChild(nav);
  document.getElementById('cmMobileNavMenu')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('menu')?.click();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSlider();
  initAssistantUI();
  initAssistantFab();
  initAssistantFabFooterHide();
  initClickableCards();
  initBasicFormValidation();
  initBackToTop();
  simplifyLegalBar();
  removeRedundantFooterButtons();
  initMobileBottomNav();
});


/* UX BATCH — SERVIZI dropdown (17 settembre 2026: sostituisce il precedente dropdown
   agganciato alla voce "FIDEIUSSIONI". Ora si aggancia alla voce "SERVIZI" del menu:
   il testo resta un link vero verso /fideiussioni (la pagina generale con tutte le
   tipologie), e in piu' rivela un sottomenu al passaggio del mouse — niente piu'
   pulsante che blocca la navigazione diretta. */
(function initServiziDropdown(){
  function init(){
    const links=document.querySelectorAll('.links a');
    const fidLink=[...links].find(a=>a.textContent.trim().toUpperCase()==='FIDEIUSSIONI' && (a.getAttribute('href')||'').replace(/\/$/,'')==='/fideiussioni');
    if(fidLink) fidLink.remove();
    const capLink=[...links].find(a=>a.textContent.trim().toUpperCase()==='CAPACITÀ FINANZIARIA' && (a.getAttribute('href')||'').replace(/\/$/,'')==='/capacita-finanziaria');
    if(capLink) capLink.remove();
    const chiSiamoLink=[...links].find(a=>a.textContent.trim().toUpperCase()==='CHI SIAMO');
    if(chiSiamoLink) chiSiamoLink.setAttribute('href','/chi-siamo');
    const hasFaq=[...links].some(a=>a.textContent.trim().toUpperCase()==='FAQ');
    const contattiLink=[...links].find(a=>a.textContent.trim().toUpperCase()==='CONTATTI');
    if(!hasFaq && contattiLink){
      const faqLink=document.createElement('a');
      faqLink.href='/faq';
      faqLink.textContent='FAQ';
      contattiLink.parentElement.insertBefore(faqLink,contattiLink);
    }
    const hasGenericCta=[...links].some(a=>a.textContent.trim().toUpperCase()==='NON SAI QUALE GARANZIA?');
    const navEl=document.querySelector('.links');
    if(!hasGenericCta && navEl){
      const genericLink=document.createElement('a');
      genericLink.href='/richiedi-preventivo?esigenza=generica';
      genericLink.className='nav-generic-cta';
      genericLink.textContent='NON SAI QUALE GARANZIA?';
      navEl.appendChild(genericLink);
    }
    // 20 settembre 2026 — link "Accedi Area Privata" su richiesta di Carmelo,
    // ultima voce del menu, verso /admin (login con password + TOTP, area
    // gia' esistente e funzionante — vedi api/admin.js e cartella admin/).
    const hasAdminLink=[...links].some(a=>(a.getAttribute('href')||'').replace(/\/$/,'')==='/admin');
    if(!hasAdminLink && navEl){
      const adminLink=document.createElement('a');
      adminLink.href='/admin';
      adminLink.className='nav-admin-link';
      adminLink.textContent='ACCEDI AREA PRIVATA';
      navEl.appendChild(adminLink);
    }
    document.querySelectorAll('a[href^="tel:+393286382612"]').forEach(a=>{
      const line=a.closest('.contact-line') || a.closest('p') || a;
      line.remove();
    });
    document.querySelectorAll('.cm-footer-legalbar p').forEach(p=>{
      const t=p.textContent.trim();
      if(t==='Telefono:' || t==='Email:' || t==='PEC:') p.remove();
    });
    document.querySelectorAll('.cm-footer-bottom p').forEach(p=>{
      if(p.textContent.trim()==='Registro Unico degli Intermediari — IVASS') p.remove();
    });
    const anchor=[...links].find(a=>a.textContent.trim().toUpperCase()==='SERVIZI');
    if(!anchor || anchor.closest('.nav-fideiussioni')) return;
    const wrap=document.createElement('div');
    wrap.className='nav-fideiussioni';
    const trigger=document.createElement('a');
    trigger.href='/fideiussioni';
    trigger.className='nav-fideiussioni-trigger';
    trigger.setAttribute('aria-haspopup','true');
    trigger.setAttribute('aria-expanded','false');
    trigger.textContent='SERVIZI';
    const menu=document.createElement('div');
    menu.className='nav-fideiussioni-menu';
    menu.setAttribute('role','menu');
    const heading=document.createElement('div');
    heading.className='nav-fideiussioni-heading';
    heading.textContent='Le nostre garanzie';
    const subheading=document.createElement('div');
    subheading.className='nav-fideiussioni-subheading';
    subheading.textContent='Scegli la tipologia che ti interessa, o vai alla pagina generale.';
    menu.append(heading,subheading);
    const items=[
      ['Tutte le garanzie →','/fideiussioni'],
      ['Appalti pubblici','/appalti-pubblici'],
      ['Contratti privati','/fideiussioni-contratti-privati'],
      ['Affitti fra privati','/locazioni'],
      ['Affitti commerciali','/affitti-commerciali'],
      ["Rami d'azienda",'/affitti-rami-azienda'],
      ['Dogane','/dogane'],
      ['Beneficiari pubblici','/ambiente'],
      ['Capacità finanziaria','/capacita-finanziaria']
    ];
    items.forEach(([label,href])=>{const a=document.createElement('a');a.href=href;a.textContent=label;a.setAttribute('role','menuitem');menu.appendChild(a);});
    wrap.append(trigger,menu);
    anchor.replaceWith(wrap);
    const close=()=>{wrap.classList.remove('open');trigger.setAttribute('aria-expanded','false');};
    const open=()=>{document.querySelectorAll('.nav-fideiussioni.open').forEach(x=>x.classList.remove('open'));wrap.classList.add('open');trigger.setAttribute('aria-expanded','true');};
    wrap.addEventListener('mouseenter',open);
    wrap.addEventListener('mouseleave',close);
    wrap.addEventListener('focusin',open);
    wrap.addEventListener('focusout',e=>{if(!wrap.contains(e.relatedTarget))close();});
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
