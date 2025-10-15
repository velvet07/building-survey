import jsPDF from 'jspdf';
import { ensureHungarianFont, setFont } from '@/lib/pdf/font-utils';
import type { FormDefinition, FormField, FormValues } from './types';
import { renderAquapolFormPDF } from './pdf-templates/aquapol';
import { formatFormValue } from './pdf/utils';

export const FORM_PAGE_CONFIG = {
  marginLeft: 18,
  marginTop: 20,
  contentWidth: 174,
  lineHeight: 6,
} as const;

function isFieldVisible(field: FormField, values: FormValues): boolean {
  if (!field.visibleWhen) {
    return true;
  }

  const dependentValue = values[field.visibleWhen.fieldId];
  let candidate: string | boolean | undefined;

  if (typeof dependentValue === 'number') {
    candidate = dependentValue.toString();
  } else if (typeof dependentValue === 'string' || typeof dependentValue === 'boolean') {
    candidate = dependentValue;
  }

  return candidate !== undefined && field.visibleWhen.equals.includes(candidate);
}

function ensureFormPageSpace(
  pdf: jsPDF,
  cursor: { current: number },
  requiredHeight: number
) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const bottomLimit = pageHeight - FORM_PAGE_CONFIG.marginTop;

  if (cursor.current + requiredHeight > bottomLimit) {
    pdf.addPage('a4', 'portrait');
    cursor.current = FORM_PAGE_CONFIG.marginTop;
  }
}

export function renderFormDefinition(
  pdf: jsPDF,
  definition: FormDefinition,
  values: FormValues,
  cursor: { current: number }
): void {
  const { marginLeft, contentWidth, lineHeight } = FORM_PAGE_CONFIG;

  ensureFormPageSpace(pdf, cursor, lineHeight);
  setFont(pdf, 'bold');
  pdf.setFontSize(14);
  pdf.text(definition.title, marginLeft, cursor.current);
  cursor.current += lineHeight + 2;

  if (definition.description) {
    const lines = pdf.splitTextToSize(definition.description, contentWidth);
    const descriptionHeight = lines.length * (lineHeight - 1) + 2;
    ensureFormPageSpace(pdf, cursor, descriptionHeight);
    setFont(pdf, 'normal');
    pdf.setFontSize(10);
    pdf.text(lines, marginLeft, cursor.current);
    cursor.current += descriptionHeight;
  }

  definition.sections.forEach((section) => {
    const visibleFields = section.fields.filter((field) => isFieldVisible(field, values));

    if (visibleFields.length === 0) {
      return;
    }

    if (section.title) {
      ensureFormPageSpace(pdf, cursor, lineHeight + 1);
      setFont(pdf, 'bold');
      pdf.setFontSize(12);
      pdf.text(section.title, marginLeft, cursor.current);
      cursor.current += lineHeight + 1;
    }

    if (section.description) {
      const sectionLines = pdf.splitTextToSize(section.description, contentWidth);
      const sectionHeight = sectionLines.length * (lineHeight - 1) + 2;
      ensureFormPageSpace(pdf, cursor, sectionHeight);
      setFont(pdf, 'normal');
      pdf.setFontSize(10);
      pdf.text(sectionLines, marginLeft, cursor.current);
      cursor.current += sectionHeight;
    }

    visibleFields.forEach((field) => {
      const formattedValue = formatFormValue(values[field.id]);
      const fieldLines = pdf.splitTextToSize(formattedValue, contentWidth);
      const valueLineHeight = lineHeight - 1;
      const blockHeight = lineHeight + fieldLines.length * valueLineHeight + 2;

      ensureFormPageSpace(pdf, cursor, blockHeight);

      setFont(pdf, 'bold');
      pdf.setFontSize(10);
      pdf.text(`${field.label}:`, marginLeft, cursor.current);
      cursor.current += lineHeight;

      setFont(pdf, 'normal');
      pdf.setFontSize(10);
      fieldLines.forEach((line: string) => {
        pdf.text(line, marginLeft + 2, cursor.current);
        cursor.current += valueLineHeight;
      });

      cursor.current += 2;
    });
  });
}

export function renderFormContent(
  pdf: jsPDF,
  definition: FormDefinition,
  values: FormValues
): void {
  if (definition.pdf?.template === 'aquapol') {
    renderAquapolFormPDF(pdf, definition, values);
  } else {
    const cursor = { current: FORM_PAGE_CONFIG.marginTop };
    renderFormDefinition(pdf, definition, values, cursor);
  }
}

export function exportFormToPDF(definition: FormDefinition, values: FormValues): void {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  ensureHungarianFont(pdf);

  renderFormContent(pdf, definition, values);

  pdf.setProperties({
    title: definition.title,
    subject: definition.title,
    author: 'Building Survey App',
    creator: 'Building Survey App',
  });

  const date = new Date().toISOString().split('T')[0];
  const safeTitle = definition.pdf?.fileName || definition.id;
  const filename = `${safeTitle}_${date}.pdf`;

  pdf.save(filename);
}
