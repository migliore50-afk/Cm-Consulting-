export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Metodo non consentito.' });
  }

  const siteKey = String(process.env.TURNSTILE_SITE_KEY || '').trim();

  if (!siteKey) {
    return res.status(503).json({
      ok: false,
      error: 'Verifica anti-spam non configurata.'
    });
  }

  return res.status(200).json({
    ok: true,
    siteKey
  });
}
