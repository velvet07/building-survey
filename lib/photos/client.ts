/**
 * Client-Safe Photo Utilities
 * Fotó segédfüggvények kliens oldalra
 *
 * This file contains photo-related functions that can safely be used in client components.
 * These functions do NOT import server-only modules like pg or lib/db.
 */

'use client';

import { createClient } from '@/lib/supabase';
import type { Photo, PhotoUploadInput } from '@/types/photo.types';

const STORAGE_BUCKET = 'project-photos';

/**
 * Upload a photo to local storage via API endpoint
 * Fotó feltöltése lokális storage-ba API végponton keresztül
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
