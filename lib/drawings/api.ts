/**
 * Drawing Module - MySQL Direct Connection
 * Felmérés Rajzoló Modul - CRUD műveletek
 *
 * All drawing data is stored in local MySQL/MariaDB database.
 */

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth/local';
import type {
  Drawing,
  CreateDrawingInput,
  UpdateDrawingInput,
  CanvasData,
  PaperOrientation,
} from './types';
import crypto from 'crypto';

/**
 * Get all drawings for a project
 * Összes rajz lekérése egy projekthez
 */
export async function getDrawings(projectId: string): Promise<Drawing[]> {
  try {
    const result = await query<Drawing>(
      `SELECT * FROM drawings
       WHERE project_id = ? AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [projectId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching drawings:', error);
    throw new Error(`Rajzok betöltése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
  }
}

/**
 * Get a single drawing by ID
 * Egyedi rajz lekérése ID alapján
 */
export async function getDrawing(drawingId: string): Promise<Drawing> {
  try {
    const result = await query<Drawing>(
      `SELECT * FROM drawings
       WHERE id = ? AND deleted_at IS NULL`,
      [drawingId]
    );

    if (result.rows.length === 0) {
      throw new Error('Rajz nem található');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching drawing:', error);
    throw new Error(`Rajz betöltése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
  }
}

/**
 * Get a single drawing by slug
 * Egyedi rajz lekérése slug alapján (user-friendly URL)
 */
export async function getDrawingBySlug(
  projectId: string,
  slug: string
): Promise<Drawing> {
  try {
    const result = await query<Drawing>(
      `SELECT * FROM drawings
       WHERE project_id = ? AND slug = ? AND deleted_at IS NULL`,
      [projectId, slug]
    );

    if (result.rows.length === 0) {
      throw new Error('Rajz nem található');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching drawing by slug:', error);
    throw new Error(`Rajz betöltése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
  }
}

/**
 * Create a new drawing
 * Új rajz létrehozása
 */
export async function createDrawing(input: CreateDrawingInput): Promise<Drawing> {
  try {
    // Get current authenticated user
    const session = await getSession();
    const userId = session?.userId || null;

    if (!userId) {
      throw new Error('Felhasználó nem található - kérlek jelentkezz be újra');
    }

    // Calculate canvas dimensions based on orientation
    const orientation = input.orientation || 'portrait';
    const isLandscape = orientation === 'landscape';

    // Default canvas dimensions (A4 @ 300 DPI)
    const defaultCanvasData: CanvasData = {
      version: '1.0',
      strokes: [],
      metadata: {
        canvas_width: isLandscape ? 3508 : 2480,
        canvas_height: isLandscape ? 2480 : 3508,
        grid_size: 11.8, // 1mm @ 300 DPI
      },
    };

    const drawingId = crypto.randomUUID();
    await query(
      `INSERT INTO drawings (id, project_id, name, canvas_data, paper_size, orientation, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        drawingId,
        input.project_id,
        input.name || 'Alaprajz',
        JSON.stringify(defaultCanvasData),
        input.paper_size || 'a4',
        orientation,
        userId,
      ]
    );

    const result = await query<Drawing>(
      `SELECT * FROM drawings WHERE id = ?`,
      [drawingId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating drawing:', error);
    throw new Error(`Rajz létrehozása sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
  }
}

/**
 * Update an existing drawing
 * Meglévő rajz frissítése
 */
export async function updateDrawing(
  drawingId: string,
  input: UpdateDrawingInput
): Promise<void> {
  try {
    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push(`name = ?`);
      values.push(input.name);
    }

    if (input.canvas_data !== undefined) {
      updates.push(`canvas_data = ?`);
      values.push(JSON.stringify(input.canvas_data));
    }

    if (input.paper_size !== undefined) {
      updates.push(`paper_size = ?`);
      values.push(input.paper_size);
    }

    if (input.orientation !== undefined) {
      updates.push(`orientation = ?`);
      values.push(input.orientation);
    }

    if (updates.length === 0) {
      return; // Nothing to update
    }

    // Always update updated_at
    updates.push('updated_at = NOW()');

    // Add drawing ID as last parameter
    values.push(drawingId);

    const queryText = `UPDATE drawings
                       SET ${updates.join(', ')}
                       WHERE id = ? AND deleted_at IS NULL`;

    await query(queryText, values);
  } catch (error) {
    console.error('Error updating drawing:', error);
    throw new Error(`Rajz mentése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
  }
}

/**
 * Delete a drawing (soft delete)
 * Rajz törlése (soft delete - deleted_at beállítása)
 */
export async function deleteDrawing(drawingId: string): Promise<void> {
  try {
    await query(
      `UPDATE drawings
       SET deleted_at = NOW()
       WHERE id = ?`,
      [drawingId]
    );
  } catch (error) {
    console.error('Error deleting drawing:', error);
    throw new Error(`Rajz törlése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
  }
}

/**
 * Save canvas data for a drawing
 * Rajz canvas adatok mentése
 */
export async function saveCanvasData(
  drawingId: string,
  canvasData: CanvasData
): Promise<void> {
  await updateDrawing(drawingId, { canvas_data: canvasData });
}

/**
 * Update drawing name
 * Rajz nevének frissítése
 */
export async function updateDrawingName(
  drawingId: string,
  name: string
): Promise<void> {
  await updateDrawing(drawingId, { name });
}

/**
 * Update paper settings (size and orientation)
 * Papír beállítások frissítése (méret és orientáció)
 */
export async function updatePaperSettings(
  drawingId: string,
  paperSize: 'a4' | 'a3',
  orientation: PaperOrientation
): Promise<void> {
  await updateDrawing(drawingId, {
    paper_size: paperSize,
    orientation: orientation,
  });
}
