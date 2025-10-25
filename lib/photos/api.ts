/**
 * Photos Module - Supabase API Functions
 * Fotók modul - CRUD műveletek és storage kezelés
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

  return (data as Photo[]) || [];
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
 * Upload a photo to storage and create database record
 * Fotó feltöltése storage-ba és adatbázis rekord létrehozása
 */
export async function uploadPhoto(input: PhotoUploadInput): Promise<Photo> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Felhasználó nem található - kérlek jelentkezz be újra');
  }

  // Generate unique file name
  const fileExt = input.file.name.split('.').pop();
  const fileName = `${input.project_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, input.file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Fotó feltöltése sikertelen: ${uploadError.message}`);
  }

  // Create database record
  const { data: photoData, error: dbError } = await supabase
    .from('photos')
    .insert({
      project_id: input.project_id,
      file_name: input.file.name,
      file_path: uploadData.path,
      file_size: input.file.size,
      mime_type: input.file.type,
      caption: input.caption,
      description: input.description,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    // Rollback: delete uploaded file if database insert fails
    await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path]);
    console.error('Database insert error:', dbError);
    throw new Error(`Fotó mentése sikertelen: ${dbError.message}`);
  }

  return photoData as Photo;
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
 * Get public URL for a photo
 * Fotó publikus URL-jének lekérése
 */
export function getPhotoUrl(filePath: string): string {
  const supabase = createClient();

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

  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([photo.file_path]);

  if (storageError) {
    console.error('Storage delete error:', storageError);
    throw new Error(`Fotó törlése sikertelen (storage): ${storageError.message}`);
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
}

/**
 * Delete multiple photos
 * Több fotó törlése
 */
export async function deletePhotos(photos: Photo[]): Promise<void> {
  const supabase = createClient();

  // Collect all file paths
  const filePaths = photos.map(p => p.file_path);
  const photoIds = photos.map(p => p.id);

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove(filePaths);

  if (storageError) {
    console.error('Bulk storage delete error:', storageError);
    throw new Error(`Fotók törlése sikertelen (storage): ${storageError.message}`);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .in('id', photoIds);

  if (dbError) {
    console.error('Bulk database delete error:', dbError);
    throw new Error(`Fotók törlése sikertelen (adatbázis): ${dbError.message}`);
  }
}
