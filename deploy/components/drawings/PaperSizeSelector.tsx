'use client';

/**
 * PaperSizeSelector Component
 * Papír méret és orientáció választó
 */

import type { PaperSize, PaperOrientation } from '@/lib/drawings/types';

interface PaperSizeSelectorProps {
  paperSize: PaperSize;
  orientation: PaperOrientation;
  onPaperSizeChange: (size: PaperSize) => void;
  onOrientationChange: (orientation: PaperOrientation) => void;
  disabled?: boolean;
  className?: string;
}

export default function PaperSizeSelector({
  paperSize,
  orientation,
  onPaperSizeChange,
  onOrientationChange,
  disabled = false,
  className = '',
}: PaperSizeSelectorProps) {
  return (
    <div className={className}>
      {/* Paper Size */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-medium mb-2">Papír méret</p>
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 w-full">
          <button
            onClick={() => onPaperSizeChange('a4')}
            disabled={disabled}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              paperSize === 'a4'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            A4
          </button>
          <button
            onClick={() => onPaperSizeChange('a3')}
            disabled={disabled}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              paperSize === 'a3'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            A3
          </button>
        </div>
      </div>

      {/* Orientation */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">Orientáció</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOrientationChange('portrait')}
            disabled={disabled}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              orientation === 'portrait'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {/* Portrait icon */}
            <svg
              className={`w-8 h-10 ${
                orientation === 'portrait' ? 'text-blue-600' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="6"
                y="2"
                width="12"
                height="20"
                rx="2"
                strokeWidth="2"
                fill={orientation === 'portrait' ? 'currentColor' : 'none'}
                fillOpacity="0.1"
              />
            </svg>
            <span
              className={`text-xs font-medium ${
                orientation === 'portrait' ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              Álló
            </span>
          </button>

          <button
            onClick={() => onOrientationChange('landscape')}
            disabled={disabled}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              orientation === 'landscape'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {/* Landscape icon */}
            <svg
              className={`w-10 h-8 ${
                orientation === 'landscape' ? 'text-blue-600' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="2"
                y="6"
                width="20"
                height="12"
                rx="2"
                strokeWidth="2"
                fill={orientation === 'landscape' ? 'currentColor' : 'none'}
                fillOpacity="0.1"
              />
            </svg>
            <span
              className={`text-xs font-medium ${
                orientation === 'landscape' ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              Fekvő
            </span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Méret:</span>{' '}
          {paperSize === 'a4' ? '210×297 mm' : '297×420 mm'}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          <span className="font-medium">Felbontás:</span> 300 DPI
        </p>
      </div>
    </div>
  );
}

/**
 * Compact PaperSizeSelector - icon-based
 */
export function CompactPaperSizeSelector({
  paperSize,
  orientation,
  onPaperSizeChange,
  onOrientationChange,
  className = '',
}: PaperSizeSelectorProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Size */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => onPaperSizeChange('a4')}
            className={`px-3 py-1 text-xs font-medium ${
              paperSize === 'a4'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            A4
          </button>
          <button
            onClick={() => onPaperSizeChange('a3')}
            className={`px-3 py-1 text-xs font-medium border-l border-gray-300 ${
              paperSize === 'a3'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            A3
          </button>
        </div>

        {/* Orientation */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => onOrientationChange('portrait')}
            className={`px-3 py-1 ${
              orientation === 'portrait'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Álló"
          >
            📄
          </button>
          <button
            onClick={() => onOrientationChange('landscape')}
            className={`px-3 py-1 border-l border-gray-300 ${
              orientation === 'landscape'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Fekvő"
          >
            📃
          </button>
        </div>
      </div>
    </div>
  );
}