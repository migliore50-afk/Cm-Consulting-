export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Assistente AI non configurato' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = String(body.message || '').trim().slice(0, 1200);
    if (!message) return res.status(400).json({ error: 'Richiesta vuota' });

    const history = Array.isArray(body.history)
      ? body.history
          .filter(item => item && (item.role === 'user' || item.role === 'assistant'))
          .map(item => ({ role: item.role, content: String(item.content || '').slice(0, 2000) }))
          .slice(-12)
      : [];

    const pageContext = body.pageContext && typeof body.pageContext === 'object' ? body.pageContext : {};
    const formContext = body.formContext && typeof body.formContext === 'object' ? body.formContext : {};

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
- Se sei già nel modulo, considera i dati presenti nel modulo come contesto e aiutalo a completare ciò che manca.
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
[[FORM:{"beneficiary":"...","company":"...","amount":"...","duration":"...","contactName":"...","contactEmail":"...","contactPhone":"...","genericDescription":"...","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","refs":"...","object":"...","notes":"..."}]]
Inserisci nel JSON SOLO chiavi con valori realmente forniti o chiaramente presenti nel contesto. Non inventare valori. Il marcatore FORM non deve essere mostrato all'utente.

Se il cliente è già nel modulo, NON emettere ROUTE a ogni risposta: usa FORM solo quando una nuova informazione deve essere applicata a un campo. Se non c'è un nuovo dato da applicare, rispondi normalmente.

CONTESTO PAGINA:
${JSON.stringify(pageContext)}

DATI ATTUALI DEL FORM:
${JSON.stringify(formContext)}`;

    const input = [
      { role: 'system', content: system },
      ...history,
      { role: 'user', content: message }
    ];

    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_ASSISTANT_MODEL || 'gpt-5.6-luna',
        input,
        max_output_tokens: 700
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('OpenAI assistant error', upstream.status, data?.error?.message || data);
      return res.status(502).json({ error: 'Servizio AI temporaneamente non disponibile' });
    }

    const rawReply = String(data.output_text || '').trim();
    if (!rawReply) return res.status(502).json({ error: 'Risposta AI vuota' });

    const routeMatch = rawReply.match(/\[\[ROUTE:(\/[^\]]+)\]\]/i);
    const formMatch = rawReply.match(/\[\[FORM:(\{[\s\S]*?\})\]\]/i);
    const reply = rawReply
      .replace(/\s*\[\[ROUTE:\/[^\]]+\]\]\s*/ig, ' ')
      .replace(/\s*\[\[FORM:\{[\s\S]*?\}\]\]\s*/ig, ' ')
      .trim();

    let form = null;
    if (formMatch) {
      try { form = JSON.parse(formMatch[1]); } catch (error) {
        console.warn('Assistant FORM marker non valido');
      }
    }

    return res.status(200).json({
      reply,
      route: routeMatch ? routeMatch[1] : '',
      form
    });
  } catch (error) {
    console.error('Assistant endpoint error', error);
    return res.status(500).json({ error: 'Errore interno dell’assistente' });
  }
}
