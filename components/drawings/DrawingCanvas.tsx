'use client';

/**
 * Drawing Canvas Component - UPDATED VERSION
 * Fő rajz komponens react-konva használatával + teljes toolbar
 */

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import type {
  Drawing,
  CanvasData,
  Stroke,
  DrawingTool,
  PaperSize,
  PaperOrientation,
} from '@/lib/drawings/types';
import {
  getCanvasSize,
  calculateCanvasScale,
  calculateCenterPosition,
  clampZoom,
  clampPointToCanvas,
  GRID_SIZE_PX,
  GRID_MAJOR_INTERVAL,
} from '@/lib/drawings/canvas-utils';
import { CompactColorPicker } from './ColorPicker';
import StrokeWidthSlider from './StrokeWidthSlider';
import { CompactPaperSizeSelector } from './PaperSizeSelector';

interface DrawingCanvasProps {
  drawing: Drawing;
  onSave: (canvasData: CanvasData) => void;
  onBack: () => void;
  onChange?: () => void;
  saving: boolean;
  projectId: string;
}

export default function DrawingCanvas({
  drawing,
  onSave,
  onBack,
  onChange,
  saving,
  projectId,
}: DrawingCanvasProps) {
  // Canvas state
  const [strokes, setStrokes] = useState<Stroke[]>(drawing.canvas_data.strokes || []);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  // Tool state
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(2);

  // Paper settings
  const [paperSize, setPaperSize] = useState<PaperSize>(drawing.paper_size);
  const [orientation, setOrientation] = useState<PaperOrientation>(drawing.orientation);

  // Zoom/Pan state
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Stage container measurements for responsive layout
  const [containerSize, setContainerSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight - 200 : 1080,
  });

  // Refs
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);

  // Canvas dimensions
  const { width: canvasWidth, height: canvasHeight } = getCanvasSize(paperSize, orientation);

  // Observe container size to keep canvas centered and scaled
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize canvas - center and fit to screen
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scale = calculateCanvasScale(
      canvasWidth,
      canvasHeight,
      container.clientWidth,
      container.clientHeight
    );
    const pos = calculateCenterPosition(
      canvasWidth,
      canvasHeight,
      container.clientWidth,
      container.clientHeight,
      scale
    );

    setStageScale(scale);
    setStagePos(pos);
  }, [canvasWidth, canvasHeight, containerSize]);

  // Handle mouse/touch down
  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === 'pan') return;

    isDrawing.current = true;
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform();
    if (!transform) return;

    const inverted = transform.copy();
    if (!inverted) return;

    const canvasPos = inverted.invert().point(pos);
    const clampedPos = clampPointToCanvas(canvasPos, canvasWidth, canvasHeight);

    const newStroke: Stroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      points: [clampedPos.x, clampedPos.y],
      color: tool === 'eraser' ? '#FFFFFF' : color,
      width: tool === 'eraser' ? width * 3 : width,
      timestamp: new Date().toISOString(),
    };

    setCurrentStroke(newStroke);
    currentStrokeRef.current = newStroke;
  };

  // Handle mouse/touch move
  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current || tool === 'pan') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform();
    if (!transform) return;

    const inverted = transform.copy();
    if (!inverted) return;

    const canvasPos = inverted.invert().point(pos);
    const clampedPos = clampPointToCanvas(canvasPos, canvasWidth, canvasHeight);

    setCurrentStroke((prev) => {
      if (!prev) return prev;

      const lastX = prev.points[prev.points.length - 2];
      const lastY = prev.points[prev.points.length - 1];
      if (lastX === clampedPos.x && lastY === clampedPos.y) {
        return prev;
      }

      const updatedStroke: Stroke = {
        ...prev,
        points: [...prev.points, clampedPos.x, clampedPos.y],
      };

      currentStrokeRef.current = updatedStroke;
      return updatedStroke;
    });
  };

  // Handle mouse/touch up
  const handleMouseUp = () => {
    const activeStroke = currentStrokeRef.current;

    if (!isDrawing.current || !activeStroke) {
      isDrawing.current = false;
      return;
    }

    isDrawing.current = false;

    if (activeStroke.points.length >= 4) {
      setStrokes((prev) => [...prev, activeStroke]);
      onChange?.();
    }

    setCurrentStroke(null);
    currentStrokeRef.current = null;
  };

  // Handle save
  const handleSave = () => {
    const canvasData: CanvasData = {
      version: '1.0',
      strokes: strokes,
      metadata: {
        canvas_width: canvasWidth,
        canvas_height: canvasHeight,
        grid_size: GRID_SIZE_PX,
      },
    };
    onSave(canvasData);
  };

  // Handle zoom
  const handleZoomIn = () => {
    setStageScale((prev) => clampZoom(prev * 1.2));
  };

  const handleZoomOut = () => {
    setStageScale((prev) => clampZoom(prev / 1.2));
  };

  const handleFitScreen = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scale = calculateCanvasScale(
      canvasWidth,
      canvasHeight,
      container.clientWidth,
      container.clientHeight
    );
    const pos = calculateCenterPosition(
      canvasWidth,
      canvasHeight,
      container.clientWidth,
      container.clientHeight,
      scale
    );

    setStageScale(scale);
    setStagePos(pos);
  };

  // Handle undo
  const handleUndo = () => {
    if (strokes.length > 0) {
      setStrokes((prev) => prev.slice(0, -1));
      onChange?.();
    }
  };

  // Handle clear
  const handleClear = () => {
    if (strokes.length === 0) return;
    if (window.confirm('Biztosan törölni szeretnéd az összes rajzelemet?')) {
      setStrokes([]);
      onChange?.();
    }
  };

  // Render grid
  const renderGrid = () => {
    const lines = [];
    const gridSize = GRID_SIZE_PX;
    const mediumInterval = 5; // 5mm

    for (let i = 0, mmIndex = 0; i <= canvasWidth; i += gridSize, mmIndex++) {
      const isMajor = mmIndex % GRID_MAJOR_INTERVAL === 0;
      const isMedium = !isMajor && mmIndex % mediumInterval === 0;

      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, canvasHeight]}
          stroke={isMajor ? '#15803D' : isMedium ? '#34D399' : '#BBF7D0'}
          strokeWidth={isMajor ? 1.5 : isMedium ? 1 : 0.5}
          opacity={isMajor ? 0.8 : isMedium ? 0.7 : 0.6}
        />
      );
    }

    for (let i = 0, mmIndex = 0; i <= canvasHeight; i += gridSize, mmIndex++) {
      const isMajor = mmIndex % GRID_MAJOR_INTERVAL === 0;
      const isMedium = !isMajor && mmIndex % mediumInterval === 0;

      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, canvasWidth, i]}
          stroke={isMajor ? '#15803D' : isMedium ? '#34D399' : '#BBF7D0'}
          strokeWidth={isMajor ? 1.5 : isMedium ? 1 : 0.5}
          opacity={isMajor ? 0.8 : isMedium ? 0.7 : 0.6}
        />
      );
    }

    return lines;
  };

  return (
    <div className="flex h-full flex-col bg-slate-100">
      {/* Toolbar */}
      <div className="z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <span aria-hidden>←</span>
            <span>Vissza</span>
          </button>

          <div className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tool === 'pen'
                  ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🖊️
              <span>Toll</span>
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tool === 'eraser'
                  ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🧹
              <span>Radír</span>
            </button>
          </div>

          <div className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />

          {tool === 'pen' && (
            <ColorPickerDropdown selectedColor={color} onChange={setColor} />
          )}

          <StrokeWidthDropdown width={width} onChange={setWidth} min={1} max={10} />

          <div className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="hidden text-xs uppercase tracking-wide text-slate-400 sm:block">Papír</span>
              <CompactPaperSizeSelector
                paperSize={paperSize}
                orientation={orientation}
                onPaperSizeChange={setPaperSize}
                onOrientationChange={setOrientation}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 transition-colors hover:bg-slate-200"
                aria-label="Kicsinyítés"
              >
                −
              </button>
              <span className="min-w-[48px] text-center text-sm font-medium text-slate-600">
                {Math.round(stageScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 transition-colors hover:bg-slate-200"
                aria-label="Nagyítás"
              >
                +
              </button>
              <button
                onClick={handleFitScreen}
                className="hidden rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:block"
              >
                Teljes nézet
              </button>
            </div>
          </div>

          <div className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              ↶
              <span>Visszavonás</span>
            </button>
            <button
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              🗑️
              <span>Törlés</span>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              💾
              <span>{saving ? 'Mentés folyamatban...' : 'Mentés'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <Stage
          width={containerSize.width}
          height={containerSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        ref={stageRef}
      >
        {/* Background Layer */}
        <Layer>
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="white" />
        </Layer>

        {/* Grid Layer */}
        <Layer>{renderGrid()}</Layer>

        {/* Drawing Layer */}
        <Layer>
          {strokes.map((stroke) => (
            <Line
              key={stroke.id}
              points={stroke.points}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
            />
          ))}
          {currentStroke && (
            <Line
              points={currentStroke.points}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.width}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
            />
          )}
        </Layer>

        {/* Text Layer */}
        <Layer>
          <Text
            x={canvasWidth - 200}
            y={canvasHeight - 40}
            text={drawing.name}
            fontSize={20}
            fill="#000000"
            align="right"
          />
        </Layer>
        </Stage>

        {/* Drawing info */}
        <div className="absolute bottom-4 right-4 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm text-slate-600 shadow backdrop-blur">
          <div className="font-medium text-slate-800">{drawing.name}</div>
          <div>
            {paperSize.toUpperCase()} · {orientation === 'portrait' ? 'Álló' : 'Fekvő'}
          </div>
          <div className="text-xs text-slate-500">{strokes.length} rajzelem</div>
        </div>
      </div>
    </div>
  );
}

interface StrokeWidthDropdownProps {
  width: number;
  onChange: (width: number) => void;
  min: number;
  max: number;
}

function StrokeWidthDropdown({ width, onChange, min, max }: StrokeWidthDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const previewSize = Math.max(min, Math.min(max, width));

  return (
    <div className="relative min-w-[150px]">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
      >
        <div className="relative h-6 w-16 rounded-full bg-slate-200" aria-hidden>
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700"
            style={{
              width: `${previewSize}px`,
              height: `${previewSize}px`,
            }}
          />
        </div>
        <span>Vastagság</span>
        <span className="ml-auto text-xs text-slate-400">{width}px</span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 w-72 max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <StrokeWidthSlider width={width} onChange={onChange} min={min} max={max} />
          </div>
        </>
      )}
    </div>
  );
}

interface ColorPickerDropdownProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

function ColorPickerDropdown({ selectedColor, onChange }: ColorPickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-w-[150px]">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
      >
        <span
          className="h-6 w-6 rounded-full border border-slate-200"
          style={{ backgroundColor: selectedColor }}
        />
        <span>Szín</span>
        <svg
          className={`ml-auto h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <CompactColorPicker
              selectedColor={selectedColor}
              onChange={(color) => {
                onChange(color);
                setIsOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
