'use client';

import type { Photo } from '@/types/photo.types';
import { getPhotoUrl } from '@/lib/photos/api';
import { formatDate } from '@/lib/utils';

export interface PhotoDetailsProps {
  photos: Photo[];
  selectedPhotos: string[];
  onPhotoSelect: (photoId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function PhotoDetails({
  photos,
  selectedPhotos,
  onPhotoSelect,
  onSelectAll,
  onDeselectAll,
}: PhotoDetailsProps) {
  if (photos.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg className="mx-auto h-16 w-16 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-secondary-900">Még nincs egyetlen fotó sem</h3>
        <p className="mt-2 text-sm text-secondary-600">Töltsd fel az első fotót a projekthez!</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      {/* Selection Controls */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-secondary-600">
          {selectedPhotos.length > 0
            ? `${selectedPhotos.length} fotó kiválasztva`
            : `${photos.length} fotó összesen`}
        </p>
        <div className="flex gap-2">
          {selectedPhotos.length === 0 ? (
            <button
              onClick={onSelectAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Összes kijelölése
            </button>
          ) : (
            <button
              onClick={onDeselectAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Kijelölés törlése
            </button>
          )}
        </div>
      </div>

      {/* Details List */}
      <div className="space-y-4">
        {photos.map((photo) => {
          const isSelected = selectedPhotos.includes(photo.id);

          return (
            <div
              key={photo.id}
              className={`bg-white rounded-lg border-2 p-4 transition-all ${
                isSelected ? 'border-primary-500 shadow-lg' : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <div className="flex gap-4">
                {/* Selection Checkbox */}
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onPhotoSelect(photo.id)}
                    className="w-5 h-5 rounded border-2 cursor-pointer accent-primary-500 mt-1"
                  />
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-secondary-100 rounded-lg overflow-hidden">
                    <img
                      src={getPhotoUrl(photo.file_path)}
                      alt={photo.caption || photo.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 truncate">
                      {photo.caption || photo.file_name}
                    </h3>
                    {photo.caption && (
                      <p className="text-sm text-secondary-600 truncate">{photo.file_name}</p>
                    )}
                  </div>

                  {photo.description && (
                    <p className="text-sm text-secondary-700">{photo.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-secondary-600">
                    <div>
                      <span className="font-semibold">Méret:</span> {formatFileSize(photo.file_size)}
                    </div>
                    <div>
                      <span className="font-semibold">Típus:</span> {photo.mime_type}
                    </div>
                    <div>
                      <span className="font-semibold">Feltöltve:</span> {formatDate(photo.created_at)}
                    </div>
                    {photo.updated_at !== photo.created_at && (
                      <div>
                        <span className="font-semibold">Módosítva:</span> {formatDate(photo.updated_at)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
