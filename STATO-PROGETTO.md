# STATO-PROGETTO.md
## CM Consulting — Registro tecnico ufficiale

**Ultimo aggiornamento:** 19 settembre 2026 (sera)  
**Repository:** `migliore50-afk/Cm-Consulting-`  
**Branch:** `main`  
**Deploy:** Vercel — Production  
**Stato:** progetto attivo. Tutti i punti aperti storici di §21 sono chiusi. Vedi §22 per il lavoro della sera del 19 settembre (correzione Trasporti, footer, tentativo di nuovo logo poi annullato). Unico punto realmente aperto: nuovo logo per header, affidato a un grafico esterno (Fiverr), in attesa dei file — vedi §22.

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

**Attenzione per chi riprende**: questo registro ha già avuto almeno un caso di "punto chiuso riproposto come aperto" per non aver riletto §18 con attenzione (vedi nota in fondo a §18). Prima di segnalare un punto come "ancora da fare", verificare sempre se esiste già una sezione che lo chiude.

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

---

# 11. FILE IMPORTANTI (aggiornato al 19 settembre 2026 sera)

## HTML — pagine principali
`index.html`, `fideiussioni.html` (hub tipologie), `capacita-finanziaria.html`, `contatti.html`, `chi-siamo.html`, `faq.html`, `richiedi-preventivo.html`, `reclami-e-arbitro-assicurativo.html`, `privacy.html`, `cookie.html`, `trasparenza.html`, `404.html`

## HTML — pagine di tipologia (contenuto reale, vedi §21)
`appalti-pubblici.html`, `dogane.html`, `ambiente.html` ("Beneficiari Pubblici"), `locazioni.html` ("Affitti fra Privati"), `affitti-commerciali.html`, `affitti-rami-azienda.html`, `fideiussioni-contratti-privati.html`

## JavaScript
`assets/app.js` — contiene sia la logica applicativa (carousel, Assistente CM, form) sia diverse funzioni di correzione automatica del menu/footer eseguite a runtime su ogni pagina (vedi §21 e §22). Leggere sempre il RAW prima di aggiungere nuova logica simile, per non duplicarla. Funzioni runtime attive nel blocco `DOMContentLoaded`: `initMenu`, `initSlider`, `initAssistantUI`, `initAssistantFab`, `initAssistantFabFooterHide`, `initClickableCards`, `initBasicFormValidation`, `initBackToTop`, `simplifyLegalBar`, più l'IIFE `initServiziDropdown` in fondo al file (menu SERVIZI, pulizia telefono/RUI). **Nessuna funzione di sostituzione logo attiva** (rimossa la sera del 19 settembre, vedi §22).

## CSS
`assets/style.css` (base), `assets/v9-final.css` (attivo, tutte le correzioni successive)

## Immagini (aggiornato al 19 settembre 2026 sera — vedi §21 punto 1 e §22 per la storia completa)
Ogni asset segue lo schema `<stem>-retina-<768|1280|1920|2560|3840>.webp`. Stem attivi: `appalti`, `autotrasportatori`, `capacita`, `ambiente`, `altre-esigenze` (condiviso solo da "Altre Fideiussioni", scelta voluta), `locazioni`, `affitti-commerciali`, `affitti-rami-azienda`, `dogane`, `contratti-privati`. Foto generate con Gemini (Nano Banana Pro/2), non foto stock. Logo: `assets/images/logo-cm-consulting.webp` (attuale, header e footer, invariato) — un tentativo di sostituirlo nel solo footer è stato fatto e annullato, vedi §22.

## Configurazione
`vercel.json` — redirect delle vecchie URL; aggiornato il 18 settembre 2026 quando le pagine di tipologia sono state riattivate (vedi §21)

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

**Stato: CHIUSO E DEFINITIVO — non riaprire senza una richiesta esplicita e nuova di Carmelo.**

Il sito non usa più upload diretti di file in nessuna pagina — sostituito da invio documentazione via email dal cliente. Codice backend (`api/_security.js`, `api/attachment-upload-url.js`) non toccato, resta nel repository ma non più richiamato da nessuna pagina HTML.

**Motivazione esplicita (confermata da Carmelo il 19 settembre 2026, non era scritta chiaramente qui prima d'ora)**: l'ipotesi era ospitare un antivirus ClamAV reale su un server Oracle Cloud a livello gratuito ("Always Free"). Oracle richiede comunque i dati di una carta di debito/credito anche per il piano gratuito. Carmelo ha deciso di non procedere per il rischio concreto che, se in futuro Oracle cambiasse le condizioni del piano gratuito, la carta collegata potrebbe subire addebiti senza un'azione esplicita da parte sua. Si è quindi scelto di eliminare l'esigenza stessa (niente upload diretto sul sito, quindi niente bisogno di un antivirus) invece di accettare quel rischio finanziario per una funzione non essenziale al business.

**Nota di continuità**: in una sessione precedente (inizio del 19 settembre) questo punto era stato erroneamente reintrodotto come "ancora da verificare" — era già chiuso da tre giorni. Non ripetere l'errore: se emerge di nuovo il tema "antivirus" o "upload diretto", il punto di partenza è questa sezione, chiusa, non una nuova valutazione da zero.

---

# 19. REDESIGN UX — richiedi-preventivo.html E capacita-finanziaria.html (17 settembre 2026)

**Stato: caricato su `main`, verificato.** Vedi anche §22 per un'ulteriore correzione a `richiedi-preventivo.html` (rimozione opzione "Trasporti") fatta il 19 settembre sera.

Da 4 step a 2 (`richiedi-preventivo.html`) e da 3 step a 1 (`capacita-finanziaria.html`): spiegazione in linguaggio semplice, campi essenziali sempre visibili, dettagli tecnici in sezione facoltativa, box unico "Documenti necessari e invio" con un solo pulsante che registra la richiesta e apre l'email precompilata. WhatsApp rimosso definitivamente dal flusso documenti (rimandato a quando sarà attiva un'eSIM dedicata). Foto dinamica per tipologia aggiunta. Contenuti di Locazioni verificati con ricerca mirata (garante bancario/assicurativo/altro, distinzione locatore/conduttore, clausola "a prima richiesta" verificata in istruttoria, non chiesta al cliente).

**Redirect `vercel.json`** creati per le vecchie pagine tipologia (poi in parte rimossi il 18 settembre, vedi §21, quando quelle pagine sono state riattivate con contenuto reale).

---

# 20. PIANO ELITE — SUPERAMENTO COMPETITOR (17 settembre 2026)

Analisi comparativa di tre competitor (fideiussioni.online, italiafideiussioni.it, mondocauzioni.it) consegnata come documento separato (`PIANO-ELITE-SUPERAMENTO-COMPETITOR.md`, fuori dal repository).

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

Tecnica usata per tutte le correzioni al menu: **una sola funzione IIFE in `assets/app.js`** (`initServiziDropdown`) che modifica il DOM del menu a runtime su ogni pagina (nessun file HTML deve essere toccato singolarmente). Include: rimozione voce "FIDEIUSSIONI" separata, rimozione voce "CAPACITÀ FINANZIARIA" separata (resta raggiungibile dal menu a tendina "SERVIZI"), correzione link "CHI SIAMO" (ora punta a `/chi-siamo`), aggiunta automatica voce "FAQ" e "NON SAI QUALE GARANZIA?" su tutte le pagine, pulizia telefono/riga RUI (vedi sotto).

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
