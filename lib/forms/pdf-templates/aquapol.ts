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
}

interface LayoutRowOptions {
  density?: 'default' | 'compact';
  minHeight?: number;
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
  { type: 'separator', marginTop: 6, marginBottom: 5, lineWidth: 0.5 },
  {
    type: 'row',
    columns: [
      { label: '12. Mikor épült a ház', fieldId: 'house_built_year', width: 0.5 },
      { label: '13. Mekkora az alapterülete', fieldId: 'house_floor_area', width: 0.5 },
    ],
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '14. Főfalak vastagsága', fieldId: 'main_wall_thickness', width: 0.5 },
      { label: '15. Közfalak vastagsága', fieldId: 'partition_wall_thickness', width: 0.5 },
    ],
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '16. Van-e pince a ház alatt?', fieldId: 'basement_exists', width: 0.5 },
      { label: '17. Hány m² alapterületű a pince', fieldId: 'basement_area', width: 0.5 },
    ],
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
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
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
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
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '22. Milyen építőanyagból készült a ház', fieldId: 'house_material', width: 0.5 },
      { label: '23. Mikor volt utoljára tatarozva', fieldId: 'last_renovation', width: 0.5 },
    ],
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
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
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '26. Festés után', fieldId: 'dampness_after_paint', width: 0.5 },
      { label: '27. Látható-e sókicsapódás a falon?', fieldId: 'salt_efflorescence', width: 0.5 },
    ],
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '28. Penész?', fieldId: 'mold_present', width: 0.5 },
      { label: '30. Csak a bútorok mögött', fieldId: 'mold_behind_furniture', width: 0.5 },
    ],
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      {
        label: '29. A penész a falak alsó felén vagy a mennyezeti részen jelentkezik',
        fieldId: 'mold_location',
      },
    ],
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
  },
  {
    type: 'row',
    columns: [
      { label: '31. Dohos, nyirkos a levegő a lakásban', fieldId: 'air_musty', width: 0.5 },
      { label: '32. Az építmény terepviszonyai', fieldId: 'terrain_type', width: 0.5 },
    ],
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
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
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
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
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
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
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
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
    options: { density: 'compact', minValueLines: 1, valueLineClamp: 1 },
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
  const marginX = 14;
  const marginTop = 20;
  const marginBottom = 18;
  const contentWidth = pageWidth - marginX * 2;
  const labelFontSize = 9;
  const labelLineHeight = 4;
  const valueFontSize = 10;
  const valueLineHeight = 4.4;
  const verticalPadding = 1.2;
  const labelValueSpacing = 1;
  const defaultRowMinHeight = 11.5;
  const cellPaddingX = 3;

  let cursorY = marginTop;
  let isFirstRow = true;

  setFont(pdf, 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  pdf.text('FELMÉRŐLAP', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 3.5;

  pdf.setTextColor(0, 0, 0);

  const ensureSpace = (height: number) => {
    if (cursorY + height > pageHeight - marginBottom) {
      pdf.addPage('a4', 'portrait');
      cursorY = marginTop;
      isFirstRow = true;
    }
  };

  const drawSectionHeader = (title: string) => {
    const headerHeight = 5.5;
    ensureSpace(headerHeight);
    setFont(pdf, 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    pdf.text(title, marginX + 2, cursorY + 4);
    cursorY += headerHeight;
    pdf.setTextColor(0, 0, 0);
    isFirstRow = true;
  };

  const drawSeparator = (entry: Extract<LayoutEntry, { type: 'separator' }>) => {
    const marginBefore = entry.marginTop ?? 6;
    const marginAfter = entry.marginBottom ?? 4;
    const totalHeight = marginBefore + marginAfter + 0.5;
    ensureSpace(totalHeight);
    cursorY += marginBefore;
    pdf.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    pdf.setLineWidth(entry.lineWidth ?? 0.45);
    pdf.line(marginX, cursorY, marginX + contentWidth, cursorY);
    cursorY += marginAfter;
    isFirstRow = true;
  };

  const drawRow = (columns: LayoutColumn[], options?: LayoutRowOptions) => {
    const availableWidth = contentWidth;
    const columnDescriptors = columns.map((column) => {
      const widthRatio = column.width ?? 1 / columns.length;
      const colWidth = availableWidth * widthRatio;
      const innerWidth = colWidth - cellPaddingX * 2;
      const label = `${column.label}:`;
      setFont(pdf, 'bold');
      pdf.setFontSize(labelFontSize);
      const labelLines = pdf.splitTextToSize(label, innerWidth);
      const value = resolveValue(column.fieldId, values);
      setFont(pdf, 'normal');
      pdf.setFontSize(valueFontSize);
      const printableValue = value === '-' ? '' : value;
      let valueLines = printableValue
        ? pdf.splitTextToSize(printableValue, innerWidth)
        : [];
      if (options?.valueLineClamp) {
        valueLines = valueLines.slice(0, options.valueLineClamp);
      }
      const minValueLines = options?.minValueLines ?? 0;
      const valueLineCount = Math.max(valueLines.length, minValueLines);
      const labelHeight = Math.max(labelLineHeight * labelLines.length, labelLineHeight);
      const valueHeight =
        valueLineCount > 0 ? labelValueSpacing + valueLineCount * valueLineHeight : 0;
      const contentHeight = verticalPadding * 2 + labelHeight + valueHeight;
      return {
        column,
        width: colWidth,
        labelLines,
        valueLines,
        contentHeight,
      };
    });

    const rowMinHeight = options?.minHeight ?? (options?.density === 'compact' ? 10 : defaultRowMinHeight);
    const rowHeight = Math.max(rowMinHeight, ...columnDescriptors.map((item) => item.contentHeight));
    ensureSpace(rowHeight);

    pdf.setDrawColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
    pdf.setLineWidth(0.25);

    if (isFirstRow) {
      pdf.line(marginX, cursorY, marginX + contentWidth, cursorY);
      isFirstRow = false;
    }

    pdf.line(marginX, cursorY + rowHeight, marginX + contentWidth, cursorY + rowHeight);
    pdf.line(marginX, cursorY, marginX, cursorY + rowHeight);
    pdf.line(marginX + contentWidth, cursorY, marginX + contentWidth, cursorY + rowHeight);

    let x = marginX;
    columnDescriptors.forEach((descriptor, index) => {
      const { column, width, labelLines, valueLines } = descriptor;

      const labelX = x + cellPaddingX;
      let labelY = cursorY + verticalPadding + labelLineHeight;
      setFont(pdf, 'bold');
      pdf.setFontSize(labelFontSize);
      pdf.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
      labelLines.forEach((line: string) => {
        pdf.text(line, labelX, labelY);
        labelY += labelLineHeight;
      });

      setFont(pdf, 'normal');
      pdf.setFontSize(valueFontSize);
      pdf.setTextColor(0, 0, 0);
      let valueY =
        cursorY +
        verticalPadding +
        labelLines.length * labelLineHeight +
        labelValueSpacing +
        valueLineHeight;
      valueLines.forEach((line: string) => {
        pdf.text(line, labelX, valueY);
        valueY += valueLineHeight;
      });

      if (index < columnDescriptors.length - 1) {
        const dividerX = x + width;
        pdf.line(dividerX, cursorY, dividerX, cursorY + rowHeight);
      }

      x += width;
    });

    cursorY += rowHeight;
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

  setFont(pdf, 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(BRAND_GREEN.r, BRAND_GREEN.g, BRAND_GREEN.b);
  const footerText = 'A dátumozás rendszeres és megfelelő elvégzése javasolt.';
  pdf.text(footerText, marginX, pageHeight - marginBottom + 6);
}
