'use client';

/**
 * PDFExportModal Component
 * PDF exportálás modal
 */

import { useState } from 'react';
import type { Drawing, PaperSize, PaperOrientation } from '@/lib/drawings/types';
import { exportDrawingToPDF } from '@/lib/drawings/pdf-export';

interface PDFExportModalProps {
  drawing: Drawing;
  onClose: () => void;
  isOpen?: boolean;
}

export default function PDFExportModal({
  drawing,
  onClose,
  isOpen = true,
}: PDFExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export settings (can be overridden)
  const [paperSize, setPaperSize] = useState<PaperSize>(drawing.paper_size);
  const [orientation, setOrientation] = useState<PaperOrientation>(drawing.orientation);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await exportDrawingToPDF(drawing, paperSize, orientation);
      setExportSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('PDF export error:', err);
      const errorMessage = err instanceof Error
        ? err.message
        : 'PDF generálása sikertelen. Próbáld újra!';
      setError(errorMessage);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
        {/* Success State */}
        {exportSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              PDF sikeresen letöltve!
            </h2>
            <p className="text-gray-600">Az ablak automatikusan bezárul...</p>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              PDF Exportálás
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {drawing.name}
            </p>

            {/* Paper Size Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Papír méret
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaperSize('a4')}
                  disabled={isExporting}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    paperSize === 'a4'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  A4
                </button>
                <button
                  onClick={() => setPaperSize('a3')}
                  disabled={isExporting}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    paperSize === 'a3'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  A3
                </button>
              </div>
            </div>

            {/* Orientation Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientáció
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrientation('portrait')}
                  disabled={isExporting}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    orientation === 'portrait'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  📄 Álló
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  disabled={isExporting}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    orientation === 'landscape'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  📃 Fekvő
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mégse
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exportálás...
                  </span>
                ) : (
                  '📄 Letöltés PDF'
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}