'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { uploadPhotos } from '@/lib/photos/api';
import type { PhotoUploadInput } from '@/types/photo.types';
import toast from 'react-hot-toast';

export interface PhotoUploadProps {
  projectId: string;
  onUploadComplete: () => void;
}

interface PendingFile {
  file: File;
  preview: string;
  caption: string;
}

export function PhotoUpload({ projectId, onUploadComplete }: PhotoUploadProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newPendingFiles: PendingFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
    }));

    setPendingFiles((prev) => [...prev, ...newPendingFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePending = (index: number) => {
    setPendingFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setPendingFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].caption = caption;
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      const inputs: PhotoUploadInput[] = pendingFiles.map((pf) => ({
        project_id: projectId,
        file: pf.file,
        caption: pf.caption,
      }));

      const results = await uploadPhotos(inputs);

      if (results.length === pendingFiles.length) {
        toast.success(`${results.length} fotó sikeresen feltöltve!`);
      } else {
        toast.success(`${results.length}/${pendingFiles.length} fotó feltöltve`);
      }

      // Cleanup previews
      pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
      setPendingFiles([]);

      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Hiba történt a feltöltés során');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload-input"
        />
        <label htmlFor="photo-upload-input" className="inline-block">
          <div className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 shadow-sm px-4 py-2 text-base bg-secondary-200 text-secondary-800 hover:bg-secondary-300 active:bg-secondary-400 cursor-pointer">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Fotók kiválasztása
          </div>
        </label>
      </div>

      {/* Pending Files Preview */}
      {pendingFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-secondary-700">
              {pendingFiles.length} fotó kiválasztva
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
                  setPendingFiles([]);
                }}
                variant="ghost"
                size="sm"
                disabled={isUploading}
              >
                Mégse
              </Button>
              <Button onClick={handleUpload} isLoading={isUploading} size="sm">
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Feltöltés
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pendingFiles.map((pf, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-secondary-100 rounded-lg overflow-hidden">
                  <img
                    src={pf.preview}
                    alt={pf.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => handleRemovePending(index)}
                  className="absolute top-2 right-2 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isUploading}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Képaláírás (opcionális)"
                  value={pf.caption}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  className="mt-2 w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  disabled={isUploading}
                />
                <p className="mt-1 text-xs text-secondary-500 truncate">{pf.file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
