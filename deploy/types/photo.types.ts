/**
 * Photo Module Types
 * Fotók modul típusdefiníciók
 */

export interface Photo {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string; // Legacy field for backwards compatibility
  local_file_path?: string; // Local file storage path (primary)
  thumbnail_path?: string; // Thumbnail path (local storage only)
  file_size: number;
  mime_type: string;
  width?: number; // Image width in pixels
  height?: number; // Image height in pixels
  caption?: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  signedUrl?: string; // Legacy field for backwards compatibility
}

export interface PhotoUploadInput {
  project_id: string;
  file: File;
  caption?: string;
  description?: string;
}

export interface PhotoUpdateInput {
  caption?: string;
  description?: string;
}

export type PhotoViewMode = 'gallery' | 'details';
