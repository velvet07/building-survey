'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { CanvasData, Drawing } from '@/lib/drawings/types';
import { getCanvasSize, GRID_SIZE_PX } from '@/lib/drawings/canvas-utils';

const DrawingCanvas = dynamic(() => import('@/components/drawings/DrawingCanvas'), {
  ssr: false,
});

const paperSize: Drawing['paper_size'] = 'a4';
const orientation: Drawing['orientation'] = 'portrait';
const { width: canvasWidth, height: canvasHeight } = getCanvasSize(paperSize, orientation);

const previewDrawing: Drawing = {
  id: 'preview-drawing',
  project_id: 'preview-project',
  name: 'Előnézet - Minta rajz',
  canvas_data: {
    version: '1.0',
    strokes: [],
    metadata: {
      canvas_width: canvasWidth,
      canvas_height: canvasHeight,
      grid_size: GRID_SIZE_PX,
    },
  },
  paper_size: paperSize,
  orientation,
  created_by: 'preview-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

export default function DrawingPreviewPage() {
  const [saving, setSaving] = useState(false);
  const [drawing, setDrawing] = useState(previewDrawing);

  const handleSave = (canvasData: CanvasData) => {
    setSaving(true);
    setTimeout(() => {
      setDrawing((prev) => ({
        ...prev,
        canvas_data: canvasData,
      }));
      setSaving(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">Rajzvászon UI előnézet (fejlesztői oldal)</h1>
        <p className="text-sm text-slate-500">
          Ez az oldal csak fejlesztői előnézetre szolgál. A módosítások nem kerülnek mentésre.
        </p>
      </div>
      <div className="h-[calc(100vh-96px)]">
        <DrawingCanvas
          drawing={drawing}
          onSave={handleSave}
          onBack={() => window.history.back()}
          onChange={() => undefined}
          saving={saving}
          projectId={drawing.project_id}
        />
      </div>
    </div>
  );
}
