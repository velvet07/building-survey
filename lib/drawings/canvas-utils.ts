/**
 * Drawing Module - Canvas Utilities
 * Felmérés Rajzoló Modul - Canvas kalkulációk és segédfüggvények
 */

import type { PaperSize, PaperOrientation, PaperDimensions } from './types';

/**
 * Paper sizes in pixels at 300 DPI
 * A4: 210mm x 297mm = 2480px x 3508px
 * A3: 297mm x 420mm = 3508px x 4960px
 */
export const PAPER_SIZES: Record<PaperSize, Record<PaperOrientation, PaperDimensions>> = {
  a4: {
    portrait: { width: 2480, height: 3508 },
    landscape: { width: 3508, height: 2480 },
  },
  a3: {
    portrait: { width: 3508, height: 4960 },
    landscape: { width: 4960, height: 3508 },
  },
} as const;

/**
 * Grid configuration
 * 1mm grid at 300 DPI = 11.8px
 */
export const GRID_SIZE_MM = 1; // 1mm grid
export const GRID_SIZE_PX = 11.8; // 1mm at 300 DPI ≈ 11.8px
export const GRID_MAJOR_INTERVAL = 10; // Major grid lines every 10mm
export const GRID_MEDIUM_INTERVAL = 5; // Medium grid lines every 5mm

/**
 * Zoom constraints
 */
export const MIN_ZOOM = 0.25; // 25%
export const MAX_ZOOM = 4.0; // 400%
export const DEFAULT_ZOOM = 1.0; // 100%

/**
 * Canvas constraints
 */
export const MAX_CANVAS_DATA_SIZE_MB = 5; // Maximum 5MB per drawing
export const MAX_STROKES_WARNING = 500; // Warning threshold for performance

/**
 * Get canvas dimensions for paper size and orientation
 */
export function getCanvasSize(
  paperSize: PaperSize,
  orientation: PaperOrientation
): PaperDimensions {
  return PAPER_SIZES[paperSize][orientation];
}

/**
 * Calculate optimal canvas scale to fit in container
 * Számítsd ki az optimális canvas skálázást, hogy elférjen a containerben
 */
export function calculateCanvasScale(
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding: number = 40
): number {
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;

  const scaleX = availableWidth / canvasWidth;
  const scaleY = availableHeight / canvasHeight;

  // Take the minimum scale to ensure canvas fits in both dimensions
  // Don't scale up beyond 100% (max 1.0)
  return Math.min(scaleX, scaleY, 1);
}

/**
 * Calculate center position to center canvas in container
 * Számítsd ki a központi pozíciót a canvas központosításához
 */
export function calculateCenterPosition(
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number,
  scale: number
): { x: number; y: number } {
  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;

  const x = (containerWidth - scaledWidth) / 2;
  const y = (containerHeight - scaledHeight) / 2;

  return { x, y };
}

/**
 * Flatten points array from {x, y} objects to [x1, y1, x2, y2, ...]
 * Konva használja a flattened formátumot
 */
export function flattenPoints(points: { x: number; y: number }[]): number[] {
  return points.flatMap((point) => [point.x, point.y]);
}

/**
 * Unflatten points array from [x1, y1, x2, y2, ...] to {x, y} objects
 * Visszaalakítás koordináta objektumokká
 */
export function unflattenPoints(points: number[]): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length; i += 2) {
    result.push({ x: points[i], y: points[i + 1] });
  }
  return result;
}

/**
 * Calculate distance between two points
 * Két pont közötti távolság számítása
 */
export function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate center point between two points
 * Két pont közötti középpont számítása
 */
export function calculateCenter(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
}

/**
 * Clamp zoom level within allowed range
 * Zoom szint korlátozása az engedélyezett tartományba
 */
export function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

/**
 * Clamp a point so it remains within the canvas bounds
 * Pontok koordinátáinak korlátozása, hogy ne hagyják el a vásznat
 */
export function clampPointToCanvas(
  point: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(point.x, 0), canvasWidth),
    y: Math.min(Math.max(point.y, 0), canvasHeight),
  };
}

/**
 * Check if a point is inside the canvas bounds
 * Ellenőrizd, hogy egy pont a vászon határain belül van-e
 */
export function isPointInsideCanvas(
  point: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number
): boolean {
  return point.x >= 0 && point.x <= canvasWidth && point.y >= 0 && point.y <= canvasHeight;
}

/**
 * Generate SVG grid pattern for background
 * SVG grid pattern generálása háttérhez
 */
export function generateGridPattern(
  gridSize: number = GRID_SIZE_PX,
  majorInterval: number = GRID_MAJOR_INTERVAL
): string {
  const majorGridSize = gridSize * majorInterval;

  return `
    <pattern id="mm-grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <rect width="${gridSize}" height="${gridSize}" fill="none" />
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="#E5E7EB" stroke-width="0.5" />
    </pattern>
    <pattern id="mm-grid-major" width="${majorGridSize}" height="${majorGridSize}" patternUnits="userSpaceOnUse">
      <rect width="${majorGridSize}" height="${majorGridSize}" fill="url(#mm-grid)" />
      <path d="M ${majorGridSize} 0 L 0 0 0 ${majorGridSize}" fill="none" stroke="#D1D5DB" stroke-width="1" />
    </pattern>
  `;
}

/**
 * Estimate canvas data size in bytes
 * Canvas adat méretének becslése byte-okban
 */
export function estimateCanvasDataSize(strokeCount: number): number {
  // Rough estimate: ~100 bytes per stroke (JSON overhead + points)
  return strokeCount * 100;
}

/**
 * Check if canvas data exceeds size limit
 * Ellenőrizd, hogy a canvas adat túllépi-e a méretet
 */
export function isCanvasDataTooLarge(canvasDataJson: string): boolean {
  const sizeInBytes = new Blob([canvasDataJson]).size;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return sizeInMB > MAX_CANVAS_DATA_SIZE_MB;
}