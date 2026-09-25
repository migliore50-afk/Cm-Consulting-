import { consumeRateLimit } from './_security.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });

  const rate = await consumeRateLimit(req, 'assistant', 20, 900);
  if (!rate.allowed) {
    return res.status(rate.reason === 'redis_unavailable' ? 503 : 429).json({
      error: rate.reason === 'redis_unavailable' ? 'Servizio temporaneamente non disponibile' : 'Limite temporaneo raggiunto. Riprova tra qualche minuto',
      code: rate.reason === 'redis_unavailable' ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMITED'
    });
  }

  const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_BACKUP]
    .map(value => String(value || '').trim())
    .filter(Boolean);
  if (!apiKeys.length) return res.status(503).json({ error: 'Assistente AI non configurato', code: 'GEMINI_NOT_CONFIGURED' });
  const model = String(process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const privacySafe = value => String(value || '')
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email omessa]')
      .replace(/\b(?:IBAN\s*)?[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi, '[iban omesso]')
      .replace(/\b\d{11}\b/g, '[numero omesso]')
      .replace(/\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi, '[codice fiscale omesso]')
      .replace(/\b(?:\+?39[\s.-]?)?(?:3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|0\d{1,3}[\s.-]?\d{5,8})\b/g, '[telefono omesso]')
      .replace(/\b(?:mi chiamo|il mio nome è)\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]*(?:\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]*){0,3}/gi, '[nome omesso]');

    const message = privacySafe(String(body.message || '').trim()).slice(0, 1200);
    if (!message) return res.status(400).json({ error: 'Richiesta vuota' });

    // Intento esplicito: quando l'utente nomina già la "capacità finanziaria"
    // per trasporto/mezzi, il percorso è determinato e non va introdotta una
    // domanda estranea (es. merci o persone) prima dell'inoltro.
    const explicitFinancialCapacity = /capacità\s+finanziaria/i.test(message) &&
      /(trasport|autotrasport|mezzi|veicol|albo)/i.test(message);

    const history = Array.isArray(body.history)
      ? body.history
          .filter(item => item && (item.role === 'user' || item.role === 'assistant'))
          .map(item => ({ role: item.role, content: privacySafe(item.content).slice(0, 1600) }))
          .slice(-12)
      : [];

    const incomingPageContext = body.pageContext && typeof body.pageContext === 'object' ? body.pageContext : {};
    const pageContext = {
      path: String(incomingPageContext.path || '').trim().slice(0, 240),
      title: String(incomingPageContext.title || '').trim().slice(0, 160),
      onRequestForm: incomingPageContext.onRequestForm === true
    };
    const incomingFormContext = body.formContext && typeof body.formContext === 'object' ? body.formContext : {};
    const formContext = {};
    ['amount','duration','vehicleCount','bilancio','leaseType','startDate','endDate'].forEach(key => {
      if (incomingFormContext[key] != null && String(incomingFormContext[key]).trim()) {
        formContext[key] = String(incomingFormContext[key]).trim().slice(0, 200);
      }
    });

    const system = `Sei l'Assistente CM Consulting, assistente digitale di orientamento e supporto alla compilazione del sito italiano di CM Consulting.

OBIETTIVO:
1. Capire in linguaggio naturale cosa deve fare il visitatore.
2. Fare solo le domande realmente necessarie, una alla volta quando possibile.
3. Identificare il percorso del sito più pertinente senza dare consulenza assicurativa definitiva.
4. Quando il percorso è sufficientemente chiaro, indirizzare al modulo corretto e trasferire nel modulo SOLO i dati realmente forniti dal cliente.
5. Se il cliente è già nel modulo di richiesta, seguirlo passo per passo nella compilazione e spiegare i campi in modo semplice.

REGOLE:
- NON promettere emissione, accettazione, prezzo o esito della pratica.
- NON inventare requisiti normativi, documenti, importi, scadenze o dati del cliente.
- NON sostituirti alla valutazione professionale.
- Se un dato non è noto, chiedilo oppure indica che può essere lasciato da verificare.
- Mantieni il contesto della conversazione.
- Se il cliente corregge un dato già raccolto, usa il nuovo dato.
- NON chiedere né richiedere al cliente nome, cognome, ragione sociale, partita IVA, codice fiscale, telefono, email, PEC, indirizzo o altri identificativi personali tramite la chat.
- Se il cliente inserisce spontaneamente identificativi personali, non ripeterli, non memorizzarli nella risposta e non trasferirli nel modulo tramite FORM.
- I dati personali devono essere inseriti direttamente nei campi del modulo CM Consulting, non nella conversazione AI.
- Se sei già nel modulo, considera solo il contesto non identificativo disponibile e aiutalo a completare ciò che manca.
- Puoi spiegare dove trovare un dato nel bando, contratto o documento, ma senza inventare il contenuto del documento.
- Rispondi in italiano, in modo professionale, breve e naturale.

PERCORSI CONSENTITI:
- /richiedi-preventivo?tipo=appalti
- /richiedi-preventivo?tipo=locazioni
- /richiedi-preventivo?tipo=dogane
- /richiedi-preventivo?tipo=ambiente
- /richiedi-preventivo?tipo=contributi
- /richiedi-preventivo?tipo=urbanistica
- /richiedi-preventivo?tipo=fiscali
- /richiedi-preventivo?tipo=contratti-privati
- /capacita-finanziaria
- /richiedi-preventivo?esigenza=generica

CLASSIFICAZIONE:
- Appalto/gara/ente appaltante/garanzia provvisoria o definitiva -> appalti.
- Se il cliente indica esplicitamente "capacità finanziaria" in relazione all'autotrasporto/trasporto o ai mezzi, -> capacita-finanziaria.
- In questo caso NON chiedere se trasporta merci o persone: tale domanda non è necessaria per classificare il percorso "Capacità finanziaria".
- Se il cliente ha già indicato "capacità finanziaria" e il numero dei mezzi, non chiedere ulteriori dettagli sul tipo di trasporto prima di indirizzarlo al percorso corretto.
- Autotrasporto/idoneità/capacità finanziaria per albo -> capacita-finanziaria.
- Affitto/locazione -> locazioni.
- Dogana -> dogane.
- Obblighi ambientali/rifiuti -> ambiente.
- Contributi/agevolazioni -> contributi.
- Urbanistica/edilizia/convenzione/oneri -> urbanistica.
- Obblighi fiscali -> fiscali.
- Contratto privato, acconto, fornitura, prestazione, saldo, anticipazione tra privati/aziende -> contratti-privati.
- Se non classificabile -> valutazione generica.

TRASFERIMENTO DATI:
Quando hai raccolto dati sufficienti, puoi aggiungere alla fine un marcatore:
[[ROUTE:/percorso]]
e, se hai dati affidabili da precompilare, un solo marcatore JSON:
[[FORM:{"amount":"...","duration":"...","vehicleCount":"...","bilancio":"si|no","leaseType":"...","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD"}]]
Inserisci nel JSON SOLO chiavi con valori realmente forniti o chiaramente presenti nel contesto. Non inventare valori. Il marcatore FORM non deve essere mostrato all'utente.

Se il cliente è già nel modulo, NON emettere ROUTE a ogni risposta: usa FORM solo quando una nuova informazione deve essere applicata a un campo. Se non c'è un nuovo dato da applicare, rispondi normalmente.

CONTESTO PAGINA:
${JSON.stringify(pageContext)}

DATI ATTUALI DEL FORM:
${JSON.stringify(formContext)}`;

    // Gemini riceve l'istruzione di sistema separatamente e mantiene lo stesso
    // schema conversazionale gia' usato dal frontend.
    const contents = [
      ...history.map(item => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    let upstream = null;
    let data = {};
    let lastStatus = 502;
    let lastMessage = '';
    let lastProviderStatus = '';

    for (let index = 0; index < apiKeys.length; index += 1) {
      const apiKey = apiKeys[index];
      upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 700
          }
        })
      });

      data = await upstream.json().catch(() => ({}));
      if (upstream.ok) break;

      lastStatus = upstream.status;
      lastMessage = String(data?.error?.message || '');
      lastProviderStatus = String(data?.error?.status || '');
      console.error('Gemini assistant error', upstream.status, lastProviderStatus, lastMessage || data);

      // La chiave di riserva viene usata solo per errori di autenticazione/autorizzazione.
      // Non viene usata per 429/5xx, evitando retry che possano aumentare traffico o costi.
      const canTryBackup = index === 0 && apiKeys.length > 1 && (upstream.status === 401 || upstream.status === 403);
      if (!canTryBackup) break;
    }

    if (!upstream?.ok) {
      let publicError = 'Servizio AI temporaneamente non disponibile';
      let code = 'GEMINI_UPSTREAM_ERROR';
      if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) {
        publicError = 'Configurazione della chiave Gemini non valida o non autorizzata';
        code = 'GEMINI_AUTH';
      } else if (lastStatus === 429) {
        publicError = 'Limite temporaneo del servizio Gemini raggiunto. Riprova tra poco';
        code = 'GEMINI_RATE_LIMIT';
      } else if (lastStatus >= 500) {
        publicError = 'Servizio Gemini temporaneamente non disponibile';
        code = 'GEMINI_UPSTREAM_ERROR';
      }
      return res.status(502).json({ error: publicError, code });
    }

    const rawReply = String(
      data?.candidates?.[0]?.content?.parts
        ?.filter(part => typeof part?.text === 'string')
        ?.map(part => part.text)
        ?.join('') || ''
    ).trim();
    if (!rawReply) return res.status(502).json({ error: 'Risposta AI vuota' });

    const routeMatch = rawReply.match(/\[\[ROUTE:(\/[^\]]+)\]\]/i);
    const allowedRoutes = new Set([
      '/richiedi-preventivo?tipo=appalti',
      '/richiedi-preventivo?tipo=locazioni',
      '/richiedi-preventivo?tipo=dogane',
      '/richiedi-preventivo?tipo=ambiente',
      '/richiedi-preventivo?tipo=contributi',
      '/richiedi-preventivo?tipo=urbanistica',
      '/richiedi-preventivo?tipo=fiscali',
      '/richiedi-preventivo?tipo=contratti-privati',
      '/capacita-finanziaria',
      '/richiedi-preventivo?esigenza=generica'
    ]);
    const requestedRoute = routeMatch ? routeMatch[1] : '';
    let safeRoute = allowedRoutes.has(requestedRoute) ? requestedRoute : '';

    // Protezione deterministica del percorso: un'esigenza già esplicitata
    // come capacità finanziaria per trasporto/mezzi non deve essere riclassificata.
    if (explicitFinancialCapacity) safeRoute = '/capacita-finanziaria';
    const formMatch = rawReply.match(/\[\[FORM:(\{[\s\S]*?\})\]\]/i);
    const reply = rawReply
      .replace(/\s*\[\[ROUTE:\/[^\]]+\]\]\s*/ig, ' ')
      .replace(/\s*\[\[FORM:\{[\s\S]*?\}\]\]\s*/ig, ' ')
      .trim();

    let form = null;
    if (formMatch) {
      try {
        const parsed = JSON.parse(formMatch[1]);
        const safeKeys = new Set(['amount','duration','vehicleCount','bilancio','leaseType','startDate','endDate']);
        form = Object.fromEntries(
          Object.entries(parsed || {}).filter(([key, value]) =>
            safeKeys.has(key) && value != null && String(value).trim()
          )
        );

        // Il modello non deve trasformare un dato contestuale in un valore
        // semanticamente diverso. In particolare, per le locazioni il canone
        // mensile non equivale all'importo della fideiussione. Il campo
        // "amount" viene quindi accettato solo quando il cliente ha esplicitamente
        // indicato l'importo/somma/valore della garanzia o della fideiussione.
        if (safeRoute === '/richiedi-preventivo?tipo=locazioni') {
          const conversationText = [
            ...history.filter(item => item.role === 'user').map(item => item.content),
            message
          ].join(' ');
          const explicitGuaranteeAmount = /(?:importo|somma|valore|ammontare|cifra)\\s+(?:della|di|richiest[oa]\\s+(?:per|della))?\\s*(?:garanzia|fideiussione)|(?:garanzia|fideiussione)\\s+(?:di|da|per)\\s*(?:€|euro|eur)?\\s*\\d|(?:devo|dobbiamo)\\s+garantire\\s+(?:€|euro|eur)?\\s*\\d/i.test(conversationText);
          if (!explicitGuaranteeAmount) delete form.amount;
        }
      } catch (error) {
        console.warn('Assistant FORM marker non valido');
      }
    }

    return res.status(200).json({
      reply,
      route: safeRoute,
      form
    });
  } catch (error) {
    console.error('Assistant endpoint error', error);
    return res.status(500).json({ error: 'Errore interno dell’assistente' });
  }
}
