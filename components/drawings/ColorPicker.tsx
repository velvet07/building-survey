'use client';

/**
 * ColorPicker Component
 * Szín választó komponens előre beállított színekkel
 */

import { useState } from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
  className?: string;
}

// Preset colors - építészeti rajzoláshoz optimalizált színek
const PRESET_COLORS = [
  { name: 'Fekete', hex: '#000000' },
  { name: 'Piros', hex: '#EF4444' },
  { name: 'Kék', hex: '#3B82F6' },
  { name: 'Zöld', hex: '#10B981' },
  { name: 'Sárga', hex: '#F59E0B' },
  { name: 'Szürke', hex: '#6B7280' },
  { name: 'Barna', hex: '#92400E' },
  { name: 'Lila', hex: '#8B5CF6' },
];

export default function ColorPicker({
  selectedColor,
  onChange,
  className = '',
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected color button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Szín választó"
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm text-gray-700 flex-1 text-left">Szín</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Color palette dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Válassz színt
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => handleColorSelect(color.hex)}
                  className={`group relative w-12 h-12 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedColor === color.hex
                      ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                      : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                >
                  {/* Checkmark for selected color */}
                  {selectedColor === color.hex && (
                    <svg
                      className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}

                  {/* Tooltip on hover */}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Color info */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Kiválasztott:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <code className="font-mono">{selectedColor}</code>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact ColorPicker - for toolbar
 * Kompakt szín választó toolbar-hoz
 */
export function CompactColorPicker({
  selectedColor,
  onChange,
  className = '',
}: ColorPickerProps) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-2">Szín</p>
      <div className="grid grid-cols-4 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => onChange(color.hex)}
            className={`w-10 h-10 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedColor === color.hex
                ? 'ring-2 ring-blue-500 scale-105'
                : ''
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
            aria-label={color.name}
          >
            {selectedColor === color.hex && (
              <svg
                className="w-5 h-5 text-white mx-auto drop-shadow-lg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}