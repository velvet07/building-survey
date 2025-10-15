'use client';

/**
 * ColorPicker Component
 * Szín választó komponens előre beállított színekkel
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      if (triggerRef.current) {
        setAnchorRect(triggerRef.current.getBoundingClientRect());
      }
    };

    updateRect();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setAnchorRect(null);
    }
  }, [isOpen]);

  const renderDropdown = () => {
    if (!isMounted || !isOpen || typeof document === 'undefined' || typeof window === 'undefined') {
      return null;
    }

    const dropdownWidth = 256;
    const viewportPadding = 12;
    const top = (anchorRect?.bottom ?? 0) + 8;
    const tentativeLeft = anchorRect?.left ?? 0;
    const maxLeft = window.innerWidth - dropdownWidth - viewportPadding;
    const left = Math.max(viewportPadding, Math.min(tentativeLeft, maxLeft));

    return createPortal(
      <div className="fixed inset-0 z-[400]">
        <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
        <div
          className="absolute w-64 max-w-sm rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl"
          style={{
            top,
            left,
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Válassz színt
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => handleColorSelect(color.hex)}
                className={`group relative flex h-14 w-14 items-center justify-center rounded-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  selectedColor === color.hex ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={color.name}
              >
                {selectedColor === color.hex && (
                  <svg className="h-6 w-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded bg-emerald-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {color.name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-emerald-100 pt-3">
            <div className="flex items-center justify-between text-xs text-emerald-600">
              <span>Kiválasztott:</span>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-emerald-200" style={{ backgroundColor: selectedColor }} />
                <code className="font-mono text-emerald-700">{selectedColor}</code>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected color button */}
      <button
        ref={triggerRef}
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

      {renderDropdown()}
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
      <div className="grid grid-cols-4 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => onChange(color.hex)}
            className={`h-11 w-11 rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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