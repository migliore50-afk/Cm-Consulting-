# STATO-PROGETTO.md
## CM Consulting — Registro tecnico ufficiale

**Ultimo aggiornamento:** 17 settembre 2026  
**Repository:** `migliore50-afk/Cm-Consulting-`  
**Branch:** `main`  
**Deploy:** Vercel — Production  
**Stato:** progetto attivo; Correzione B (overscan hero) applicata e verificata su GitHub (commit `69ac5b1`); da riverificare Vercel Production → Ready e comportamento live. Le sezioni 5-8 descrivono uno stato storico del carousel non più corrispondente al codice attuale — vedi §5 e §5-bis.

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

`Via Spinoza n. 49 - 00137 - Roma`

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

## Correzione B — overscan hero carousel (11 settembre 2026)

**File:** `assets/app.js`, dentro `initSlider()`, blocco di stile su `[imgA, imgB]`.

Sostituzioni applicate, nessun'altra riga toccata:

- `image.style.width = 'calc(100% + 10px)'` → `'100%'`
- `image.style.objectPosition = '5% center'` → `'center center'`
- `image.style.marginLeft = '-10px'` → `'0'`

`paintSlide()`, il meccanismo di crossfade, CSS, HTML e immagini non sono stati toccati.

Commit: `fix: rimuove overscan hero e ripristina centratura immagini`  
SHA: `69ac5b1`  
Verifica sintattica (`node --check`): OK  
Applicato tramite editor web GitHub (vedi nota tecnica §5-bis per il motivo).

## Diagnosi fascia chiara bordo superiore Hero — 12 settembre 2026

**Problema esaminato:** sottile fascia chiara percepita tra Header e Hero nella homepage, soprattutto sulla fotografia della slide con penna/documento.

**Diagnosi eseguita sul sito live Vercel tramite Console Chrome.**

Risultati desktop:
- `headerHeight = 88px`;
- `headerBottom = 88px`;
- `heroTop = 88px`;
- `gap = 0px`;
- `devicePixelRatio = 1`;
- `viewportWidth = 1920px`.

Ulteriore verifica:
- `border-bottom` dell'header rilevato come `none` nel rendering testato;
- `heroTopPixelElement = .hero.hero-home`;
- `pictures = 2`;
- `images = 2`;
- `<picture>` e `<img>` risultano coincidenti nella posizione;
- `object-fit = cover`;
- la disattivazione temporanea di `backdrop-filter` non ha modificato visivamente la fascia.

**Conclusione:** non è stato rilevato alcun gap strutturale Header → Hero e non è stata confermata una causa CSS/HTML/JS. La fascia è compatibile con il contenuto/rendering dell'asset fotografico della slide e viene classificata come **issue estetica dell'asset**, non come bug di layout.

**Decisione:** nessuna modifica a `index.html`, `assets/style.css`, `assets/v9-final.css` o `assets/app.js` per questa issue. Non intervenire sul layout senza una nuova evidenza diagnostica. Un eventuale intervento futuro dovrà riguardare direttamente l'asset fotografico (crop, correzione esposizione o sostituzione).

### Carousel servizi — card "Altre esigenze"

La visualizzazione parzialmente tagliata dell'ultima card a destra è **comportamento intenzionale** del carousel orizzontale con `overflow-x:auto` e `scroll-snap-type`, usato come affordance visiva dello scorrimento. Non classificare come bug salvo richiesta esplicita di redesign.

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

### AGGIORNAMENTO 11 settembre 2026 — architettura carousel cambiata

Le sezioni 5-8 di questo registro descrivono un'architettura del carousel (singolo `<picture>`, classe `fade`, `currentSlideRequest`) che **non corrisponde più al codice attualmente su `main`**. Verificato leggendo il RAW di `assets/app.js` in questa sessione: `initSlider()` ora usa un'architettura a doppio buffer con crossfade (`pictureA`/`pictureB` clonati, `layers[]`, `crossfadeTo()`, `finishTransition()`, `prepareLayer()`), introdotta presumibilmente in una sessione precedente non ancora riportata in questo registro. Il carousel e l'Assistente CM risultavano funzionanti prima dell'inizio di questa sessione (nessun problema riportato dall'utente).

**Chi riprende questo progetto non deve considerare valide le sezioni 5-8 come descrizione dello stato attuale del codice**, ma solo come cronologia storica. Verificare sempre il RAW corrente prima di intervenire su `assets/app.js`.

---

# 5-bis. NOTA TECNICA — 403 "Resource not accessible by integration" sul connettore GitHub MCP (11 settembre 2026)

Durante questa sessione, i tentativi di scrittura su GitHub tramite il tool `GitHub:create_or_update_file` (connettore MCP di Claude, endpoint `https://api.githubcopilot.com/mcp`) hanno restituito costantemente:

```
403 Resource not accessible by integration
PUT https://api.github.com/repos/migliore50-afk/Cm-Consulting-/contents/assets/app.js
```

**Diagnosi effettuata:**

1. Verificata la GitHub App **"Claude"** (Settings → Applications → Installed GitHub Apps): permesso Contents = Read and write, repository `Cm-Consulting-` correttamente selezionato. Push comunque fallito con lo stesso 403.
2. Riconnesso il connettore GitHub in Claude (Disconnetti → Collega → Authorize) per ottenere un token OAuth fresco. Push fallito di nuovo, stesso errore identico.
3. Verificata la pagina "Authorized GitHub Apps" (`github.com/settings/apps/authorizations`): risultano **due app GitHub distinte di Anthropic**:
   - **"Claude"** — quella usata da Claude Code, con permessi Contents R/W configurati correttamente sul repo.
   - **"Claude Github MCP Connector"** — quella effettivamente legata al connettore MCP usato in questa chat web. La sua pagina dettagli dichiara esplicitamente: *"Claude Github MCP Connector has not been installed on any accounts you have access to."*

**Causa individuata:** l'app GitHub che serve la chiamata `api.githubcopilot.com/mcp` non risulta installata su alcun repository, quindi non ha accesso effettivo in scrittura, indipendentemente dai permessi OAuth generali concessi (identità, lettura risorse, "act on your behalf"). Questo spiega il 403 anche con token fresco.

**Non risolto in questa sessione** (nessuna modifica a permessi/installazioni GitHub è stata effettuata, su richiesta esplicita dell'utente di non improvvisare cambi di autorizzazione). 

**Soluzione applicata come bypass per completare la correzione B:** editing manuale del file tramite l'editor web di GitHub (`github.com/.../edit/main/assets/app.js`), con sostituzione dell'intero contenuto del file (fornito da Claude come file scaricabile) e commit diretto su `main` dall'interfaccia GitHub.

**Per le prossime sessioni:** se il tool `GitHub:create_or_update_file` (o altri tool di scrittura del connettore MCP) restituisce di nuovo `403 Resource not accessible by integration`, non ripetere da zero questa diagnosi. Verificare prima se nel frattempo l'app **"Claude Github MCP Connector"** è stata installata su un repository (Settings → Applications → Installed GitHub Apps, cercare quel nome specifico, non solo "Claude"). Se non installata, il bypass via editor web GitHub resta la via più rapida.

**Conferma 16 settembre 2026:** il problema si è ripresentato identico durante l'audit di sicurezza di `api/_security.js` e durante il tentativo di aggiungere la sezione 18 e il relativo diagramma SVG. Sia `create_or_update_file` sia `push_files` restituiscono lo stesso `403 Resource not accessible by integration`, anche dopo disconnessione/riconnessione del connettore GitHub in Claude e con permessi Contents R/W confermati corretti sulla app "Claude". La causa resta quella individuata qui: l'app "Claude Github MCP Connector" non risulta installata. Bypass confermato ancora valido: editing manuale via editor web GitHub, file forniti da Claude come download pronti per il copia-incolla. Tool di sola lettura (`get_file_contents`, `search_code`) continuano invece a funzionare regolarmente tramite il connettore. Il commit del 16 settembre (upload manuale tramite "Add file → Upload files" su GitHub) ha funzionato regolarmente per tre file contemporaneamente — quella via resta la procedura consigliata.

---

# 6. PROBLEMA ATTUALE — CAROUSEL + ASSISTENTE CM

**Nota (11 settembre 2026): questa sezione descrive uno stato storico risolto in una sessione precedente non documentata qui. Vedi §5 "AGGIORNAMENTO 11 settembre 2026" e §5-bis. Non usare come base per una nuova diagnosi senza prima verificare il RAW corrente.**

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

- commit `69ac5b1`;
- messaggio `fix: rimuove overscan hero e ripristina centratura immagini`;
- branch `main`.

**Vercel Production → Ready non ancora riverificato dopo questo commit in questa sessione: da controllare alla prossima ripresa.**

Commit storici rilevanti (vedi §5 per nota sull'architettura obsoleta):

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

Correzione B (overscan hero) completata e verificata l'11 settembre 2026, commit `69ac5b1`. Resta da riverificare Vercel Production → Ready e il comportamento live sul sito per questo commit specifico.

Le sezioni 5-8 descrivono uno stato storico del carousel non più corrispondente al codice attuale: vedi nota in §5 e §5-bis prima di intervenire di nuovo su `assets/app.js`.

Se il tool di scrittura GitHub del connettore MCP restituisce `403 Resource not accessible by integration`, vedi §5-bis prima di rifare la diagnosi da zero.

**Dal 16 settembre 2026, nessuna pagina del sito usa più upload diretti di file: vedi §18.** Se si trovano riferimenti a `/api/attachment-upload-url` o `attachments` in una pagina HTML, verificare che non sia una versione non ancora pubblicata: quel flusso è stato dismesso su tutto il portale.

**Dal 17 settembre 2026, `richiedi-preventivo.html` e `capacita-finanziaria.html` hanno un'architettura completamente diversa da quella descritta nelle sezioni precedenti a questo registro: vedi §19.** Non fare riferimento a step numerati vecchi (es. "step3 documentazione") senza aver prima verificato il RAW corrente.

---

# 15. ISTRUZIONE DI AVVIO PER NUOVE CHAT

> Prima di fare qualsiasi modifica al progetto CM Consulting, leggi `STATO-PROGETTO.md` direttamente dal branch `main` di GitHub. Consideralo il registro tecnico ufficiale. Verifica sempre il RAW corrente dei file interessati. Non basarti su copie locali, memoria della chat o supposizioni. Identifica prima il problema reale. Procedi una sola correzione alla volta e non modificare parti non richieste.

Frase breve:

**"Riprendiamo il progetto CM Consulting."**

---

# 16. PRINCIPIO FINALE

**GitHub `main` = stato reale.**

**`STATO-PROGETTO.md` = registro tecnico ufficiale condiviso.**

**PC = backup di sicurezza.**

**ChatGPT, Claude e Copilot devono usare lo stesso registro e verificare sempre GitHub prima di modificare.**

**Nessuna correzione alla cieca. Prima diagnosi, poi modifica minima, poi verifica.**

---

# 17. AGGIORNAMENTO — 13 SETTEMBRE 2026

## Correzione sede legale — completata e verificata

Sono state corrette le seguenti pagine:

- `index.html`
- `capacita-finanziaria.html`

Sostituzione effettuata:

`Via Giacomo Puccini 4, 10092 Beinasco (TO)`

con:

`Via Spinoza n. 49 - 00137 - Roma`

### GitHub

Commit:

`61d4ec9849f68ebad321798bef51d61072b57460`

Messaggio:

`fix: corregge sede legale in homepage e capacita finanziaria`

Branch:

`main`

Verifica Git locale:

`Your branch is up to date with 'origin/main'.`

`nothing to commit, working tree clean`

### Vercel

Deployment associato al commit `61d4ec9`:

- Target: `production`
- Stato: `READY`
- Source: Git
- Branch: `main`
- Alias error: `null`

La produzione Vercel è quindi aggiornata al commit `61d4ec9`.

### Verifica produzione

La homepage della produzione ha risposto con:

`HTTP 200 OK`

Nel codice HTML pubblicato è presente:

`Sede legale: Via Spinoza n. 49 - 00137 - Roma`

La correzione è quindi verificata lungo tutta la catena:

**PC/Mac → GitHub main → Vercel → Production**

## Stato attuale

La correzione dell'indirizzo è **CHIUSA**.

Non risultano modifiche Git locali pendenti.

Il vecchio indirizzo di Beinasco è stato eliminato dai due file corretti.

### Prossimo lavoro

Riprendere l'audit tecnico del progetto senza modifiche alla cieca.

Priorità già individuate:

1. verificare le anomalie residue del footer;
2. verificare i redirect e le regole di `vercel.json`;
3. ~~verificare la gestione degli upload in `capacita-finanziaria.html`, in particolare il limite payload Vercel~~ — superato: upload diretto rimosso, vedi §18;
4. verificare privacy/localStorage e passaggio dati verso WhatsApp;
5. aggiornare `sitemap.xml` quando le modifiche definitive lo richiedono.

Ogni modifica dovrà seguire la procedura prevista da questo registro: diagnosi → verifica RAW → modifica minima → diff → commit separato → verifica Vercel → verifica funzionale.

---

# 18. UPLOAD DIRETTO E ANTIVIRUS CLAMAV — PERCORSO ARCHIVIATO (16 settembre 2026)

**Stato: CHIUSO.** L'intero percorso di valutazione Oracle Cloud + ClamAV è stato archiviato. Il sito non usa più upload diretti di file in nessuna pagina.

## Cosa è cambiato

Sono stati riscritti due file per rimuovere completamente l'upload diretto, sostituendolo con invio della documentazione via email da parte del cliente, fuori dal sito:

- **`richiedi-preventivo.html`** — rimossi tutti gli input file, `fileToBase64`, le chiamate a `/api/attachment-upload-url`.
- **`capacita-finanziaria.html`** — rimossi gli input file (`docs`, `bilancioFile`), la funzione di rendering della lista file e il ciclo di upload in `submitCapacity()`.

Entrambi i file inviano `/api/submit-request` **senza il campo `attachments`** (il backend lo gestisce già correttamente come array vuoto).

**Nota:** l'invio documenti via WhatsApp, introdotto in una prima versione di questa modifica, è stato **rimosso definitivamente il 17 settembre 2026** — vedi §19. Resta solo l'invio via email.

## Perché è stato chiuso

Verifica end-to-end completata prima della decisione (16 settembre 2026): è stato accertato che, oltre a `richiedi-preventivo.html`, anche `capacita-finanziaria.html` usava attivamente lo stesso flusso di upload (`/api/attachment-upload-url` → `scanBlobAttachment()` in `api/_security.js`). Con l'antivirus fail-closed e `CM_ANTIVIRUS_WEBHOOK_URL` mai configurato, qualunque cliente che allegasse un documento su quella pagina riceveva un rifiuto totale della richiesta (`ATTACHMENT_SECURITY_REJECTED`). Decisione: invece di configurare un antivirus reale (a pagamento o self-hosted, entrambi scartati per vincoli di Carmelo — niente carte di credito/debito salvate, nessun dispositivo sempre acceso gestibile), è stato rimosso l'upload diretto da entrambe le pagine del sito.

## Stato del codice backend (non modificato)

`api/_security.js` (incluse `scanBlobAttachment`, `scanAttachment`, la logica antivirus fail-closed), `api/attachment-upload-url.js` e la gestione di `attachments` dentro `api/submit-request.js` **non sono stati toccati né rimossi**. Restano nel repository come codice non più richiamato da nessuna pagina HTML. Rimuovere questo codice backend è una decisione separata, non ancora presa.

Diagramma storico (architettura ClamAV/Oracle valutata e poi archiviata, mai attiva in produzione): `docs/CM-Consulting-ClamAV-Oracle-architettura.svg`.

---

# 19. REDESIGN UX — richiedi-preventivo.html E capacita-finanziaria.html (17 settembre 2026)

**Stato: pronto per il commit, approvato da Carmelo, non ancora caricato su `main`.**

## Motivo

Carmelo ha segnalato che entrambe le pagine, anche dopo la rimozione dell'upload (§18), restavano troppo macchinose per clienti non esperti della materia assicurativa: troppi campi tecnici mostrati tutti insieme, troppi step, terminologia poco chiara.

## Cosa è cambiato — `richiedi-preventivo.html`

Da **4 step a 2**:
1. Scelta tipologia (invariata)
2. Un'unica schermata con: spiegazione in linguaggio semplice della garanzia scelta, campi essenziali sempre visibili (beneficiario, importo, durata, referente, email, telefono), dettagli tecnici (P.IVA, indirizzo, PEC, oggetto, note, riferimenti specifici) dentro una sezione facoltativa collassata (`<details>`), elenco documenti utili, riepilogo che si aggiorna in tempo reale, pulsante di invio email con oggetto/corpo precompilati

**WhatsApp rimosso definitivamente dal flusso documenti** — resta solo l'email. Su indicazione di Carmelo, WhatsApp è rimandato a un utilizzo futuro come canale di chat/supporto generico, da collegare solo quando sarà attiva una nuova eSIM dedicata a CM Consulting — non va reintrodotto nel flusso di invio documenti.

### Locazioni — contenuti verificati con ricerca mirata

- Rimossa la parola "assicurativa" dalla spiegazione: la fideiussione per locazione può essere bancaria, assicurativa o prestata da un altro soggetto garante
- Aggiunto un campo "Tipo di locazione" (uso abitativo / uso commerciale)
- Distinti correttamente **locatore** (proprietario, il beneficiario della garanzia) e **conduttore** (l'inquilino, il contraente) — per Carmelo il termine "locatario" è sinonimo di locatore/beneficiario, non di conduttore
- Documenti richiesti aggiornati a: contratto di locazione tra le parti (anche in bozza) e documentazione reddituale del conduttore
- Verificato che la distinzione tra fideiussione "a prima richiesta" e "a perdita definitiva" **non va chiesta al cliente nel form**: è una clausola già presente nel testo/schema fornito dal beneficiario, che CM Consulting verifica in fase di istruttoria leggendo quel documento (coerente con la domanda già esistente "Il beneficiario ti ha fornito un testo, schema, richiesta o delibera?")

### Altre tipologie — da rivedere

Le spiegazioni per Appalti, Trasporti, Dogane, Ambiente, Contributi, Urbanistica, Fiscali sono **bozze scritte con nozioni generali**, non verificate con ricerche mirate come per Locazioni. Segnalate esplicitamente a Carmelo come punto aperto da correggere con la sua esperienza diretta prima o dopo la pubblicazione.

## Cosa è cambiato — `capacita-finanziaria.html`

Da **3 step a una schermata unica**: spiegazione (cos'è il requisito di idoneità finanziaria, riferimento alla circolare MIT n. 4499/2026), campi essenziali (ragione sociale, P.IVA/C.F., comune, provincia, numero mezzi, referente, email), dettagli sui singoli mezzi e domanda sul bilancio dentro la sezione facoltativa, elenco documenti, riepilogo live, invio via email.

## Cosa NON è cambiato

Il contratto con il backend resta identico in entrambi i file: `POST /api/submit-request` con `{subject, text, email, customerName, phone, requestType, requestTypeName, privacyAccepted}`, nessun campo `attachments`. Nessuna modifica a `api/submit-request.js`, `api/_security.js` o ad altri file backend.

## Prossimi passi

1. Carmelo carica i due file su `main` (stesso metodo del 16 settembre: "Add file → Upload files" su GitHub, un solo commit)
2. Verifica GitHub (SHA), Vercel Production → Ready, comportamento live — stessa procedura già seguita per §18
3. Revisione con Carmelo delle spiegazioni per le tipologie diverse da Locazioni, quando avrà tempo di verificarle una per una

## Iterazione successiva (stesso giorno) — un solo pulsante e foto dinamica

Dopo il primo test dal vivo di Carmelo sono emerse tre correzioni, tutte applicate alla stessa architettura a 2 step:

**Un solo pulsante invece di due azioni separate.** Prima il cliente doveva cliccare "Invia richiesta" e poi, separatamente, un secondo pulsante per aprire l'email — due gesti, il secondo facile da dimenticare. Ora un unico pulsante ("INVIA RICHIESTA E ALLEGA I DOCUMENTI →") fa entrambe le cose: registra la richiesta lato server **e** apre subito il client email del cliente (`window.location.href` su un `mailto:` generato al volo). Resta un pulsante di backup più piccolo ("Non si è aperta? Apri qui l'email") per il caso raro in cui l'apertura automatica non funzioni sul dispositivo del cliente. Applicato identico su entrambi i file.

**Foto dinamica per tipologia in `richiedi-preventivo.html`.** Ogni tipologia ora mostra, in cima allo step 2, la stessa foto già usata sulle pagine dedicate del sito (`assets/locazioni-retina-1920.webp`, `assets/appalti-retina-1920.webp`, `assets/ambiente-retina-1920.webp`; `assets/altre-esigenze-retina-1920.webp` come fallback per Dogane e per le tipologie senza pagina dedicata: Trasporti, Contributi, Urbanistica, Fiscali, Altro). Le spiegazioni di Appalti, Dogane e Ambiente sono state riscritte riprendendo i contenuti reali già pubblicati su `appalti-pubblici.html`, `dogane.html` e `ambiente.html`, invece delle bozze generiche della prima versione — restano bozze non verificate solo Trasporti, Contributi, Urbanistica, Fiscali.

**Box "Documenti" e box "Invio" uniti in uno solo.** Su segnalazione di Carmelo ("il cliente deve leggere i documenti in un punto e poi cercare il pulsante altrove"), i due riquadri sono stati fusi in un unico box laterale (sticky) chiamato "Documenti necessari e invio": elenco documenti, checkbox privacy, pulsante di invio e pulsante di backup email, tutti nello stesso riquadro. Applicato identico su entrambi i file. Il vecchio pulsante "INDIETRO" in `richiedi-preventivo.html` è stato sostituito da un link discreto "← Cambia tipologia" in alto, meno ingombrante.

## Decisione ancora aperta, non affrontata in questa iterazione

Carmelo ha proposto di eliminare il passaggio intermedio delle pagine dedicate per tipologia (`locazioni.html`, `appalti-pubblici.html`, `dogane.html`, `ambiente.html`), facendo puntare i link della pagina hub `fideiussioni.html` direttamente a `richiedi-preventivo.html?tipo=X`, dato che la spiegazione ora presente nello step 2 rende quelle pagine ridondanti. Non ancora implementato: cambiare quei link è una modifica distinta con conseguenze su indicizzazione Google e su altri link interni che puntano alle pagine dedicate (ognuna ha già i propri `<link rel="canonical">`, meta description, e collegamenti di navigazione tra servizi `cm-service-nav` verso le pagine vicine). Prima di procedere va deciso con Carmelo se: (a) lasciare le vecchie pagine raggiungibili solo da link diretti/Google senza più linkarle dal menu, oppure (b) reindirizzarle con redirect lato Vercel verso `richiedi-preventivo.html?tipo=X`, oppure (c) eliminarle definitivamente. Nessuna delle tre è stata scelta.
