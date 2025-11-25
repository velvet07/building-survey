/**
 * Drawing Module - TypeScript Type Definitions
 * Felmérés Rajzoló Modul típus definíciók
 */

// Paper size options
export type PaperSize = 'a4' | 'a3';

// Paper orientation options
export type PaperOrientation = 'portrait' | 'landscape';

// Drawing tool types
export type DrawingTool = 'pen' | 'eraser' | 'select' | 'pan';

// Point interface for coordinates
export interface Point {
  x: number;
  y: number;
}

// Stroke represents a single pen/eraser stroke
export interface Stroke {
  id: string;
  points: number[]; // Flattened array: [x1, y1, x2, y2, ...]
  color: string; // Hex color (e.g., "#000000")
  width: number; // Stroke width in pixels
  timestamp: string; // ISO 8601 timestamp
  compositeOperation?: GlobalCompositeOperation; // Optional canvas composite mode (e.g., destination-out for eraser)
}

// Canvas metadata
export interface CanvasMetadata {
  canvas_width: number; // Canvas width in pixels
  canvas_height: number; // Canvas height in pixels
  grid_size: number; // Grid size in pixels (11.8px = 1mm @ 300 DPI)
}

// Canvas data structure stored in JSONB
export interface CanvasData {
  version: string; // Data format version (e.g., "1.0")
  strokes: Stroke[]; // Array of all strokes
  metadata: CanvasMetadata; // Canvas configuration
}

// Drawing entity from database
export interface Drawing {
  id: string; // UUID
  project_id: string; // UUID - foreign key to projects table
  name: string; // Drawing name (e.g., "Alaprajz", "Alaprajz 2")
  slug: string; // URL-friendly slug (e.g., "alaprajz", "alaprajz-2")
  canvas_data: CanvasData; // JSONB - drawing data
  paper_size: PaperSize; // 'a4' | 'a3'
  orientation: PaperOrientation; // 'portrait' | 'landscape'
  created_by: string; // UUID - foreign key to users table
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp (soft delete)
}

// Input for creating a new drawing
export interface CreateDrawingInput {
  project_id: string; // Required: parent project UUID
  name?: string; // Optional: drawing name (auto-generated if not provided)
  paper_size?: PaperSize; // Optional: defaults to 'a4'
  orientation?: PaperOrientation; // Optional: defaults to 'portrait'
}

// Input for updating an existing drawing
export interface UpdateDrawingInput {
  name?: string; // Optional: update drawing name
  canvas_data?: CanvasData; // Optional: update canvas data
  paper_size?: PaperSize; // Optional: change paper size
  orientation?: PaperOrientation; // Optional: change orientation
}

// Paper dimensions in pixels at 300 DPI
export interface PaperDimensions {
  width: number; // Width in pixels
  height: number; // Height in pixels
}

// Tool configuration
export interface ToolConfig {
  tool: DrawingTool; // Current tool
  color: string; // Pen color (hex)
  width: number; // Stroke width (1-10px)
}

// Viewport state for pan & zoom
export interface ViewportState {
  scale: number; // Zoom level (0.25 - 4.0)
  x: number; // Pan X offset
  y: number; // Pan Y offset
}

// Gesture event for touch handling
export interface GestureEvent {
  type: 'start' | 'move' | 'end';
  points: Point[]; // Array of touch points
  distance?: number; // Distance between two fingers (pinch gesture)
  center?: Point; // Center point between fingers
}