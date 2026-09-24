export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Assistente AI non configurato' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const privacySafe = value => String(value || '')
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email omessa]')
      .replace(/\b(?:IBAN\s*)?[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi, '[iban omesso]')
      .replace(/\b\d{11}\b/g, '[numero omesso]')
      .replace(/\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi, '[codice fiscale omesso]')
      .replace(/\b(?:\+?39[\s.-]?)?(?:3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|0\d{1,3}[\s.-]?\d{5,8})\b/g, '[telefono omesso]')
      .replace(/\b(?:mi chiamo|sono)\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]*(?:\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]*){0,3}/gi, '[nome omesso]');

    const message = privacySafe(String(body.message || '').trim()).slice(0, 1200);
    if (!message) return res.status(400).json({ error: 'Richiesta vuota' });

    const history = Array.isArray(body.history)
      ? body.history
          .filter(item => item && (item.role === 'user' || item.role === 'assistant'))
          .map(item => ({ role: item.role, content: privacySafe(item.content).slice(0, 1600) }))
          .slice(-12)
      : [];

    const pageContext = body.pageContext && typeof body.pageContext === 'object' ? body.pageContext : {};
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

    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
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

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('Gemini assistant error', upstream.status, data?.error?.message || data);
      return res.status(502).json({ error: 'Servizio AI temporaneamente non disponibile' });
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
    const safeRoute = allowedRoutes.has(requestedRoute) ? requestedRoute : '';
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
