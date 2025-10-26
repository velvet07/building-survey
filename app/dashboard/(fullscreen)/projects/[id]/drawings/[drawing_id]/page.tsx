'use client';

/**
 * Drawing Editor Page
 * Rajz szerkesztő oldal - canvas interface
 */

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getDrawing, getDrawingBySlug, updateDrawing } from '@/lib/drawings/api';
import { getProjectById } from '@/lib/projects';
import type {
  Drawing,
  CanvasData,
  PaperSize,
  PaperOrientation,
} from '@/lib/drawings/types';
import { showError } from '@/lib/toast';
import { useUserRole } from '@/hooks/useUserRole';

// Dynamic import - Canvas csak client-side
const DrawingCanvas = dynamic(
  () => import('@/components/drawings/DrawingCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rajz betöltése...</p>
        </div>
      </div>
    ),
  }
);

export default function DrawingEditorPage() {
  const params = useParams();
  const router = useRouter();
  const drawingId = params.drawing_id as string;
  const projectId = params.id as string;
  const { canEdit } = useUserRole();

  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState<string | null>(null);

  type CanvasChangePayload = {
    canvasData: CanvasData;
    paperSize: PaperSize;
    orientation: PaperOrientation;
  };

  const pendingSaveRef = useRef<{ payload: CanvasChangePayload; signature: string } | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedSignature = useRef<string | null>(null);

  useEffect(() => {
    loadDrawing();
  }, [drawingId]);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (!drawing) return;

    const initialPayload: CanvasChangePayload = {
      canvasData: drawing.canvas_data,
      paperSize: drawing.paper_size,
      orientation: drawing.orientation,
    };

    lastSavedSignature.current = createSignature(initialPayload);
  }, [drawing]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const loadDrawing = async () => {
    try {
      setLoading(true);
      // Try to load by slug first (new approach)
      try {
        const data = await getDrawingBySlug(projectId, drawingId);
        setDrawing(data);
        return;
      } catch (slugError) {
        // If slug fails, try by ID for backward compatibility
        console.log('Slug lookup failed, trying by ID:', slugError);
        const data = await getDrawing(drawingId);
        setDrawing(data);
      }
    } catch (error) {
      showError('Rajz betöltése sikertelen');
      console.error(error);
      // Redirect back to list on error
      router.push(`/dashboard/projects/${projectId}/drawings`);
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async () => {
    try {
      const { data, error } = await getProjectById(projectId);
      if (error) throw error;
      setProjectName(data?.name ?? null);
    } catch (error) {
      console.error('Projekt betöltése sikertelen:', error);
    }
  };

  function createSignature(payload: CanvasChangePayload) {
    return JSON.stringify({
      paperSize: payload.paperSize,
      orientation: payload.orientation,
      data: payload.canvasData,
    });
  }

  function schedulePendingSave(delay = 800) {
    if (isSavingRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      void flushPendingSave();
    }, delay);
  }

  async function flushPendingSave() {
    if (!pendingSaveRef.current || isSavingRef.current || !drawing) {
      return;
    }

    const { payload, signature } = pendingSaveRef.current;
    pendingSaveRef.current = null;
    isSavingRef.current = true;
    setSaving(true);

    try {
      // Use drawing.id for database operations, not slug
      await updateDrawing(drawing.id, {
        canvas_data: payload.canvasData,
        paper_size: payload.paperSize,
        orientation: payload.orientation,
      });

      setDrawing((prev) =>
        prev
          ? {
              ...prev,
              canvas_data: payload.canvasData,
              paper_size: payload.paperSize,
              orientation: payload.orientation,
            }
          : prev
      );
      lastSavedSignature.current = signature;
    } catch (error) {
      console.error(error);
      showError('Automatikus mentés sikertelen');
      pendingSaveRef.current = { payload, signature };
    } finally {
      setSaving(false);
      isSavingRef.current = false;

      if (pendingSaveRef.current) {
        schedulePendingSave(400);
      } else if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    }
  }

  function handleCanvasChange(payload: CanvasChangePayload) {
    // Viewer cannot save changes
    if (!canEdit) {
      return;
    }

    const signature = createSignature(payload);

    if (signature === lastSavedSignature.current) {
      pendingSaveRef.current = null;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      return;
    }

    pendingSaveRef.current = { payload, signature };

    if (isSavingRef.current) {
      return;
    }

    schedulePendingSave();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rajz betöltése...</p>
        </div>
      </div>
    );
  }

  if (!drawing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Rajz nem található</p>
          <button
            onClick={() => router.push(`/dashboard/projects/${projectId}/drawings`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Vissza a listához
          </button>
        </div>
      </div>
    );
  }

  return (
    <DrawingCanvas
      drawing={drawing}
      onCanvasChange={handleCanvasChange}
      saving={saving}
      projectName={projectName ?? undefined}
      projectUrl={`/dashboard/projects/${projectId}`}
      drawingsUrl={`/dashboard/projects/${projectId}/drawings`}
      readOnly={!canEdit}
    />
  );
}
