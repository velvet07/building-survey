/**
 * Photos Module - MySQL Direct Connection
 * Fotók modul - CRUD műveletek és storage kezelés
 *
 * All photo metadata is stored in local MySQL/MariaDB database.
 * Photo files are stored locally via /api/upload endpoint.
 */

import { query, getCurrentUserId } from '@/lib/db';
import type { Photo, PhotoUploadInput, PhotoUpdateInput } from '@/types/photo.types';

/**
 * Get all photos for a project
 * Összes fotó lekérése egy projekthez
 */
export async function getPhotos(projectId: string): Promise<Photo[]> {
  try {
    const result = await query<Photo>(
      `SELECT * FROM photos
       WHERE project_id = ?
       ORDER BY created_at DESC`,
      [projectId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw new Error(`Fotók betöltése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a single photo by ID
 * Egyedi fotó lekérése ID alapján
 */
export async function getPhoto(photoId: string): Promise<Photo> {
  try {
    const result = await query<Photo>(
      `SELECT * FROM photos WHERE id = ?`,
      [photoId]
    );

    if (result.rows.length === 0) {
      throw new Error('Fotó nem található');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching photo:', error);
    throw new Error(`Fotó betöltése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload a photo to local storage and create database record
 * Fotó feltöltése lokális storage-ba és adatbázis rekord létrehozása
 */
export async function uploadPhoto(input: PhotoUploadInput): Promise<Photo> {
  // Use new local upload API endpoint
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('project_id', input.project_id);
  if (input.caption) formData.append('caption', input.caption);
  if (input.description) formData.append('description', input.description);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fotó feltöltése sikertelen');
  }

  const result = await response.json();
  return result.photo as Photo;
}

/**
 * Upload multiple photos
 * Több fotó feltöltése egyszerre
 */
export async function uploadPhotos(inputs: PhotoUploadInput[]): Promise<Photo[]> {
  const results: Photo[] = [];
  const errors: string[] = [];

  for (const input of inputs) {
    try {
      const photo = await uploadPhoto(input);
      results.push(photo);
    } catch (error) {
      console.error('Upload error:', error);
      errors.push(`${input.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (errors.length > 0) {
    console.warn('Some uploads failed:', errors);
  }

  return results;
}

/**
 * Get photo URL - returns local file serving URL or legacy signed URL
 * Fotó URL lekérése - lokális file serving URL vagy régi signed URL
 */
export function getPhotoUrl(photo: Photo | string, thumbnail = false): string {
  // If photo object with local_file_path, use local file serving
  if (typeof photo === 'object' && photo.local_file_path) {
    const filename = thumbnail && photo.thumbnail_path ? photo.thumbnail_path : photo.local_file_path;
    return `/api/files/${filename}${thumbnail ? '?thumbnail=true' : ''}`;
  }

  // Legacy: If photo object with signedUrl, return it
  if (typeof photo === 'object' && photo.signedUrl) {
    return photo.signedUrl;
  }

  // For local files, use file serving endpoint
  const filePath = typeof photo === 'string' ? photo : (photo.local_file_path || photo.file_path);

  if (!filePath) {
    return '';
  }

  // Use local file serving endpoint
  return `/api/files/${encodeURIComponent(filePath)}`;
}

/**
 * Download a photo
 * Fotó letöltése
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

  // Use local file serving endpoint
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
 * Download multiple photos as zip
 * Több fotó letöltése zip-ben (simplified - downloads one by one)
 */
export async function downloadPhotos(photos: Photo[]): Promise<void> {
  for (const photo of photos) {
    await downloadPhoto(photo);
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Update photo metadata
 * Fotó metaadatok frissítése
 */
export async function updatePhoto(
  photoId: string,
  input: PhotoUpdateInput
): Promise<void> {
  try {
    await query(
      `UPDATE photos
       SET caption = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [input.caption, input.description, photoId]
    );
  } catch (error) {
    console.error('Update error:', error);
    throw new Error(`Fotó frissítése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a photo (hard delete from storage and database)
 * Fotó törlése (tényleges törlés storage-ból és adatbázisból)
 */
export async function deletePhoto(photo: Photo): Promise<void> {
  try {
    // Delete local file if exists
    if (photo.local_file_path) {
      try {
        const response = await fetch('/api/files/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: photo.local_file_path }),
        });

        if (!response.ok) {
          console.warn('Failed to delete local file:', photo.local_file_path);
        }
      } catch (fileError) {
        console.warn('Error deleting local file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }


    // Delete from database
    await query(`DELETE FROM photos WHERE id = ?`, [photo.id]);
  } catch (error) {
    console.error('Database delete error:', error);
    throw new Error(`Fotó törlése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete multiple photos
 * Több fotó törlése
 */
export async function deletePhotos(photos: Photo[]): Promise<void> {
  try {
    // Get photo IDs
    const photoIds = photos.map(p => p.id);

    // Delete local files
    for (const photo of photos) {
      if (!photo.local_file_path) continue;
      try {
        const response = await fetch('/api/files/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: photo.local_file_path }),
        });

        if (!response.ok) {
          console.warn('Failed to delete local file:', photo.local_file_path);
        }
      } catch (fileError) {
        console.warn('Error deleting local file:', fileError);
        // Continue with other deletions
      }
    }


    // Delete from database
    await query(
      `DELETE FROM photos WHERE id IN (${photoIds.map(() => '?').join(',')})`,
      photoIds
    );
  } catch (error) {
    console.error('Bulk database delete error:', error);
    throw new Error(`Fotók törlése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
