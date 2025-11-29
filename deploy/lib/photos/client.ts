/**
 * Photos Client Helpers
 * Client-side helper functions for photos (no database dependencies)
 */

import type { Photo } from '@/types/photo.types';

/**
 * Get photo URL for display
 * Fotó URL generálása megjelenítéshez
 */
export function getPhotoUrl(photo: Photo | string, thumbnail = false): string {
  // If photo object with local_file_path, use local file serving
  if (typeof photo === 'object' && photo.local_file_path) {
    const filename = thumbnail && photo.thumbnail_path ? photo.thumbnail_path : photo.local_file_path;
    return `/api/files/${filename}${thumbnail ? '?thumbnail=true' : ''}`;
  }

  // Legacy support for old file_path field
  if (typeof photo === 'object' && photo.file_path) {
    return photo.file_path;
  }

  // If string, assume it's a filename
  if (typeof photo === 'string') {
    return `/api/files/${photo}${thumbnail ? '?thumbnail=true' : ''}`;
  }

  // Fallback
  return '';
}

/**
 * Download a single photo
 * Egyedi fotó letöltése
 */
export async function downloadPhoto(photo: Photo): Promise<void> {
  // For local files, use direct download from file serving endpoint
  if (photo.local_file_path) {
    const url = getPhotoUrl(photo);
    const a = document.createElement('a');
    a.href = url;
    a.download = photo.file_name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Fallback for photos without local_file_path
  const url = getPhotoUrl(photo);
  const a = document.createElement('a');
  a.href = url;
  a.download = photo.file_name;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Download multiple photos
 * Több fotó letöltése egyszerre
 */
export async function downloadPhotos(photos: Photo[]): Promise<void> {
  for (const photo of photos) {
    await downloadPhoto(photo);
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

