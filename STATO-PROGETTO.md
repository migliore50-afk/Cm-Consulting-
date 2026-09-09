# STATO-PROGETTO.md
## CM Consulting — Registro tecnico ufficiale

**Ultimo aggiornamento:** 9 settembre 2026  
**Repository:** `migliore50-afk/Cm-Consulting-`  
**Branch:** `main`  
**Deploy:** Vercel — Production  
**Stato:** progetto attivo; il problema JavaScript del Carousel homepage e dell'Assistente CM deve ancora essere diagnosticato e verificato nel browser.

---

## 1. SCOPO E REGOLE

Questo file è il registro tecnico ufficiale condiviso da **ChatGPT, Claude e GitHub Copilot**.

**GitHub `main` = stato reale del progetto.**  
**STATO-PROGETTO.md = registro tecnico ufficiale.**  
**PC = archivio di sicurezza e backup.**

Prima di qualsiasi modifica:

1. leggere questo file da GitHub;
2. verificare il RAW corrente del file interessato;
3. controllare il contesto completo;
4. identificare prima il problema reale;
5. una sola correzione alla volta;
6. modificare solo ciò che è necessario;
7. non ricostruire file da vecchie copie o memoria;
8. verificare il diff;
9. verificare il commit;
10. verificare Vercel `Production → Ready`;
11. verificare il comportamento reale sul sito.

Ogni correzione indipendente deve avere un commit separato.

Se il RAW GitHub è troncato, non ricostruire il file alla cieca: recuperare il contenuto necessario oppure chiedere il file completo.

---

## 2. PROCEDURA CONCORDATA

Per ogni correzione:

1. audit;
2. verifica GitHub;
3. identificazione esatta della modifica;
4. preparazione del file completo quando necessario;
5. indicazione del nome esatto del file;
6. indicazione del commit message esatto;
7. upload/edizione controllata su `main`;
8. verifica del commit;
9. verifica Vercel;
10. verifica funzionale;
11. aggiornamento di questo registro.

Quando la chat diventa molto lunga o termina un blocco importante, creare un nuovo `STATO-PROGETTO.md`.

Copia di sicurezza sul PC:

`Sito cm consulting with CHATGPT`

---

## 3. DATI E VINCOLI DEL PROGETTO

**Azienda:** CM Consulting di Carmelo Migliore – Intermediazione Assicurativa.

Attività: intermediazione assicurativa, con particolare attenzione a fideiussioni, appalti pubblici, locazioni, capacità finanziaria per albi trasportatori, dogane, ambiente e altre esigenze.

### Contatti

- telefono: `328 6382612`
- email: `info@cm-consulting.info`
- PEC: `carmelo.migliore@legalmail.it`

### Indirizzo attualmente riportato

`Via Giacomo Puccini 4, 10092 Beinasco (TO)`

### Vincoli

- non riportare il vecchio indirizzo di Pomezia;
- non elencare stabilmente broker/compagnie/intermediari collaboranti;
- mantenere impostazione moderna e professionale;
- rispettare gli obblighi IVASS;
- non modificare parti non richieste.

---

# 4. CORREZIONI PUBBLICATE E VERIFICATE

## Homepage — link FIDEIUSSIONI

**File:** `index.html`

`/appalti-pubblici` → `/fideiussioni`

Commit: `Corregge homepage e link FIDEIUSSIONI`  
SHA: `ab6bdc5`  
Vercel: Production → Ready

## Footer Appalti pubblici

**File:** `appalti-pubblici.html`

Prima colonna: `Fideiussioni` → `CM Consulting`

Commit: `Corregge titolo footer Appalti pubblici`  
SHA: `a651e2b`  
Vercel: Production → Ready

## Footer 404

**File:** `404.html`

Prima colonna: `Fideiussioni` → `CM Consulting`

Commit: `Corregge titolo footer pagina 404`  
SHA: `78a7846`  
Vercel: Production → Ready

## Navigazione servizi Appalti

**File:** `appalti-pubblici.html`

- `ambiente.html` → `/ambiente`
- `fideiussioni.html` → `/fideiussioni`
- `capacita-finanziaria.html` → `/capacita-finanziaria`

Commit: `Corregge navigazione servizi Appalti pubblici`  
SHA: `dd0472d`  
Vercel: Production → Ready

## CSS hero/footer

**File:** `assets/v9-final.css`

- rimossa la regola globale del bordo bianco sul media hero;
- mantenuta la correzione relativa allo stile footer.

Commit: `Ripristina stile footer e mantiene correzione hero`  
SHA: `fa98593`  
Vercel: Production → Ready

**Attenzione:** il CSS attivo è `assets/v9-final.css`. Non confonderlo con il vecchio `v9-final.css` nella root, che è stato eliminato.

---

# 5. CAROUSEL HOMEPAGE — STORIA E STATO

**File:** `assets/app.js`

La funzione `paintSlide()` contiene:

- preload con stesso `srcset`/`sizes`;
- `decode()` quando disponibile;
- aggiornamento di `<source>` prima di `<img>`;
- doppio `requestAnimationFrame()` prima della rimozione di `fade`.

**Non modificare `paintSlide()` senza nuova diagnosi.**

## Tentativo race-condition

Sono state introdotte temporaneamente:

```javascript
let currentSlideRequest = 0;
const requestId = ++currentSlideRequest;
if (requestId !== currentSlideRequest) return;
```

Commit:

`0f888c31a628ae2c58d4a09e152ca291c9cb43c1`  
`Corregge race condition carousel: protezione callback obsolete`

Prima era stato creato il ripristino:

`142cc10b18a636dfefff0e3c1575842f04ae7848`  
`Ripristina assets/app.js al commit 93ad5d7 (revert temporaneo)`

Dopo il deploy con la protezione il carosello risultava statico. La protezione è stata quindi rimossa.

### Stato attuale

Commit:

`9dedbf29cdee81accc4e174aa7fcb95b55fd0e7d`  
`fix: rimuove controllo currentSlideRequest che blocca carousel hero`

Vercel: Production → Ready, branch `main`.

Il commit ha modificato solo `assets/app.js`, rimuovendo il controllo `currentSlideRequest`.

### Nota tecnica

Non considerare come causa certa il solo controllo `currentSlideRequest`: matematicamente, su una normale seconda chiamata `paintSlide()`, il nuovo `requestId` coincide con `currentSlideRequest`. Il controllo serve soprattutto a ignorare callback obsolete.

La rimozione è stata fatta perché il comportamento reale osservato dopo `0f888c3` era il carosello completamente statico.

---

# 6. PROBLEMA ATTUALE — CAROUSEL + ASSISTENTE CM

Dopo il commit `9dedbf29` è stato osservato nel browser:

### Carousel

- rimane sempre sulla prima immagine;
- non cambia automaticamente;
- freccia destra non cambia;
- freccia sinistra non cambia.

### Assistente CM

- il pulsante/floating è visibile;
- cliccandolo non si apre correttamente.

Poiché due funzioni diverse dello stesso `assets/app.js` risultano inattive contemporaneamente, **non fare altre modifiche alla cieca al carosello**.

### Ipotesi diagnostica principale

`assets/app.js` potrebbe:

- non essere eseguito correttamente nel browser;
- non essere caricato correttamente;
- interrompersi per un errore JavaScript prima dell'inizializzazione degli eventi.

I log runtime Vercel non sono sufficienti per escludere un errore JavaScript lato browser.

### Test da completare prima di modificare `assets/app.js`

Aprire nel browser:

`https://www.cm-consulting.info/assets/app.js`

Interpretazione:

- codice JavaScript visibile → file servito;
- 404 / Not Found → problema di percorso/deploy;
- HTML o errore → problema di caricamento.

Dopo questo test bisogna verificare la Console del browser per eventuali errori JavaScript e testare dal vivo il click sull'Assistente CM.

**Non modificare `assets/app.js` prima di completare la diagnosi.**

---

# 7. ASSISTENTE CM

`assets/app.js` contiene:

- `initAssistantUI()`;
- `openAI()`;
- `closeAI()`;
- `startAI()`;
- `startAssistantRecognition()`;
- `stopAssistantRecognition()`;
- `aiChoose()`;
- `initAssistantFab()`;
- `initAssistantFabFooterHide()`.

L'avvio generale comprende:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSlider();
  initAssistantUI();
  initAssistantFab();
  initAssistantFabFooterHide();
  initClickableCards();
  initBasicFormValidation();
});
```

**NON rimuovere o modificare `initAssistantFabFooterHide()` durante correzioni non correlate.**

La voce `appalto` nella mappa `aiChoose` punta ora a:

`appalti-pubblici.html`

La vecchia destinazione `appalti.html` è stata rimossa dalla mappa.

---

# 8. STRUTTURA HERO `.hero-stage picture`

Una precedente ipotesi prevedeva di aggiungere:

- `position:absolute`;
- `inset:0`;
- altre regole di isolamento.

**Stato verificato:** non considerare tale modifica come già applicata.

La verifica del CSS attivo `assets/v9-final.css` ha mostrato che il blocco corrente è:

```css
.hero-stage picture{width:100%;height:100%}
.hero-stage picture img{width:100%;height:100%;object-fit:cover}
```

Non dichiarare quindi che `position:absolute` / `inset:0` siano presenti senza una nuova verifica del RAW corrente.

**Non applicare questa modifica senza nuova diagnosi visiva/tecnica.**

---

# 9. FOOTER — AUDIT ATTUALE

Obiettivo per il footer standard:

```html
<h3>CM Consulting</h3>
```

come titolo della prima colonna.

## Già corretti

- `404.html`
- `ambiente.html`
- `appalti-pubblici.html`
- `dogane.html`
- `locazioni.html`

## Ancora da correggere

- `index.html`
- `altre-esigenze.html`
- `capacita-finanziaria.html`
- `contatti.html`
- `cookie.html`
- `fideiussioni.html`
- `privacy.html`
- `reclami-e-arbitro-assicurativo.html`
- `richiedi-preventivo.html`
- `trasparenza.html`

Ogni correzione deve essere separata.

### Commit concordato

`Uniforma titolo footer CM Consulting su [nome pagina]`

Prima di ogni correzione:

1. verificare il RAW corrente;
2. modificare solo il titolo `<h3>` richiesto;
3. non toccare altre righe;
4. verificare il diff;
5. fare un solo commit;
6. verificare Vercel;
7. passare alla pagina successiva solo dopo conferma.

## Pagine senza footer standard oggetto dell'audit

- `area-cm.html` — redirect
- `admin/index.html`
- `admin/reset.html`

---

# 10. FILE ORFANI

Candidati originari:

1. `index-fix-fideiussioni.html`
2. `v9-final.css` nella root
3. `v9-final-footer-text-links.css`
4. `assets/cm-assistant.css`
5. `assets/cm-assistant.js`
6. `assets/cm-assistant-v7.css`
7. `appalti.html`

## Sei file già eliminati

- `assets/cm-assistant-v7.css` — `dc1072d`
- `assets/cm-assistant.js` — `9ea5e6b`
- `assets/cm-assistant.css` — `2802c9f`
- `v9-final-footer-text-links.css` — `f0f15d0`
- root `v9-final.css` — `450b506`
- `index-fix-fideiussioni.html` — `ef38058`

## `appalti.html`

In precedenza era referenziato da `assets/app.js`.

La mappa `aiChoose` è stata corretta a:

`appalti-pubblici.html`

Prima di eliminare `appalti.html` è obbligatoria una nuova ricerca completa delle referenze sul branch `main`.

Non confondere mai:

- `assets/v9-final.css` = CSS attivo;
- `v9-final.css` = vecchio file root già eliminato.

---

# 11. FILE IMPORTANTI

## HTML

- `index.html`
- `ambiente.html`
- `appalti-pubblici.html`
- `capacita-finanziaria.html`
- `contatti.html`
- `dogane.html`
- `fideiussioni.html`
- `locazioni.html`
- `altre-esigenze.html`
- `richiedi-preventivo.html`
- `reclami-e-arbitro-assicurativo.html`
- `privacy.html`
- `cookie.html`
- `trasparenza.html`
- `404.html`

## JavaScript

`assets/app.js`

## CSS

- `assets/style.css`
- `assets/v9-final.css`

---

# 12. STATO VERCEL

Ultimo deploy noto:

- commit `9dedbf29`;
- messaggio `fix: rimuove controllo currentSlideRequest che blocca carousel hero`;
- Production → Ready;
- branch `main`.

Commit recenti importanti:

- `93ad5d7` — versione di riferimento precedente;
- `142cc10` — ripristino temporaneo `assets/app.js`;
- `0f888c3` — protezione callback obsolete;
- `9dedbf2` — rimozione della protezione.

**Production → Ready non significa che il JavaScript lato browser funzioni: il comportamento deve essere verificato sul sito.**

---

# 13. BACKUP PC

Cartella:

`Sito cm consulting with CHATGPT`

Deve contenere:

- `STATO-PROGETTO.md`;
- backup ZIP;
- audit;
- documentazione tecnica;
- altre copie importanti del progetto.

Quando questo file viene aggiornato:

1. scaricarlo;
2. sostituire la copia sul PC;
3. sostituire la copia su GitHub;
4. fare commit su `main`.

---

# 14. ISTRUZIONE SPECIFICA PER CLAUDE E COPILOT

Claude e GitHub Copilot devono usare questo registro esattamente come ChatGPT.

Prima di modificare:

1. leggere `STATO-PROGETTO.md`;
2. verificare `migliore50-afk/Cm-Consulting-`, branch `main`;
3. verificare il RAW corrente;
4. non ricostruire file da memoria;
5. diagnosticare prima;
6. una sola modifica alla volta;
7. un solo commit per correzione;
8. verificare il diff;
9. verificare Vercel;
10. verificare il comportamento reale.

### Stato da comunicare

Il problema aperto è:

**Carousel homepage + Assistente CM entrambi inattivi nel browser.**

Il prossimo test prioritario è:

`https://www.cm-consulting.info/assets/app.js`

Poi:

- Console browser;
- eventuali errori JavaScript;
- test click Assistente CM;
- test frecce carousel;
- test cambio automatico.

**Non modificare `assets/app.js` prima di completare questi test e la diagnosi.**

---

# 15. ISTRUZIONE DI AVVIO PER NUOVE CHAT

> Prima di fare qualsiasi modifica al progetto CM Consulting, leggi `STATO-PROGETTO.md` direttamente dal branch `main` di GitHub. Consideralo il registro tecnico ufficiale. Verifica sempre il RAW corrente dei file interessati. Non basarti su copie locali, memoria della chat o supposizioni. Identifica prima il problema reale. Procedi una sola correzione alla volta e non modificare parti non richieste.

Frase breve:

**“Riprendiamo il progetto CM Consulting.”**

---

# 16. PRINCIPIO FINALE

**GitHub `main` = stato reale.**

**`STATO-PROGETTO.md` = registro tecnico ufficiale condiviso.**

**PC = backup di sicurezza.**

**ChatGPT, Claude e Copilot devono usare lo stesso registro e verificare sempre GitHub prima di modificare.**

**Nessuna correzione alla cieca. Prima diagnosi, poi modifica minima, poi verifica.**
