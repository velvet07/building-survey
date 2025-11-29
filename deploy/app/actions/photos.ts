'use server';

/**
 * Server Actions for Photos
 *
 * Wraps photo API functions that require server-side MySQL/MariaDB access
 */

import { revalidatePath } from 'next/cache';
import {
  getPhotos,
  deletePhoto as deletePhotoLib,
  deletePhotos as deletePhotosLib,
} from '@/lib/photos/api';
import type { Photo } from '@/types/photo.types';

export async function getPhotosAction(projectId: string) {
  try {
    const photos = await getPhotos(projectId);
    return { data: photos, error: null };
  } catch (error) {
    console.error('getPhotosAction error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function deletePhotoAction(photo: Photo) {
  try {
    await deletePhotoLib(photo);
    revalidatePath(`/dashboard/projects/${photo.project_id}/photos`);
    return { error: null };
  } catch (error) {
    console.error('deletePhotoAction error:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function deletePhotosAction(photos: Photo[]) {
  try {
    await deletePhotosLib(photos);
    if (photos.length > 0) {
      revalidatePath(`/dashboard/projects/${photos[0].project_id}/photos`);
    }
    return { error: null };
  } catch (error) {
    console.error('deletePhotosAction error:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
