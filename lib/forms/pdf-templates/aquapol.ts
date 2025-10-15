import jsPDF from 'jspdf';
import { setFont } from '@/lib/pdf/font-utils';
import { formatFormValue } from '../pdf/utils';
import type { FormDefinition, FormValues } from '../types';

const BRAND_GREEN = { r: 0, g: 132, b: 70 } as const;
type ColumnWidth = number; // 0-1 ratio of the available width

interface LayoutColumn {
  label: string;
  fieldId: string;
  width?: ColumnWidth;
  labelWidth?: number;
}

interface LayoutRowOptions {
  minValueLines?: number;
  valueLineClamp?: number;
}

type LayoutEntry =
  | { type: 'section'; title: string }
  | { type: 'separator'; marginTop?: number; marginBottom?: number; lineWidth?: number }
  | { type: 'row'; columns: LayoutColumn[]; options?: LayoutRowOptions };

const AQUAPOL_LAYOUT: LayoutEntry[] = [
  {
    type: 'row',
    columns: [
      { label: 'Megrendelő neve', fieldId: 'customer_name', width: 0.5 },
      { label: 'Lakcím / Irányítószám', fieldId: 'customer_address', width: 0.5 },
    ],
  },
  {
    type: 'row',
    columns: [
      { label: 'Telefon', fieldId: 'customer_phone', width: 0.5 },
      { label: 'Mobil', fieldId: 'customer_mobile', width: 0.5 },
    ],
  },
  {
    type: 'row',
    columns: [
      { label: 'E-mail', fieldId: 'customer_email', width: 0.5 },
      { label: 'Kapcsolattartó', fieldId: 'contact_person', width: 0.5 },
    ],
  },
  {
    type: 'row',
    columns: [{ label: 'Telefon (kapcsolattartó)', fieldId: 'contact_person_phone' }],
  },
  { type: 'section', title: 'Ahová az AQUAPOL® készüléket telepíteni kívánja' },
  {
    type: 'row',
    columns: [
      { label: 'Név', fieldId: 'installation_name', width: 0.5 },
      { label: 'Telefon', fieldId: 'installation_phone', width: 0.5 },
    ],
  },
  {
    type: 'row',
    columns: [{ label: 'Cím / Irányítószám', fieldId: 'installation_address' }],
  },
  { type: 'separator', marginTop: 0, marginBottom: 0, lineWidth: 0.5 },
  {
    type: 'row',
    columns: [
      { label: '12. Mikor épült a ház', fieldId: 'house_built_year', width: 0.5 },
      { label: '13. Mekkora az alapterülete', fieldId: 'house_floor_area', width: 0.5 },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '14. Főfalak vastagsága', fieldId: 'main_wall_thickness', width: 0.5 },
      { label: '15. Közfalak vastagsága', fieldId: 'partition_wall_thickness', width: 0.5 },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '16. Van-e pince a ház alatt?', fieldId: 'basement_exists', width: 0.5 },
      { label: '17. Hány m² alapterületű a pince', fieldId: 'basement_area', width: 0.5 },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '18. A pince mélysége a föld szintjéhez képest', fieldId: 'basement_depth', width: 0.5 },
      {
        label: '19. A föld szintje feletti pincemagasság',
        fieldId: 'basement_height_above_ground',
        width: 0.5,
      },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      {
        label: '20. Van-e oldalirányú nedvesedésre utaló jel a pincében?',
        fieldId: 'basement_lateral_moisture',
        width: 0.5,
      },
      {
        label:
          '21. Ha nincs pince az épület alatt, mekkora a padlószint magassága a járdaszinthez képest',
        fieldId: 'floor_height_without_basement',
        width: 0.5,
      },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '22. Milyen építőanyagból készült a ház', fieldId: 'house_material', width: 0.5 },
      { label: '23. Mikor volt utoljára tatarozva', fieldId: 'last_renovation', width: 0.5 },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '24. Festve', fieldId: 'last_paint', width: 0.5 },
      {
        label: '25. Mennyi időt múlva jelentkezett a nedvesedés',
        fieldId: 'dampness_after_time',
        width: 0.5,
      },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '26. Festés után', fieldId: 'dampness_after_paint', width: 0.5 },
      { label: '27. Látható-e sókicsapódás a falon?', fieldId: 'salt_efflorescence', width: 0.5 },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '28. Penész?', fieldId: 'mold_present', width: 0.5 },
      { label: '30. Csak a bútorok mögött', fieldId: 'mold_behind_furniture', width: 0.5 },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      {
        label: '29. A penész a falak alsó felén vagy a mennyezeti részen jelentkezik',
        fieldId: 'mold_location',
      },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '31. Dohos, nyirkos a levegő a lakásban', fieldId: 'air_musty', width: 0.5 },
      { label: '32. Az építmény terepviszonyai', fieldId: 'terrain_type', width: 0.5 },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '33. Esőcsatorna állapota', fieldId: 'gutter_condition', width: 0.5 },
      {
        label:
          '34. Épül-e járda az épület köré, ami a fal tövéről indul és elvezeti a felcsapódó vizeket?',
        fieldId: 'sidewalk_building',
        width: 0.5,
      },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      {
        label: '35. Megoldódott-e az esővíz kifolyónyílásánál a vízelvezetés a falakról?',
        fieldId: 'rainwater_drainage_resolved',
        width: 0.5,
      },
      {
        label: '36. Télen intenzív fűtés mellett páralecsapódást észlel-e a falakon?',
        fieldId: 'winter_condensation',
        width: 0.5,
      },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      {
        label: '37. A falakon látható falnedvesség magassága (cm a főfalon)',
        fieldId: 'wall_moisture_height_main',
        width: 0.5,
      },
      {
        label: '37. A falakon látható falnedvesség magassága (cm a közbenső falon)',
        fieldId: 'wall_moisture_height_partition',
        width: 0.5,
      },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '38. Deformálódik-e a padlózat a nedvesség hatására?', fieldId: 'floor_deformation', width: 0.5 },
      {
        label:
          '39. Helytelen kivitelezésből adódó nedvesedés, eresz, WC, fürdőszoba, konyha, egyéb',
        fieldId: 'incorrect_execution_dampness',
        width: 0.5,
      },
    ],
    options: { minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '39. Részletek (ha Igen)', fieldId: 'incorrect_execution_details' },
    ],
    options: { minValueLines: 2 },
  },
  {
    type: 'row',
    columns: [
      { label: '40. Egyéb észrevételei amit lényegesnek tart', fieldId: 'additional_observations' },
    ],
    options: { minValueLines: 3 },
  },
  {
    type: 'row',
    columns: [{ label: '41. Kalkuláció', fieldId: 'calculation_notes' }],
    options: { minValueLines: 5 },
  },
];

function resolveValue(fieldId: string, values: FormValues): string {
  if (fieldId === 'terrain_type') {
    const terrainValue = values[fieldId];
    switch (terrainValue) {
      case 'plain':
        return 'Síkság';
      case 'riverside':
        return 'Folyópart';
      case 'slope':
        return 'Lejtő';
      default:
        return formatFormValue(terrainValue ?? null);
    }
  }

  return formatFormValue(values[fieldId] ?? null);
}

export function renderAquapolFormPDF(
  pdf: jsPDF,
  _definition: FormDefinition,
  values: FormValues
): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 12;
  const marginTop = 19;
  const marginBottom = 16;
  const contentWidth = pageWidth - marginX * 2;
  const labelFontSize = 9;
  const valueFontSize = 10;
  const lineHeight = 4;
  const verticalPadding = 1;
  const cellPaddingX = 3;
  const labelValueGap = 2.2;
  const outerBorderWidth = 0.7;
  const innerBorderWidth = 0.22;
  const sectionLineWidth = 0.6;

  let cursorY = marginTop;
  let tableStartY: number | null = null;
  let tableEndY = marginTop;

  const drawTableBorder = () => {
    if (tableStartY !== null) {
      pdf.setLineWidth(outerBorderWidth);
      pdf.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
      pdf.rect(marginX, tableStartY, contentWidth, tableEndY - tableStartY);
    }
  };

  setFont(pdf, 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  pdf.text('FELMÉRŐLAP', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 3.8;

  pdf.setTextColor(0, 0, 0);

  const ensureSpace = (height: number) => {
    if (cursorY + height > pageHeight - marginBottom) {
      drawTableBorder();
      pdf.addPage('a4', 'portrait');
      cursorY = marginTop;
      tableStartY = null;
      tableEndY = marginTop;
    }
  };

  const registerTableBounds = (top: number, bottom: number) => {
    if (tableStartY === null) {
      tableStartY = top;
    }
    tableEndY = Math.max(tableEndY, bottom);
  };

  const drawSectionHeader = (title: string) => {
    const headerHeight = 5;
    ensureSpace(headerHeight);
    const topY = cursorY;
    pdf.setLineWidth(sectionLineWidth);
    pdf.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    pdf.line(marginX, cursorY, marginX + contentWidth, cursorY);
    cursorY += headerHeight;
    setFont(pdf, 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    pdf.text(title, marginX + cellPaddingX, cursorY - headerHeight + lineHeight + 0.4);
    pdf.setLineWidth(innerBorderWidth);
    pdf.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    pdf.line(marginX, cursorY, marginX + contentWidth, cursorY);
    pdf.setTextColor(0, 0, 0);
    registerTableBounds(topY, cursorY);
  };

  const drawSeparator = (entry: Extract<LayoutEntry, { type: 'separator' }>) => {
    const marginBefore = entry.marginTop ?? 0;
    const marginAfter = entry.marginBottom ?? 0;
    const totalHeight = marginBefore + marginAfter;
    ensureSpace(totalHeight + 0.5);
    cursorY += marginBefore;
    const lineY = cursorY;
    pdf.setLineWidth(entry.lineWidth ?? sectionLineWidth);
    pdf.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    pdf.line(marginX, lineY, marginX + contentWidth, lineY);
    cursorY += marginAfter;
    registerTableBounds(lineY, cursorY);
  };

  const drawRow = (columns: LayoutColumn[], options?: LayoutRowOptions) => {
    const availableWidth = contentWidth;
    const columnDescriptors = columns.map((column) => {
      const widthRatio = column.width ?? 1 / columns.length;
      const colWidth = availableWidth * widthRatio;
      const innerWidth = colWidth - cellPaddingX * 2;
      const labelAreaWidth = Math.max(
        0,
        Math.min(innerWidth - labelValueGap, innerWidth * (column.labelWidth ?? 0.45))
      );
      const valueAreaWidth = Math.max(innerWidth - labelAreaWidth - labelValueGap, 1);
      const label = `${column.label}:`;
      setFont(pdf, 'bold');
      pdf.setFontSize(labelFontSize);
      const labelLines = pdf.splitTextToSize(label, Math.max(labelAreaWidth, 6));
      const labelLineCount = Math.max(labelLines.length, 1);
      const value = resolveValue(column.fieldId, values);
      const printableValue = value === '-' ? '' : value;
      setFont(pdf, 'normal');
      pdf.setFontSize(valueFontSize);
      let valueLines = printableValue
        ? pdf.splitTextToSize(printableValue, valueAreaWidth)
        : [];
      if (options?.valueLineClamp) {
        valueLines = valueLines.slice(0, options.valueLineClamp);
      }
      const minValueLines = options?.minValueLines ?? 1;
      const valueLineCount = Math.max(valueLines.length, minValueLines);
      const lineCount = Math.max(labelLineCount, valueLineCount);
      const rowHeight = verticalPadding * 2 + lineCount * lineHeight;

      return {
        column,
        width: colWidth,
        labelLines,
        valueLines,
        labelAreaWidth,
        valueAreaWidth,
        lineCount,
        rowHeight,
      };
    });

    const rowHeight = Math.max(...columnDescriptors.map((descriptor) => descriptor.rowHeight));
    ensureSpace(rowHeight);
    const rowTop = cursorY;

    pdf.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    pdf.setLineWidth(innerBorderWidth);

    let x = marginX;
    columnDescriptors.forEach((descriptor, index) => {
      const { width, labelLines, valueLines, labelAreaWidth, valueAreaWidth, lineCount } = descriptor;
      const labelX = x + cellPaddingX;
      const valueX = labelX + labelAreaWidth + labelValueGap;
      const textBaseY = cursorY + verticalPadding + lineHeight;

      for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
        const labelLine = labelLines[lineIndex];
        if (labelLine) {
          setFont(pdf, 'bold');
          pdf.setFontSize(labelFontSize);
          pdf.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
          pdf.text(labelLine, labelX, textBaseY + lineIndex * lineHeight);
        }

        const valueLine = valueLines[lineIndex];
        if (valueLine) {
          setFont(pdf, 'normal');
          pdf.setFontSize(valueFontSize);
          pdf.setTextColor(0, 0, 0);
          pdf.text(valueLine, valueX, textBaseY + lineIndex * lineHeight, {
            maxWidth: valueAreaWidth,
          });
        }
      }

      if (index < columnDescriptors.length - 1) {
        const dividerX = x + width;
        pdf.setLineWidth(innerBorderWidth);
        pdf.line(dividerX, rowTop, dividerX, rowTop + rowHeight);
      }

      x += width;
    });

    pdf.setTextColor(0, 0, 0);

    pdf.setLineWidth(innerBorderWidth);
    pdf.line(marginX, rowTop + rowHeight, marginX + contentWidth, rowTop + rowHeight);

    cursorY += rowHeight;
    registerTableBounds(rowTop, cursorY);
  };

  AQUAPOL_LAYOUT.forEach((entry) => {
    if (entry.type === 'section') {
      drawSectionHeader(entry.title);
    } else if (entry.type === 'separator') {
      drawSeparator(entry);
    } else {
      drawRow(entry.columns, entry.options);
    }
  });

  drawTableBorder();

  setFont(pdf, 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  const footerText = 'A dátumozás rendszeres és megfelelő elvégzése javasolt.';
  pdf.text(footerText, marginX, pageHeight - marginBottom + 6);
}
