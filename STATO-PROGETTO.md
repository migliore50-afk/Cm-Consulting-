# STATO-PROGETTO.md
## CM Consulting — Registro tecnico ufficiale

**Ultimo aggiornamento:** 9 settembre 2026  
**Repository:** `migliore50-afk/Cm-Consulting-`  
**Branch di riferimento:** `main`  
**Deploy:** Vercel — Production

---

## 1. SCOPO DEL FILE

Questo file è il **registro tecnico ufficiale del progetto CM Consulting**.

Serve a mantenere la continuità del lavoro tra chat diverse e tra assistenti diversi, in particolare **ChatGPT e Claude**.

Il contenuto di questo file ha priorità rispetto alla memoria della singola conversazione. Ogni assistente che lavora sul progetto deve leggerlo prima di intervenire.

La copia su GitHub, nel branch `main`, è il riferimento ufficiale dello stato del progetto.

È inoltre presente una copia di sicurezza sul PC dell'utente, nella cartella:

`Sito cm consulting with CHATGPT`

---

## 2. REGOLE PER CHATGPT E CLAUDE

Queste regole valgono per **qualsiasi assistente AI** che lavori sul progetto.

### Prima di qualsiasi modifica

1. Leggere `STATO-PROGETTO.md` direttamente dal branch `main` di GitHub.
2. Verificare il RAW attuale dei file interessati.
3. Controllare il contesto completo del codice prima di modificare.
4. Non basarsi su copie locali, memoria della chat precedente o supposizioni.
5. Identificare prima il problema reale.
6. Procedere una sola correzione alla volta.
7. Modificare esclusivamente ciò che è necessario.
8. Non modificare file o righe non coinvolti.
9. Dopo la modifica, verificare il risultato.
10. Dopo il commit, verificare il deploy Vercel.

### Regola di continuità

Se si apre una nuova chat, l'assistente deve usare questo file per capire:

- cosa è già stato fatto;
- cosa è ancora da fare;
- quali file sono importanti;
- quali correzioni sono già pubblicate;
- quali correzioni sono soltanto pianificate;
- quali vincoli devono essere rispettati.

### Regola di sicurezza

Se il contenuto del RAW corrente di GitHub non è disponibile o è troncato, **non ricostruire il file completo basandosi su una copia vecchia**.

In quel caso bisogna fermarsi, recuperare il contenuto necessario oppure chiedere all'utente il file completo.

---

## 3. PROCEDURA OPERATIVA CONCORDATA

Per ogni correzione:

1. audit del problema;
2. verifica del file attuale su GitHub;
3. identificazione esatta della modifica;
4. preparazione del file completo, quando necessario;
5. indicazione del nome esatto del file;
6. indicazione del messaggio esatto del commit;
7. upload tramite GitHub → **Add file → Upload files**;
8. commit direttamente su `main`;
9. verifica del commit;
10. verifica Vercel → **Production → Ready**;
11. aggiornamento di questo registro quando la correzione è realmente conclusa.

### Commit

Ogni correzione indipendente deve avere un commit separato.

Non raggruppare modifiche diverse in un unico commit se non espressamente deciso.

---

## 4. GESTIONE DELLA FINE DELLA CHAT

La capacità residua della conversazione non è rappresentata da un contatore preciso visibile all'assistente.

Pertanto non bisogna aspettare necessariamente che la chat sia completamente piena.

Quando la conversazione diventa molto lunga o quando viene concluso un blocco importante di lavoro, l'assistente deve valutare se è opportuno salvare lo stato.

Quando è opportuno, deve avvisare l'utente con un messaggio del tipo:

**"Prima di continuare, aggiorniamo STATO-PROGETTO.md."**

L'assistente deve quindi preparare un **nuovo file completo** `STATO-PROGETTO.md`, pronto per essere scaricato.

L'utente deve:

1. scaricare il nuovo file;
2. sostituire la copia precedente sul PC;
3. sostituire la copia precedente su GitHub;
4. fare il commit su `main`.

L'assistente deve indicare sempre il nome esatto del file e il messaggio esatto del commit.

### Importante

Non promettere un rilevamento matematico della percentuale di spazio residuo della chat.

L'obiettivo è evitare la perdita di contesto tramite aggiornamenti preventivi del registro.

---

## 5. CORREZIONI GIÀ PUBBLICATE E VERIFICATE

### Homepage — link FIDEIUSSIONI
**File:** `index.html`

Correzione:
- il link `FIDEIUSSIONI` della homepage è stato portato da `/appalti-pubblici` a `/fideiussioni`.

**Commit:** `Corregge homepage e link FIDEIUSSIONI`  
**Commit breve:** `ab6bdc5`  
**Deploy:** Production → Ready

---

### Footer Appalti pubblici
**File:** `appalti-pubblici.html`

Correzione:
- titolo della prima colonna footer da `Fideiussioni` a `CM Consulting`.

**Commit:** `Corregge titolo footer Appalti pubblici`  
**Commit breve:** `a651e2b`  
**Deploy:** Production → Ready

---

### Footer pagina 404
**File:** `404.html`

Correzione:
- titolo della prima colonna footer da `Fideiussioni` a `CM Consulting`.

**Commit:** `Corregge titolo footer pagina 404`  
**Commit breve:** `78a7846`  
**Deploy:** Production → Ready

---

### Navigazione servizi Appalti pubblici
**File:** `appalti-pubblici.html`

Correzione:
- `ambiente.html` → `/ambiente`
- `fideiussioni.html` → `/fideiussioni`
- `capacita-finanziaria.html` → `/capacita-finanziaria`

**Commit:** `Corregge navigazione servizi Appalti pubblici`  
**Commit breve:** `dd0472d`  
**Deploy:** Production → Ready

---

### CSS — hero e footer
**File:** `assets/v9-final.css`

Correzione pubblicata:
- rimossa la regola globale che applicava un bordo bianco al media hero;
- mantenuta la correzione relativa allo stile footer.

**Commit:** `Ripristina stile footer e mantiene correzione hero`  
**Commit breve:** `fa98593`  
**Deploy:** Production → Ready

Nota: la correzione strutturale successiva relativa a `.hero-stage picture` è separata e non deve essere considerata già applicata.

---

### Carousel homepage — gestione del cambio immagine
**File:** `assets/app.js`

La funzione `paintSlide()` è stata corretta per evitare problemi durante il cambio delle immagini responsive.

La versione attuale comprende:
- preload con lo stesso `srcset` e `sizes` della slide;
- uso di `decode()` quando disponibile;
- aggiornamento di `<source>` prima di `<img>`;
- doppio `requestAnimationFrame()` prima della rimozione della classe `fade`.

Non modificare nuovamente `paintSlide()` senza una nuova verifica del comportamento reale.

---

### Assistente — FAB/footer
**File:** `assets/app.js`

È presente `initAssistantFabFooterHide()` e il relativo avvio tramite `DOMContentLoaded`.

**NON rimuovere o alterare questa funzione** durante correzioni non correlate.

---

### Appalti — destinazione dell'assistente
**File:** `assets/app.js`

La voce `appalto` nella mappa `aiChoose` attualmente punta a:

`appalti-pubblici.html`

Questo ha eliminato la precedente referenza a `appalti.html`.

---

## 6. PROBLEMI ANCORA APERTI

### A. Struttura `.hero-stage picture`
**File:** `assets/v9-final.css`

Correzione identificata ma **NON ancora applicata**.

Struttura attuale verificata:

```css
.hero-stage picture{
  width:100%;
  height:100%
}
```

Correzione prevista:

```css
.hero-stage picture{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  display:block;
  margin:0;
  padding:0;
}
```

Vincoli:
- non modificare `.hero-stage picture img`;
- non modificare `.hero-stage` base;
- non modificare `assets/app.js`;
- non modificare altri blocchi CSS.

Prima di applicare la correzione, verificare nuovamente il RAW corrente di `assets/v9-final.css`.

---

### B. Titoli footer da uniformare

Obiettivo:
la prima colonna del footer deve avere `<h3>CM Consulting</h3>`.

**Già corretti:**
- `404.html`
- `ambiente.html`
- `appalti-pubblici.html`
- `dogane.html`
- `locazioni.html`

**Ancora da correggere:**
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

Ogni correzione deve essere effettuata separatamente, con un commit distinto.

Formato commit concordato:

`Uniforma titolo footer CM Consulting su [nome pagina]`

---

## 7. FILE ORFANI — VERIFICA E STATO

Sono stati analizzati come candidati alla rimozione:

1. `index-fix-fideiussioni.html`
2. `v9-final.css` nella root — **non confondere con `assets/v9-final.css`**
3. `v9-final-footer-text-links.css`
4. `assets/cm-assistant.css`
5. `assets/cm-assistant.js`
6. `assets/cm-assistant-v7.css`
7. `appalti.html`

È stata eseguita una ricerca delle referenze.

### Punto importante

`appalti.html` in precedenza risultava referenziato da `assets/app.js` tramite la voce `appalto` della mappa `aiChoose`.

La referenza è stata aggiornata a:

`appalti-pubblici.html`

Quindi, prima di eliminare `appalti.html`, bisogna eseguire una nuova ricerca completa delle referenze sul branch `main`.

### Regola

Non eliminare nessuno dei sette file finché l'assenza di referenze non è stata verificata nuovamente sullo stato corrente del repository.

In particolare:
- `assets/v9-final.css` **non deve essere confuso** con il vecchio `v9-final.css` presente nella root;
- una ricerca per filename deve essere effettuata prima della cancellazione.

---

## 8. FOOTER — AUDIT ATTUALE

Audit diretto sul branch `main`.

### Prima colonna corretta — `CM Consulting`
- `404.html`
- `ambiente.html`
- `appalti-pubblici.html`
- `dogane.html`
- `locazioni.html`

### Prima colonna ancora errata — `Fideiussioni`
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

### Pagine senza il footer standard oggetto dell'audit
- `area-cm.html` — redirect
- `admin/index.html`
- `admin/reset.html`

---

## 9. FILE IMPORTANTI

### HTML principali
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

### JavaScript principale
`assets/app.js`

Contiene, tra le altre:
- carousel homepage;
- `paintSlide()`;
- `initAssistantFabFooterHide()`;
- mappa `aiChoose`.

### CSS principali
- `assets/style.css`
- `assets/v9-final.css`

**Attenzione:** `assets/v9-final.css` è il CSS V9 attivo. Non confonderlo con il vecchio `v9-final.css` presente nella root.

---

## 10. STATO VERCEL

Le correzioni pubblicate elencate in questo documento sono state verificate con deploy:

**Production → Ready**

Commit verificati nel lavoro corrente:
- `dd0472d` — navigazione servizi Appalti pubblici
- `fa98593` — stile footer / hero
- `78a7846` — footer 404
- `a651e2b` — footer Appalti
- `ab6bdc5` — homepage / link FIDEIUSSIONI

Prima di considerare una nuova modifica conclusa, verificare nuovamente il deploy Production.

---

## 11. COPIE DI SICUREZZA SUL PC

L'utente conserva i backup nella cartella:

`Sito cm consulting with CHATGPT`

In questa cartella sono presenti, tra gli altri:
- `STATO-PROGETTO.md`;
- backup ZIP;
- audit;
- documentazione tecnica;
- altri file di sicurezza del progetto.

Quando viene generato un nuovo `STATO-PROGETTO.md`, sostituire la copia precedente sul PC.

Il file TXT `ISTRUZIONI_STATO_PROGETTO_CM_CONSULTING.txt` è un promemoria operativo separato e non sostituisce questo registro.

---

## 12. PROSSIMO PASSO

Quando si riprende il progetto:

1. leggere questo file;
2. verificare il RAW corrente del file interessato;
3. affrontare una sola correzione;
4. preparare il file completo se necessario;
5. indicare nome file e commit message esatti;
6. l'utente carica e committa su `main`;
7. verificare Vercel Production → Ready;
8. aggiornare questo registro dopo la conclusione della correzione.

---

## 13. ISTRUZIONE DI AVVIO PER QUALSIASI NUOVA CHAT

> Prima di fare qualsiasi modifica al progetto CM Consulting, leggi il file `STATO-PROGETTO.md` direttamente dal branch `main` di GitHub. Consideralo il registro tecnico ufficiale del progetto. Dopo averlo letto, verifica sempre il RAW attuale dei file interessati prima di modificare qualsiasi cosa. Non basarti su copie locali, memoria della chat o supposizioni. Procedi una sola correzione alla volta e non modificare parti non richieste.

### Istruzione aggiuntiva per Claude

> Se stai lavorando sul progetto CM Consulting, usa `STATO-PROGETTO.md` come registro tecnico ufficiale esattamente come ChatGPT. Prima di modificare qualsiasi file, leggi il registro e verifica il RAW corrente del repository GitHub `migliore50-afk/Cm-Consulting-`, branch `main`. Non ricostruire file da versioni vecchie o da memoria della conversazione. Procedi una sola modifica alla volta, indica il file esatto e il commit previsto e non modificare parti non richieste.

---

## 14. PRINCIPIO FINALE

**GitHub `main` = stato reale del progetto.**

**`STATO-PROGETTO.md` = registro tecnico ufficiale.**

**PC = archivio di sicurezza e backup.**

ChatGPT e Claude devono utilizzare lo stesso registro e verificare sempre GitHub prima di modificare il progetto.
