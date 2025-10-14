import jsPDF from 'jspdf';
import type { Project } from '@/types/project.types';
import type { FormDefinition, FormValues, ProjectFormResponse } from '@/lib/forms/types';
import type { Drawing } from '@/lib/drawings/types';
import { generateThumbnail } from '@/lib/drawings/pdf-export';

interface ExportProjectModulesParams {
  project: Project;
  modules: string[];
  aquapol?: {
    definition: FormDefinition;
    response: ProjectFormResponse | null;
  };
  drawings?: Drawing[];
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'string') {
    if (value === 'yes') return 'Igen';
    if (value === 'no') return 'Nem';
  }

  return String(value);
}

function renderFormSection(
  pdf: jsPDF,
  definition: FormDefinition,
  values: FormValues,
  cursorY: { current: number }
) {
  const marginLeft = 18;
  const marginTop = 20;
  const lineHeight = 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(definition.title, marginLeft, cursorY.current);
  cursorY.current += lineHeight;

  definition.sections.forEach((section) => {
    if (cursorY.current >= 270) {
      pdf.addPage();
      cursorY.current = marginTop;
    }

    if (section.title) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(section.title, marginLeft, cursorY.current);
      cursorY.current += lineHeight;
    }

    if (section.description) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(section.description, 170);
      pdf.text(lines, marginLeft, cursorY.current);
      cursorY.current += lines.length * (lineHeight - 1);
    }

    section.fields.forEach((field) => {
      const value = values[field.id];
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`${field.label}:`, marginLeft, cursorY.current);
      cursorY.current += 5;

      pdf.setFont('helvetica', 'normal');
      const formatted = formatValue(value);
      const lines = pdf.splitTextToSize(formatted, 170);
      pdf.text(lines, marginLeft + 2, cursorY.current);
      cursorY.current += lines.length * (lineHeight - 1) + 3;

      if (cursorY.current >= 270) {
        pdf.addPage();
        cursorY.current = marginTop;
      }
    });
  });
}

function renderDrawingsSection(
  pdf: jsPDF,
  drawings: Drawing[],
  cursorY: { current: number }
) {
  const marginLeft = 18;
  const marginTop = 20;
  const lineHeight = 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Rajzok összefoglalója', marginLeft, cursorY.current);
  cursorY.current += lineHeight;

  if (drawings.length === 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Nincsenek mentett rajzok a projekthez.', marginLeft, cursorY.current);
    cursorY.current += lineHeight;
    return;
  }

  drawings.forEach((drawing, index) => {
    if (index > 0) {
      cursorY.current += 4;
    }

    if (cursorY.current >= 250) {
      pdf.addPage();
      cursorY.current = marginTop;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`${drawing.name}`, marginLeft, cursorY.current);
    cursorY.current += lineHeight;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(
      `Papír méret: ${drawing.paper_size.toUpperCase()} • Orientáció: ${drawing.orientation}`,
      marginLeft,
      cursorY.current
    );
    cursorY.current += lineHeight;
    pdf.text(
      `Létrehozva: ${new Date(drawing.created_at).toLocaleDateString('hu-HU')} • Utolsó módosítás: ${
        drawing.updated_at ? new Date(drawing.updated_at).toLocaleDateString('hu-HU') : '-'
      }`,
      marginLeft,
      cursorY.current
    );
    cursorY.current += lineHeight;

    try {
      const thumbnail = generateThumbnail(drawing, 150, 110);
      pdf.addImage(thumbnail, 'PNG', marginLeft, cursorY.current, 70, 50);
    } catch (error) {
      console.warn('Failed to render drawing thumbnail:', error);
      pdf.text('Előnézet generálása nem sikerült.', marginLeft, cursorY.current);
    }

    cursorY.current += 55;
  });
}

export function exportProjectModulesToPDF({
  project,
  modules,
  aquapol,
  drawings,
}: ExportProjectModulesParams) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const cursorY = { current: 30 };

  pdf.setProperties({
    title: `${project.name} - modul export`,
    subject: 'Projekt modul PDF export',
    author: 'Building Survey App',
    creator: 'Building Survey App',
  });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text(project.name, 20, cursorY.current);
  cursorY.current += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(`Projekt azonosító: ${project.auto_identifier}`, 20, cursorY.current);
  cursorY.current += 7;
  pdf.text(`Export dátuma: ${new Date().toLocaleString('hu-HU')}`, 20, cursorY.current);
  cursorY.current += 10;

  modules.forEach((moduleId, index) => {
    if (index > 0) {
      pdf.addPage();
      cursorY.current = 30;
    }

    if (moduleId === 'aquapol-form' && aquapol) {
      if (aquapol.response) {
        renderFormSection(pdf, aquapol.definition, aquapol.response.data, cursorY);
      } else {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Aquapol űrlap', 18, cursorY.current);
        cursorY.current += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text('Az Aquapol űrlap még nincs kitöltve ehhez a projekthez.', 18, cursorY.current);
      }
    }

    if (moduleId === 'drawings' && drawings) {
      renderDrawingsSection(pdf, drawings, cursorY);
    }
  });

  const date = new Date().toISOString().split('T')[0];
  const filename = `${project.name.replace(/\s+/g, '_')}_modul_export_${date}.pdf`;

  pdf.save(filename);
}
