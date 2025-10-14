import jsPDF from 'jspdf';
import type { Project } from '@/types/project.types';
import type { FormDefinition, FormValues, ProjectFormResponse, FormField } from '@/lib/forms/types';
import type { Drawing } from '@/lib/drawings/types';
import { renderDrawingToImage } from '@/lib/drawings/pdf-export';
import { ensureHungarianFont, setFont } from '@/lib/pdf/font-utils';

interface ModuleSelection {
  id: 'aquapol-form' | 'drawings';
  items?: string[];
}

interface ExportProjectModulesParams {
  project: Project;
  modules: ModuleSelection[];
  aquapol?: {
    definition: FormDefinition;
    response: ProjectFormResponse | null;
  };
  drawings?: {
    data: Drawing[];
  };
}

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
  }

  return String(value);
}

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

function renderFormSection(
  pdf: jsPDF,
  definition: FormDefinition,
  values: FormValues,
  cursorY: { current: number }
) {
  const marginLeft = 18;
  const marginTop = 20;
  const lineHeight = 6;

  setFont(pdf, 'bold');
  pdf.setFontSize(14);
  pdf.text(definition.title, marginLeft, cursorY.current);
  cursorY.current += lineHeight;

  definition.sections.forEach((section) => {
    if (cursorY.current >= 270) {
      pdf.addPage();
      cursorY.current = marginTop;
    }

    const visibleFields = section.fields.filter((field) =>
      isFieldVisible(field, values)
    );

    if (visibleFields.length === 0) {
      return;
    }

    if (section.title) {
      setFont(pdf, 'bold');
      pdf.setFontSize(12);
      pdf.text(section.title, marginLeft, cursorY.current);
      cursorY.current += lineHeight;
    }

    if (section.description) {
      setFont(pdf, 'normal');
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(section.description, 170);
      pdf.text(lines, marginLeft, cursorY.current);
      cursorY.current += lines.length * (lineHeight - 1);
    }

    visibleFields.forEach((field) => {
      const value = values[field.id];
      setFont(pdf, 'bold');
      pdf.setFontSize(10);
      pdf.text(`${field.label}:`, marginLeft, cursorY.current);
      cursorY.current += 5;

      setFont(pdf, 'normal');
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
  const maxImageWidth = 174; // 210mm - margins
  const maxImageHeight = 200;

  if (drawings.length === 0) {
    setFont(pdf, 'bold');
    pdf.setFontSize(14);
    pdf.text('Rajz modul', marginLeft, cursorY.current);
    cursorY.current += 8;

    setFont(pdf, 'normal');
    pdf.setFontSize(10);
    pdf.text('Nincsenek kiválasztott rajzok ebben az exportban.', marginLeft, cursorY.current);
    cursorY.current += 6;
    return;
  }

  drawings.forEach((drawing, index) => {
    if (cursorY.current < marginTop) {
      cursorY.current = marginTop;
    }

    if (index > 0) {
      pdf.addPage();
      cursorY.current = marginTop;
    }

    setFont(pdf, 'bold');
    pdf.setFontSize(14);
    pdf.text('Rajz modul', marginLeft, cursorY.current);
    cursorY.current += 8;

    setFont(pdf, 'bold');
    pdf.setFontSize(12);
    pdf.text(drawing.name, marginLeft, cursorY.current);
    cursorY.current += 6;

    setFont(pdf, 'normal');
    pdf.setFontSize(10);
    pdf.text(
      `Papír méret: ${drawing.paper_size.toUpperCase()} • Orientáció: ${
        drawing.orientation === 'portrait' ? 'Álló' : 'Fekvő'
      }`,
      marginLeft,
      cursorY.current
    );
    cursorY.current += 5;
    pdf.text(
      `Létrehozva: ${new Date(drawing.created_at).toLocaleDateString('hu-HU')} • Utolsó módosítás: ${
        drawing.updated_at ? new Date(drawing.updated_at).toLocaleDateString('hu-HU') : '-'
      }`,
      marginLeft,
      cursorY.current
    );
    cursorY.current += 8;

    try {
      const image = renderDrawingToImage(drawing, { includeTitle: false });
      const meta = drawing.canvas_data?.metadata;
      const aspectRatio = meta?.canvas_width && meta.canvas_height
        ? meta.canvas_width / meta.canvas_height
        : 1.4;

      let renderWidth = maxImageWidth;
      let renderHeight = renderWidth / aspectRatio;

      if (renderHeight > maxImageHeight) {
        renderHeight = maxImageHeight;
        renderWidth = renderHeight * aspectRatio;
      }

      pdf.addImage(image, 'PNG', marginLeft, cursorY.current, renderWidth, renderHeight);
      cursorY.current += renderHeight + 8;
    } catch (error) {
      console.warn('Failed to render drawing image:', error);
      pdf.text('A rajz képének beillesztése nem sikerült.', marginLeft, cursorY.current);
      cursorY.current += 10;
    }
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
  ensureHungarianFont(pdf);

  pdf.setProperties({
    title: `${project.name} - modul export`,
    subject: 'Projekt modul PDF export',
    author: 'Building Survey App',
    creator: 'Building Survey App',
  });

  setFont(pdf, 'bold');
  pdf.setFontSize(20);
  pdf.text(project.name, 20, cursorY.current);
  cursorY.current += 10;

  setFont(pdf, 'normal');
  pdf.setFontSize(11);
  pdf.text(`Projekt azonosító: ${project.auto_identifier}`, 20, cursorY.current);
  cursorY.current += 7;
  pdf.text(`Export dátuma: ${new Date().toLocaleString('hu-HU')}`, 20, cursorY.current);
  cursorY.current += 10;

  modules.forEach((module, index) => {
    if (index > 0) {
      pdf.addPage();
      cursorY.current = 30;
    }

    if (module.id === 'aquapol-form' && aquapol) {
      if (aquapol.response) {
        renderFormSection(pdf, aquapol.definition, aquapol.response.data, cursorY);
      } else {
        setFont(pdf, 'bold');
        pdf.setFontSize(14);
        pdf.text('Aquapol űrlap', 18, cursorY.current);
        cursorY.current += 8;
        setFont(pdf, 'normal');
        pdf.setFontSize(10);
        pdf.text('Az Aquapol űrlap még nincs kitöltve ehhez a projekthez.', 18, cursorY.current);
      }
    }

    if (module.id === 'drawings' && drawings) {
      const selectedIds = new Set(module.items ?? []);
      const filtered = module.items && module.items.length > 0
        ? drawings.data.filter((drawing) => selectedIds.has(drawing.id))
        : drawings.data;
      renderDrawingsSection(pdf, filtered, cursorY);
    }
  });

  const date = new Date().toISOString().split('T')[0];
  const filename = `${project.name.replace(/\s+/g, '_')}_modul_export_${date}.pdf`;

  pdf.save(filename);
}
