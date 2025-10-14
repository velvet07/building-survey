import jsPDF from 'jspdf';
import type { Project } from '@/types/project.types';
import type { FormDefinition, ProjectFormResponse } from '@/lib/forms/types';
import type { Drawing } from '@/lib/drawings/types';
import { renderDrawingToImage, getPaperDimensionsInMillimeters } from '@/lib/drawings/pdf-export';
import { ensureHungarianFont, setFont } from '@/lib/pdf/font-utils';
import { FORM_PAGE_CONFIG, renderFormDefinition } from '@/lib/forms/pdf-export';

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

export function exportProjectModulesToPDF({
  project,
  modules,
  aquapol,
  drawings,
}: ExportProjectModulesParams) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  ensureHungarianFont(pdf);

  // remove the initially created blank page so module rendering can control sizes precisely
  pdf.deletePage(1);

  let hasContent = false;

  pdf.setProperties({
    title: `${project.name} - modul export`,
    subject: 'Projekt modul PDF export',
    author: 'Building Survey App',
    creator: 'Building Survey App',
  });

  modules.forEach((module) => {
    if (module.id === 'aquapol-form' && aquapol) {
      pdf.addPage('a4', 'portrait');
      const cursor = { current: FORM_PAGE_CONFIG.marginTop };

      if (aquapol.response) {
        renderFormDefinition(pdf, aquapol.definition, aquapol.response.data, cursor);
      } else {
        setFont(pdf, 'bold');
        pdf.setFontSize(14);
        pdf.text('Aquapol űrlap', FORM_PAGE_CONFIG.marginLeft, cursor.current);
        cursor.current += FORM_PAGE_CONFIG.lineHeight + 2;

        setFont(pdf, 'normal');
        pdf.setFontSize(10);
        pdf.text(
          'Az Aquapol űrlap még nincs kitöltve ehhez a projekthez.',
          FORM_PAGE_CONFIG.marginLeft,
          cursor.current
        );
      }

      hasContent = true;
    }

    if (module.id === 'drawings' && drawings) {
      const selectedIds = new Set(module.items ?? []);
      const filtered = module.items && module.items.length > 0
        ? drawings.data.filter((drawing) => selectedIds.has(drawing.id))
        : drawings.data;

      if (filtered.length === 0) {
        pdf.addPage('a4', 'portrait');
        const cursor = { current: FORM_PAGE_CONFIG.marginTop };
        setFont(pdf, 'bold');
        pdf.setFontSize(14);
        pdf.text('Rajz modul', FORM_PAGE_CONFIG.marginLeft, cursor.current);
        cursor.current += FORM_PAGE_CONFIG.lineHeight + 2;
        setFont(pdf, 'normal');
        pdf.setFontSize(10);
        pdf.text('Nincsenek kiválasztott rajzok ebben az exportban.', FORM_PAGE_CONFIG.marginLeft, cursor.current);
      } else {
        filtered.forEach((drawing) => {
          const { width, height } = getPaperDimensionsInMillimeters(
            drawing.paper_size,
            drawing.orientation
          );

          const orientation = drawing.orientation === 'portrait' ? 'p' : 'l';

          pdf.addPage([width, height], orientation);

          try {
            const image = renderDrawingToImage(drawing, { includeTitle: false });
            pdf.addImage(image, 'PNG', 0, 0, width, height);
          } catch (error) {
            console.warn('Failed to render drawing image:', error);
            setFont(pdf, 'bold');
            pdf.setFontSize(16);
            pdf.text('A rajz exportálása sikertelen volt.', 20, 40);
          }

          hasContent = true;
        });
      }

      hasContent = true;
    }
  });

  if (!hasContent) {
    pdf.addPage('a4', 'portrait');
    setFont(pdf, 'normal');
    pdf.setFontSize(12);
    pdf.text('Nincs exportálható tartalom a kiválasztott modulokhoz.', 20, 40);
  }

  const date = new Date().toISOString().split('T')[0];
  const filename = `${project.name.replace(/\s+/g, '_')}_modul_export_${date}.pdf`;

  pdf.save(filename);
}
