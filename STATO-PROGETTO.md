# STATO-PROGETTO.md
## CM Consulting — Registro tecnico ufficiale

**Ultimo aggiornamento:** 20 settembre 2026  
**Repository:** `migliore50-afk/Cm-Consulting-`  
**Branch:** `main`  
**Deploy:** Vercel — Production (dominio Aruba non ancora collegato, in attesa — vedi §23)  
**Stato:** progetto attivo. Vedi §23 per l'audit tecnico completo del 20 settembre (bug menu/logo risolti, riscoperta dell'Area Amministratore già esistente, sitemap da aggiornare, flusso email/allegati da decidere). Punto aperto storico: nuovo logo per header, affidato a un grafico esterno (Fiverr), in attesa dei file — vedi §22.

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

**Attenzione per chi riprende**: questo registro ha già avuto almeno un caso di "punto chiuso riproposto come aperto" per non aver riletto §18 con attenzione (vedi nota in fondo a §18). Prima di segnalare un punto come "ancora da fare", verificare sempre se esiste già una sezione che lo chiude. Vedi anche §23 per un secondo caso simile (Area Amministratore esistente ma non documentata).

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

**Regola di lavoro permanente (dal 19 settembre 2026, valida per tutte le sessioni)**: Claude fornisce sempre i file da caricare come download (non solo testo incollato in chat), Carmelo li carica lui su GitHub (root o `assets`) via drag & drop, e Claude indica sempre il messaggio di commit esatto da usare — nel formato "Dove caricarlo: <link diretto /upload/main/...>" + "Commit message: <tipo>: <descrizione>".

---

## 3. DATI E VINCOLI DEL PROGETTO

**Azienda:** CM Consulting di Carmelo Migliore – Intermediazione Assicurativa.

Attività: intermediazione assicurativa, con particolare attenzione a fideiussioni, appalti pubblici, locazioni, capacità finanziaria per albi trasportatori, dogane, ambiente e altre esigenze.

### Contatti

- email: `info@cm-consulting.info`
- PEC: `carmelo.migliore@legalmail.it`
- **numero di cellulare personale rimosso dal sito il 18 settembre 2026 (vedi §21) — non reinserirlo senza richiesta esplicita di Carmelo; in futuro sarà sostituito da un numero WhatsApp dedicato (eSIM), non ancora attivo**

### Indirizzo attualmente riportato

`Via Spinoza n. 49 - 00137 - Roma`

### Vincoli

- non riportare il vecchio indirizzo di Pomezia;
- non elencare stabilmente broker/compagnie/intermediari collaboranti;
- mantenere impostazione moderna e professionale;
- rispettare gli obblighi IVASS;
- non modificare parti non richieste;
- **non dichiarare numeri di esperienza, volumi di pratiche, recensioni o marchi registrati non veritieri — vedi §20 e §21**;
- **non introdurre servizi/infrastrutture di terzi che richiedano dati di una carta di debito/credito, anche se il piano è "gratuito"** — vedi §18, motivazione esplicita.

---

# 4. CORREZIONI PUBBLICATE E VERIFICATE (storico, fino al 17 settembre 2026)

## Homepage — link FIDEIUSSIONI

**File:** `index.html`

`/appalti-pubblici` → `/fideiussioni`

Commit: `Corregge homepage e link FIDEIUSSIONI`  
SHA: `ab6bdc5`

## Footer Appalti pubblici / 404 / navigazione servizi

Titoli footer uniformati a "CM Consulting"; link di navigazione corretti verso i percorsi puliti (`/ambiente`, `/fideiussioni`, `/capacita-finanziaria`).

## CSS hero/footer, Correzione B overscan hero (11 settembre 2026)

`assets/v9-final.css` e `assets/app.js` corretti per rimuovere l'overscan delle immagini hero e ripristinare la centratura. Vedi §5-bis per la nota tecnica sul connettore GitHub.

## Diagnosi fascia chiara Hero (12 settembre 2026)

Nessun gap strutturale trovato; classificata come issue estetica dell'asset fotografico, non un bug di layout. Nessuna modifica applicata.

---

# 5. CAROUSEL HOMEPAGE — STORIA E STATO

`assets/app.js`, funzione `initSlider()`, usa un'architettura a doppio buffer con crossfade (`pictureA`/`pictureB`, `layers[]`, `crossfadeTo()`). **Non modificare `paintSlide()`/`initSlider()` senza nuova diagnosi.** Le sezioni storiche su un'architettura precedente (singolo `<picture>`, `currentSlideRequest`) sono superate — non usarle come riferimento per lo stato attuale del codice.

---

# 5-bis. NOTA TECNICA — GitHub MCP Connector, scrittura non disponibile

Il connettore GitHub MCP usato da Claude in questa chat ha **solo accesso in lettura confermato funzionante** (`get_file_contents`, `search_code`). I tentativi di scrittura diretta (`create_or_update_file`, `push_files`) restituiscono `403 Resource not accessible by integration` — causa individuata: l'app "Claude Github MCP Connector" (distinta dall'app "Claude" usata da Claude Code) non risulta installata su alcun repository.

**Procedura consolidata e usata per tutto il lavoro di questo registro**: Claude legge sempre il RAW da GitHub prima di modificare, prepara il file completo (come download, dal 19 settembre 2026 — vedi §1) o le istruzioni precise, e **Carmelo carica manualmente** via drag & drop sull'editor web GitHub, un commit per correzione (o un gruppo di file coerenti caricati insieme). Claude verifica poi il risultato rileggendo il RAW.

---

# 6-8. STORICO CAROUSEL/ASSISTENTE/HERO — superato

Le sezioni 6, 7, 8 di versioni precedenti di questo registro descrivevano diagnosi e strutture non più corrispondenti al codice attuale. Non usarle come riferimento. Verificare sempre il RAW corrente di `assets/app.js` e `assets/v9-final.css` prima di intervenire.

---

# 9. FOOTER — AUDIT STORICO

Obiettivo storico: titolo prima colonna footer uniformato a "CM Consulting" su tutte le pagine. Risultava in gran parte completato al 17 settembre 2026. Non riverificato puntualmente in questa sessione (18 settembre) — se si nota un footer con titolo diverso, correggere seguendo lo stesso schema.

---

# 10. FILE ORFANI

File storici già eliminati: `assets/cm-assistant-v7.css`, `assets/cm-assistant.js`, `assets/cm-assistant.css`, `v9-final-footer-text-links.css`, root `v9-final.css`, `index-fix-fideiussioni.html`.

**Non confondere mai:** `assets/v9-final.css` (attivo) con un eventuale `v9-final.css` in root (già eliminato, non deve esistere).

**Nuovi candidati orfani (17 settembre 2026), ora RISOLTI**: `locazioni.html`, `appalti-pubblici.html`, `dogane.html`, `ambiente.html` non sono più orfani — sono stati riattivati con contenuto reale il 18 settembre 2026, vedi §21. Non eliminarli.

`appalti.html`: non referenziato da nessuna pagina attiva; redirect in `vercel.json` verso `/appalti-pubblici`. Prima di un'eventuale eliminazione, nuova ricerca completa delle referenze sul branch `main`.

**Nuovo candidato orfano (19 settembre 2026 sera)**: `assets/images/logo-cm-consulting-footer.webp` — caricato durante un tentativo di nuovo logo poi annullato (vedi §22), non più referenziato da nessuna pagina. Non urgente da rimuovere.

**Candidati orfani identificati il 20 settembre 2026 (audit, vedi §23)**: numerosi file di documentazione storica in root (`AUDIT-V12.6-FINALE.md`, `AUDIT-V12.7-FINALE.md`, `README-V12.7.md`, `README-V12.8-SECURITY.md`, `VERSION*.txt`, `ASSET-AUDIT-V11.txt`, `ASSET-RECUPERATI.txt`, `CONTROLLO-TECNICO-V9.txt`, `PUBBLICAZIONE-CHECKLIST.txt`, `AUDIT-ASSISTENTE-V12.6.1.md`) — non causano problemi funzionali ma non sono più il riferimento attivo (quello è questo file). Non eliminarli senza conferma esplicita di Carmelo; considerare di spostarli in `/docs/archivio/`.

---

# 11. FILE IMPORTANTI (aggiornato al 20 settembre 2026)

## HTML — pagine principali
`index.html`, `fideiussioni.html` (hub tipologie), `capacita-finanziaria.html`, `contatti.html`, `chi-siamo.html`, `faq.html`, `richiedi-preventivo.html`, `reclami-e-arbitro-assicurativo.html`, `privacy.html`, `cookie.html`, `trasparenza.html`, `404.html`

## HTML — pagine di tipologia (contenuto reale, vedi §21)
`appalti-pubblici.html`, `dogane.html`, `ambiente.html` ("Beneficiari Pubblici"), `locazioni.html` ("Affitti fra Privati"), `affitti-commerciali.html`, `affitti-rami-azienda.html`, `fideiussioni-contratti-privati.html`

## Area Amministratore (riscoperta il 20 settembre 2026 — vedi §23)
`admin/index.html` (login), `admin/reset.html`, `admin/admin.css`, `admin/admin.js` — frontend completo dell'area riservata, servito su `/admin`. `area-cm.html` è solo un redirect verso `/admin`. Backend: `api/admin.js` (login password+TOTP, sessioni Redis, CRUD pratiche/richieste su Supabase). Documentazione architetturale in `SECURITY-V12.8.md` (root). **Login testato e funzionante il 20 settembre 2026** sull'URL stabile `https://cm-consulting-v128-security-vercel.vercel.app/admin` — non funziona sugli URL di preview `-deploy-xxxxx.vercel.app` per via del controllo origine legato a `SITE_URL`, comportamento corretto e voluto.

## JavaScript
`assets/app.js` — contiene sia la logica applicativa (carousel, Assistente CM, form) sia diverse funzioni di correzione automatica del menu/footer eseguite a runtime su ogni pagina (vedi §21, §22, §23). Leggere sempre il RAW prima di aggiungere nuova logica simile, per non duplicarla. Funzioni runtime attive nel blocco `DOMContentLoaded`: `initMenu`, `initSlider`, `initAssistantUI`, `initAssistantFab`, `initAssistantFabFooterHide`, `initClickableCards`, `initBasicFormValidation`, `initBackToTop`, `simplifyLegalBar`, `removeRedundantFooterButtons`, più l'IIFE `initServiziDropdown` in fondo al file (menu SERVIZI, link "Accedi Area Privata", pulizia telefono/RUI). **Nessuna funzione di sostituzione logo attiva** (rimossa la sera del 19 settembre, vedi §22).

## CSS
`assets/style.css` (base), `assets/v9-final.css` (attivo, tutte le correzioni successive — vedi §23 per gli ultimi fix su logo/menu)

## Immagini (vedi §21 punto 1 e §22 per la storia completa)
Ogni asset segue lo schema `<stem>-retina-<768|1280|1920|2560|3840>.webp`. Stem attivi: `appalti`, `autotrasportatori`, `capacita`, `ambiente`, `altre-esigenze` (condiviso solo da "Altre Fideiussioni", scelta voluta), `locazioni`, `affitti-commerciali`, `affitti-rami-azienda`, `dogane`, `contratti-privati`. Foto generate con Gemini (Nano Banana Pro/2), non foto stock. Logo: `assets/images/logo-cm-consulting.webp` (attuale, header e footer, invariato) — un tentativo di sostituirlo nel solo footer è stato fatto e annullato, vedi §22.

## Configurazione
`vercel.json` — redirect delle vecchie URL; aggiornato il 18 settembre 2026 quando le pagine di tipologia sono state riattivate (vedi §21). `sitemap.xml` e `robots.txt` in root — **sitemap ferma al 27 agosto 2026, da aggiornare, vedi §23**.

## API backend (`api/`)
`api/admin.js` (vedi sopra), `api/submit-request.js` (invio richiesta + email via Resend, supporta allegati reali via Vercel Blob con scansione antivirus fail-closed — **non collegato al frontend attuale, vedi §23**), `api/attachment-upload-url.js` (genera URL di upload firmato, non richiamato da nessuna pagina), `api/_security.js` (rate limiting e scansione antivirus condivisi, entrambi fail-closed).

---

# 12-16. STATO VERCEL, BACKUP, ISTRUZIONI STORICHE

Vedi procedura generale in §1-§2. Non riportate qui le sezioni storiche di dettaglio su singoli commit del carousel (superate, vedi §5).

**Istruzione di avvio per nuove chat**, invariata:

> Prima di fare qualsiasi modifica al progetto CM Consulting, leggi `STATO-PROGETTO.md` direttamente dal branch `main` di GitHub. Consideralo il registro tecnico ufficiale. Verifica sempre il RAW corrente dei file interessati. Non basarti su copie locali, memoria della chat o supposizioni. Identifica prima il problema reale. Procedi una sola correzione alla volta e non modificare parti non richieste.

Frase breve: **"Riprendiamo il progetto CM Consulting."**

---

# 17. AGGIORNAMENTO — 13 SETTEMBRE 2026 — Correzione sede legale

Corretta su `index.html` e `capacita-finanziaria.html`: vecchio indirizzo di Beinasco → `Via Spinoza n. 49 - 00137 - Roma`. Verificata lungo tutta la catena PC → GitHub → Vercel → Produzione. **Stato: CHIUSO.**

---

# 18. UPLOAD DIRETTO E ANTIVIRUS CLAMAV — PERCORSO ARCHIVIATO (16 settembre 2026)

**Stato: CHIUSO E DEFINITIVO come scelta Oracle Cloud/ClamAV — ma vedi §23 per un'alternativa a pagamento (Cloudmersive) riemersa il 20 settembre, se Carmelo deciderà di riattivare l'upload con allegati.**

Il sito non usa più upload diretti di file in nessuna pagina — sostituito da invio documentazione via email dal cliente (flusso a due email separate, vedi §23 punto 3). Codice backend (`api/_security.js`, `api/attachment-upload-url.js`, `api/submit-request.js`) non toccato, resta nel repository completo e funzionante ma non richiamato dal frontend attuale.

**Motivazione esplicita (confermata da Carmelo il 19 settembre 2026, non era scritta chiaramente qui prima d'ora)**: l'ipotesi era ospitare un antivirus ClamAV reale su un server Oracle Cloud a livello gratuito ("Always Free"). Oracle richiede comunque i dati di una carta di debito/credito anche per il piano gratuito. Carmelo ha deciso di non procedere per il rischio concreto che, se in futuro Oracle cambiasse le condizioni del piano gratuito, la carta collegata potrebbe subire addebiti senza un'azione esplicita da parte sua. Si è quindi scelto di eliminare l'esigenza stessa (niente upload diretto sul sito, quindi niente bisogno di un antivirus) invece di accettare quel rischio finanziario per una funzione non essenziale al business.

**Nota di continuità**: in una sessione precedente (inizio del 19 settembre) questo punto era stato erroneamente reintrodotto come "ancora da verificare" — era già chiuso da tre giorni. Non ripetere l'errore: se emerge di nuovo il tema "antivirus" o "upload diretto", il punto di partenza è questa sezione e §23, non una nuova valutazione da zero.

---

# 19. REDESIGN UX — richiedi-preventivo.html E capacita-finanziaria.html (17 settembre 2026)

**Stato: caricato su `main`, verificato.** Vedi anche §22 per un'ulteriore correzione a `richiedi-preventivo.html` (rimozione opzione "Trasporti") fatta il 19 settembre sera, e §23 per l'analisi del flusso email/allegati.

Da 4 step a 2 (`richiedi-preventivo.html`) e da 3 step a 1 (`capacita-finanziaria.html`): spiegazione in linguaggio semplice, campi essenziali sempre visibili, dettagli tecnici in sezione facoltativa, box unico "Documenti necessari e invio" con un solo pulsante che registra la richiesta e apre l'email precompilata. WhatsApp rimosso definitivamente dal flusso documenti (rimandato a quando sarà attiva un'eSIM dedicata). Foto dinamica per tipologia aggiunta. Contenuti di Locazioni verificati con ricerca mirata (garante bancario/assicurativo/altro, distinzione locatore/conduttore, clausola "a prima richiesta" verificata in istruttoria, non chiesta al cliente).

**Redirect `vercel.json`** creati per le vecchie pagine tipologia (poi in parte rimossi il 18 settembre, vedi §21, quando quelle pagine sono state riattivate con contenuto reale).

---

# 20. PIANO ELITE — SUPERAMENTO COMPETITOR (17 settembre 2026)

Analisi comparativa di tre competitor (fideiussioni.online, italiafideiussioni.it, mondocauzioni.it) consegnata come documento separato (`PIANO-ELITE-SUPERAMENTO-COMPETITOR.md`, fuori dal repository). Aggiornamento del 20 settembre in §23 (pubblicazione del MUP come pagina consultabile, pratica diffusa tra intermediari).

**Premessa vincolante, vale per sempre**: CM Consulting non può dichiarare scala/numeri/anni di esperienza/recensioni dei competitor (es. "30+ anni", "2.500+ pratiche") senza violare la trasparenza IVASS — nessuna cifra falsa va introdotta. Vale anche per "marchio registrato" (vedi §21 — chiuso il 19 settembre 2026, nessuna riga aggiunta): si scrive solo ciò che è vero e verificabile.

Categoria identificata per espansione futura, non ancora implementata: "Fideiussioni per stranieri" (visti, permessi di soggiorno).


---

# 21. LAVORO DEL 18 SETTEMBRE 2026 — pagine di tipologia, navigazione, pagine nuove, pulizia footer

**Stato generale: tutto confermato live. Entrambi i punti aperti storici di questa sezione sono CHIUSI (vedi in fondo).**

## Sette pagine di tipologia — contenuto reale, documenti, FAQ, step personalizzati

Confermato live via RAW GitHub:
- `appalti-pubblici.html` — riattivata (era in redirect verso il form)
- `dogane.html` — riattivata
- `ambiente.html` — riattivata come **"Cauzioni per Beneficiari Pubblici"** (titolo/H1 cambiato, URL invariato)
- `locazioni.html` — riattivata come **"Affitti fra Privati"**
- `affitti-commerciali.html` — nuova
- `affitti-rami-azienda.html` — nuova
- `fideiussioni-contratti-privati.html` — nuova (categoria interamente nuova, nessuna vecchia pagina da recuperare; non ha mai avuto un riquadro hero-image, solo la card sulla pagina hub)

Ogni pagina ha: H1/H2 per SEO, elenco "Cosa può coprire" (checklist compatta a due colonne, non più box singoli), box "Documenti necessari" (verificati con ricerca mirata, non copiati dai competitor), 4 step "Come funziona la richiesta" personalizzati per tipologia (non più testo generico ripetuto), 2-3 FAQ verificate per categoria, CTA finale verso `/richiedi-preventivo?tipo=X`.

**Conseguenza su `vercel.json`**: tolti i redirect per `appalti-pubblici`, `dogane`, `ambiente`, `locazioni` (avevano senso quando quelle pagine erano solo marketing vuoto duplicato dal form — ora hanno contenuto reale, si sono "riguadagnate" il diritto di esistere). Aggiunti redirect puliti `.html` → versione senza estensione per le stesse quattro pagine e per `appalti.html` → `/appalti-pubblici`.

**`richiedi-preventivo.html`**: aggiunta la tipologia "Contratti privati" (spiegazione, documenti, pulsante nella schermata di scelta) e una terza opzione "Ramo d'azienda" nel toggle di Locazioni (prima solo abitativo/commerciale). **Aggiornamento 19 settembre sera**: l'opzione "Trasporti" è stata rimossa da qui — vedi §22.

**`fideiussioni.html`** (pagina hub): tutte le card puntano a pagine di contenuto reale o a `capacita-finanziaria.html`. Contiene 9 card: Appalti Pubblici, Affitti fra Privati, Affitti Commerciali, Rami d'Azienda, **Capacità Finanziaria** (sostituisce "Trasporti", vedi §22), Dogane, Beneficiari Pubblici, Contratti Privati, Altre Fideiussioni.

## Pagina Reclami — riscritta con struttura a 4 passaggi

`reclami-e-arbitro-assicurativo.html` riscritta su richiesta di Carmelo (confrontata con la pagina equivalente di un altro operatore di settore, mondocauzioni.it): prima erano due riquadri densi senza il passaggio "reclamo alla compagnia assicurativa". Ora: 1) Reclamo a CM Consulting (contatti reali, cosa deve contenere, 45 giorni) 2) Reclamo alla Compagnia Assicurativa (dove trovare i contatti — DIP Aggiuntivo) 3) Reclamo all'IVASS (indirizzo/fax/PEC verificati con ricerca web in questa sessione: Via del Quirinale 21, 00187 Roma; fax 06.42133206; PEC tutela.consumatore@pec.ivass.it) 4) Sistemi alternativi — aggiunte **Mediazione civile** (obbligatoria per legge, D.Lgs 28/2010) e **Negoziazione assistita**, assenti prima.

## Navigazione — menu a tendina, voci rimosse/aggiunte, tutto via `assets/app.js`

Tecnica usata per tutte le correzioni al menu: **una sola funzione IIFE in `assets/app.js`** (`initServiziDropdown`) che modifica il DOM del menu a runtime su ogni pagina (nessun file HTML deve essere toccato singolarmente). Include: rimozione voce "FIDEIUSSIONI" separata, rimozione voce "CAPACITÀ FINANZIARIA" separata (resta raggiungibile dal menu a tendina "SERVIZI"), correzione link "CHI SIAMO" (ora punta a `/chi-siamo`), aggiunta automatica voce "FAQ" e "NON SAI QUALE GARANZIA?" su tutte le pagine, pulizia telefono/riga RUI (vedi sotto). **Aggiornamento 20 settembre**: aggiunta anche la voce "ACCEDI AREA PRIVATA" verso `/admin`, vedi §23.

**Nota per chi riprende**: `assets/app.js` contiene diverse funzioni di questo tipo (ricerca testo nel menu → rimuovi/aggiungi/correggi link). Prima di aggiungerne altre, leggere il RAW e capire lo schema esistente invece di duplicare logica.

## Due pagine nuove

- **`chi-siamo.html`** — dati verificabili (RUI Sezione E n. E000437237, iscritto dal 24/01/2013, sede legale) — nessun numero di esperienza inventato.
- **`faq.html`** — griglia di box per categoria (3 colonne desktop, 2 tablet, 1 mobile), `<details>/<summary>` per aprire ogni risposta.

## Pulizia footer e nuovi elementi — via `assets/app.js` e `assets/v9-final.css`

**Nota tecnica importante**: la rimozione di numero di telefono e riga RUI è fatta interamente **a runtime via JavaScript** — l'HTML statico di ogni pagina *contiene ancora* quelle righe nel markup sorgente, ma vengono rimosse dal DOM ad ogni caricamento pagina (flash impercettibile, non un bug). **Non scambiare "presente nell'HTML sorgente" per "visibile sul sito live".**

- **Numero di cellulare personale (328 6382612) rimosso da tutto il sito** — su richiesta di Carmelo.
- **Pulsante "torna su"** — ovale dorato "↑ Torna su", centrato in basso. `initBackToTop()`.
- **Riquadro "Dati societari e iscrizione"** — vedi evoluzione completa in §22 (ulteriore restyle il 19 sera).
- **Riga "Registro Unico degli Intermediari — IVASS"** rimossa dalla barra finale del footer.

## Punti storici — entrambi CHIUSI

### 1. Foto ripetute tra le pagine di tipologia — CHIUSO IL 19 SETTEMBRE 2026

Problema originale: `locazioni-retina-*.webp` (una casa) usata identica per 3 card (Affitti fra Privati, Affitti Commerciali, Rami d'Azienda); `altre-esigenze-retina-*.webp` (penna su documento) usata identica per 3 card (Dogane, Contratti Privati, Altre Fideiussioni).

**Soluzione adottata**: immagini originali generate con Gemini (Nano Banana Pro/2, 21:9, 2K), non foto stock — vincoli espliciti nel prompt (niente volti anche sullo sfondo, niente loghi, niente testo leggibile, niente watermark). ChatGPT/DALL-E scartato all'inizio per risoluzione troppo bassa (826×465px).

**Mappatura finale, tutti i file caricati su GitHub e verificati via RAW:**
- `locazioni-retina-*` (contenuto sostituito, stesso nome file) — consegna chiavi → `locazioni.html`
- `affitti-rami-azienda-retina-*` — stretta di mano/contratto → `affitti-rami-azienda.html`
- `affitti-commerciali-retina-*` — edificio commerciale esterno → `affitti-commerciali.html`
- `dogane-retina-*` — container/porto → `dogane.html` e card corrispondente su `fideiussioni.html`
- `contratti-privati-retina-*` — firma di documento a scrivania (persona sola, laptop e calcolatrice sullo sfondo) → solo card "Contratti Privati" su `fideiussioni.html`

`fideiussioni.html` aggiornato di conseguenza. **Scelta esplicita**: la card "Altre Fideiussioni" resta su `altre-esigenze-retina-*` — è la categoria residuale, un'immagine generica lì è accettata, non un problema.

### 2. Riga "marchio registrato" nel footer — CHIUSO IL 19 SETTEMBRE 2026

"CM Consulting" NON è registrato come marchio presso l'UIBM. Tra le tre alternative proposte, **Carmelo ha scelto: nessuna riga aggiuntiva**. Footer con solo copyright, nessuna modifica al codice necessaria.

---

# 22. LAVORO DELLA SERA DEL 19 SETTEMBRE 2026 — Trasporti→Capacità Finanziaria, footer, logo

## Card "Trasporti" sostituita con "Capacità Finanziaria" — CHIUSO

Carmelo ha notato due problemi collegati: (1) la card "Trasporti" su `fideiussioni.html` portava a uno step generico del form (`richiedi-preventivo.html?tipo=trasporti`) che di fatto duplicava `capacita-finanziaria.html`, già una pagina reale e completa per lo stesso pubblico (autotrasportatori); (2) l'immagine mostrata in quello step del form era la penna generica (`altre-esigenze-retina`), non il camion.

**Correzioni fatte:**
- `fideiussioni.html`: card "Trasporti" → **"Capacità Finanziaria"**, `id="capacita-finanziaria"`, punta direttamente a `/capacita-finanziaria`, usa `assets/capacita-retina-*` (stessa foto della pagina di destinazione, il camion).
- `richiedi-preventivo.html`: rimossa la voce "🚛 Trasporti" dalla schermata di scelta iniziale; aggiunto un redirect automatico (`window.location.replace('/capacita-finanziaria')`) se qualcuno arriva comunque su `?tipo=trasporti` da un link vecchio; corrette anche le mappature immagine rimaste sbagliate per `dogane` (ora `dogane-retina-*`, non più la penna) e `contratti-privati` (ora `contratti-privati-retina-*`) nell'oggetto `typeImages` dello script della pagina.

## Riquadro "Dati societari e iscrizione" — restyle compatto — CHIUSO

Su richiesta di Carmelo, ispirato al footer di un competitor (fideiussioni.online: riga unica, allineata a sinistra, separatori "·"). Implementato in `assets/app.js`, nuova funzione **`simplifyLegalBar()`**, richiamata nel blocco `DOMContentLoaded` insieme alle altre `init*`. Sostituisce l'HTML del blocco `.cm-footer-legalbar` a runtime con un'unica riga: nome azienda, P.IVA/CF, REA, RUI con data, link "Verificabile su IVASS". **Alcuni dati prima presenti nel blocco esteso (Codice Univoco, Sede legale, Sito) non sono più mostrati qui** — restano comunque pubblicati su `/chi-siamo` e `/trasparenza`. Se in futuro serve rimetterli anche nel footer, va riscritta la stringa HTML dentro `simplifyLegalBar()`.

## Tentativo di nuovo logo nel footer — FATTO E ANNULLATO

Carmelo ha esplorato per diverso tempo alternative al logo attuale (non leggibile su sfondo blu senza il suo riquadro bianco), generando varie proposte con Gemini (monogrammi geometrici, un concept a "nodo/infinito" disegnato da Claude in SVG, render fotorealistici argento/oro). **Conclusioni tecniche utili per il futuro, se si riprende il tema:**
- Le immagini generate da Gemini con effetti fotorealistici (bagliori, 3D, pulviscolo) non reggono a 32px (favicon) e non sono vettoriali — verificato più volte riducendo concretamente le immagini.
- Claude non ha uno strumento di generazione immagini in questo ambiente, né uno di vettorizzazione/ricalco automatico — può solo scrivere SVG a mano, adatto a forme geometriche semplici, non a stili calligrafici fluidi.
- Un'immagine che Gemini presenta come "pacchetto di file pronti" (icone .AI/.EPS/.SVG, misure multiple) è comunque una singola immagine PNG/JPEG — quei file vettoriali non esistono davvero, vanno commissionati a un grafico vero.

**Un tentativo concreto è stato caricato sul sito**: `assets/images/logo-cm-consulting-footer.webp` sostituiva il logo **solo nel footer** (sfondo blu, dove il colore di sfondo dell'immagine coincideva quasi esattamente con quello del sito) tramite una funzione `swapFooterLogo()` in `assets/app.js`. **Non piaciuto a Carmelo una volta visto live** (appariva dentro un riquadro bianco esistente nel footer, pensato per il logo attuale) — **annullato la sera del 19 settembre**: `swapFooterLogo()` rimossa da `assets/app.js`, il footer mostra di nuovo il logo originale ovunque. Il file `logo-cm-consulting-footer.webp` resta caricato in `assets/images/` ma non è più referenziato da nessuna pagina (candidato a pulizia futura, non urgente).

**Stato attuale, unico punto aperto reale del progetto**: Carmelo ha deciso di affidare il nuovo logo per l'header a un grafico professionale esterno (contattato su Fiverr, gig `fiverr.com/zubairfb/redesign-your-logo-in-vector`, messaggio con requisiti già inviato). **In attesa dei file di consegna** (preferibilmente `.AI` o `.SVG`). Quando arrivano: verificare che siano vettoriali veri (non immagini rinominate), controllare la leggibilità a 32px, poi integrare nell'header — il logo attuale resta invariato fino ad allora, header e footer.

---

# 23. LAVORO DEL 20 SETTEMBRE 2026 — bug menu/logo, Area Amministratore, audit tecnico completo

## Bug menu ☰ e logo che sborda — CHIUSI

Carmelo, testando il sito sul MacBook, ha segnalato: (1) il logo sbordava visivamente nella fascia blu sotto l'header su certe larghezze di finestra; (2) il menu ☰ non compariva affatto su alcune pagine, e su altre compariva ma cliccandolo non succedeva nulla.

**Diagnosi e correzioni in `assets/v9-final.css`:**
- Il logo aveva un'altezza fissa (74px) mentre l'header ha altezza fluida (clamp 70-88px) senza `overflow:hidden` (necessario per non tagliare il menu a tendina mobile) — quando l'header scendeva sotto i 74px, il logo sporgeva. **Corretto**: `.brand{height:100%}` invece di `height:74px`, segue sempre l'altezza reale dell'header.
- Tra 761px e 1100px di larghezza finestra il sito mostrava il ☰ ma la regola CSS che rende visibile `.links.open` esisteva solo per finestre ≤760px, non per questa fascia intermedia — clic registrato, nessun effetto visibile. **Corretto**: soglia del ☰ spostata a 880px, con la regola `.links.open` ora presente su tutta la fascia in cui il ☰ compare.

**Diagnosi e correzioni sui file HTML — header ridotto (solo logo+HOME, nessun menu):**
Trovate 4 pagine con un header "ridotto" invece di quello standard con menu completo: `privacy.html`, `cookie.html`, `trasparenza.html`, `reclami-e-arbitro-assicurativo.html`. Tutte e 4 corrette con l'header standard (uguale al resto del sito). `404.html` resta intenzionalmente senza header (normale per una pagina di errore, non toccata).

## Pulsanti footer ridondanti rimossi — CHIUSO

I due pulsanti arancioni "Verifica iscrizione RUI" e "Reclami e Arbitro Assicurativo" nella colonna Contatti del footer duplicavano informazioni già presenti altrove nello stesso footer (link "Verificabile su IVASS" nella riga compatta, voce "Reclami e Arbitro Assicurativo" nella colonna Informazioni). Non richiesti in quella forma specifica dalla normativa IVASS — l'obbligo è che l'informazione sia accessibile, non che compaia due volte. Rimossi via nuova funzione `removeRedundantFooterButtons()` in `assets/app.js`.

## Area Amministratore — riscoperta, non era documentata qui — CHIUSO (per oggi)

Carmelo ha chiesto una voce di menu "Accedi area privata". Durante la preparazione è emerso che **esiste già un intero sistema di amministrazione completo e funzionante**, mai documentato in questo registro: login con password + secondo fattore TOTP obbligatorio, sessioni server-side su Redis, gestione pratiche e richieste su database Supabase (`api/admin.js`, cartella `admin/`, documentazione architetturale in `SECURITY-V12.8.md`, root del repo). Il login era bloccato da un controllo di sicurezza legato all'origine della richiesta (variabile `SITE_URL`, impostata correttamente sul dominio Vercel stabile) — il problema era solo che i test venivano fatti su un URL di preview temporaneo (`-deploy-xxxxx.vercel.app`) invece di quello stabile. **Testato e confermato funzionante il 20 settembre** su `https://cm-consulting-v128-security-vercel.vercel.app/admin`.

Aggiunta la voce di menu **"ACCEDI AREA PRIVATA"** (ultima voce, verso `/admin`) in `assets/app.js`, stesso meccanismo delle altre voci di menu.

**Nota di continuità, sullo stesso schema di §18**: come per l'antivirus, un'intera funzionalità completa e testata in passato non era stata scritta in questo registro, causando lavoro di riscoperta. D'ora in poi, ogni volta che si trova un pezzo importante di codice non documentato qui, va aggiunto subito, anche se non richiede modifiche immediate.

## Audit tecnico completo — 20 settembre 2026

Su richiesta di Carmelo, audit approfondito dell'intero progetto (architettura, sicurezza, flusso richieste, conformità IVASS, SEO, concorrenti), consegnato come documento separato `AUDIT-TECNICO-20-SETTEMBRE-2026.md` (fuori dal repository, fornito a Carmelo). Punti aperti emersi, non ancora risolti:

### 1. Flusso email/allegati — DECISIONE DA PRENDERE

Scoperta: `api/submit-request.js` supporta già nativamente allegati reali (upload su Vercel Blob, scansione antivirus fail-closed, invio di un'unica email a Carmelo con dati e allegati veri tramite Resend) — **ma il frontend (`richiedi-preventivo.html`) non usa questa funzione**. Oggi il cliente riceve solo la registrazione testuale della richiesta via `/api/submit-request`, poi deve inviare lui stesso un'email separata (via `mailto:`) con gli allegati — risultato pratico: **due email distinte** per Carmelo invece di una sola completa.

Causa: la scansione antivirus è fail-closed e richiede `CM_ANTIVIRUS_WEBHOOK_URL` configurato (vedi §18) — non configurato per la scelta già presa su Oracle Cloud/ClamAV. Per un'unica email con allegati servirebbe ricollegare il frontend alla funzione già scritta **e** attivare un vero servizio antivirus — possibile alternativa più economica di un server autogestito: un servizio antivirus in cloud a pagamento (es. Cloudmersive, già valutato in una sessione precedente), che evita il problema "carta di credito su piano gratuito" che aveva fatto scartare Oracle. **In attesa della decisione di Carmelo**: tenere il flusso attuale a due email, oppure investire nel ricollegamento + antivirus a pagamento.

### 2. Sitemap.xml da aggiornare

`sitemap.xml` ferma al 27 agosto 2026, mancano `/affitti-commerciali`, `/affitti-rami-azienda`, `/fideiussioni-contratti-privati`, `/chi-siamo`, `/faq` — pagine reali create il 18 settembre. Basso sforzo, da fare appena richiesto.

### 3. Aggiornamento normativo da verificare con un professionista

Trovato che il Modulo Unico Precontrattuale (Allegati 3/4 del Regolamento IVASS 40/2018) è stato aggiornato dal **Provvedimento IVASS n. 147/2024, in vigore dal 1° luglio 2025**. `trasparenza.html` cita solo il Regolamento 40/2018 originale. Da verificare con un consulente compliance/IVASS (fuori dalle competenze di un'IA) se il MUP che Carmelo consegna in pratica ai clienti sia già nel formato aggiornato, e se aggiungere un riferimento esplicito al Provvedimento 147/2024 in `trasparenza.html`.

### 4. Test di sicurezza esterno — raccomandato prima del collegamento Aruba

`SECURITY-V12.8.md` raccomanda esplicitamente un test di sicurezza esterno prima del "deploy definitivo" — non ancora fatto. Da considerare prima di collegare il dominio vero, dato che l'Area Amministratore tratta dati di clienti.

### 5. Dati strutturati Schema.org — miglioramento SEO facoltativo

Assenti (es. `LocalBusiness`/`InsuranceAgency` in home, `FAQPage` in `faq.html`). Migliorerebbero la visibilità nei risultati di ricerca (rich snippet). Non urgente.

### Verifica incrociata con ChatGPT

Consegnato a Carmelo un prompt completo per far verificare in modo indipendente a ChatGPT: conformità IVASS approfondita (in particolare il punto 3 sopra), sicurezza vista da un secondo punto di vista, parole chiave SEO e markup Schema.org pronto da incollare, ricerca di concorrenti Sezione E comparabili. Prompt conservato in `AUDIT-TECNICO-20-SETTEMBRE-2026.md`, sezione finale.
