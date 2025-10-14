import jsPDF from 'jspdf';
import type { FormDefinition, FormValues } from './types';

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Igen' : 'Nem';
  }

  if (typeof value === 'string') {
    if (value === 'yes') return 'Igen';
    if (value === 'no') return 'Nem';
    return value;
  }

  return String(value);
}

export function exportFormToPDF(
  definition: FormDefinition,
  values: FormValues,
  options?: {
    projectName?: string;
  }
): void {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

  const marginLeft = 20;
  const marginTop = 25;
  const lineHeight = 7;
  let cursorY = marginTop;

  const title = options?.projectName
    ? `${definition.title} – ${options.projectName}`
    : definition.title;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(title, marginLeft, cursorY);
  cursorY += lineHeight + 3;

  if (definition.description) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(definition.description, 170);
    pdf.text(lines, marginLeft, cursorY);
    cursorY += lines.length * lineHeight + 4;
  }

  definition.sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      cursorY += 4;
    }

    if (cursorY >= 270) {
      pdf.addPage();
      cursorY = marginTop;
    }

    if (section.title) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(section.title, marginLeft, cursorY);
      cursorY += lineHeight;
    }

    if (section.description) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      const lines = pdf.splitTextToSize(section.description, 170);
      pdf.text(lines, marginLeft, cursorY);
      cursorY += lines.length * lineHeight;
    }

    section.fields.forEach((field) => {
      const fieldValue = values[field.id];

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(`${field.label}:`, marginLeft, cursorY);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);

      const formatted = formatValue(fieldValue);
      const fieldLines = pdf.splitTextToSize(formatted, 170);

      pdf.text(fieldLines, marginLeft + 2, cursorY + lineHeight);
      cursorY += lineHeight * (fieldLines.length + 1);

      if (cursorY >= 270) {
        pdf.addPage();
        cursorY = marginTop;
      }
    });
  });

  pdf.setProperties({
    title: definition.title,
    subject: 'Aquapol felmérési űrlap',
    author: 'Building Survey App',
    creator: 'Building Survey App',
  });

  const date = new Date().toISOString().split('T')[0];
  const safeTitle = definition.pdf?.fileName || definition.id;
  const filename = `${safeTitle}_${date}.pdf`;

  pdf.save(filename);
}
