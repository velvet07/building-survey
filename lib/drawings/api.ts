/**
 * Drawing Module - Supabase API Functions
 * Felmérés Rajzoló Modul - CRUD műveletek
 */

import { createClient } from '@/lib/supabase';
import { generateSlug, makeSlugUnique, isUUID } from './slug-utils';
import type {
  Drawing,
  CreateDrawingInput,
  UpdateDrawingInput,
  CanvasData,
  PaperOrientation,
} from './types';

/**
 * Get all drawings for a project
 * Összes rajz lekérése egy projekthez
 */
export async function getDrawings(projectId: string): Promise<Drawing[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('drawings')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching drawings:', error);
    throw new Error(`Rajzok betöltése sikertelen: ${error.message}`, { cause: error });
  }

  return data as Drawing[];
}

/**
 * Get a single drawing by ID or slug
 * Egyedi rajz lekérése ID vagy slug alapján
 * Backward compatible: tries slug first, falls back to ID
 */
export async function getDrawing(identifier: string): Promise<Drawing> {
  const supabase = createClient();

  // Determine if identifier is UUID or slug
  if (isUUID(identifier)) {
    // It's a UUID, search by id
    const { data, error } = await supabase
      .from('drawings')
      .select('*')
      .eq('id', identifier)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching drawing:', error);
      throw new Error(`Rajz betöltése sikertelen: ${error.message}`, { cause: error });
    }

    if (!data) {
      throw new Error('Rajz nem található');
    }

    return data as Drawing;
  } else {
    // It's a slug, search by slug
    const { data, error } = await supabase
      .from('drawings')
      .select('*')
      .eq('slug', identifier)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching drawing:', error);
      throw new Error(`Rajz betöltése sikertelen: ${error.message}`, { cause: error });
    }

    if (!data) {
      throw new Error('Rajz nem található');
    }

    return data as Drawing;
  }
}

/**
 * Get a single drawing by slug only
 * Egyedi rajz lekérése csak slug alapján
 */
export async function getDrawingBySlug(projectId: string, slug: string): Promise<Drawing> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('drawings')
    .select('*')
    .eq('project_id', projectId)
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('Error fetching drawing by slug:', error);
    throw new Error(`Rajz betöltése sikertelen: ${error.message}`, { cause: error });
  }

  if (!data) {
    throw new Error('Rajz nem található');
  }

  return data as Drawing;
}

/**
 * Create a new drawing
 * Új rajz létrehozása
 */
export async function createDrawing(input: CreateDrawingInput): Promise<Drawing> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Auth error:', userError);
    throw new Error(`Autentikációs hiba: ${userError.message}`, { cause: userError });
  }

  if (!user) {
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

  const drawingName = input.name || 'Alaprajz';

  // Generate slug from name
  const baseSlug = generateSlug(drawingName);

  // Get existing slugs for this project to ensure uniqueness
  const { data: existingDrawings } = await supabase
    .from('drawings')
    .select('slug')
    .eq('project_id', input.project_id)
    .is('deleted_at', null);

  const existingSlugs = existingDrawings?.map(d => d.slug) || [];
  const uniqueSlug = makeSlugUnique(baseSlug, existingSlugs);

  const { data, error } = await supabase
    .from('drawings')
    .insert({
      project_id: input.project_id,
      name: drawingName,
      slug: uniqueSlug,
      canvas_data: defaultCanvasData,
      paper_size: input.paper_size || 'a4',
      orientation: orientation,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating drawing:', error);
    throw new Error(`Rajz létrehozása sikertelen: ${error.message}`, { cause: error });
  }

  return data as Drawing;
}

/**
 * Update an existing drawing
 * Meglévő rajz frissítése
 */
export async function updateDrawing(
  drawingId: string,
  input: UpdateDrawingInput
): Promise<void> {
  const supabase = createClient();

  // Update only provided fields
  const updateData: Record<string, any> = {};
  if (input.name !== undefined) {
    updateData.name = input.name;

    // Regenerate slug when name changes
    const baseSlug = generateSlug(input.name);

    // Get current drawing to check project_id
    const { data: currentDrawing } = await supabase
      .from('drawings')
      .select('project_id')
      .eq('id', drawingId)
      .single();

    if (currentDrawing) {
      // Get existing slugs for this project (excluding current drawing)
      const { data: existingDrawings } = await supabase
        .from('drawings')
        .select('slug')
        .eq('project_id', currentDrawing.project_id)
        .neq('id', drawingId)
        .is('deleted_at', null);

      const existingSlugs = existingDrawings?.map(d => d.slug) || [];
      updateData.slug = makeSlugUnique(baseSlug, existingSlugs);
    } else {
      // Fallback: use base slug without uniqueness check
      updateData.slug = baseSlug;
    }
  }
  if (input.canvas_data !== undefined) updateData.canvas_data = input.canvas_data;
  if (input.paper_size !== undefined) updateData.paper_size = input.paper_size;
  if (input.orientation !== undefined) updateData.orientation = input.orientation;

  const { error } = await supabase
    .from('drawings')
    .update(updateData)
    .eq('id', drawingId);

  if (error) {
    console.error('Error updating drawing:', error);
    throw new Error(`Rajz mentése sikertelen: ${error.message}`, { cause: error });
  }
}

/**
 * Delete a drawing (soft delete)
 * Rajz törlése (soft delete - deleted_at beállítása)
 */
export async function deleteDrawing(drawingId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('drawings')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', drawingId);

  if (error) {
    console.error('Error deleting drawing:', error);
    throw new Error(`Rajz törlése sikertelen: ${error.message}`, { cause: error });
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