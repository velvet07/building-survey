'use client';

/**
 * DrawingList Component
 * Rajzok grid/list megjelenítése
 */

import DrawingCard from './DrawingCard';
import type { Drawing } from '@/lib/drawings/types';

interface DrawingListProps {
  drawings: Drawing[];
  projectId: string;
  onRefresh: () => void;
}

export default function DrawingList({
  drawings,
  projectId,
  onRefresh,
}: DrawingListProps) {
  if (drawings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Nincs még rajzod
        </h2>
        <p className="text-gray-600 text-center max-w-md">
          Kezdj el rajzolni és dokumentáld a felméréseidet. Készíts alaprajzokat,
          vázlatokat és jegyzeteket.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drawings.map((drawing) => (
        <DrawingCard
          key={drawing.id}
          drawing={drawing}
          projectId={projectId}
          onDelete={onRefresh}
          onUpdate={onRefresh}
        />
      ))}
    </div>
  );
}