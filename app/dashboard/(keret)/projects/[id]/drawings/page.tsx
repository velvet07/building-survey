'use client';

/**
 * Drawing List Page
 * Rajzok listázása projekten belül
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDrawings, createDrawing } from '@/lib/drawings/api';
import type { Drawing } from '@/lib/drawings/types';
import { showSuccess, showError } from '@/lib/toast';
import DrawingList from '@/components/drawings/DrawingList';

export default function DrawingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDrawings();
  }, [projectId]);

  const loadDrawings = async () => {
    try {
      setLoading(true);
      const data = await getDrawings(projectId);
      setDrawings(data);
    } catch (error) {
      showError('Rajzok betöltése sikertelen');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrawing = async () => {
    if (creating) return;

    setCreating(true);
    try {
      const newDrawing = await createDrawing({ project_id: projectId });
      showSuccess('Rajz létrehozva!');
      router.push(`/dashboard/projects/${projectId}/drawings/${newDrawing.id}`);
    } catch (error) {
      showError('Rajz létrehozása sikertelen');
      console.error(error);
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rajzok betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="text-gray-600 hover:text-gray-900 font-medium mb-6 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Vissza a projekt dashboardhoz
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rajzok</h1>
          <p className="text-gray-600 mt-1">
            {drawings.length} {drawings.length === 1 ? 'rajz' : 'rajz'}
          </p>
        </div>
        <button
          onClick={handleCreateDrawing}
          disabled={creating}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {creating ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Létrehozás...
            </span>
          ) : (
            '+ Új rajz'
          )}
        </button>
      </div>

      {/* Drawing List with Cards */}
      <DrawingList
        drawings={drawings}
        projectId={projectId}
        onRefresh={loadDrawings}
      />
    </div>
  );
}