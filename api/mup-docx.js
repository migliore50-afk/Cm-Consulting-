import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType,
  BorderStyle,
  ShadingType
} from 'docx';

function text(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function row(label, value) {
  const valueText = text(value) || '—';
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 36, type: WidthType.PERCENTAGE },
        shading: { fill: 'F3F5F7', type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })]
      }),
      new TableCell({
        width: { size: 64, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun(valueText)] })]
      })
    ]
  });
}

function section(title, rows) {
  return [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'C7CED4' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C7CED4' },
        left: { style: BorderStyle.SINGLE, size: 4, color: 'C7CED4' },
        right: { style: BorderStyle.SINGLE, size: 4, color: 'C7CED4' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'C7CED4' },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'C7CED4' }
      },
      rows: rows.map(([label, value]) => row(label, value))
    }),
    new Paragraph({ text: '' })
  ];
}

export async function generateMupDocx(data) {
  const d = Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, text(v)]));
  const generatedAt = d.generatedAt || new Date().toISOString();
  const documentId = d.documentId || 'MUP';

  const children = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'MODULO UNICO PRECONTRATTUALE (MUP)',
          bold: true,
          size: 32
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'CM Consulting — Intermediazione assicurativa',
          bold: true,
          size: 22
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Documento: ${documentId} · generato il ${new Date(generatedAt).toLocaleString('it-IT')}`,
          color: '5F6B75',
          size: 18
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Riferimento normativo: Allegato 3 al Regolamento IVASS n. 40/2018, come modificato dai Provvedimenti IVASS n. 163/2025 e n. 169/2026.',
          color: '5F6B75'
        })
      ]
    }),
    ...section('1. Informazioni generali sul distributore che entra in contatto con il contraente', [
      ['Nome e cognome / denominazione', d.mupDistributorName],
      ['RUI, data di iscrizione, sezione e ruolo', [d.mupDistributorRui, d.mupDistributorDate, d.mupDistributorSection ? `Sezione ${d.mupDistributorSection}` : '', d.mupDistributorRole].filter(Boolean).join(' · ')],
      ['Sede legale / domicilio professionale', d.mupDistributorAddress],
      ['Telefono', d.mupDistributorPhone],
      ['E-mail', d.mupDistributorEmail],
      ['PEC', d.mupDistributorPec],
      ['Sito internet', d.mupDistributorWebsite],
      ['Autorità di vigilanza', d.mupIvass],
      ['Intermediario per il quale è svolta la distribuzione', d.mupMainIntermediary],
      ['RUI, sezione e ruolo dell’intermediario', [d.mupMainRui, d.mupMainSection ? `Sezione ${d.mupMainSection}` : '', d.mupMainRole].filter(Boolean).join(' · ')],
      ['Sede legale intermediario', d.mupMainAddress],
      ['Telefono / e-mail / PEC intermediario', [d.mupMainPhone, d.mupMainEmail, d.mupMainPec].filter(Boolean).join(' · ')],
      ['Sito internet intermediario', d.mupMainWebsite]
    ]),
    ...section('2. Informazioni sul modello di distribuzione', [
      ['Modello di distribuzione', d.mupDistribution],
      ['Impresa/e di assicurazione', d.mupInsurer],
      ['Collaborazione orizzontale', d.mupHorizontal],
      ['Intermediario della collaborazione orizzontale', d.mupHorizontalName]
    ]),
    ...section('3. Informazioni relative a situazioni di potenziale conflitto d’interesse', [
      ['Intermediario detiene almeno il 10% di impresa', d.mupConflictA],
      ['Denominazione impresa interessata', d.mupConflictAName],
      ['Impresa detiene almeno il 10% dell’intermediario', d.mupConflictB],
      ['Denominazione impresa/controllante', d.mupConflictBName]
    ]),
    ...section('4. Informazioni sull’attività di distribuzione e consulenza', [
      ['Consulenza ai sensi dell’art. 119-ter, comma 3, CAP', d.mupAdvice],
      ['Analisi imparziale e personale ai sensi dell’art. 119-ter, comma 4, CAP', d.mupImpartial],
      ['Contratto di distribuzione in esclusiva', d.mupExclusive],
      ['Distribuzione non esclusiva', d.mupNonExclusive],
      ['Imprese con cui esistono rapporti di affari', d.mupBusinessRelationships],
      ['Altre informazioni utili alla trasparenza ex art. 119-bis, c.7 CAP', d.mupTransparency]
    ]),
    ...section('5. Informazioni sulle remunerazioni', [
      ['Tipologia e natura della remunerazione', d.mupRemuneration],
      ['Importo del compenso o metodo per calcolarlo', d.mupRemunerationAmount],
      ['Eventuale compenso pagato direttamente dal cliente', d.mupClientFee],
      ['Provvigioni RC Auto, se applicabile', d.mupRcAuto],
      ['Compensi complessivi in caso di collaborazione orizzontale / Sezione E', d.mupHorizontalCompensation]
    ]),
    ...section('6. Informazioni sul pagamento dei premi', [
      ['Tutela delle somme e dei premi incassati', d.mupPayment],
      ['Modalità di pagamento dei premi ammesse', d.mupPaymentMethods],
      ['Pagamento a intermediario Sezione B, se applicabile', d.mupSectionBPayment]
    ]),
    ...section('7. Informazioni sugli strumenti di tutela del contraente', [
      ['Assicurazione RC professionale', d.mupRc],
      ['Reclami: modalità e recapiti', d.mupComplaints],
      ['Arbitro Assicurativo', d.mupArbitro],
      ['FIN.NET, se applicabile', d.mupFinNet],
      ['Altri sistemi ADR, se applicabili', d.mupOtherAdr]
    ]),
    ...section('8. Informazioni sul diritto all’oblio oncologico', [
      ['Informativa', 'Non applicabile: CM Consulting non colloca prodotti assicurativi vita/salute per i quali sia richiesta una dichiarazione sullo stato di salute del contraente.']
    ])
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 900, right: 900, bottom: 900, left: 900 }
        }
      },
      children
    }]
  });

  return Packer.toBuffer(doc);
}
