'use client';

/**
 * Drawing Editor Page
 * Rajz szerkesztő oldal - canvas interface
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getDrawing, updateDrawing } from '@/lib/drawings/api';
import type { Drawing, CanvasData } from '@/lib/drawings/types';
import { showSuccess, showError } from '@/lib/toast';

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

  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadDrawing();
  }, [drawingId]);

  // Warn before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadDrawing = async () => {
    try {
      setLoading(true);
      const data = await getDrawing(drawingId);
      setDrawing(data);
    } catch (error) {
      showError('Rajz betöltése sikertelen');
      console.error(error);
      // Redirect back to list on error
      router.push(`/dashboard/projects/${projectId}/drawings`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (canvasData: CanvasData) => {
    if (saving) return;

    setSaving(true);
    try {
      await updateDrawing(drawingId, { canvas_data: canvasData });
      setHasUnsavedChanges(false);
      showSuccess('Rajz mentve!');
    } catch (error) {
      showError('Mentés sikertelen');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'Van mentetlen módosításod. Biztosan elhagyod az oldalt?'
      );
      if (!confirmLeave) return;
    }
    router.push(`/dashboard/projects/${projectId}/drawings`);
  };

  const handleCanvasChange = () => {
    setHasUnsavedChanges(true);
  };

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
    <div className="h-screen flex flex-col overflow-hidden">
      <DrawingCanvas
        drawing={drawing}
        onSave={handleSave}
        onBack={handleBack}
        onChange={handleCanvasChange}
        saving={saving}
        projectId={projectId}
      />
    </div>
  );
}