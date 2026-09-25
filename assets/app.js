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
        <div><b>Assistente CM</b><span>Assistente AI</span></div>
      </div>
      <div class="ai-head-actions">
        <button class="ai-close" type="button" aria-label="Chiudi Assistente CM">×</button>
      </div>
    </div>
    <div class="ai-portrait">${assistantImageMarkup()}</div>
    <div id="aiContent" class="ai-content"></div>
    <div class="ai-note">Assistente digitale di orientamento. Non sostituisce la valutazione professionale né la documentazione richiesta.</div>`;

  aiPanel.querySelector('.ai-close')?.addEventListener('click', closeAI);
}

function speakAI() {
  // Assistente CM volutamente testuale: nessuna sintesi vocale browser.
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
}

function getAIConversationHistory() {
  try {
    const raw = sessionStorage.getItem('cm_ai_history');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(-12) : [];
  } catch { return []; }
}

function sanitizeAIText(text) {
  return String(text || '')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email omessa]')
    .replace(/\b(?:IBAN\s*)?[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi, '[iban omesso]')
    .replace(/\b\d{11}\b/g, '[numero omesso]')
    .replace(/\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi, '[codice fiscale omesso]')
    .replace(/\b(?:\+?39[\s.-]?)?(?:3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|0\d{1,3}[\s.-]?\d{5,8})\b/g, '[telefono omesso]')
    .replace(/\b(?:mi chiamo|il mio nome è)\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]*(?:\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]*){0,3}/gi, '[nome omesso]')
    .slice(0, 1200);
}

function getAIPrivacySafeHistory() {
  return getAIConversationHistory().map(item => ({
    role: item.role,
    content: sanitizeAIText(item.content).slice(0, 1600)
  })).slice(-12);
}

function getAIPrivacySafeFormContext() {
  const full = getAIFormContext();
  const safe = {};
  ['amount','duration','vehicleCount','bilancio','leaseType','startDate','endDate'].forEach(key => {
    if (full[key]) safe[key] = full[key];
  });
  return safe;
}

function saveAIConversationTurn(role, content) {
  const history = getAIConversationHistory();
  const safeContent = role === 'user' ? sanitizeAIText(content) : String(content || '').slice(0, 2000);
  history.push({role, content: safeContent});
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
  const panel = document.getElementById('aiPanel');
  panel?.classList.toggle('cm-ai-form-mode', onRequestForm);
  const formContext = getAIFormContext();
  const greeting = onRequestForm
    ? 'Sono qui per seguirti nella compilazione. Dimmi cosa vuoi inserire, oppure chiedimi quale dato serve nel campo che stai compilando.'
    : 'Raccontami con parole semplici cosa devi fare. Non è necessario conoscere il nome della garanzia.';

  const history = getAIConversationHistory();
  const historyMarkup = history.length
    ? history.map(item => {
        const role = item.role === 'user' ? 'user' : 'ai';
        const safe = String(item.content || '')
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;').replace(/\n/g,'<br>');
        return `<div class="bubble ${role}">${safe}</div>`;
      }).join('')
    : `<div class="bubble ai"><b>Ciao, sono l'Assistente CM.</b><br>${greeting}</div>`;

  content.innerHTML = `
    <div class="ai-chat-log" id="aiChatLog" aria-live="polite">${historyMarkup}</div>
    <form class="ai-chat-form" id="aiChatForm">
      <input id="aiChatInput" type="text" maxlength="1200" autocomplete="off" placeholder="${onRequestForm ? 'Es. Non so dove trovare l’importo...' : 'Scrivi qui la tua necessità...'}" aria-label="Scrivi la tua necessità">
      <button type="submit" aria-label="Invia richiesta">Invia</button>
    </form>
`;

  content.querySelector('#aiChatForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('aiChatInput');
    const message = String(input?.value || '').trim();
    if (message) aiSendMessage(message);
  });
  scrollAssistantToLatest('auto');
}

function scrollAssistantToLatest(behavior = 'auto') {
  const content = document.getElementById('aiContent');
  if (!content) return;
  const scroll = () => {
    content.scrollTo({top: content.scrollHeight, behavior});
  };
  requestAnimationFrame(() => {
    scroll();
    requestAnimationFrame(scroll);
  });
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
  scrollAssistantToLatest('auto');
  const historyBeforeTurn = getAIConversationHistory();

  try {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        message: sanitizeAIText(message),
        history: historyBeforeTurn.map(item => ({
          role: item.role,
          content: sanitizeAIText(item.content)
        })),
        pageContext: getAIPageContext(),
        formContext: getAIPrivacySafeFormContext()
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || 'Servizio temporaneamente non disponibile.');

    const reply = String(data.reply || '').trim();
    const incomingFormData = data.form && typeof data.form === 'object' ? data.form : {};
    if (Object.keys(incomingFormData).length) applyAIFormData(incomingFormData);
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
      const targetRoute = safeRoute.includes('capacita-finanziaria') || safeRoute.includes('#') ? safeRoute : safeRoute + '#step2';
      link.href = targetRoute;
      link.textContent = safeRoute.includes('capacita-finanziaria') ? 'Apri Capacità finanziaria →' : 'Apri il modulo corretto →';
      actions.appendChild(link);
      log.appendChild(actions);

      const currentFormData = getAIFormContext();
      const mergedFormData = {...currentFormData, ...incomingFormData};
      sessionStorage.setItem('cm_ai_route', safeRoute);
      sessionStorage.setItem('cm_ai_form_context', JSON.stringify(mergedFormData));
      sessionStorage.setItem('cm_ai_open_after_route', '1');
      sessionStorage.setItem('cm_ai_scroll_to_form', '1');
    }

    scrollAssistantToLatest('auto');
  } catch (error) {
    console.error('Assistente CM: richiesta AI non riuscita', error);
    const aiBubble = document.createElement('div');
    aiBubble.className = 'bubble ai';
    const message = String(error?.message || 'Servizio AI temporaneamente non disponibile.');
    aiBubble.textContent = message;
    log.appendChild(aiBubble);
    scrollAssistantToLatest('auto');
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

function initAIAfterRoute() {
  if (sessionStorage.getItem('cm_ai_open_after_route') !== '1') return;
  sessionStorage.removeItem('cm_ai_open_after_route');

  const isCapacityPage = window.location.pathname.includes('capacita-finanziaria');
  const isRequestForm = Boolean(document.querySelector('#step2') && document.querySelector('#contactEmail'));

  if (isCapacityPage) {
    restoreAIPageContext();
    const scrollToForm = () => {
      const target = document.getElementById('mainForm');
      if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
    };
    if (sessionStorage.getItem('cm_ai_scroll_to_form') === '1') {
      sessionStorage.removeItem('cm_ai_scroll_to_form');
      window.setTimeout(scrollToForm, 120);
    }
    window.setTimeout(() => {
      if (typeof window.openAI === 'function') window.openAI();
    }, 220);
    return;
  }

  if (!isRequestForm) return;

  const scrollToForm = () => {
    const target = document.getElementById('step2');
    if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
  };

  if (sessionStorage.getItem('cm_ai_scroll_to_form') === '1') {
    sessionStorage.removeItem('cm_ai_scroll_to_form');
    window.setTimeout(scrollToForm, 120);
  }

  window.setTimeout(() => {
    if (typeof window.openAI === 'function') window.openAI();
  }, 220);
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
    aiuto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
  };
  const nav = document.createElement('nav');
  nav.id = 'cmMobileNav';
  nav.className = 'cm-mobile-nav';
  nav.setAttribute('aria-label', 'Navigazione rapida');
  nav.innerHTML = `
    <a href="/" class="cm-mn-item"><span class="cm-mn-icon" aria-hidden="true">${icons.home}</span><span>Home</span></a>
    <a href="/fideiussioni" class="cm-mn-item"><span class="cm-mn-icon" aria-hidden="true">${icons.servizi}</span><span>Servizi</span></a>
    <a href="/richiedi-preventivo?form=1" class="cm-mn-item cm-mn-cta"><span class="cm-mn-icon" aria-hidden="true">${icons.preventivo}</span><span>Preventivo</span></a>
    <a href="/contatti" class="cm-mn-item"><span class="cm-mn-icon" aria-hidden="true">${icons.contatti}</span><span>Contatti</span></a>
    <button type="button" class="cm-mn-item" id="cmMobileNavAiuto"><span class="cm-mn-icon" aria-hidden="true">${icons.aiuto}</span><span>Aiuto</span></button>
  `;
  document.body.appendChild(nav);
  // 21 settembre 2026 — su richiesta di Carmelo, l'Assistente CM su mobile si apre
  // da qui invece che dal pallone fluttuante, che copriva il contenuto della
  // pagina. Il pallone resta nascosto su mobile via CSS. Voce "Menu" rimossa
  // (ridondante con l'hamburger già presente nell'header) — con 5 voci
  // "Preventivo" torna esattamente al centro della barra.
  document.getElementById('cmMobileNavAiuto')?.addEventListener('click', () => {
    if (typeof window.openAI === 'function') window.openAI();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSlider();
  initAssistantUI();
  initAssistantFab();
  initAssistantFabFooterHide();
  initAIAfterRoute();
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
    // La precedente voce generica non fa più parte del menu principale.
    // Il percorso generico resta disponibile tramite /altre-esigenze e Assistente CM.
    const navEl=document.querySelector('.links');
    [...links].filter(a=>a.textContent.trim().toUpperCase()==='NON SAI QUALE GARANZIA?')
      .forEach(a=>a.remove());
    // 20 settembre 2026 — link "Accedi Area Privata" su richiesta di Carmelo,
    // ultima voce del menu, verso /admin (login con password + TOTP, area
    // gia' esistente e funzionante — vedi api/admin.js e cartella admin/).
    // Area privata: resta separata dal menu di navigazione e viene collocata
    // nel blocco strumenti a destra, accanto a "Richiedi preventivo".
    const navWrap=navEl?.closest('.nav');
    const headerCta=navWrap?.querySelector('.header-cta');
    if(navWrap && headerCta){
      let utilities=navWrap.querySelector('.header-utilities');
      if(!utilities){
        utilities=document.createElement('div');
        utilities.className='header-utilities';
        headerCta.parentNode.insertBefore(utilities,headerCta);
        utilities.appendChild(headerCta);
      }
      const existingAdmin=utilities.querySelector('.nav-admin-link');
      if(!existingAdmin){
        const adminLink=document.createElement('a');
        adminLink.href='/admin';
        adminLink.className='nav-admin-link';
        adminLink.setAttribute('aria-label','Accedi all’area privata');
        adminLink.innerHTML='<span class="nav-admin-lock" aria-hidden="true">🔒</span><span>AREA PRIVATA</span>';
        utilities.insertBefore(adminLink,headerCta);
      }
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
      ['Contributi pubblici / AGEA','/contributi-pubblici'],
      ['Dogane','/dogane'],
      ['Ambiente','/ambiente'],
      ['Edilizia e immobiliare','/edilizia-immobiliare'],
      ['Locazioni e rami d’azienda','/locazioni'],
      ['Contratti privati','/fideiussioni-contratti-privati'],
      ['Capacità finanziaria','/capacita-finanziaria'],
      ['Agenzie e attività regolamentate','/agenzie-e-attivita-regolamentate'],
      ['Stranieri e visti','/stranieri'],
      ['Altre esigenze','/altre-esigenze']
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