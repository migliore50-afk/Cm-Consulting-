# STATO-PROGETTO.md
## CM Consulting — Registro tecnico ufficiale

**Ultimo aggiornamento:** 20 settembre 2026 (sera tarda) — vedi §25 per gli ultimi aggiornamenti (punti 6/7/8, chiarimento MUP)  
**Repository:** `migliore50-afk/Cm-Consulting-`  
**Branch:** `main`  
**Deploy:** Vercel — Production (dominio Aruba non ancora collegato, in attesa — vedi §23 e §24)  
**Stato:** progetto attivo. **LEGGERE PRIMA §24**: la ragione sociale/P.IVA attuale potrebbe cambiare (posizione camerale in riattivazione, il commercialista sta valutando se aprirne una nuova) — non registrare/comunicare nulla di definitivo con l'identità attuale finché non è chiarito. Vedi poi §23 per l'audit tecnico del 20 settembre (bug menu/logo risolti, riscoperta dell'Area Amministratore, sitemap aggiornata, riferimenti normativi reclami aggiornati). Punto aperto storico: nuovo logo per header, affidato a un grafico esterno (Fiverr), in attesa dei file — vedi §22.

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

**Attenzione per chi riprende**: questo registro ha già avuto almeno un caso di "punto chiuso riproposto come aperto" per non aver riletto §18 con attenzione (vedi nota in fondo a §18), e un caso di funzionalità completa non documentata (§23, Area Amministratore). Prima di segnalare un punto come "ancora da fare", verificare sempre se esiste già una sezione che lo chiude. **Leggere §24 per primo, in ogni sessione**: è il punto più critico attualmente aperto.

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

**Azienda:** CM Consulting di Carmelo Migliore – Intermediazione Assicurativa. **Attenzione: nome e P.IVA potrebbero cambiare — vedi §24, punto critico aperto.**

Attività: intermediazione assicurativa come collaboratore RUI Sezione E — vedi §24 per il modello di lavoro reale (raccolta documentazione, valutazione del rischio, collocamento presso l'intermediario collaboratore più idoneo; l'istruttoria e l'emissione della garanzia sono a cura dell'intermediario/compagnia). Ambiti: fideiussioni, appalti pubblici, locazioni, capacità finanziaria per albi trasportatori, dogane, ambiente e altre esigenze.

### Contatti

- email: `info@cm-consulting.info`
- PEC: `carmelo.migliore@legalmail.it`
- **numero di cellulare personale rimosso dal sito il 18 settembre 2026 (vedi §21) — non reinserirlo senza richiesta esplicita di Carmelo; in futuro sarà sostituito da un numero WhatsApp dedicato (eSIM), non ancora attivo**

### Indirizzo attualmente riportato

`Via Spinoza n. 49 - 00137 - Roma`

### Intermediari collaboratori (RUI pubblico, verificato il 20 settembre 2026)

Carmelo Migliore, RUI Sezione E n. E000437237 dal 24/01/2013, collabora con:
- **Cadore Assicurazioni S.r.l.** — Sezione A, n. A000524766 dal 15/12/2015
- **C.B.A. S.r.l. Semplificata** — Sezione B, n. B000511269 dal 20/04/2016

Non pubblicare questo elenco come pagina statica del sito (non richiesto e non opportuno, l'informazione va nel MUP di ogni pratica specifica — vedi §23 punto 3) — è qui solo come riferimento tecnico interno.

### Vincoli

- non riportare il vecchio indirizzo di Pomezia;
- non elencare stabilmente broker/compagnie/intermediari collaboranti sul sito pubblico;
- mantenere impostazione moderna e professionale;
- rispettare gli obblighi IVASS;
- non modificare parti non richieste;
- **non dichiarare numeri di esperienza, volumi di pratiche, recensioni o marchi registrati non veritieri — vedi §20 e §21**;
- **non introdurre servizi/infrastrutture di terzi che richiedano dati di una carta di debito/credito, anche se il piano è "gratuito"** — vedi §18, motivazione esplicita;
- **non usare la parola "consulenza" per descrivere l'attività a meno che non si tratti di vera consulenza formale ai sensi dell'art. 59 del Regolamento IVASS 40/2018** — vedi §23 e §24. Usare invece "assistenza", "orientamento", "individuiamo la soluzione più adatta" ecc.;
- **non presentare pubblicamente né fatturare un servizio di consulenza/assistenza a pagamento separato dalla provvigione finché non verificato su tre fronti indipendenti** (commercialista, intermediari collaboratori, conformità IVASS) — vedi §24.

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
`vercel.json` — redirect delle vecchie URL e header di sicurezza (HSTS, CSP, X-Frame-Options DENY, ecc. — verificati presenti e corretti il 20 settembre, vedi §23). `sitemap.xml` e `robots.txt` in root — **sitemap aggiornata il 20 settembre 2026, tutte le pagine presenti**.

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

Il sito non usa più upload diretti di file in nessuna pagina — sostituito da invio documentazione via email dal cliente (flusso a due email separate, vedi §23 punto 1). Codice backend (`api/_security.js`, `api/attachment-upload-url.js`, `api/submit-request.js`) non toccato, resta nel repository completo e funzionante ma non richiamato dal frontend attuale.

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

`reclami-e-arbitro-assicurativo.html` riscritta su richiesta di Carmelo (confrontata con la pagina equivalente di un altro operatore di settore, mondocauzioni.it): prima erano due riquadri densi senza il passaggio "reclamo alla compagnia assicurativa". Ora: 1) Reclamo a CM Consulting (contatti reali, cosa deve contenere, 45 giorni) 2) Reclamo alla Compagnia Assicurativa (dove trovare i contatti — DIP Aggiuntivo) 3) Reclamo all'IVASS (indirizzo/fax/PEC verificati con ricerca web in questa sessione: Via del Quirinale 21, 00187 Roma; fax 06.42133206; PEC tutela.consumatore@pec.ivass.it) 4) Sistemi alternativi — aggiunte **Mediazione civile** (obbligatoria per legge, D.Lgs 28/2010) e **Negoziazione assistita**, assenti prima. **Aggiornamento 20 settembre, vedi §23**: riferimenti normativi aggiornati con il Provvedimento IVASS 163/2025.

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

# 23. LAVORO DEL 20 SETTEMBRE 2026 — bug menu/logo, Area Amministratore, audit tecnico, verifica incrociata ChatGPT

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

## Audit tecnico completo + verifica incrociata con ChatGPT ("staffetta")

Su richiesta di Carmelo, audit approfondito dell'intero progetto (architettura, sicurezza, flusso richieste, conformità IVASS, SEO, concorrenti), consegnato come documento separato `AUDIT-TECNICO-20-SETTEMBRE-2026.md` (fuori dal repository). L'audit includeva anche un prompt per far verificare la stessa analisi in modo indipendente da ChatGPT. **Diverse correzioni proposte da ChatGPT sono state verificate una per una con ricerche mirate (non accettate per fiducia) prima di essere applicate** — dettaglio sotto.

### 1. Flusso email/allegati — ANCORA APERTO, decisione da prendere

`api/submit-request.js` supporta già nativamente allegati reali (upload su Vercel Blob, scansione antivirus fail-closed, invio di un'unica email a Carmelo con dati e allegati veri tramite Resend) — **ma il frontend (`richiedi-preventivo.html`) non usa questa funzione**. Oggi il cliente riceve solo la registrazione testuale della richiesta via `/api/submit-request`, poi deve inviare lui stesso un'email separata (via `mailto:`) con gli allegati — risultato pratico: **due email distinte** per Carmelo invece di una sola completa.

Causa: la scansione antivirus è fail-closed e richiede `CM_ANTIVIRUS_WEBHOOK_URL` configurato (vedi §18) — non configurato per la scelta già presa su Oracle Cloud/ClamAV. Per un'unica email con allegati servirebbe ricollegare il frontend alla funzione già scritta **e** attivare un vero servizio antivirus — possibile alternativa più economica di un server autogestito: un servizio antivirus in cloud a pagamento (es. Cloudmersive), che evita il problema "carta di credito su piano gratuito" che aveva fatto scartare Oracle. **In attesa della decisione di Carmelo.**

### 2. Sitemap.xml — CHIUSO IL 20 SETTEMBRE 2026

Aggiornata con le 5 pagine che mancavano (`/affitti-commerciali`, `/affitti-rami-azienda`, `/fideiussioni-contratti-privati`, `/chi-siamo`, `/faq`) e date `lastmod` corrette per le pagine modificate di recente. Caricata e verificata su GitHub.

### 3. Riferimenti normativi — parzialmente CHIUSO, resta un controllo operativo

**Verifica incrociata con ChatGPT, fatta con ricerche mirate una per una (non solo lette per buone):**
- **Confermato reale**: Provvedimento IVASS n. 163 del 25 novembre 2025 — modifica l'art. 79 del Regolamento 40/2018 (comma 1, lettera e) imponendo di indicare sul sito la facoltà di ricorso all'Arbitro Assicurativo con link diretto, oltre ai recapiti reclami. `reclami-e-arbitro-assicurativo.html` sostanzialmente già rispettava il contenuto — **aggiornati i riferimenti normativi** (sottotitolo pagina + paragrafo finale) per citare esplicitamente il Provvedimento 163/2025. Caricato e verificato.
- **Confermato reale ma non pertinente qui**: Provvedimento IVASS n. 169/2026 (15 gennaio 2026) esiste davvero e ha aggiornato MUP/DIP, ma riguarda il **diritto all'oblio oncologico** (dichiarazioni sanitarie in polizze vita/salute) — non applicabile alle fideiussioni/cauzioni di CM Consulting. Non aggiunto da nessuna parte sul sito, correttamente.
- **Confermato reale**: obbligo per ogni persona fisica iscritta al RUI di comunicare a IVASS il dominio del proprio sito (Regolamento 40/2018, artt. 5/78, come modificati dal Provvedimento 128/2023, in vigore dal 2023) — **Carmelo ha confermato di non averlo ancora fatto**, scelta consapevole rimandata a "progetto finito" (vedi anche §24). Verificato che il campo "Sito internet" sul profilo RUI pubblico di Carmelo è oggi vuoto, coerente.
- **Resta da fare, operativo non sul sito**: verificare che il MUP effettivamente usato nelle pratiche sia aggiornato ai Provvedimenti 147/2024 + 163/2025 (non 169/2026, non pertinente). Va verificato con un professionista, non è compito di un'IA. **Collegato a §24**: ha senso pieno solo una volta chiarita quale entità (P.IVA attuale o nuova) userà quel MUP.

### 4. Test di sicurezza esterno — raccomandazione, non obbligo IVASS automatico

`SECURITY-V12.8.md` lo raccomanda prima del "deploy definitivo" — non ancora fatto. ChatGPT ha correttamente ridimensionato: non risulta un obbligo generale IVASS per un piccolo intermediario Sezione E; resta comunque una buona pratica di sicurezza da considerare prima di collegare il dominio vero, dato che l'Area Amministratore tratta dati di clienti.

### 5. Header di sicurezza HTTP — CHIUSO, verificato presente

Verifica diretta di `vercel.json`, confermato: HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, Content-Security-Policy (più restrittiva sull'area `/admin`, senza `unsafe-inline` sugli script lì). Correzione rispetto alla prima stesura dell'audit, che li segnalava come "da verificare".

### 6. Linguaggio "consulenza" — CHIUSO IL 20 SETTEMBRE, con chiarimento importante di Carmelo

Frasi verificate una per una nel codice (confermate reali, non ipotetiche): "Consulenza dedicata per operazioni complesse" (`affitti-rami-azienda.html`), "Individuiamo la soluzione più adatta" (`locazioni.html`), "Segui la tua pratica direttamente con me" (`chi-siamo.html`), "ti indicheremo il percorso giusto" (`richiedi-preventivo.html`).

**Chiarimento di Carmelo sul suo modello di lavoro reale**: raccoglie la documentazione dal cliente, valuta il tipo di rischio da collocare, individua l'intermediario collaboratore più idoneo (Cadore per sezione A, C.B.A. per sezione B — vedi §3), e trasmette la pratica — è l'intermediario/compagnia a fare l'istruttoria e l'eventuale emissione della garanzia. Questo corrisponde all'attività di valutazione delle esigenze del cliente prevista dall'art. 58 del Regolamento IVASS 40/2018, **non** a una consulenza assicurativa formale ai sensi dell'art. 59 (che richiederebbe una dichiarazione di analisi imparziale su un numero sufficiente di contratti/fornitori del mercato — difficilmente sostenibile con soli due intermediari collaboratori).

**Correzione fatta**: solo "Consulenza dedicata" → "Assistenza dedicata" in `affitti-rami-azienda.html` (unica occorrenza con la parola specifica disciplinata dalla norma). Le altre tre frasi restano invariate: descrivono correttamente assistenza ordinaria, non consulenza formale.

**Punto collegato emerso durante la discussione, vedi §24**: Carmelo ha chiesto se potrebbe in futuro fatturare separatamente un servizio di analisi/assistenza al cliente, oltre alla provvigione — **non implementato, in attesa di tre verifiche indipendenti** (commercialista, intermediari collaboratori, conformità IVASS). Nessuna modifica al sito su questo finché non chiarito.

---

# 24. PUNTO CRITICO — POSSIBILE CAMBIO DI RAGIONE SOCIALE/P.IVA (20 settembre 2026)

**Stato: APERTO — il più importante di tutto il progetto, sopra a qualunque altro punto elencato in questo registro. Leggere questa sezione per prima in ogni nuova sessione, prima di §22 e §23.**

## Cosa è emerso

La posizione camerale attuale di CM Consulting **risulta oggi inattiva**. Carmelo la sta riattivando con il commercialista per riprendere l'attività di intermediazione assicurativa (fideiussioni), dopo un periodo in cui ha lavorato come venditore di automobili. Il commercialista conferma che si può fare, ma **sta ancora valutando se convenga**:

- **riattivare l'attuale impresa individuale** (stessa P.IVA 14416401009, stesso nome "CM Consulting di Carmelo Migliore"), oppure
- **chiuderla e aprirne una nuova** per questo progetto.

Se sarà aperta una nuova impresa, **cambieranno quasi certamente sia il nome sia la Partita IVA** attualmente scritti in tutto il sito (footer di ogni pagina, `chi-siamo.html`, `trasparenza.html`, `contatti.html`, meta-tag, eventuali fatture). Ancora nessuna certezza: si attende la risposta del commercialista.

## Perché è collegato ad altri punti di questo registro

Questo spiega retroattivamente alcune scelte prudenti già prese da Carmelo, che ora risultano più motivate di quanto sembrasse:
- §22/§23 — motivo aggiuntivo per cui la comunicazione del dominio `cm-consulting.info` a IVASS è stata rimandata "a progetto finito": se cambia la P.IVA, cambierebbe anche l'intermediario titolare da comunicare.
- §23 punto 3 — la verifica del MUP operativo ha senso pieno solo una volta chiarita quale entità (attuale o nuova) lo utilizzerà.
- Emerso anche un tema collegato ma distinto: Carmelo valuta se strutturare un compenso separato ("analisi documentale/assistenza alla collocazione del rischio") oltre alla provvigione da intermediazione — **prima di qualunque fattura in tal senso**, servono tre verifiche indipendenti, nessuna delle quali è di competenza di un'IA: (1) commercialista, per il corretto trattamento fiscale/IVA (le provvigioni di intermediazione sono tipicamente esenti IVA, una "consulenza" generica no); (2) Cadore Assicurazioni S.r.l. e C.B.A. S.r.l. Semplificata (i due intermediari con cui Carmelo collabora, sezioni A e B — vedi §3), per verificare se un compenso separato fatturato direttamente al cliente finale è compatibile con gli accordi di collaborazione in essere; (3) se si dichiara "consulenza" formale ai sensi dell'art. 59 del Regolamento IVASS 40/2018, si attivano obblighi specifici di raccomandazione personalizzata che oggi il sito non è strutturato per soddisfare.

## Cosa fare nel frattempo — regola pratica

- **Si può continuare** a lavorare su struttura del sito, contenuti, sicurezza, funzionalità, SEO: nessuno di questi dipende dal nome/P.IVA finale ed è comunque lavoro utile.
- **Non registrare o comunicare nulla che leghi in modo definitivo l'identità attuale** finché non arriva la risposta del commercialista: niente comunicazione del dominio a IVASS (già sospesa), niente fatture reali (né di provvigione extra né di "consulenza"), attenzione a non presentare pubblicamente un servizio di consulenza a pagamento sul sito prima che il modello sia chiarito su tutti e tre i fronti sopra elencati.
- Quando arriva la risposta del commercialista: se cambia P.IVA/nome, sarà necessario un aggiornamento sistematico di tutti i dati identificativi sul sito (footer, chi-siamo, trasparenza, contatti, meta-tag) — lavoro meccanico ma da fare con attenzione, un file alla volta, verificando ogni pagina.

**Nota per chi riprende**: se in una sessione futura sembra che questo punto sia stato dimenticato, è probabilmente perché non è stato riletto — controllare sempre questa sezione prima di procedere con qualunque modifica ai dati identificativi (P.IVA, REA, nome) o con la comunicazione del dominio a IVASS.

---

# 25. AGGIORNAMENTI DEL 20 SETTEMBRE 2026 (SERA TARDA) — punti 6/7/8, chiarimento MUP

## Punto 6 (email con allegati) — MESSO IN PAUSA, collegato a §24

Carmelo ha giustamente osservato che, con il flusso attuale a due email separate, l'antivirus non serve affatto: il documento arriva direttamente nella sua casella di posta, mai sui server del sito, quindi la protezione della sua email/il suo antivirus personale sono sufficienti per quel percorso. L'antivirus (Cloudmersive o simile) servirebbe solo se si sceglie di far transitare il file sui server (Vercel Blob) per comporre un'unica email automatica.

**Decisione presa**: aspettare l'esito con il commercialista (§24) prima di decidere ed eventualmente registrarsi a un servizio come Cloudmersive — per non dover rifare la registrazione con nome/email diversi se cambierà la ragione sociale. **Nessun lavoro di sviluppo iniziato su questo punto.**

Nota tecnica raccolta nel frattempo, utile quando si riprenderà: Cloudmersive offre 600 controlli antivirus gratuiti al mese, senza scadenza (verificato con ricerca il 20 settembre) — se il volume di richieste di CM Consulting resta contenuto, potrebbe restare gratuito. Non confermato con certezza se la registrazione gratuita richieda una carta di credito: da verificare al momento dell'iscrizione, prima di inserire qualsiasi dato di pagamento (stesso principio già applicato a Oracle Cloud, vedi §18).

## Punto 7 (test di sicurezza esterno) — CHIUSO, non di interesse per Carmelo

Carmelo ha deciso di non procedere. Nessuna azione necessaria. Se il tema dovesse riemergere in futuro, ripartire da qui: già valutato e scartato consapevolmente il 20 settembre 2026.

## Punto 8 (pulizia file storici in root) — IN CORSO, istruzioni date

Lista definitiva confermata (14 file, verificata contro il contenuto reale di `main`): `AUDIT-V12.6-FINALE.md`, `AUDIT-V12.7-FINALE.md`, `README-V12.7.md`, `README-V12.8-SECURITY.md`, `ASSET-AUDIT-V11.txt`, `ASSET-RECUPERATI.txt`, `CONTROLLO-TECNICO-V9.txt`, `PUBBLICAZIONE-CHECKLIST.txt`, `AUDIT-ASSISTENTE-V12.6.1.md`, `VERSION-DEFINITIVA.txt`, `VERSION-LOGO-FINALE.txt`, `VERSION-SECURITY-FINALE.txt`, `VERSION-UX-GENERIC.txt`, `VERSION.txt`.

**Esplicitamente esclusi**: `AMBIENTE-PHOTO-AUDIT-V12.3.txt` (non fa parte del gruppo), `SECURITY-V12.8.md` (documentazione architetturale ancora attiva, citata in questo registro — resta in root), `README.md` (file corrente, non storico).

Destinazione: `docs/archivio/` (cartella `docs/` già esistente in root), stesso nome file, un solo commit (`chore: archivia file storici in docs/archivio`) tramite l'editor github.dev (tasto "." sulla pagina del repository), non tramite 14 modifiche separate. **In attesa che Carmelo esegua lo spostamento e confermi.**

## Chiarimento sul MUP — aggiornamento rispetto a §23 punto 3

Carmelo ha chiarito un punto importante: **non ha mai usato un Modulo Unico Precontrattuale nelle pratiche passate, e non ne conosceva l'esistenza**. Non sa se questo dipendesse dal fatto che non fosse applicabile al tipo di fideiussioni trattate, o se la documentazione precontrattuale fosse gestita direttamente da Cadore/C.B.A. come intermediari titolari.

**Non trattare questo come una violazione accertata** — è un punto da chiarire, non un errore confermato. La domanda concreta da porre a Cadore e C.B.A. (non risolvibile da un'IA, serve la loro conferma sul rapporto di collaborazione specifico): chi consegna il MUP e la documentazione precontrattuale nel loro accordo con Carmelo come collaboratore Sezione E, e quale modello va usato oggi per le fideiussioni, aggiornato ai Provvedimenti IVASS più recenti. **Nessuna modifica al sito su questo finché Carmelo non ha una risposta** — richiesta esplicita di Carmelo di non fare supposizioni.

## Nota su accesso in scrittura — chiarimento per chi riprende

Carmelo ha chiesto se Claude o ChatGPT potessero eseguire da soli le modifiche su GitHub (es. lo spostamento file del punto 8), invece di fargli fare i passaggi manuali. Confermato: **Claude in questa chat ha solo accesso in lettura a GitHub** (vedi §5-bis, causa già diagnosticata). Non è possibile verificare da qui se un'istanza di ChatGPT in un'altra conversazione abbia invece accesso in scrittura — dipende dagli strumenti che Carmelo ha eventualmente collegato al suo account ChatGPT, informazione che va chiesta direttamente a ChatGPT stesso in quella conversazione.
