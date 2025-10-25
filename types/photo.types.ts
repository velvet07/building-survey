/**
 * Photo Module Types
 * Fotók modul típusdefiníciók
 */

export interface Photo {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  caption?: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
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
