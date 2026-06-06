import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

type Msg = { role: 'user' | 'assistant'; content: string };

const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const safeName = (title: string) => title.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');

export async function exportChatToPDF(title: string, messages: Msg[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  // Brand header bar
  doc.setFillColor(34, 84, 61); // forest
  doc.rect(0, 0, pageW, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Machinery Ring Nyandarua', margin, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('FIA — Farm Intelligence Agent', margin, 46);

  y = 90;
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, margin, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`Exported ${new Date().toLocaleString()}`, margin, y);
  y += 22;

  const addText = (text: string, opts: { bold?: boolean; size?: number; color?: [number, number, number] }) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size ?? 11);
    const [r, g, b] = opts.color ?? [20, 20, 20];
    doc.setTextColor(r, g, b);
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      if (y > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += (opts.size ?? 11) * 1.35;
    }
  };

  for (const m of messages) {
    if (y > pageH - margin - 20) { doc.addPage(); y = margin; }
    addText(m.role === 'user' ? 'You' : 'FIA', {
      bold: true,
      size: 10,
      color: m.role === 'user' ? [34, 84, 61] : [120, 80, 20],
    });
    y += 2;
    // strip markdown for cleaner PDF
    const cleaned = m.content
      .replace(/```[\s\S]*?```/g, (b) => b.replace(/```/g, ''))
      .replace(/[*_`>#]/g, '')
      .trim();
    addText(cleaned, { size: 11 });
    y += 12;
  }

  doc.save(`${safeName(title)}_${stamp()}.pdf`);
}

export async function exportChatToDOCX(title: string, messages: Msg[]) {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: 'Machinery Ring Nyandarua', bold: true, size: 28, color: '22543D' })],
    }),
    new Paragraph({
      children: [new TextRun({ text: 'FIA — Farm Intelligence Agent', italics: true, size: 20, color: '6B6B6B' })],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: title, bold: true, size: 26 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: `Exported ${new Date().toLocaleString()}`, size: 18, color: '888888' })],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
  ];

  for (const m of messages) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: m.role === 'user' ? 'You' : 'FIA',
            bold: true,
            color: m.role === 'user' ? '22543D' : 'B7791F',
            size: 22,
          }),
        ],
      }),
    );
    const lines = m.content.split('\n');
    for (const line of lines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line.replace(/[*_`>#]/g, ''), size: 22 })],
        }),
      );
    }
    children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
  }

  const doc = new Document({
    creator: 'Machinery Ring Nyandarua',
    title,
    sections: [{ children }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${safeName(title)}_${stamp()}.docx`);
}
