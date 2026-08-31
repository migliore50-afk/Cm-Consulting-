# Audit Assistente CM — V12.6.1

## Correzione navigazione

| Scelta | Destinazione assistente | Pagina verticale/canonica |
|---|---|---|
| Devo partecipare a un appalto | `appalti.html` | `/appalti-pubblici` |
| Ho un’esigenza per autotrasporto | `capacita-finanziaria.html` | `/capacita-finanziaria` |
| Mi chiedono una garanzia per una locazione | `locazioni.html` | `/locazioni` |
| Ho un’esigenza doganale | `dogane.html` | `/dogane` |
| Ho un’esigenza ambientale | `ambiente.html` | `/ambiente` |
| Non so ancora quale garanzia mi serve | `richiedi-preventivo.html` | `/richiedi-preventivo` |
| Racconta direttamente la tua esigenza | `richiedi-preventivo.html` | `/richiedi-preventivo` |
| Cambia esigenza | reset con `startAI()` | schermata iniziale |

## Compatibilità URL

- I link dell’assistente usano i file `.html`, compatibili con preview/staging statici.
- `vercel.json` mantiene `cleanUrls: true` e normalizza i percorsi verso URL pulite.
- È stato aggiunto `appalti.html` come alias di compatibilità, con destinazione canonica `appalti-pubblici`.
- La pagina reale e canonica degli appalti resta `appalti-pubblici.html` / `/appalti-pubblici`.

## Controlli tecnici

- Sintassi `assets/app.js`: OK (`node --check`).
- Sintassi `assets/cm-assistant.js`: OK (`node --check`).
- JSON `vercel.json`: OK.
- Tutte le destinazioni richieste esistono nel pacchetto.
