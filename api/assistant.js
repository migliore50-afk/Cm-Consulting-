export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Assistente AI non configurato' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = String(body.message || '').trim().slice(0, 1200);
    if (!message) return res.status(400).json({ error: 'Richiesta vuota' });

    const system = `Sei l'Assistente CM Consulting, assistente digitale di orientamento per il sito italiano di CM Consulting.
Il tuo compito è capire in linguaggio naturale cosa deve fare il visitatore, fare al massimo 3 domande mirate quando servono e accompagnarlo nella sezione corretta del sito.
NON dare consulenza assicurativa definitiva, NON promettere emissione/accettazione/prezzo, NON inventare requisiti normativi o prodotti.
Usa un linguaggio semplice, professionale e breve. Se mancano informazioni, chiedi solo quella realmente necessaria.
Quando hai elementi sufficienti per indirizzare il cliente, aggiungi ESATTAMENTE un marcatore finale nel formato [[ROUTE:/percorso]].
Percorsi consentiti:
- /appalti-pubblici
- /capacita-finanziaria
- /locazioni
- /affitti-commerciali
- /affitti-rami-azienda
- /dogane
- /ambiente
- /fideiussioni
- /richiedi-preventivo?esigenza=generica
Usa /richiedi-preventivo?esigenza=generica quando la richiesta non è ancora classificabile.
Non mostrare il marcatore all'utente se non devi ancora indirizzarlo. Quando indirizzi, spiega in una frase perché e invita a proseguire.`;

    const input = [
      { role: 'system', content: system },
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
        max_output_tokens: 500
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('OpenAI assistant error', upstream.status, data?.error?.message || data);
      return res.status(502).json({ error: 'Servizio AI temporaneamente non disponibile' });
    }

    const reply = String(data.output_text || '').trim();
    if (!reply) return res.status(502).json({ error: 'Risposta AI vuota' });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Assistant endpoint error', error);
    return res.status(500).json({ error: 'Errore interno dell’assistente' });
  }
}
