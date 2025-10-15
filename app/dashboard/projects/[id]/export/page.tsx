'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDrawings } from '@/lib/drawings/api';
import type { Drawing } from '@/lib/drawings/types';
import PDFExportModal from '@/components/drawings/PDFExportModal';
import { showError } from '@/lib/toast';

export default function ProjectExportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const items = await getDrawings(projectId);
        setDrawings(items);
      } catch (error) {
        console.error(error);
        showError('Nem sikerült betölteni a rajzokat az exporthoz');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [projectId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="text-gray-600 hover:text-gray-900 font-medium mb-6 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Vissza a projekt dashboardhoz
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rajz export központ</h1>
        <p className="text-gray-600">
          Exportálj PDF-et a projekt összes rajzáról, vagy készíts összefoglaló csomagot az ügyfélnek. Válaszd ki a
          rajzot, majd indítsd az exportálást.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Rajzok betöltése...</p>
        </div>
      ) : drawings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-600">
          Nincs még rajz ebben a projektben. Hozz létre egy új rajzot, hogy exportálni tudj.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drawings.map((drawing) => (
            <div
              key={drawing.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{drawing.name}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(drawing.created_at).toLocaleDateString('hu-HU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
                  {drawing.paper_size.toUpperCase()} • {drawing.orientation === 'landscape' ? 'Fekvő' : 'Álló'}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  {drawing.canvas_data.strokes.length} rajzelem
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/dashboard/projects/${projectId}/drawings/${drawing.id}`)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Megnyitás szerkesztésre
                </button>
                <button
                  onClick={() => setSelectedDrawing(drawing)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  PDF export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDrawing && (
        <PDFExportModal
          drawing={selectedDrawing}
          onClose={() => setSelectedDrawing(null)}
        />
      )}
    </div>
  );
}
