// ATTENZIONE — endpoint temporaneamente disattivato (Fase B, analisi del
// 25/09/2026).
//
// Motivo: il frontend attuale (richiedi-preventivo.html, capacita-
// finanziaria.html) non offre ancora un controllo di caricamento allegati.
// Questo endpoint restava comunque raggiungibile pubblicamente, senza
// autenticazione né CAPTCHA, protetto solo da un limite di frequenza per IP.
// I file caricati non venivano collegati a nessuna richiesta né soggetti a
// una scadenza automatica.
//
// Riattivare solo dopo la Fase C (architettura allegati), con:
//   - scelta definitiva tra Vercel Blob e Supabase Storage;
//   - collegamento sicuro allegato → richiesta (es. token firmato);
//   - cancellazione o scadenza automatica dei file non utilizzati.
//
// La logica precedente (emissione di URL pre-firmati per Vercel Blob) è
// stata rimossa da questo file, non solo disattivata, per non lasciare in
// produzione codice che referenzia credenziali Blob senza che nessuno lo
// stia più verificando attivamente.
export default async function handler(req, res) {
  return res.status(503).json({
    error: 'Caricamento documenti non ancora disponibile. Invia la richiesta senza allegati: ti contatteremo per l’eventuale documentazione.'
  });
}
