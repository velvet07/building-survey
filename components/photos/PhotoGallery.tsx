'use client';

import { useState } from 'react';
import type { Photo } from '@/types/photo.types';
import { getPhotoUrl } from '@/lib/photos/api';
import { Button } from '@/components/ui/Button';

export interface PhotoGalleryProps {
  photos: Photo[];
  selectedPhotos: string[];
  onPhotoSelect: (photoId: string) => void;
  onPhotoClick: (photo: Photo) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function PhotoGallery({
  photos,
  selectedPhotos,
  onPhotoSelect,
  onPhotoClick,
  onSelectAll,
  onDeselectAll,
}: PhotoGalleryProps) {
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

  return (
    <div>
      {/* Selection Controls */}
      {photos.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            {selectedPhotos.length > 0
              ? `${selectedPhotos.length} fotó kiválasztva`
              : `${photos.length} fotó összesen`}
          </p>
          <div className="flex gap-2">
            {selectedPhotos.length === 0 ? (
              <Button variant="ghost" size="sm" onClick={onSelectAll}>
                Összes kijelölése
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onDeselectAll}>
                Kijelölés törlése
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {photos.map((photo) => {
          const isSelected = selectedPhotos.includes(photo.id);

          return (
            <div key={photo.id} className="relative group">
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onPhotoSelect(photo.id)}
                  className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer accent-primary-500"
                />
              </div>

              {/* Image */}
              <div
                onClick={() => onPhotoClick(photo)}
                className={`aspect-square bg-secondary-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'ring-4 ring-primary-500' : 'hover:ring-2 hover:ring-secondary-300'
                }`}
              >
                <img
                  src={getPhotoUrl(photo.file_path)}
                  alt={photo.caption || photo.file_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Caption */}
              {photo.caption && (
                <p className="mt-2 text-sm text-secondary-700 truncate font-medium">{photo.caption}</p>
              )}

              {/* File Name */}
              <p className="text-xs text-secondary-500 truncate">{photo.file_name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
