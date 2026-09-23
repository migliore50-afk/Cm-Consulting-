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
  const enabled = localStorage.getItem('cm_ai_voice') !== '0';
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
  return localStorage.getItem('cm_ai_voice') !== '0';
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

function getAIConversationHistory() {
  try {
    const raw = sessionStorage.getItem('cm_ai_history');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(-12) : [];
  } catch { return []; }
}

function saveAIConversationTurn(role, content) {
  const history = getAIConversationHistory();
  history.push({role, content: String(content || '').slice(0, 2000)});
  sessionStorage.setItem('cm_ai_history', JSON.stringify(history.slice(-12)));
}

function getAIFormContext() {
  const ids = ['genericDescription','beneficiary','company','vat','city','province','amount','duration','contactName','contactPhone','contact','contactEmail','email','startDate','endDate','beneficiaryTax','beneficiaryAddress','beneficiaryPec','companyTax','refs','object','notes'];
  const out = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && String(el.value || '').trim()) out[id] = String(el.value).trim();
  });
  const lease = document.querySelector('input[name="leaseType"]:checked');
  if (lease) out.leaseType = lease.value;
  const vehicleCount = document.getElementById('vehicleCount');
  if (vehicleCount) out.vehicleCount = String(vehicleCount.textContent || '').trim();
  const bilancio = document.querySelector('input[name="bilancio"]:checked');
  if (bilancio) out.bilancio = bilancio.value;
  return out;
}

function applyAIFormData(data) {
  if (!data || typeof data !== 'object') return;
  Object.entries(data).forEach(([key, value]) => {
    const el = document.getElementById(key);
    if (!el || value == null || typeof value === 'object') return;
    const text = String(value).trim();
    if (!text) return;
    if (el.tagName === 'INPUT' && el.type === 'radio') return;
    el.value = text;
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  });
  const lease = String(data.leaseType || '');
  if (lease) {
    const radio = document.querySelector(`input[name="leaseType"][value="${CSS.escape(lease)}"]`);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', {bubbles:true})); }
  }
  const bilancio = String(data.bilancio || '');
  if (bilancio) {
    const radio = document.querySelector(`input[name="bilancio"][value="${CSS.escape(bilancio)}"]`);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', {bubbles:true})); }
  }
  const vehicles = Number.parseInt(data.vehicleCount, 10);
  if (Number.isFinite(vehicles) && vehicles > 0 && typeof window.changeVehicles === 'function') {
    const current = Number.parseInt(document.getElementById('vehicleCount')?.textContent || '1', 10) || 1;
    window.changeVehicles(vehicles - current);
  }
}

function restoreAIPageContext() {
  const route = sessionStorage.getItem('cm_ai_route') || '';
  if (!route || !window.location.pathname.includes('capacita-finanziaria')) return;
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('cm_ai_form_context') || 'null'); } catch {}
  if (!saved || typeof saved !== 'object') return;
  applyAIFormData(saved);
  if (typeof window.refreshAll === 'function') window.refreshAll();
  sessionStorage.removeItem('cm_ai_form_context');
  sessionStorage.removeItem('cm_ai_route');
}

function getAIPageContext() {
  return {
    path: window.location.pathname + window.location.search,
    title: document.title,
    onRequestForm: Boolean(document.querySelector('#step2') && document.querySelector('#contactEmail'))
  };
}

function startAI() {
  const content = document.getElementById('aiContent');
  if (!content) return;

  const onRequestForm = Boolean(document.querySelector('#step2') && document.querySelector('#contactEmail'));
  const formContext = getAIFormContext();
  const greeting = onRequestForm
    ? 'Sono qui per seguirti nella compilazione. Dimmi cosa vuoi inserire, oppure chiedimi quale dato serve nel campo che stai compilando.'
    : 'Raccontami con parole semplici cosa devi fare. Non è necessario conoscere il nome della garanzia.';

  content.innerHTML = `
    <div class="bubble ai"><b>Ciao, sono l'Assistente CM.</b><br>${greeting}</div>
    <div class="ai-chat-log" id="aiChatLog" aria-live="polite"></div>
    <form class="ai-chat-form" id="aiChatForm">
      <input id="aiChatInput" type="text" maxlength="1200" autocomplete="off" placeholder="${onRequestForm ? 'Es. Non so dove trovare l’importo...' : 'Scrivi qui la tua necessità...'}" aria-label="Scrivi la tua necessità">
      <button type="submit" aria-label="Invia richiesta">Invia</button>
    </form>
    <div class="ai-voice-row">
      <button class="ai-mic" id="aiMic" type="button" aria-label="Spiega a voce la tua esigenza">🎙️ <span>Parla con l'assistente</span></button>
      <span class="ai-voice-status" id="aiVoiceStatus" role="status" aria-live="polite"></span>
    </div>`;

  content.querySelector('#aiMic')?.addEventListener('click', startAssistantRecognition);
  content.querySelector('#aiChatForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('aiChatInput');
    const message = String(input?.value || '').trim();
    if (message) aiSendMessage(message);
  });
  speakAI(greeting);
}

let assistantRecognition = null;

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
    if (status) status.textContent = 'Richiesta acquisita. La invio all’assistente…';
    const input = document.getElementById('aiChatInput');
    if (input) input.value = transcript;
    aiSendMessage(transcript);
  };
  assistantRecognition.onerror = event => {
    if (status) status.textContent = event.error === 'not-allowed' ? "Consenti l'uso del microfono per parlare con l'assistente." : "Non ho potuto acquisire l'audio. Riprova.";
  };
  assistantRecognition.onend = () => {
    if (mic) mic.classList.remove('listening');
    assistantRecognition = null;
  };
  try { assistantRecognition.start(); } catch (error) {
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

async function aiSendMessage(message) {
  const content = document.getElementById('aiContent');
  const log = document.getElementById('aiChatLog');
  if (!content || !log) return;
  const input = document.getElementById('aiChatInput');
  const send = content.querySelector('.ai-chat-form button');
  if (input) input.value = '';
  if (send) send.disabled = true;

  const userBubble = document.createElement('div');
  userBubble.className = 'bubble user';
  userBubble.textContent = message;
  log.appendChild(userBubble);
  log.scrollTop = log.scrollHeight;
  const historyBeforeTurn = getAIConversationHistory();

  try {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        message,
        history: historyBeforeTurn,
        pageContext: getAIPageContext(),
        formContext: getAIFormContext()
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || 'Servizio temporaneamente non disponibile.');

    const reply = String(data.reply || '').trim();
    if (data.form) applyAIFormData(data.form);
    saveAIConversationTurn('user', message);

    const aiBubble = document.createElement('div');
    aiBubble.className = 'bubble ai';
    aiBubble.textContent = reply || 'Ho aggiornato le informazioni disponibili.';
    log.appendChild(aiBubble);
    saveAIConversationTurn('assistant', reply);

    if (data.route) {
      const safeRoute = String(data.route).startsWith('/') ? String(data.route) : '/';
      const actions = document.createElement('div');
      actions.className = 'ai-route-actions';
      const link = document.createElement('a');
      link.className = 'ai-choice';
      link.href = safeRoute;
      link.textContent = safeRoute.includes('capacita-finanziaria') ? 'Apri Capacità finanziaria →' : 'Apri il modulo corretto →';
      actions.appendChild(link);
      log.appendChild(actions);

      const formData = getAIFormContext();
      sessionStorage.setItem('cm_ai_route', safeRoute);
      sessionStorage.setItem('cm_ai_form_context', JSON.stringify(formData));
    }

    log.scrollTop = log.scrollHeight;
    speakAI(reply);
  } catch (error) {
    console.error('Assistente CM: richiesta AI non riuscita', error);
    const aiBubble = document.createElement('div');
    aiBubble.className = 'bubble ai';
    aiBubble.textContent = 'In questo momento non riesco a collegarmi al servizio AI. Riprova tra poco.';
    log.appendChild(aiBubble);
    speakAI('In questo momento non riesco a collegarmi al servizio AI. Riprova tra poco.');
  } finally {
    if (send) send.disabled = false;
  }
}

function aiChoose(type) {
  const prompts = {
    appalto: 'Devo partecipare a un appalto pubblico.',
    trasporto: 'Ho bisogno di capacità finanziaria per l’autotrasporto.',
    locazione: 'Ho bisogno di una garanzia per una locazione.',
    dogana: 'Ho una richiesta di garanzia doganale.',
    ambiente: 'Ho una richiesta di garanzia in ambito ambientale.'
  };
  aiSendMessage(prompts[type] || 'Non so quale garanzia mi serve.');
}


window.openAI = openAI;
window.closeAI = closeAI;
window.startAI = startAI;
window.aiChoose = aiChoose;

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