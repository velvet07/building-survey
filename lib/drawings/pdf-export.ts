/**
 * PDF Export Utility
 * Rajz exportálása PDF formátumban jsPDF használatával
 */

import jsPDF from 'jspdf';
import type { Drawing, PaperSize, PaperOrientation } from './types';
import { getCanvasSize, GRID_SIZE_PX } from './canvas-utils';

const PAPER_DIMENSIONS_MM: Record<
  PaperSize,
  Record<PaperOrientation, { width: number; height: number }>
> = {
  a4: {
    portrait: { width: 210, height: 297 },
    landscape: { width: 297, height: 210 },
  },
  a3: {
    portrait: { width: 297, height: 420 },
    landscape: { width: 420, height: 297 },
  },
};

export function getPaperDimensionsInMillimeters(
  paperSize: PaperSize,
  orientation: PaperOrientation
): { width: number; height: number } {
  return PAPER_DIMENSIONS_MM[paperSize][orientation];
}

/**
 * Export drawing to PDF using vector graphics (optimized)
 * Rajz exportálása PDF-be vector formában (optimalizált)
 *
 * Benefits:
 * - Small file size (KB instead of MB)
 * - Infinite zoom quality
 * - Fast rendering
 * - Proper vector graphics instead of raster image
 */
export async function exportDrawingToPDF(
  drawing: Drawing,
  paperSize: PaperSize = drawing.paper_size,
  orientation: PaperOrientation = drawing.orientation
): Promise<void> {
  try {
    // Create jsPDF instance
    const { width, height } = getPaperDimensionsInMillimeters(paperSize, orientation);
    const paperSizeMM: [number, number] = [width, height];
    const orientationFormat = orientation === 'portrait' ? 'p' : 'l';

    const pdf = new jsPDF({
      orientation: orientationFormat,
      unit: 'mm',
      format: paperSizeMM as [number, number],
      compress: true, // Enable compression
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Get canvas dimensions in pixels (300 DPI)
    const { width: canvasWidth, height: canvasHeight } = getCanvasSize(
      drawing.paper_size,
      drawing.orientation
    );

    // Calculate scale: pixels to mm
    const scaleX = pdfWidth / canvasWidth;
    const scaleY = pdfHeight / canvasHeight;

    // Draw white background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    // Draw grid as vector (lightweight)
    drawGridVector(pdf, pdfWidth, pdfHeight, GRID_SIZE_PX * scaleX);

    // Draw strokes as vector paths (very lightweight)
    drawing.canvas_data.strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      // Convert hex color to RGB
      const rgb = hexToRgb(stroke.color);
      pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
      pdf.setLineWidth(stroke.width * scaleX);
      pdf.setLineCap('round');
      pdf.setLineJoin('round');

      // Draw the path
      for (let i = 0; i < stroke.points.length; i += 2) {
        const x = stroke.points[i] * scaleX;
        const y = stroke.points[i + 1] * scaleY;

        if (i === 0) {
          // Move to first point (no line drawn)
          continue;
        } else {
          const prevX = stroke.points[i - 2] * scaleX;
          const prevY = stroke.points[i - 1] * scaleY;
          pdf.line(prevX, prevY, x, y);
        }
      }
    });

    // Add title as vector text (lightweight)
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(drawing.name, pdfWidth - 10, pdfHeight - 10, { align: 'right' });

    // Set metadata
    pdf.setProperties({
      title: drawing.name,
      subject: `Felmérési rajz - ${paperSize.toUpperCase()} ${orientation}`,
      author: 'Building Survey App',
      keywords: 'drawing, survey, floor plan',
      creator: 'Building Survey App - Drawing Module v1.2 (Vector Export)',
    });

    const date = new Date().toISOString().split('T')[0];
    const filename = `${drawing.name.replace(/\s+/g, '_')}_${date}.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDF generálása sikertelen');
  }
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Draw grid as vector graphics in PDF
 * Much smaller file size than raster image
 */
function drawGridVector(
  pdf: jsPDF,
  width: number,
  height: number,
  gridSize: number
): void {
  // Light gray for minor grid lines
  pdf.setDrawColor(229, 231, 235); // #E5E7EB
  pdf.setLineWidth(0.1);

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    pdf.line(x, 0, x, height);
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    pdf.line(0, y, width, y);
  }

  // Major grid lines (every 10mm)
  const majorGridSize = gridSize * 10;
  pdf.setDrawColor(209, 213, 219); // #D1D5DB
  pdf.setLineWidth(0.2);

  // Major vertical lines
  for (let x = 0; x <= width; x += majorGridSize) {
    pdf.line(x, 0, x, height);
  }

  // Major horizontal lines
  for (let y = 0; y <= height; y += majorGridSize) {
    pdf.line(0, y, width, y);
  }
}

/**
 * Render drawing to image (raster fallback)
 * Use reduced DPI and JPEG compression for smaller file size
 *
 * @deprecated Use vector export (exportDrawingToPDF) for better results
 */
export function renderDrawingToImage(
  drawing: Drawing,
  options: {
    includeTitle?: boolean;
    dpi?: number; // Default 150 (half of 300)
    quality?: number; // JPEG quality 0-1, default 0.85
    format?: 'png' | 'jpeg';
  } = {}
): string {
  const {
    includeTitle = false,
    dpi = 150, // Reduced from 300 DPI for smaller file
    quality = 0.85,
    format = 'jpeg', // JPEG default for compression
  } = options;

  // Calculate canvas size based on DPI
  const { width: baseWidth, height: baseHeight } = getCanvasSize(
    drawing.paper_size,
    drawing.orientation
  );

  // Scale down based on DPI reduction
  const scale = dpi / 300;
  const canvasWidth = Math.round(baseWidth * scale);
  const canvasHeight = Math.round(baseHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw grid (scaled)
  drawGrid(ctx, canvasWidth, canvasHeight, GRID_SIZE_PX * scale);

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

  if (includeTitle) {
    ctx.fillStyle = '#000000';
    ctx.font = `${24 * scale}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText(drawing.name, canvasWidth - 40 * scale, canvasHeight - 40 * scale);
  }

  // Return compressed image
  if (format === 'jpeg') {
    return canvas.toDataURL('image/jpeg', quality);
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
 * Uses JPEG compression for smaller file size
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

    // Draw grid (scaled, simplified for thumbnail)
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    const scaledGridSize = GRID_SIZE_PX * scale;

    // Only draw major grid lines for thumbnails (lighter)
    const majorGridSize = scaledGridSize * 10;
    for (let x = 0; x <= thumbWidth; x += majorGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, thumbHeight);
      ctx.stroke();
    }

    for (let y = 0; y <= thumbHeight; y += majorGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(thumbWidth, y);
      ctx.stroke();
    }

    // Draw strokes (scaled)
    drawing.canvas_data.strokes.forEach((stroke) => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(stroke.width * scale, 1); // Min 1px for visibility
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

    // Return compressed JPEG (smaller file size for thumbnails)
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return ''; // Return empty string on error
  }
}