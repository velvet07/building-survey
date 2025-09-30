'use client';

/**
 * StrokeWidthSlider Component
 * Toll vastagság állító slider
 */

interface StrokeWidthSliderProps {
  width: number;
  onChange: (width: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export default function StrokeWidthSlider({
  width,
  onChange,
  min = 1,
  max = 10,
  className = '',
}: StrokeWidthSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  // Calculate percentage for visual indicator
  const percentage = ((width - min) / (max - min)) * 100;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-gray-500 font-medium">Vastagság</label>
        <span className="text-xs text-gray-600 font-medium">{width}px</span>
      </div>

      {/* Visual preview circles */}
      <div className="flex items-center justify-between mb-3 px-1">
        {[1, 3, 5, 7, 10].map((size) => (
          <div
            key={size}
            className={`rounded-full bg-gray-800 transition-opacity ${
              Math.abs(width - size) < 2 ? 'opacity-100' : 'opacity-30'
            }`}
            style={{
              width: `${size * 2}px`,
              height: `${size * 2}px`,
            }}
          />
        ))}
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={width}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
        <span>Vékony</span>
        <span>Vastag</span>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.15s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider-thumb::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.15s ease;
        }

        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        .slider-thumb::-moz-range-thumb:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}

/**
 * Compact StrokeWidthSlider - buttons only
 */
export function CompactStrokeWidthSlider({
  width,
  onChange,
  className = '',
}: StrokeWidthSliderProps) {
  const sizes = [1, 2, 3, 5, 8];

  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-2">Vastagság: {width}px</p>
      <div className="flex items-center gap-1">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
              width === size
                ? 'bg-blue-100 ring-2 ring-blue-500'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            aria-label={`${size}px vastagság`}
          >
            <div
              className="rounded-full bg-gray-800"
              style={{
                width: `${size * 2}px`,
                height: `${size * 2}px`,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}