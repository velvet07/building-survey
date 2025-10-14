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
        className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:border-emerald-400 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label="Szín választó"
      >
        <div
          className="h-6 w-6 flex-shrink-0 rounded-full border-2 border-emerald-300"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="flex-1 text-left">Szín</span>
        <svg
          className={`h-4 w-4 text-emerald-500 transition-transform ${
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
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Palette */}
          <div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Válassz színt
            </p>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => handleColorSelect(color.hex)}
                  className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    selectedColor === color.hex
                      ? 'ring-2 ring-emerald-500 ring-offset-2'
                      : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                >
                  {/* Checkmark for selected color */}
                  {selectedColor === color.hex && (
                    <svg
                      className="h-6 w-6 text-white drop-shadow-lg"
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
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 transform rounded bg-emerald-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Color info */}
            <div className="mt-4 border-t border-emerald-100 pt-3">
              <div className="flex items-center justify-between text-xs text-emerald-600">
                <span>Kiválasztott:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-emerald-200"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <code className="font-mono text-emerald-700">{selectedColor}</code>
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
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">Szín</p>
      <div className="grid grid-cols-4 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => onChange(color.hex)}
            className={`h-10 w-10 rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              selectedColor === color.hex
                ? 'ring-2 ring-emerald-500'
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