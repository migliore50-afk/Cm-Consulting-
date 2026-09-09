# STATO-PROGETTO.md
## CM Consulting — Registro tecnico ufficiale

**Ultimo aggiornamento:** 9 settembre 2026  
**Repository:** `migliore50-afk/Cm-Consulting-`  
**Branch di riferimento:** `main`  
**Deploy:** Vercel — Production

---

## 1. STATO ATTUALE

Questo file è il registro tecnico ufficiale del progetto CM Consulting.

Prima di effettuare qualsiasi modifica:

1. leggere questo file dal branch `main`;
2. verificare il RAW attuale dei file interessati direttamente da GitHub;
3. verificare il contesto completo prima di modificare;
4. effettuare una sola correzione alla volta;
5. modificare esclusivamente il file e le righe necessarie;
6. non ricostruire file grandi da copie precedenti o da contenuti troncati;
7. dopo l'upload, verificare il file e il deploy Vercel;
8. usare un commit separato per ogni correzione richiesta.

### Procedura operativa concordata

Per ogni correzione:

- identificare prima il problema reale;
- preparare il **file completo** interessato, quando richiesto;
- indicare sempre il **nome esatto del file** da sostituire;
- indicare sempre il **messaggio esatto del commit**;
- l'utente carica il file tramite GitHub → **Add file → Upload files**;
- l'utente effettua il commit direttamente su `main`;
- verificare che Vercel riporti **Production → Ready**;
- solo dopo passare alla correzione successiva.

---

## 2. REGOLE DI MODIFICA

### Regola fondamentale
Non fare modifiche alla cieca.

Prima di modificare un file bisogna conoscere la versione attualmente presente su `main`.

### Vincoli
- Non modificare file non coinvolti nella correzione.
- Non modificare blocchi non richiesti.
- Non eliminare funzioni esistenti senza una verifica preventiva.
- Non sostituire un file completo usando una copia vecchia se il RAW corrente non è stato verificato.
- Non dichiarare una correzione come pubblicata finché il commit e il deploy non sono stati verificati.
- Non dichiarare un file "orfano" senza una ricerca delle sue referenze nel repository.
- Distinguere sempre tra:
  - correzione già pubblicata;
  - correzione verificata nel codice ma non ancora pubblicata;
  - problema ancora aperto.

---

## 3. CORREZIONI GIÀ PUBBLICATE E VERIFICATE

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
- rimossa la regola globale che applicava un bordo bianco al media hero:
  `.cm-confirmed-hero-media{border:1px solid rgba(255,255,255,.14);...}`
- mantenuta la correzione relativa allo stile footer.

**Commit:** `Ripristina stile footer e mantiene correzione hero`  
**Commit breve:** `fa98593`  
**Deploy:** Production → Ready

Nota: il successivo problema strutturale relativo a `.hero-stage picture` è separato e non deve essere considerato già applicato.

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

## 4. PROBLEMI ANCORA APERTI

### A. Struttura `.hero-stage picture`
**File:** `assets/v9-final.css`

Correzione identificata ma **NON ancora applicata**.

Attuale struttura verificata:

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

## 5. FILE ORFANI — VERIFICA E STATO

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
- `assets/v9-final.css` **non deve essere confuso** con il vecchio `v9-final.css` nella root;
- una ricerca per filename deve essere effettuata prima della cancellazione.

---

## 6. FOOTER — AUDIT ATTUALE

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

## 7. STRUTTURA E FILE IMPORTANTI

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

## 8. STATO VERCEL

Le correzioni pubblicate elencate in questo documento sono state verificate con deploy:

**Production → Ready**

Ultimi commit verificati nel lavoro corrente:
- `dd0472d` — navigazione servizi Appalti pubblici
- `fa98593` — stile footer / hero
- `78a7846` — footer 404
- `a651e2b` — footer Appalti
- `ab6bdc5` — homepage / link FIDEIUSSIONI

Prima di considerare una nuova modifica conclusa, verificare nuovamente il deploy Production.

---

## 9. PROSSIMO PASSO

Quando si riprende il progetto:

1. leggere questo file;
2. verificare il RAW corrente del file interessato;
3. affrontare una sola correzione;
4. preparare il file completo se necessario;
5. indicare nome file e commit message esatti;
6. l'utente carica e committa su `main`;
7. verificare Vercel Production → Ready;
8. aggiornare questo registro solo dopo la verifica.

---

## 10. ISTRUZIONE DI AVVIO PER QUALSIASI NUOVA CHAT

> Prima di fare qualsiasi modifica al progetto CM Consulting, leggi il file `STATO-PROGETTO.md` direttamente dal branch `main` di GitHub. Consideralo il registro tecnico ufficiale del progetto. Dopo averlo letto, verifica sempre il RAW attuale dei file interessati prima di modificare qualsiasi cosa. Non basarti su copie locali, memoria della chat o supposizioni. Procedi una sola correzione alla volta e non modificare parti non richieste.
