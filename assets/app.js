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

function speakAI(text) {
  if (!isVoiceEnabled() || !('speechSynthesis' in window)) return;
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'it-IT';
  utterance.rate = 0.98;
  utterance.pitch = 1;
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
  stopAssistantRecognition();
}

function startAI() {
  const content = document.getElementById('aiContent');
  if (!content) return;

  const greeting = `Buongiorno! Sono l'Assistente CM. Posso aiutarti a trovare il percorso più adatto alla tua esigenza. Da dove vuoi iniziare?`;
  content.innerHTML = `
    <div class="bubble ai"><b>Buongiorno!</b><br> Sono l'Assistente CM.<br>Posso aiutarti a trovare il percorso più adatto alla tua esigenza.<br><br><b>Da dove vuoi iniziare?</b></div>
    <div class="ai-choices">
      <button class="ai-choice" type="button" data-ai="appalto">🏗️ Devo partecipare a un appalto <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="trasporto">🚛 Ho un'esigenza per autotrasporto <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="locazione">🏠 Mi chiedono una garanzia per una locazione <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="dogana">🛃 Ho un'esigenza doganale <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="ambiente">🌱 Ho un'esigenza ambientale <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="altro">💬 Non so ancora quale garanzia mi serve <span>›</span></button>
    </div>
    <div class="ai-voice-row">
      <button class="ai-mic" id="aiMic" type="button" aria-label="Spiega a voce la tua esigenza">🎙️ <span>Spiega a voce la tua esigenza</span></button>
      <span class="ai-voice-status" id="aiVoiceStatus" role="status" aria-live="polite"></span>
    </div>`;

  content.querySelectorAll('[data-ai]').forEach(button => {
    button.addEventListener('click', () => aiChoose(button.dataset.ai));
  });
  content.querySelector('#aiMic')?.addEventListener('click', startAssistantRecognition);
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
    sessionStorage.setItem('cm_voice_request', transcript);
    if (status) status.textContent = 'Richiesta acquisita. Apro la valutazione generica…';
    speakAI(`Ho acquisito la tua richiesta: ${transcript}. Apro la valutazione generica.`);
    window.setTimeout(() => {
      window.location.href = 'richiedi-preventivo.html?esigenza=generica';
    }, isVoiceEnabled() ? 700 : 0);
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

function aiChoose(type) {
  const content = document.getElementById('aiContent');
  if (!content) return;

  const map = {
    appalto: ['Per un appalto posso indirizzarti alle garanzie collegate alla gara e agli obblighi contrattuali.', 'appalti-pubblici.html'],
    trasporto: ["Per l'autotrasporto possiamo distinguere tra capacità finanziaria e altre esigenze di garanzia.", 'capacita-finanziaria.html'],
    locazione: ['Per la locazione partiamo dalle condizioni richieste dal contratto o dal locatore.', 'locazioni.html'],
    dogana: ['Per una pratica doganale partiamo dal tipo di obbligo e dalla documentazione ricevuta.', 'dogane.html'],
    ambiente: ["Per l'ambiente partiamo dall'obbligo specifico e dal soggetto che richiede la garanzia.", 'ambiente.html'],
    altro: ['Va bene. Raccontami il caso concreto e allega la documentazione che hai: apriamo direttamente la valutazione generica.', 'richiedi-preventivo.html?esigenza=generica']
  };

  const [message, destination] = map[type] || map.altro;
  const directGeneric = destination === 'richiedi-preventivo.html?esigenza=generica';
  content.innerHTML = `
    <div class="bubble ai"><b>Perfetto.</b><br>${message}</div>
    <div class="ai-choices">
      <a class="ai-choice" href="${destination}">Vai al percorso <span>›</span></a>
      <a class="ai-choice" href="richiedi-preventivo.html?esigenza=generica">Racconta direttamente la tua esigenza <span>›</span></a>
      <button class="ai-choice" type="button" id="aiRestart">← Cambia esigenza</button>
    </div>`;
  document.getElementById('aiRestart')?.addEventListener('click', startAI);
  speakAI(directGeneric ? 'Apro il percorso di valutazione generica.' : message);
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

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSlider();
  initAssistantUI();
  initAssistantFab();
  initAssistantFabFooterHide();
  initClickableCards();
  initBasicFormValidation();
});


/* UX BATCH — FIDEIUSSIONI dropdown */
(function initFideiussioniDropdown(){
  function init(){
    const links=document.querySelectorAll('.links a');
    const anchor=[...links].find(a=>a.textContent.trim().toUpperCase()==='FIDEIUSSIONI');
    if(!anchor || anchor.closest('.nav-fideiussioni')) return;
    const wrap=document.createElement('div');
    wrap.className='nav-fideiussioni';
    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='nav-fideiussioni-trigger';
    trigger.setAttribute('aria-haspopup','true');
    trigger.setAttribute('aria-expanded','false');
    trigger.textContent='FIDEIUSSIONI';
    const menu=document.createElement('div');
    menu.className='nav-fideiussioni-menu';
    menu.setAttribute('role','menu');
    const heading=document.createElement('div');
    heading.className='nav-fideiussioni-heading';
    heading.textContent='Soluzioni di garanzia';
    const subheading=document.createElement('div');
    subheading.className='nav-fideiussioni-subheading';
    subheading.textContent='Scegli la tipologia di fideiussione che ti interessa.';
    menu.append(heading,subheading);
    const items=[
      ['Appalti pubblici','/appalti-pubblici'],['Locazioni','/locazioni'],['Trasporti','/richiedi-preventivo?tipo=trasporti'],['Dogane','/dogane'],['Ambiente','/ambiente'],['Contributi e agevolazioni','/richiedi-preventivo?tipo=contributi'],['Urbanistica ed edilizia','/richiedi-preventivo?tipo=urbanistica'],['Garanzie fiscali','/richiedi-preventivo?tipo=fiscali'],['Altra fideiussione','/richiedi-preventivo?tipo=altra']
    ];
    items.forEach(([label,href])=>{const a=document.createElement('a');a.href=href;a.textContent=label;a.setAttribute('role','menuitem');menu.appendChild(a);});
    wrap.append(trigger,menu);
    anchor.replaceWith(wrap);
    const close=()=>{wrap.classList.remove('open');trigger.setAttribute('aria-expanded','false');};
    trigger.addEventListener('click',e=>{e.stopPropagation();const open=!wrap.classList.contains('open');document.querySelectorAll('.nav-fideiussioni.open').forEach(x=>x.classList.remove('open'));wrap.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open));});
    wrap.addEventListener('mouseenter',()=>wrap.classList.add('open'));
    wrap.addEventListener('mouseleave',close);
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
