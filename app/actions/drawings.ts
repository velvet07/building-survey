'use server';

/**
 * Server Actions for Drawings
 *
 * Uses local PostgreSQL database via lib/drawings/api.ts
 */

import { revalidatePath } from 'next/cache';
import {
  getDrawings,
  getDrawing,
  createDrawing as createDrawingLib,
  updateDrawing,
  deleteDrawing,
  saveCanvasData
} from '@/lib/drawings/api';
import type { CreateDrawingInput, UpdateDrawingInput, CanvasData } from '@/lib/drawings/types';

export async function getDrawingsAction(projectId: string) {
  try {
    const drawings = await getDrawings(projectId);
    return { data: drawings, error: null };
  } catch (error) {
    console.error('getDrawingsAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function getDrawingAction(drawingId: string) {
  try {
    const drawing = await getDrawing(drawingId);
    return { data: drawing, error: null };
  } catch (error) {
    console.error('getDrawingAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function createDrawingAction(input: CreateDrawingInput) {
  try {
    const drawing = await createDrawingLib(input);
    revalidatePath(`/dashboard/projects/${input.project_id}/drawings`);
    return { data: drawing, error: null };
  } catch (error) {
    console.error('createDrawingAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function updateDrawingAction(drawingId: string, input: UpdateDrawingInput) {
  try {
    await updateDrawing(drawingId, input);
    return { error: null };
  } catch (error) {
    console.error('updateDrawingAction error:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function deleteDrawingAction(drawingId: string) {
  try {
    await deleteDrawing(drawingId);
    return { error: null };
  } catch (error) {
    console.error('deleteDrawingAction error:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function saveCanvasDataAction(drawingId: string, canvasData: CanvasData) {
  try {
    await saveCanvasData(drawingId, canvasData);
    return { error: null };
  } catch (error) {
    console.error('saveCanvasDataAction error:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
