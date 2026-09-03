const SLIDES = [
  ['appalti', 'APPALTI PUBBLICI', 'Garanzie per le tue gare', 'Per chi deve partecipare a una gara o gestire obblighi contrattuali.'],
  ['autotrasportatori', 'TRASPORTI', "Soluzioni per l'autotrasporto", 'Per imprese che operano nel trasporto e nell’autotrasporto.'],
  ['locazioni', 'LOCAZIONI', 'Garanzie per il tuo contratto', 'Per esigenze legate a rapporti di locazione.'],
  ['altre-esigenze', 'ALTRE ESIGENZE', 'Garanzie per esigenze specifiche', 'Soluzioni per dogane, ambiente, energia, sanità e altre necessità.']
];

const IMG_WIDTHS = [768, 1280, 1920, 2560, 3840];
const imageSet = stem => IMG_WIDTHS.map(w => `assets/${stem}-retina-${w}.webp ${w}w`).join(', ');
const imageSizes = '(max-width: 760px) 100vw, 56vw';

let slideIndex = 0;
let slideTimer = null;

function initSlider() {
  const img = document.getElementById('heroImage');
  if (!img) return;

  const webp = document.getElementById('heroWebp');
  const kicker = document.getElementById('heroKicker');
  const title = document.getElementById('heroTitle');
  const text = document.getElementById('heroText');
  const progress = document.getElementById('heroProgress');
  const dots = document.getElementById('heroDots');

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
    slideIndex = (index + SLIDES.length) % SLIDES.length;
    const [stem, label, heading, description] = SLIDES[slideIndex];

    img.classList.add('fade');

    window.setTimeout(() => {
      const srcset = imageSet(stem);
      img.src = `assets/${stem}-retina-1920.webp`;
      img.srcset = srcset;
      img.sizes = imageSizes;
      img.alt = `${label} — ${heading}`;

      if (webp) {
        webp.srcset = srcset;
        webp.sizes = imageSizes;
      }

      if (kicker) kicker.textContent = label;
      if (title) title.textContent = heading;
      if (text) text.textContent = description;
      img.classList.remove('fade');
    }, 120);

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

  paintSlide(0);
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

function getPreferredItalianMaleVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const italian = voices.filter(v => /^it(?:-|_)/i.test(v.lang || ''));
  const pool = italian.length ? italian : voices;
  const preferred = /\b(luca|cosimo|giorgio|paolo|matteo|federico|marco|carlo|antonio|massimo|davide|simone|riccardo|fabio|stefano)\b/i;
  return pool.find(v => preferred.test(v.name || '')) || pool.find(v => /^it-IT$/i.test(v.lang || '')) || pool[0] || null;
}

function setAssistantSpeaking(speaking) {
  document.querySelector('.ai-portrait')?.classList.toggle('speaking', speaking);
  document.querySelector('.cm-ai-fab')?.classList.toggle('speaking', speaking);
}

function speakAI(text) {
  if (!isVoiceEnabled() || !('speechSynthesis' in window)) return;
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  window.speechSynthesis.cancel();
  setAssistantSpeaking(false);
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'it-IT';
  utterance.rate = 0.96;
  utterance.pitch = 0.84;
  const voice = getPreferredItalianMaleVoice();
  if (voice) utterance.voice = voice;
  utterance.onstart = () => setAssistantSpeaking(true);
  utterance.onend = () => setAssistantSpeaking(false);
  utterance.onerror = () => setAssistantSpeaking(false);
  window.speechSynthesis.speak(utterance);
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {});
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

  const greeting = `Buongiorno! Sono l’Assistente CM. Posso aiutarti a trovare il percorso più adatto alla tua esigenza. Da dove vuoi iniziare?`;
  content.innerHTML = `
    <div class="bubble ai"><b>Buongiorno!</b><br> Sono l’Assistente CM.<br>Posso aiutarti a trovare il percorso più adatto alla tua esigenza.<br><br><b>Da dove vuoi iniziare?</b></div>
    <div class="ai-choices">
      <button class="ai-choice" type="button" data-ai="appalto">🏗️ Devo partecipare a un appalto <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="trasporto">🚛 Ho un’esigenza per autotrasporto <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="locazione">🏠 Mi chiedono una garanzia per una locazione <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="dogana">🛃 Ho un’esigenza doganale <span>›</span></button>
      <button class="ai-choice" type="button" data-ai="ambiente">🌱 Ho un’esigenza ambientale <span>›</span></button>
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
      window.location.href = '/richiedi-preventivo?esigenza=generica';
    }, isVoiceEnabled() ? 700 : 0);
  };
  assistantRecognition.onerror = event => {
    if (status) status.textContent = event.error === 'not-allowed' ? 'Consenti l’uso del microfono per parlare con l’assistente.' : 'Non ho potuto acquisire l’audio. Riprova.';
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
    appalto: ['Per un appalto posso indirizzarti alle garanzie collegate alla gara e agli obblighi contrattuali.', '/appalti-pubblici'],
    trasporto: ['Per l’autotrasporto possiamo distinguere tra capacità finanziaria e altre esigenze di garanzia.', '/capacita-finanziaria'],
    locazione: ['Per la locazione partiamo dalle condizioni richieste dal contratto o dal locatore.', '/locazioni'],
    dogana: ['Per una pratica doganale partiamo dal tipo di obbligo e dalla documentazione ricevuta.', '/dogane'],
    ambiente: ['Per l’ambiente partiamo dall’obbligo specifico e dal soggetto che richiede la garanzia.', '/ambiente'],
    altro: ['Va bene. Raccontami il caso concreto e allega la documentazione che hai: apriamo direttamente la valutazione generica.', '/richiedi-preventivo?esigenza=generica']
  };

  const [message, destination] = map[type] || map.altro;
  const directGeneric = destination === '/richiedi-preventivo?esigenza=generica';
  content.innerHTML = `
    <div class="bubble ai"><b>Perfetto.</b><br>${message}</div>
    <div class="ai-choices">
      <a class="ai-choice" href="${destination}">Vai al percorso <span>›</span></a>
      <a class="ai-choice" href="/richiedi-preventivo?esigenza=generica">Racconta direttamente la tua esigenza <span>›</span></a>
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
  button.innerHTML = '<span class="cm-ai-fab-logo" aria-hidden="true"><img src="assets/images/logo-cm-symbol.png" alt=""></span><span class="cm-ai-fab-icon" aria-hidden="true">•••</span><span class="cm-ai-fab-label">Assistente CM</span>';
  button.addEventListener('click', openAI);
  document.body.appendChild(button);
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
  initClickableCards();
  initBasicFormValidation();
});
