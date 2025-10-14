/**
 * PDF Export Utility
 * Rajz exportálása PDF formátumban jsPDF használatával
 */

import jsPDF from 'jspdf';
import type { Drawing, PaperSize, PaperOrientation } from './types';
import { getCanvasSize, GRID_SIZE_PX } from './canvas-utils';

/**
 * Export drawing to PDF
 * Rajz exportálása PDF-be
 */
export async function exportDrawingToPDF(
  drawing: Drawing,
  paperSize: PaperSize = drawing.paper_size,
  orientation: PaperOrientation = drawing.orientation
): Promise<void> {
  try {
    const imageData = renderDrawingToImage(drawing, { includeTitle: true });

    // Create jsPDF instance
    // Paper sizes in mm: A4 = 210x297, A3 = 297x420
    const paperSizeMM = paperSize === 'a4' ? [210, 297] : [297, 420];
    const orientationFormat = orientation === 'portrait' ? 'p' : 'l';

    const pdf = new jsPDF({
      orientation: orientationFormat,
      unit: 'mm',
      format: paperSizeMM as [number, number],
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    pdf.setProperties({
      title: drawing.name,
      subject: `Felmérési rajz - ${paperSize.toUpperCase()} ${orientation}`,
      author: 'Building Survey App',
      keywords: 'drawing, survey, floor plan',
      creator: 'Building Survey App - Drawing Module',
    });

    const date = new Date().toISOString().split('T')[0];
    const filename = `${drawing.name.replace(/\s+/g, '_')}_${date}.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDF generálása sikertelen');
  }
}

export function renderDrawingToImage(
  drawing: Drawing,
  options: { includeTitle?: boolean } = {}
): string {
  const { width: canvasWidth, height: canvasHeight } = getCanvasSize(
    drawing.paper_size,
    drawing.orientation
  );

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  drawGrid(ctx, canvasWidth, canvasHeight, GRID_SIZE_PX);

  drawing.canvas_data.strokes.forEach((stroke) => {
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < stroke.points.length; i += 2) {
      const x = stroke.points[i];
      const y = stroke.points[i + 1];

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  });

  if (options.includeTitle) {
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(drawing.name, canvasWidth - 40, canvasHeight - 40);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Draw grid on canvas context
 * Rács rajzolása canvasra
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number
): void {
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 0.5;

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Major grid lines (every 10mm = 118px)
  const majorGridSize = gridSize * 10;
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;

  // Major vertical lines
  for (let x = 0; x <= width; x += majorGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Major horizontal lines
  for (let y = 0; y <= height; y += majorGridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Generate thumbnail preview of drawing
 * Rajz thumbnail előnézet generálása
 */
export function generateThumbnail(
  drawing: Drawing,
  maxWidth: number = 200,
  maxHeight: number = 280
): string {
  try {
    const { width: canvasWidth, height: canvasHeight } = getCanvasSize(
      drawing.paper_size,
      drawing.orientation
    );

    // Calculate thumbnail dimensions maintaining aspect ratio
    const aspectRatio = canvasWidth / canvasHeight;
    let thumbWidth = maxWidth;
    let thumbHeight = maxWidth / aspectRatio;

    if (thumbHeight > maxHeight) {
      thumbHeight = maxHeight;
      thumbWidth = maxHeight * aspectRatio;
    }

    // Create thumbnail canvas
    const canvas = document.createElement('canvas');
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Scale factor
    const scale = thumbWidth / canvasWidth;

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, thumbWidth, thumbHeight);

    // Draw grid (scaled)
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    const scaledGridSize = GRID_SIZE_PX * scale;

    for (let x = 0; x <= thumbWidth; x += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, thumbHeight);
      ctx.stroke();
    }

    for (let y = 0; y <= thumbHeight; y += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(thumbWidth, y);
      ctx.stroke();
    }

    // Draw strokes (scaled)
    drawing.canvas_data.strokes.forEach((stroke) => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < stroke.points.length; i += 2) {
        const x = stroke.points[i] * scale;
        const y = stroke.points[i + 1] * scale;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    });

    // Return data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return ''; // Return empty string on error
  }
}