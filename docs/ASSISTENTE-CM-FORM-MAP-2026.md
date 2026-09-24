# Mappatura Assistente CM ↔ Moduli richiesta — 24/09/2026

## Obiettivo
L'Assistente CM deve fare domande aderenti ai campi reali del modulo della tipologia individuata. Non deve inventare domande o richiedere dati che il modulo non utilizza. Le informazioni raccolte devono poter essere trasferite nei campi del modulo senza duplicazioni.

## Regola documentale importante
La **visura camerale** va indicata come documentazione utile/da allegare quando pertinente all'impresa, ma non va descritta come documento con "validità legale di 6 mesi": la visura non ha un termine di validità stabilito dalla legge. Il **certificato camerale**, invece, ha validità legale di sei mesi dalla data di rilascio. Fonte verificata: Registro Imprese e Camere di Commercio. Se CM Consulting vuole imporre internamente una soglia di aggiornamento (es. documento emesso entro 6 mesi), questa deve essere formulata come requisito operativo dell'istruttoria, non come validità legale della visura.

## 0. Modulo unico di richiesta — nuovo flusso operativo
Pagina: `/richiedi-preventivo`

Il cliente non è obbligato a conoscere la tipologia della fideiussione e non deve completare un questionario specialistico prima dell'invio.

Campi essenziali:
- Descrizione libera dell'esigenza *
- Nome e cognome referente *
- Email *
- Telefono (facoltativo)
- Importo della garanzia, se conosciuto
- Durata o scadenza, se conosciuta
- Beneficiario, se conosciuto

Campo facoltativo:
- Tipologia, se il cliente la conosce già; altrimenti "Non lo so / preferisco descriverlo"

Dettagli facoltativi:
- Tipo di locazione, quando pertinente
- Date
- Dati identificativi del beneficiario, se disponibili
- Riferimenti pratica/gara/ente
- Oggetto e note
- Eventuale documento ricevuto

Principio operativo:
1. Le pagine informative restano specifiche per ogni tipologia e spiegano caratteristiche e documentazione utile.
2. Il modulo operativo resta unico e snello.
3. Il cliente invia le informazioni che conosce e i documenti che possiede.
4. La documentazione mancante viene richiesta successivamente da CM Consulting durante la valutazione.
5. L'Assistente CM orienta, precompila solo dati realmente forniti e non obbliga il cliente a completare dati specialistici non necessari per avviare la richiesta.

## 1. Capacità finanziaria
Pagina: `/capacita-finanziaria`

Campi del modulo:
- Ragione sociale *
- Partita IVA / Codice fiscale *
- Comune sede impresa *
- Provincia *
- Numero dei mezzi *
- Nome e cognome referente *
- Email *
- Bilancio: sì/no
- Per ciascun mezzo: tipologia
- Per ciascun mezzo: targa, se disponibile
- Note aggiuntive

Documenti attualmente indicati:
- Visura camerale aggiornata dell'impresa
- Bilancio aggiornato, se l'impresa lo redige
- Modello IDOFIN vigente e pertinente, compilato e firmato
- Carta d'identità e tessera sanitaria dell'amministratore
- Altra documentazione utile alla valutazione, se disponibile

## 2. Appalti pubblici
Pagina informativa: `/appalti-pubblici`
Modulo operativo: `/richiedi-preventivo?tipo=appalti`

Campi base condivisi:
- Beneficiario
- Importo da garantire
- Durata della garanzia
- Nome e cognome referente *
- Email *
- Telefono
- Data decorrenza
- Data scadenza, se prevista
- P.IVA/C.F. beneficiario
- Indirizzo beneficiario
- PEC beneficiario, se disponibile
- P.IVA/C.F. contraente
- Oggetto della garanzia
- Presenza di testo/schema/richiesta/delibera del beneficiario
- Note

Campo specifico:
- Riferimenti gara, se presenti: CIG/CUP/numero gara/contratto

Documenti:
- Bando di gara, lettera di invito o contratto
- Visura camerale aggiornata dell'impresa
- Ultimi bilanci depositati per garanzie di importo rilevante
- Provvedimento di aggiudicazione per garanzia definitiva

## 3. Locazioni
Pagina informativa: `/locazioni`
Modulo operativo: `/richiedi-preventivo?tipo=locazioni`

Campo specifico:
- Tipo di locazione: uso abitativo / uso commerciale / ramo d'azienda

Campi condivisi:
- Locatore/beneficiario
- Conduttore
- Importo
- Durata
- Referente
- Email
- Telefono
- Date
- P.IVA/C.F. locatore
- Indirizzo locatore
- PEC locatore
- P.IVA/C.F. conduttore
- Oggetto
- Eventuale documento fornito dal beneficiario
- Note

Documenti:
- Contratto di locazione, anche in bozza
- Documentazione reddituale del conduttore
- Visura camerale aggiornata se una delle parti è un'impresa
- Documento d'identità delle parti

Sottotipi informativi presenti:
- Affitti fra privati
- Affitti commerciali
- Rami d'azienda

## 4. Dogane
Pagina informativa: `/dogane`
Modulo operativo: `/richiedi-preventivo?tipo=dogane`

Campi: schema condiviso; la conversazione deve raccogliere solo i dati necessari alla specifica richiesta doganale.

Documenti:
- Richiesta/documentazione doganale
- Visura camerale aggiornata dell'impresa
- Ultimi bilanci depositati
- Documento d'identità del legale rappresentante

## 5. Ambiente / Beneficiari pubblici
Pagina informativa: `/ambiente`
Modulo operativo: `/richiedi-preventivo?tipo=ambiente`

Campi: schema condiviso; la domanda deve partire dall'obbligo, ente e documento ricevuto.

Documenti:
- Provvedimento, concessione o richiesta dell'ente
- Visura camerale aggiornata e documentazione societaria dell'impresa
- Documento d'identità del legale rappresentante

## 6. Contributi e agevolazioni
Modulo operativo: `/richiedi-preventivo?tipo=contributi`

Campo specifico:
- Ente / misura / riferimento

Campi: schema condiviso + riferimento ente/misura.

Documenti:
- Provvedimento, bando o richiesta dell'ente
- Visura camerale aggiornata dell'impresa, se il richiedente è un'azienda

## 7. Urbanistica ed edilizia
Modulo operativo: `/richiedi-preventivo?tipo=urbanistica`

Campo specifico:
- Comune / riferimento pratica

Campi: schema condiviso + comune/riferimento pratica.

Documenti:
- Convenzione, atto o richiesta dell'ente
- Visura camerale aggiornata dell'impresa, se il richiedente è un'azienda

## 8. Garanzie fiscali
Modulo operativo: `/richiedi-preventivo?tipo=fiscali`

Campo specifico:
- Ente / riferimento fiscale

Campi: schema condiviso + riferimento fiscale.

Documenti:
- Richiesta o provvedimento dell'ente
- Visura camerale aggiornata dell'impresa, se il richiedente è un'azienda

## 9. Contratti privati
Pagina informativa: `/fideiussioni-contratti-privati`
Modulo operativo: `/richiedi-preventivo?tipo=contratti-privati`

Campi: schema condiviso.

Documenti:
- Contratto/capitolato, anche in bozza
- Richiesta del beneficiario con importo e durata, se disponibile
- Per azienda: bilanci e visura camerale
- Per privato: documento d'identità e documentazione reddituale

## 10. Esigenza generica / altra fideiussione
Percorsi:
- `/richiedi-preventivo?esigenza=generica`
- `/richiedi-preventivo?tipo=altro`

Campo iniziale:
- Descrizione libera dell'esigenza

Documenti:
- Richiesta ricevuta / bozza contratto / bando / altro documento disponibile
- Visura camerale aggiornata se pertinente all'impresa


## 11. AGEA / contributi agricoli
Pagina informativa: `/fideiussione-agea`
Modulo operativo: `/richiedi-preventivo?tipo=contributi`

Dati preliminari utili da raccogliere localmente:
- Misura / programma AGEA
- Ente o organismo pagatore
- Importo dell'anticipo
- Durata richiesta
- Presenza dello schema fideiussorio
- Eventuale scadenza della pratica

Alias naturali da riconoscere: AGEA, fideiussione AGEA, garanzia AGEA, anticipo contributo agricolo, OCM Vino.

## 12. Attività regolamentate
Pagine informative:
- `/fideiussione-istituti-vigilanza`
- `/fideiussione-investigazioni`
- `/garanzie-agenzie-di-viaggio`
- `/capacita-finanziaria-autoscuole`
- `/capacita-finanziaria-scuole-nautiche`
- `/capacita-finanziaria-centri-revisione`

Modulo operativo iniziale: richiesta generica o modulo capacità finanziaria, secondo la tipologia.

Dati preliminari da raccogliere localmente:
- attività svolta;
- nuova autorizzazione / rinnovo / variazione;
- ente o ufficio competente;
- importo e durata se già indicati;
- eventuale schema o richiesta ricevuta.

Alias da riconoscere:
- vigilanza privata, istituto di vigilanza, cauzione prefettura;
- investigatore, agenzia investigativa, investigazioni private;
- agenzia viaggi, tour operator;
- autoscuola, capacità finanziaria autoscuola;
- scuola nautica, capacità finanziaria scuola nautica;
- centro revisioni, capacità finanziaria revisione auto.

## 13. Stranieri
Pagine informative:
- `/stranieri`
- `/fideiussione-visto-turistico`
- `/fideiussione-ricongiungimento-familiare`

Modulo operativo iniziale: `/richiedi-preventivo?tipo=altro` finché non viene creato un modulo specialistico.

Dati preliminari da raccogliere localmente:
- tipo di ingresso/procedura;
- paese di cittadinanza;
- durata del soggiorno, se pertinente;
- fase della pratica;
- eventuale richiesta dell'autorità/consolato.

Alias da riconoscere: visto turistico, visto Italia, fideiussione visto, ingresso straniero, ricongiungimento familiare, fideiussione ricongiungimento.

## 14. Regola di sicurezza per nuove tipologie
Se l'utente nomina una tipologia presente nel catalogo ma non ancora collegata a un modulo specialistico, l'Assistente CM deve:
1. riconoscere la tipologia;
2. aprire la pagina informativa pertinente;
3. raccogliere solo informazioni non identificative necessarie a orientare la richiesta;
4. trasferire l'utente al modulo generico appropriato;
5. non dichiarare che la garanzia è obbligatoria senza una fonte o un documento della pratica;
6. non inventare importi, durate, beneficiari o requisiti;
7. mantenere i dati identificativi nel modulo locale e non inviarli a Gemini Free.

## Regola futura del motore
1. Individuare la tipologia.
2. Caricare lo schema della tipologia.
3. Confrontare i dati già forniti con i campi dello schema.
4. Chiedere soltanto il prossimo dato mancante necessario.
5. Non ripetere una domanda già soddisfatta.
6. Non chiedere dati estranei al modulo.
7. Prima del trasferimento, mostrare un riepilogo e chiedere conferma.
8. Trasferire i dati nel modulo corretto.
9. Mostrare i documenti pertinenti alla tipologia.
10. Lasciare al cliente la verifica finale, le precisazioni e l'allegazione dei documenti.

## Nota privacy
I dati identificativi raccolti per compilare il modulo devono essere gestiti dal sito/modulo e non devono essere trasferiti a Gemini Free se non necessario. Gemini deve ricevere il minimo contesto non identificativo indispensabile per comprendere la conversazione.
