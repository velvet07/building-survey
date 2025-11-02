'use client';

/**
 * Photos Module Page
 * Fotók modul oldal
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import { PhotoDetails } from '@/components/photos/PhotoDetails';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getPhotos, downloadPhoto, downloadPhotos, deletePhoto, deletePhotos, getPhotoUrl } from '@/lib/photos/api';
import type { Photo, PhotoViewMode } from '@/types/photo.types';
import { useUserRole } from '@/hooks/useUserRole';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Helper to check if string is UUID format
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function PhotosPage() {
  const params = useParams();
  const router = useRouter();
  const projectIdentifier = params.id as string; // Can be UUID or auto_identifier
  const { canCreate, canDelete, isViewer } = useUserRole();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<PhotoViewMode>('gallery');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<Photo | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectIdentifier]);

  useEffect(() => {
    if (projectId) {
      loadPhotos();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const supabase = createClient();
      const isUUIDFormat = isUUID(projectIdentifier);
      const column = isUUIDFormat ? 'id' : 'auto_identifier';

      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq(column, projectIdentifier)
        .single();

      if (error) throw error;
      setProjectId(data.id);
    } catch (error) {
      console.error('Error loading project:', error);
      router.push('/dashboard/projects');
    }
  };

  const loadPhotos = async () => {
    if (!projectId) return;

    try {
      const data = await getPhotos(projectId);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Hiba történt a fotók betöltése során');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPhotos(photos.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPhotos([]);
  };

  const handleDownload = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      const photosToDownload = photos.filter((p) => selectedPhotos.includes(p.id));

      if (photosToDownload.length === 1) {
        await downloadPhoto(photosToDownload[0]);
        toast.success('Fotó letöltve');
      } else {
        await downloadPhotos(photosToDownload);
        toast.success(`${photosToDownload.length} fotó letöltve`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Hiba történt a letöltés során');
    }
  };

  const handleDelete = async () => {
    if (selectedPhotos.length === 0 || !canDelete) return;

    const confirmed = window.confirm(
      `Biztosan törlöd a kiválasztott ${selectedPhotos.length} fotót? Ez a művelet nem vonható vissza!`
    );

    if (!confirmed) return;

    try {
      const photosToDelete = photos.filter((p) => selectedPhotos.includes(p.id));

      if (photosToDelete.length === 1) {
        await deletePhoto(photosToDelete[0]);
        toast.success('Fotó törölve');
      } else {
        await deletePhotos(photosToDelete);
        toast.success(`${photosToDelete.length} fotó törölve`);
      }

      setSelectedPhotos([]);
      loadPhotos();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Hiba történt a törlés során');
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhotoForPreview(photo);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 font-medium mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vissza a projekthez
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Fotók</h1>
          <p className="mt-2 text-gray-600">Helyszíni fotók és dokumentáció</p>
        </div>

        {/* Upload Section */}
        {canCreate && projectId && (
          <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Új fotók feltöltése</h2>
            <PhotoUpload projectId={projectId} onUploadComplete={loadPhotos} />
          </div>
        )}

        {/* Viewer Notice */}
        {isViewer && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Megtekintő mód</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">Csak megtekintési jogosultsággal rendelkezel. Fotók feltöltése és törlése nem engedélyezett.</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'gallery'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Galéria
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'details'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Részletek
            </button>
          </div>

          {/* Action Buttons */}
          {selectedPhotos.length > 0 && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleDownload}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Letöltés ({selectedPhotos.length})
              </Button>
              {canDelete && (
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Törlés ({selectedPhotos.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Photos Display */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {viewMode === 'gallery' ? (
            <PhotoGallery
              photos={photos}
              selectedPhotos={selectedPhotos}
              onPhotoSelect={handlePhotoSelect}
              onPhotoClick={handlePhotoClick}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
          ) : (
            <PhotoDetails
              photos={photos}
              selectedPhotos={selectedPhotos}
              onPhotoSelect={handlePhotoSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
          )}
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhotoForPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setSelectedPhotoForPreview(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setSelectedPhotoForPreview(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={getPhotoUrl(selectedPhotoForPreview)}
              alt={selectedPhotoForPreview.caption || selectedPhotoForPreview.file_name}
              className="max-w-full max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {selectedPhotoForPreview.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                <p className="text-lg font-semibold">{selectedPhotoForPreview.caption}</p>
                {selectedPhotoForPreview.description && (
                  <p className="text-sm text-gray-300 mt-1">{selectedPhotoForPreview.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
