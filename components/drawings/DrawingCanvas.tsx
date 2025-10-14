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
  GRID_SIZE_PX,
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

  // UI state
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);

  // Window size state for responsive canvas
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Refs
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas dimensions
  const { width: canvasWidth, height: canvasHeight } = getCanvasSize(paperSize, orientation);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize canvas - center and fit to screen
  useEffect(() => {
    if (containerRef.current) {
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
    }
  }, [canvasWidth, canvasHeight, windowSize]);

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

    const newStroke: Stroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      points: [canvasPos.x, canvasPos.y],
      color: tool === 'eraser' ? '#FFFFFF' : color,
      width: tool === 'eraser' ? width * 3 : width,
      timestamp: new Date().toISOString(),
    };

    setCurrentStroke(newStroke);
  };

  // Handle mouse/touch move
  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current || !currentStroke || tool === 'pan') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform();
    if (!transform) return;

    const inverted = transform.copy();
    if (!inverted) return;

    const canvasPos = inverted.invert().point(pos);

    const newPoints = [...currentStroke.points, canvasPos.x, canvasPos.y];
    setCurrentStroke({ ...currentStroke, points: newPoints });
  };

  // Handle mouse/touch up
  const handleMouseUp = () => {
    if (!isDrawing.current || !currentStroke) {
      isDrawing.current = false;
      return;
    }

    isDrawing.current = false;

    if (currentStroke.points.length >= 4) {
      setStrokes((prev) => [...prev, currentStroke]);
      onChange?.();
    }

    setCurrentStroke(null);
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
    if (containerRef.current) {
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
    }
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

    for (let i = 0; i <= canvasWidth; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, canvasHeight]}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      );
    }

    for (let i = 0; i <= canvasHeight; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, canvasWidth, i]}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      );
    }

    return lines;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div
        className={`absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 space-y-4 transition-all ${
          isToolbarOpen ? 'opacity-100' : 'opacity-50 hover:opacity-100'
        } max-w-xs`}
      >
        {/* Toolbar Toggle */}
        <button
          onClick={() => setIsToolbarOpen(!isToolbarOpen)}
          className="absolute -right-3 top-4 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
        >
          {isToolbarOpen ? '◀' : '▶'}
        </button>

        {isToolbarOpen && (
          <>
            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 font-medium"
            >
              ← Vissza
            </button>

            <div className="border-t pt-3">
              {/* Tools */}
              <p className="text-xs text-gray-500 font-medium mb-2">Eszköz</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTool('pen')}
                  className={`flex-1 px-4 py-2 rounded ${
                    tool === 'pen' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🖊️ Toll
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`flex-1 px-4 py-2 rounded ${
                    tool === 'eraser' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🧹 Radír
                </button>
              </div>
            </div>

            {/* Color Picker */}
            {tool === 'pen' && (
              <div className="border-t pt-3">
                <CompactColorPicker selectedColor={color} onChange={setColor} />
              </div>
            )}

            {/* Stroke Width */}
            <div className="border-t pt-3">
              <StrokeWidthSlider width={width} onChange={setWidth} min={1} max={10} />
            </div>

            {/* Paper Size */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 font-medium mb-2">Papír</p>
              <CompactPaperSizeSelector
                paperSize={paperSize}
                orientation={orientation}
                onPaperSizeChange={setPaperSize}
                onOrientationChange={setOrientation}
              />
            </div>

            {/* Zoom Controls */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 font-medium mb-2">Zoom</p>
              <div className="flex gap-1">
                <button
                  onClick={handleZoomOut}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  -
                </button>
                <button
                  onClick={handleZoomIn}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  +
                </button>
                <button
                  onClick={handleFitScreen}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-xs"
                >
                  📐
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {Math.round(stageScale * 100)}%
              </p>
            </div>

            {/* Actions */}
            <div className="border-t pt-3 space-y-2">
              <button
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↶ Visszavonás
              </button>
              <button
                onClick={handleClear}
                disabled={strokes.length === 0}
                className="w-full px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Összes törlése
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Mentés...' : '💾 Mentés'}
            </button>
          </>
        )}
      </div>

      {/* Canvas */}
      <Stage
        width={windowSize.width}
        height={windowSize.height}
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
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm space-y-1">
        <div className="text-gray-900 font-medium">{drawing.name}</div>
        <div className="text-gray-600">
          {paperSize.toUpperCase()} · {orientation === 'portrait' ? 'Álló' : 'Fekvő'}
        </div>
        <div className="text-gray-500 text-xs">
          {strokes.length} rajzelem
        </div>
      </div>
    </div>
  );
}