# STATO-PROGETTO.md
## CM Consulting — Registro tecnico ufficiale

**Ultimo aggiornamento:** 19 settembre 2026  
**Repository:** `migliore50-afk/Cm-Consulting-`  
**Branch:** `main`  
**Deploy:** Vercel — Production  
**Stato:** progetto attivo. Vedi §21 per il lavoro più recente (pagine di tipologia, navigazione, pagine Chi Siamo/FAQ, pulizia footer). Il punto aperto 2 (marchio registrato) è stato chiuso il 19 settembre 2026. Resta aperto solo il punto 1 (foto pagine di tipologia), in lavorazione — vedi aggiornamento in fondo a §21.

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

**Regola di lavoro permanente (dal 19 settembre 2026, valida per tutte le sessioni)**: Claude fornisce sempre i file da caricare come download (non solo testo incollato in chat), Carmelo li carica lui su GitHub (root o `assets`) via drag & drop, e Claude indica sempre il messaggio di commit esatto da usare.

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
- **non dichiarare numeri di esperienza, volumi di pratiche, recensioni o marchi registrati non veritieri — vedi §20 e §21**.

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

---

# 11. FILE IMPORTANTI (aggiornato al 18 settembre 2026)

## HTML — pagine principali
`index.html`, `fideiussioni.html` (hub tipologie), `capacita-finanziaria.html`, `contatti.html`, `chi-siamo.html`, `faq.html`, `richiedi-preventivo.html`, `reclami-e-arbitro-assicurativo.html`, `privacy.html`, `cookie.html`, `trasparenza.html`, `404.html`

## HTML — pagine di tipologia (contenuto reale, vedi §21)
`appalti-pubblici.html`, `dogane.html`, `ambiente.html` ("Beneficiari Pubblici"), `locazioni.html` ("Affitti fra Privati"), `affitti-commerciali.html`, `affitti-rami-azienda.html`, `fideiussioni-contratti-privati.html`

## JavaScript
`assets/app.js` — contiene sia la logica applicativa (carousel, Assistente CM, form) sia diverse funzioni di correzione automatica del menu/footer eseguite a runtime su ogni pagina (vedi §21). Leggere sempre il RAW prima di aggiungere nuova logica simile, per non duplicarla.

## CSS
`assets/style.css` (base), `assets/v9-final.css` (attivo, tutte le correzioni successive)

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

**Stato: CHIUSO.** Il sito non usa più upload diretti di file in nessuna pagina — sostituito da invio documentazione via email dal cliente. Codice backend (`api/_security.js`, `api/attachment-upload-url.js`) non toccato, resta nel repository ma non più richiamato da nessuna pagina HTML.

---

# 19. REDESIGN UX — richiedi-preventivo.html E capacita-finanziaria.html (17 settembre 2026)

**Stato: caricato su `main`, verificato.**

Da 4 step a 2 (`richiedi-preventivo.html`) e da 3 step a 1 (`capacita-finanziaria.html`): spiegazione in linguaggio semplice, campi essenziali sempre visibili, dettagli tecnici in sezione facoltativa, box unico "Documenti necessari e invio" con un solo pulsante che registra la richiesta e apre l'email precompilata. WhatsApp rimosso definitivamente dal flusso documenti (rimandato a quando sarà attiva un'eSIM dedicata). Foto dinamica per tipologia aggiunta. Contenuti di Locazioni verificati con ricerca mirata (garante bancario/assicurativo/altro, distinzione locatore/conduttore, clausola "a prima richiesta" verificata in istruttoria, non chiesta al cliente).

**Redirect `vercel.json`** creati per le vecchie pagine tipologia (poi in parte rimossi il 18 settembre, vedi §21, quando quelle pagine sono state riattivate con contenuto reale).

---

# 20. PIANO ELITE — SUPERAMENTO COMPETITOR (17 settembre 2026)

Analisi comparativa di tre competitor (fideiussioni.online, italiafideiussioni.it, mondocauzioni.it) consegnata come documento separato (`PIANO-ELITE-SUPERAMENTO-COMPETITOR.md`, fuori dal repository).

**Premessa vincolante, vale per sempre**: CM Consulting non può dichiarare scala/numeri/anni di esperienza/recensioni dei competitor (es. "30+ anni", "2.500+ pratiche") senza violare la trasparenza IVASS — nessuna cifra falsa va introdotta. Vale anche per "marchio registrato" (vedi §21 — chiuso il 19 settembre 2026, nessuna riga aggiunta): si scrive solo ciò che è vero e verificabile.

Categoria identificata per espansione futura, non ancora implementata: "Fideiussioni per stranieri" (visti, permessi di soggiorno).


---

# 21. LAVORO DEL 18 SETTEMBRE 2026 — pagine di tipologia, navigazione, pagine nuove, pulizia footer

**Stato generale: la maggior parte è confermata live (verificata via RAW GitHub durante la sessione).**

## Sette pagine di tipologia — contenuto reale, documenti, FAQ, step personalizzati

Confermato live via RAW GitHub:
- `appalti-pubblici.html` — riattivata (era in redirect verso il form)
- `dogane.html` — riattivata
- `ambiente.html` — riattivata come **"Cauzioni per Beneficiari Pubblici"** (titolo/H1 cambiato, URL invariato)
- `locazioni.html` — riattivata come **"Affitti fra Privati"**
- `affitti-commerciali.html` — nuova
- `affitti-rami-azienda.html` — nuova
- `fideiussioni-contratti-privati.html` — nuova (categoria interamente nuova, nessuna vecchia pagina da recuperare)

Ogni pagina ha: H1/H2 per SEO, elenco "Cosa può coprire" (checklist compatta a due colonne, non più box singoli), box "Documenti necessari" (verificati con ricerca mirata, non copiati dai competitor), 4 step "Come funziona la richiesta" personalizzati per tipologia (non più testo generico ripetuto), 2-3 FAQ verificate per categoria, CTA finale verso `/richiedi-preventivo?tipo=X`.

**Conseguenza su `vercel.json`**: tolti i redirect per `appalti-pubblici`, `dogane`, `ambiente`, `locazioni` (avevano senso quando quelle pagine erano solo marketing vuoto duplicato dal form — ora hanno contenuto reale, si sono "riguadagnate" il diritto di esistere). Aggiunti redirect puliti `.html` → versione senza estensione per le stesse quattro pagine e per `appalti.html` → `/appalti-pubblici`.

**`richiedi-preventivo.html`**: aggiunta la tipologia "Contratti privati" (spiegazione, documenti, pulsante nella schermata di scelta) e una terza opzione "Ramo d'azienda" nel toggle di Locazioni (prima solo abitativo/commerciale).

**`fideiussioni.html`** (pagina hub): tutte le card ora puntano alle pagine di contenuto reale, non più direttamente al form. Contiene 9 card: Appalti Pubblici, Affitti fra Privati, Affitti Commerciali, Rami d'Azienda, Trasporti (ancora verso il form, nessuna pagina dedicata), Dogane, Beneficiari Pubblici, Contratti Privati, Altre Fideiussioni.

## Pagina Reclami — riscritta con struttura a 4 passaggi

`reclami-e-arbitro-assicurativo.html` riscritta su richiesta di Carmelo (confrontata con la pagina equivalente di un altro operatore di settore, mondocauzioni.it): prima erano due riquadri densi senza il passaggio "reclamo alla compagnia assicurativa". Ora: 1) Reclamo a CM Consulting (contatti reali, cosa deve contenere, 45 giorni) 2) Reclamo alla Compagnia Assicurativa (dove trovare i contatti — DIP Aggiuntivo) 3) Reclamo all'IVASS (indirizzo/fax/PEC verificati con ricerca web in questa sessione: Via del Quirinale 21, 00187 Roma; fax 06.42133206; PEC tutela.consumatore@pec.ivass.it) 4) Sistemi alternativi — aggiunte **Mediazione civile** (obbligatoria per legge, D.Lgs 28/2010) e **Negoziazione assistita**, assenti prima.

## Navigazione — menu a tendina, voci rimosse/aggiunte, tutto via `assets/app.js`

**Scoperta importante di questa sessione**: il menu a tendina sotto "SERVIZI" (con link a tutte le tipologie) **esisteva già**, presumibilmente da un lavoro precedente non documentato in questo registro — trovato leggendo il RAW di `assets/app.js`, commento datato "17 settembre 2026". Non è stato quindi creato da zero in questa sessione, solo completato.

Tecnica usata per tutte le correzioni al menu: **una sola funzione IIFE in `assets/app.js`** che modifica il DOM del menu a runtime su ogni pagina (nessun file HTML deve essere toccato singolarmente). In questa sessione sono state aggiunte, nello stesso blocco:
- rimozione della voce "FIDEIUSSIONI" separata (restava duplicata col nuovo menu a tendina "SERVIZI")
- rimozione della voce "CAPACITÀ FINANZIARIA" separata (resta raggiungibile dal menu a tendina "SERVIZI")
- correzione del link "CHI SIAMO": puntava a `/#metodo` (sezione homepage sul funzionamento dell'Assistente CM, non una vera pagina "chi siamo") — ora punta a `/chi-siamo`
- aggiunta automatica della voce "FAQ" (se assente) prima di "CONTATTI"
- aggiunta automatica della voce "NON SAI QUALE GARANZIA?" (se assente) — prima presente solo su `index.html`, ora su tutte le pagine

**Nota per chi riprende**: `assets/app.js` contiene ora diverse funzioni di questo tipo (ricerca testo nel menu → rimuovi/aggiungi/correggi link). Prima di aggiungerne altre, leggere il RAW e capire lo schema esistente invece di duplicare logica.

## Due pagine nuove

- **`chi-siamo.html`** — creata perché il vecchio link "CHI SIAMO" non portava a nessun contenuto reale su Carmelo. Contiene solo dati verificabili (RUI Sezione E n. E000437237, iscritto dal 24/01/2013, sede legale, cosa fa CM Consulting) — **nessun numero di esperienza o cifra inventata**, coerente con il vincolo già impostato in §20 sui competitor.
- **`faq.html`** — raccoglie le 16 FAQ già scritte sulle 7 pagine di tipologia. Passata per due redesign su richiesta di Carmelo: prima versione a elenco singola colonna con domande sempre visibili (bocciata, "troppo lunga"); poi versione con `<details>/<summary>` a comparsa ma ancora a colonna unica (bocciata, "voglio dei rettangoli come mondocauzioni"); versione finale e attuale: **griglia di box per categoria** (3 colonne desktop, 2 tablet, 1 mobile), con `<details>/<summary>` dentro ogni box per aprire la risposta al click.

## Pulizia footer e nuovi elementi — via `assets/app.js` e `assets/v9-final.css`

Tutto tramite lo stesso meccanismo automatico (nessun file HTML toccato uno per uno). **Nota tecnica importante (verificata il 19 settembre 2026)**: la rimozione di numero di telefono e riga RUI è fatta interamente **a runtime via JavaScript** (funzione IIFE in `assets/app.js`, blocco `document.querySelectorAll('a[href^="tel:..."]')...remove()` ecc.) — l'HTML statico di ogni pagina *contiene ancora* quelle righe nel markup sorgente, ma vengono rimosse dal DOM ad ogni caricamento pagina, prima che l'utente le veda (effetto collaterale minore: un flash impercettibile, visibile solo con JS disattivato o a un crawler che non esegue JS — non è un bug, è la soluzione scelta per evitare di editare ogni file HTML singolarmente). **Non scambiare "presente nell'HTML sorgente" per "visibile sul sito live" — verificare sempre `assets/app.js` prima di segnalare un problema di questo tipo.**

- **Numero di cellulare personale (328 6382612) rimosso da tutto il sito** — su richiesta esplicita di Carmelo, decisione motivata: non vuole essere chiamato direttamente, il cliente deve usare il form o (in futuro) WhatsApp quando avrà l'eSIM dedicata. Rimosso sia dal footer di ogni pagina sia dal blocco più prominente sulla pagina `/contatti` (struttura HTML diversa, gestita con un secondo selettore).
- **Pulsante "torna su"** aggiunto su ogni pagina (compare dopo scroll, sparisce in cima) — passato per due redesign su richiesta di Carmelo: prima versione cerchio bianco in basso a sinistra (bocciata, "poco evidente"); versione attuale: **ovale dorato con scritta "↑ Torna su", centrato orizzontalmente in basso**. Implementato in `assets/app.js`, funzione `initBackToTop()` — confermato presente e funzionante.
- **Riquadro "Dati societari e iscrizione"** (in fondo a ogni pagina): passato da un unico blocco di testo che scorreva in linea (si sovrapponeva al widget Assistente CM) a una griglia, poi centrato, poi — su ulteriore feedback di Carmelo ("confusionario su 3 colonne", righe di lunghezza diversa disallineavano la griglia) — **a colonna singola centrata**, un campo per riga.
- **Riga "Registro Unico degli Intermediari — IVASS"** rimossa dalla barra finale del footer (sotto il copyright), su richiesta di Carmelo — rimozione a runtime, vedi nota tecnica sopra.
- **Righe vuote "Telefono:", "Email:", "PEC:"** (residuo, senza valore) rimosse dal riquadro dati societari — rimozione a runtime, vedi nota tecnica sopra.

## PUNTI APERTI — non risolti, richiedono azione di Carmelo o una decisione

### 1. Foto ripetute tra le pagine di tipologia — IN LAVORAZIONE (aggiornato 19 settembre 2026)

Verificato con screenshot di Carmelo: la stessa foto (`locazioni-retina-*.webp`, una casa) è usata identica per **tre** card diverse (Affitti fra Privati, Affitti Commerciali, Rami d'Azienda) e la stessa foto (`altre-esigenze-retina-*.webp`, penna su documento) è usata identica per **tre** card diverse (Dogane, Contratti Privati, Altre Fideiussioni).

**Causa del blocco iniziale**: Claude non ha accesso di rete per scaricare foto da internet e non può caricare materiale protetto da copyright su un sito commerciale senza licenza. Scartata anche la ricerca di foto stock generiche via web (risultati quasi tutti a pagamento — Alamy/Dreamstime/iStock).

**Soluzione in corso**: generazione di immagini con Gemini (Nano Banana Pro/2, formato 21:9, risoluzione 2K), non foto stock — con vincoli espliciti nel prompt (niente volti, niente loghi, niente testo leggibile, niente watermark).

**Stato dei singoli file, al 19 settembre 2026:**
- Tentativo iniziale con ChatGPT/DALL-E: risoluzione troppo bassa (826×465px contro i requisiti del sito, 768/1280/1920/2560/3840px) — scartato, si è passati a Gemini.
- **Stretta di mano/contratto** (Gemini, 1584×672px, 21:9) — **approvata da Carmelo**, destinata a `affitti-rami-azienda.html`.
- **Consegna chiavi** (Gemini, 1584×672px, 21:9) — **approvata da Carmelo**, destinata a `locazioni.html`.
- **Edificio commerciale** (tentativo 1, Gemini: mano su planimetrie, 912×1175px verticale, formato sbagliato) — **scartata da Carmelo**, da rigenerare in orizzontale 21:9, destinata a `affitti-commerciali.html`.
- Foto dogane (dogana/porto container) — non ancora tentata con Gemini.

**Nessun file ancora caricato su GitHub, nessun commit fatto** — tutto fermo alla fase di approvazione delle immagini.

**Nota su una mappatura precedente, ora superata**: un primissimo piano (con i prompt dati a ChatGPT, prima di passare a Gemini) assegnava "stretta di mano" a `fideiussioni-contratti-privati.html` e "consegna chiavi" a `affitti-rami-azienda.html`. **Quella mappatura è superata**: la mappatura valida è quella sopra (verificata via RAW GitHub il 19 settembre e confermata con Carmelo). Resta da decidere cosa usare per `fideiussioni-contratti-privati.html` (nel piano attuale non ha ancora una foto dedicata assegnata).

### 2. Riga "marchio registrato" nel footer — CHIUSO IL 19 SETTEMBRE 2026

Carmelo ha notato che un competitor (mondocauzioni.it) scrive "[Sito] è un marchio registrato di [nome]" in fondo alla pagina. **Confermato: "CM Consulting" NON è registrato come marchio presso l'UIBM** — quella frase esatta non si può scrivere. Tra le tre alternative proposte (nessuna riga / riga ancorata alla RUI / riga di proprietà senza la parola "marchio"), **Carmelo ha scelto: nessuna riga aggiuntiva**. Il footer resta con il solo copyright già presente. **Nessuna modifica al codice necessaria — il footer attuale è già conforme alla decisione.**
