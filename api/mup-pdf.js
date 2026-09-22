import PDFDocument from 'pdfkit';

const clean = v => typeof v === 'string' ? v.trim() : '';

function addSection(doc, title, rows) {
  doc.moveDown(0.7);
  doc.font('Helvetica-Bold').fontSize(12).text(title);
  doc.moveTo(45, doc.y + 3).lineTo(550, doc.y + 3).stroke();
  doc.moveDown(0.35);

  for (const [label, value] of rows) {
    const v = clean(value) || 'DA COMPILARE';
    const startY = doc.y;
    doc.font('Helvetica-Bold').fontSize(9.5).text(label, 48, startY, { width: 175 });
    const labelHeight = doc.heightOfString(label, { width: 175 });
    doc.font('Helvetica').fontSize(9.5).text(v, 230, startY, { width: 315 });
    const valueHeight = doc.heightOfString(v, { width: 315 });
    const h = Math.max(labelHeight, valueHeight) + 8;
    doc.moveTo(45, startY + h).lineTo(550, startY + h).stroke();
    doc.y = startY + h + 2;
    if (doc.y > 735) doc.addPage();
  }
}

export function generateMupPdf(data) {
  const d = Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, clean(v)]));
  const generatedAt = d.generatedAt || new Date().toISOString();
  const documentId = d.documentId || 'MUP';

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 45, bottom: 45, left: 45, right: 45 }, info: {
      Title: 'Modulo Unico Precontrattuale (MUP)',
      Author: 'CM Consulting',
      Subject: documentId
    }});
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const header = () => {
      doc.font('Helvetica-Bold').fontSize(17).text('MODULO UNICO PRECONTRATTUALE (MUP)');
      doc.font('Helvetica-Bold').fontSize(11).text('CM Consulting — Intermediazione assicurativa');
      doc.font('Helvetica').fontSize(8.5).fillColor('#5F6B75')
        .text(`Documento: ${documentId} · generato il ${new Date(generatedAt).toLocaleString('it-IT')}`);
      doc.fillColor('#17212B').moveDown(0.4);
      doc.font('Helvetica-Bold').fontSize(8.5)
        .text('VERIFICA OBBLIGATORIA: il documento è compilato dalla pratica amministrativa. Prima della consegna verificare che ogni dato corrisponda alla distribuzione effettivamente svolta e alla singola impresa/prodotto.', { width: 505 });
      doc.font('Helvetica').fontSize(8.5).moveDown(0.4)
        .text('Base del modello: Allegato 3 al Regolamento IVASS n. 40/2018. Il contenuto deve essere verificato rispetto alla versione normativa vigente e alla specifica distribuzione prima della trasmissione al contraente.', { width: 505 });
    };

    header();

    addSection(doc, '1. Informazioni generali sul distributore che entra in contatto con il contraente', [
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
    ]);
    addSection(doc, '2. Informazioni sul modello di distribuzione', [
      ['Mandato del cliente', d.mupMandate],
      ['Distribuzione per una o più imprese di assicurazione', d.mupDistribution],
      ['Impresa/e di assicurazione', d.mupInsurer],
      ['Collaborazione orizzontale', d.mupHorizontal],
      ['Intermediario della collaborazione orizzontale', d.mupHorizontalName]
    ]);
    addSection(doc, '3. Informazioni relative a situazioni di potenziale conflitto d’interesse', [
      ['Intermediario detiene ≥10% di impresa', d.mupConflictA],
      ['Denominazione impresa interessata', d.mupConflictAName],
      ['Impresa detiene ≥10% dell’intermediario', d.mupConflictB],
      ['Denominazione impresa/controllante', d.mupConflictBName]
    ]);
    addSection(doc, '4. Informazioni sull’attività di distribuzione e consulenza', [
      ['Consulenza ai sensi dell’art. 119-ter, comma 3, CAP', d.mupAdvice],
      ['Analisi imparziale e personale ai sensi dell’art. 119-ter, comma 4, CAP', d.mupImpartial],
      ['Contratto di distribuzione in esclusiva', d.mupExclusive],
      ['Distribuzione non esclusiva', d.mupNonExclusive],
      ['Imprese con cui esistono rapporti di affari', d.mupBusinessRelationships],
      ['Altre informazioni utili alla trasparenza ex art. 119-bis, c.7 CAP', d.mupTransparency]
    ]);
    addSection(doc, '5. Informazioni sulle remunerazioni', [
      ['Tipologia e natura della remunerazione', d.mupRemuneration],
      ['Eventuale compenso pagato direttamente dal cliente', d.mupClientFee],
      ['Provvigioni RC Auto, se applicabile', d.mupRcAuto],
      ['Compensi complessivi in caso di collaborazione orizzontale / Sezione E', d.mupHorizontalCompensation]
    ]);
    addSection(doc, '6. Informazioni sul pagamento dei premi', [
      ['Regime applicabile', d.mupPayment],
      ['Gestione separata / garanzia bancaria, se applicabile', d.mupSegregatedAssets],
      ['Modalità di pagamento ammesse', d.mupPaymentMethods],
      ['Pagamento a intermediario Sezione B, se applicabile', d.mupSectionBPayment]
    ]);
    addSection(doc, '7. Informazioni sugli strumenti di tutela del contraente', [
      ['Assicurazione RC professionale', d.mupRc],
      ['Reclami: modalità e recapiti', d.mupComplaints],
      ['Arbitro Assicurativo', d.mupArbitro],
      ['FIN.NET, se applicabile', d.mupFinNet],
      ['Altri sistemi ADR, se applicabili', d.mupOtherAdr]
    ]);
    addSection(doc, '8. Informazioni sul diritto all’oblio oncologico', [
      ['Informativa', d.mupOncology]
    ]);
    addSection(doc, 'Dati della pratica — riferimento amministrativo', [
      ['Contraente / cliente', d.mupClient],
      ['Tipologia / prodotto', d.mupProduct],
      ['Scadenza pratica', d.mupExpiry],
      ['E-mail cliente', d.mupEmail],
      ['Intermediario principale', d.mupMainIntermediary],
      ['Impresa di assicurazione', d.mupInsurer]
    ]);

    doc.moveDown(0.8);
    doc.font('Helvetica').fontSize(7.5).fillColor('#5F6B75')
      .text('Modello riferito all’Allegato 3 del Regolamento IVASS n. 40/2018, come modificato dai Provvedimenti IVASS n. 163/2025 e n. 169/2026. Documento generato per controllo interno: non sostituisce la verifica della modulistica ufficiale e dei dati effettivi della distribuzione.', { width: 505 });
    doc.end();
  });
}
