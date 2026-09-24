import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const MAX_TEXT = 200000;

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return clean(match[1]);
  }
  return '';
}

function normalizeDate(value) {
  const v = clean(value);
  let m = v.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  m = v.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  return v;
}

function extractFields(text) {
  const t = text.replace(/\u00a0/g, ' ').replace(/≥/g, '>=');
  const data = {
    collaborator: firstMatch(t, [
      /(?:Collaboratore|Intermediario|Intermediario\s+collaboratore)\s*[:\-]\s*([^\n]+)/i
    ]),
    insurer: firstMatch(t, [
      /(?:Impresa(?:\/e)?\s+di\s+assicurazione|Compagnia|Impresa)\s*[:\-]\s*([^\n]+)/i
    ]),
    risk_type: firstMatch(t, [
      /(?:Tipologia|Tipo\s+garanzia|Prodotto|Rischio)\s*[:\-]\s*([^\n]+)/i
    ]),
    contractor: firstMatch(t, [
      /(?:Contraente|Cliente|Richiedente)\s*[:\-]\s*([^\n]+)/i
    ]),
    beneficiary: firstMatch(t, [
      /(?:Beneficiario|Ente\s+beneficiario|A\s+favore\s+di)\s*[:\-]\s*([^\n]+)/i
    ]),
    amount: firstMatch(t, [
      /(?:Importo(?:\s+garantito)?|Somma\s+garantita|Massimale)\s*[:\-]\s*([^\n]+)/i
    ]),
    start_date: normalizeDate(firstMatch(t, [
      /(?:Decorrenza|Data\s+inizio|Inizio)\s*[:\-]\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})/i
    ])),
    end_date: normalizeDate(firstMatch(t, [
      /(?:Scadenza|Data\s+fine|Fine)\s*[:\-]\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})/i
    ])),
    release_date: normalizeDate(firstMatch(t, [
      /(?:Data\s+svincolo|Svincolo|Liberatoria|Restituzione)\s*(?:entro|prevista|previsto|entro\s+il)?\s*[:\-]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})/i
    ])),
    release_condition: firstMatch(t, [
      /([^\n]*(?:svincolo|liberatoria|restituzione)[^\n]*)/i
    ]),
    policy_number: firstMatch(t, [
      /(?:Numero\s+polizza|N\.\s*polizza|Polizza)\s*[:\-]\s*([^\n]+)/i
    ]),
    beneficiary_reference: firstMatch(t, [
      /(?:CIG|CUP|Riferimento\s+beneficiario|Numero\s+pratica)\s*[:\-]\s*([^\n]+)/i
    ])
  };

  return Object.fromEntries(Object.entries(data).filter(([,v]) => v));
}

export async function extractFacsimile(buffer, contentType) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Documento vuoto o non valido.');
  }

  let text = '';
  const type = String(contentType || '').toLowerCase();

  if (type === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result?.text || '';
    } finally {
      await parser.destroy();
    }
  } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    text = result?.value || '';
  } else if (type === 'application/msword') {
    throw new Error('I documenti .doc legacy non sono ancora supportati. Salva il file come .docx e riprova.');
  } else {
    throw new Error('Formato facsimile non supportato.');
  }

  text = text.replace(/\r/g, '').trim().slice(0, MAX_TEXT);
  if (!text) throw new Error('Non è stato possibile estrarre testo dal documento.');

  return {
    text,
    data: extractFields(text)
  };
}
