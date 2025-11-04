/**
 * Photos Module - PostgreSQL Direct Connection
 * Fotók modul - CRUD műveletek és storage kezelés
 *
 * All photo metadata is stored in local PostgreSQL database.
 * Photo files are stored locally via /api/upload endpoint.
 * Supabase is only used for authentication.
 * Legacy Supabase Storage photos are still supported for backward compatibility.
 */

import { query, getCurrentUserId } from '@/lib/db';
import { createClient } from '@/lib/supabase';
import { isUUID } from '@/lib/drawings/slug-utils';
import type { Photo, PhotoUploadInput, PhotoUpdateInput } from '@/types/photo.types';

const STORAGE_BUCKET = 'project-photos';

/**
 * Get all photos for a project
 * Összes fotó lekérése egy projekthez
 * Supports both project UUID and auto_identifier
 */
export async function getPhotos(projectIdentifier: string): Promise<Photo[]> {
  try {
    // If identifier is a UUID, search directly by project_id
    // If it's an auto_identifier, join with projects table
    const queryText = isUUID(projectIdentifier)
      ? `SELECT ph.* FROM public.photos ph
         WHERE ph.project_id = $1
         ORDER BY ph.created_at DESC`
      : `SELECT ph.* FROM public.photos ph
         JOIN public.projects p ON ph.project_id = p.id
         WHERE p.auto_identifier = $1
         ORDER BY ph.created_at DESC`;

    const result = await query<Photo>(queryText, [projectIdentifier]);

    const photos = result.rows;

    // For local storage, no need to generate signed URLs
    // For legacy Supabase Storage photos, generate signed URLs if needed
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        // Skip signed URL generation for local files
        if (photo.local_file_path) {
          return photo;
        }

        // Generate signed URLs for legacy Supabase Storage photos
        if (photo.file_path) {
          const supabase = createClient();
          const { data: urlData } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(photo.file_path, 3600); // 1 hour expiry

          return {
            ...photo,
            signedUrl: urlData?.signedUrl || '',
          };
        }

        return photo;
      })
    );

    return photosWithUrls;
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
      `SELECT * FROM public.photos WHERE id = $1`,
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

  // Legacy: Fallback to Supabase Storage public URL (for old photos)
  const supabase = createClient();
  const filePath = typeof photo === 'string' ? photo : photo.file_path;

  if (!filePath) {
    return '';
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
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

  // Legacy: Download from Supabase Storage
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(photo.file_path);

  if (error) {
    console.error('Download error:', error);
    throw new Error(`Fotó letöltése sikertelen: ${error.message}`);
  }

  // Create download link
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = photo.file_name;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
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
      `UPDATE public.photos
       SET caption = $1, description = $2, updated_at = NOW()
       WHERE id = $3`,
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

    // Delete legacy Supabase Storage file if exists
    if (photo.file_path && !photo.local_file_path) {
      try {
        const supabase = createClient();
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([photo.file_path]);

        if (storageError) {
          console.warn('Failed to delete Supabase Storage file:', storageError);
        }
      } catch (storageError) {
        console.warn('Error deleting Supabase Storage file:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    await query(`DELETE FROM public.photos WHERE id = $1`, [photo.id]);
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
    // Separate local and legacy photos
    const localPhotos = photos.filter(p => p.local_file_path);
    const legacyPhotos = photos.filter(p => p.file_path && !p.local_file_path);
    const photoIds = photos.map(p => p.id);

    // Delete local files
    for (const photo of localPhotos) {
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

    // Delete legacy Supabase Storage files
    if (legacyPhotos.length > 0) {
      try {
        const supabase = createClient();
        const legacyFilePaths = legacyPhotos.map(p => p.file_path);
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(legacyFilePaths);

        if (storageError) {
          console.warn('Bulk storage delete error:', storageError);
        }
      } catch (storageError) {
        console.warn('Error deleting Supabase Storage files:', storageError);
        // Continue with database deletion
      }
    }

    // Delete from database
    await query(
      `DELETE FROM public.photos WHERE id = ANY($1::uuid[])`,
      [photoIds]
    );
  } catch (error) {
    console.error('Bulk database delete error:', error);
    throw new Error(`Fotók törlése sikertelen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
