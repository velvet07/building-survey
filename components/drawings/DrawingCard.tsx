'use client';

/**
 * DrawingCard Component
 * Egyedi rajz card megjelenítés thumbnail-lel, metadata-val, és action gombokkal
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDrawing, updateDrawing } from '@/lib/drawings/api';
import { generateThumbnail } from '@/lib/drawings/pdf-export';
import DeleteDrawingModal from './DeleteDrawingModal';
import PDFExportModal from './PDFExportModal';
import type { Drawing } from '@/lib/drawings/types';
import { showSuccess, showError } from '@/lib/toast';
import { useUserRole } from '@/hooks/useUserRole';

interface DrawingCardProps {
  drawing: Drawing;
  projectId: string;
  onDelete: () => void;
  onUpdate: () => void;
}

export default function DrawingCard({
  drawing,
  projectId,
  onDelete,
  onUpdate,
}: DrawingCardProps) {
  const router = useRouter();
  const { canEdit, canDelete } = useUserRole();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(drawing.name);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>('');

  // Generate thumbnail on mount
  useEffect(() => {
    const thumb = generateThumbnail(drawing, 280, 200);
    setThumbnail(thumb);
  }, [drawing]);

  const handleNameSave = async () => {
    if (!editedName.trim()) {
      showError('A rajz neve nem lehet üres');
      setEditedName(drawing.name);
      setIsEditing(false);
      return;
    }

    if (editedName === drawing.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateDrawing(drawing.id, { name: editedName });
      showSuccess('Név módosítva');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      showError('Név módosítása sikertelen');
      setEditedName(drawing.name);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDrawing(drawing.id);
      showSuccess('Rajz törölve');
      setShowDeleteModal(false);
      onDelete();
    } catch (error) {
      showError('Törlés sikertelen');
    }
  };

  const handleCardClick = () => {
    if (!isEditing) {
      router.push(`/dashboard/projects/${projectId}/drawings/${drawing.slug}`);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-200 relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={drawing.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
            <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Megnyitás
            </span>
          </div>
        </div>

        {/* Drawing Info */}
        <div className="p-4">
          {/* Name (editable) */}
          {isEditing && canEdit ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') {
                  setEditedName(drawing.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-lg font-semibold border-b-2 border-blue-500 focus:outline-none px-1"
              autoFocus
            />
          ) : (
            <h3
              onClick={(e) => {
                if (canEdit) {
                  e.stopPropagation();
                  setIsEditing(true);
                }
              }}
              className={`text-lg font-semibold text-gray-900 mb-2 truncate ${canEdit ? 'cursor-text hover:text-blue-600' : ''} transition-colors`}
              title={canEdit ? 'Kattints a szerkesztéshez' : drawing.name}
            >
              {drawing.name}
            </h3>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span className="px-2 py-1 bg-gray-100 rounded font-medium">
              {drawing.paper_size.toUpperCase()}
            </span>
            <span title={drawing.orientation === 'portrait' ? 'Álló' : 'Fekvő'}>
              {drawing.orientation === 'portrait' ? '📄' : '📃'}
            </span>
            <span className="ml-auto" title="Létrehozás dátuma">
              {new Date(drawing.created_at).toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Stroke count */}
          <div className="text-xs text-gray-500 mb-3">
            {drawing.canvas_data.strokes.length} rajzelem
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/projects/${projectId}/drawings/${drawing.slug}`);
              }}
              className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100 transition-colors"
            >
              {canEdit ? 'Szerkesztés' : 'Megtekintés'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExportModal(true);
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              title="PDF Export"
            >
              📄
            </button>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                title="Törlés"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeleteModal && (
        <DeleteDrawingModal
          drawingName={drawing.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showExportModal && (
        <PDFExportModal
          drawing={drawing}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
}