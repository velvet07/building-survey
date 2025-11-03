/**
 * Photos Module - Supabase Client API Functions
 * Fotók modul - CRUD műveletek és storage kezelés
 *
 * Uses Supabase client for database operations (works on both client and server)
 * Photo files are stored locally via /api/upload endpoint
 * Legacy Supabase Storage photos are still supported for backward compatibility
 */

import { createClient } from '@/lib/supabase';
import type { Photo, PhotoUploadInput, PhotoUpdateInput } from '@/types/photo.types';

const STORAGE_BUCKET = 'project-photos';

/**
 * Get all photos for a project
 * Összes fotó lekérése egy projekthez
 */
export async function getPhotos(projectId: string): Promise<Photo[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching photos:', error);
    throw new Error(`Fotók betöltése sikertelen: ${error.message}`);
  }

  const photos = (data as Photo[]) || [];

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
}

/**
 * Get a single photo by ID
 * Egyedi fotó lekérése ID alapján
 */
export async function getPhoto(photoId: string): Promise<Photo> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('id', photoId)
    .single();

  if (error) {
    console.error('Error fetching photo:', error);
    throw new Error(`Fotó betöltése sikertelen: ${error.message}`);
  }

  if (!data) {
    throw new Error('Fotó nem található');
  }

  return data as Photo;
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
  const supabase = createClient();

  const { error } = await supabase
    .from('photos')
    .update({
      caption: input.caption,
      description: input.description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', photoId);

  if (error) {
    console.error('Update error:', error);
    throw new Error(`Fotó frissítése sikertelen: ${error.message}`);
  }
}

/**
 * Delete a photo (hard delete from storage and database)
 * Fotó törlése (tényleges törlés storage-ból és adatbázisból)
 */
export async function deletePhoto(photo: Photo): Promise<void> {
  const supabase = createClient();

  try {
    // For local files, delete via API endpoint
    if (photo.local_file_path) {
      // Delete main file
      const deleteResponse = await fetch('/api/photos/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: photo.local_file_path,
          thumbnail: photo.thumbnail_path,
        }),
      });

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        console.error('Local file delete error:', error);
        throw new Error(`Fotó fájl törlése sikertelen: ${error.error || 'Unknown error'}`);
      }
    } else if (photo.file_path) {
      // Legacy: Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([photo.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        throw new Error(`Fotó törlése sikertelen (storage): ${storageError.message}`);
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photo.id);

    if (dbError) {
      console.error('Database delete error:', dbError);
      throw new Error(`Fotó törlése sikertelen (adatbázis): ${dbError.message}`);
    }
  } catch (error) {
    console.error('Delete photo error:', error);
    throw error;
  }
}

/**
 * Delete multiple photos
 * Több fotó törlése
 */
export async function deletePhotos(photos: Photo[]): Promise<void> {
  const supabase = createClient();

  try {
    // Separate local and legacy storage photos
    const localPhotos = photos.filter(p => p.local_file_path);
    const legacyPhotos = photos.filter(p => !p.local_file_path && p.file_path);

    // Delete local files via API
    if (localPhotos.length > 0) {
      for (const photo of localPhotos) {
        await fetch('/api/photos/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: photo.local_file_path,
            thumbnail: photo.thumbnail_path,
          }),
        });
      }
    }

    // Delete legacy photos from Supabase Storage
    if (legacyPhotos.length > 0) {
      const filePaths = legacyPhotos.map(p => p.file_path);
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filePaths);

      if (storageError) {
        console.error('Bulk storage delete error:', storageError);
        throw new Error(`Fotók törlése sikertelen (storage): ${storageError.message}`);
      }
    }

    // Delete all from database
    const photoIds = photos.map(p => p.id);
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .in('id', photoIds);

    if (dbError) {
      console.error('Bulk database delete error:', dbError);
      throw new Error(`Fotók törlése sikertelen (adatbázis): ${dbError.message}`);
    }
  } catch (error) {
    console.error('Delete photos error:', error);
    throw error;
  }
}
