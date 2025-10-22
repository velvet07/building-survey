'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback, type ReactElement } from 'react';
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
  GRID_MAJOR_INTERVAL,
  GRID_MEDIUM_INTERVAL,
  clampPointToCanvas,
  isPointInsideCanvas,
} from '@/lib/drawings/canvas-utils';
import ColorPicker from './ColorPicker';
import StrokeWidthSlider from './StrokeWidthSlider';
import { CompactPaperSizeSelector } from './PaperSizeSelector';

const WIDTH_PRESETS = [1, 2, 3, 5, 8, 10];
const TOOLBAR_TOOLS: { id: DrawingTool; label: string; icon: string }[] = [
  { id: 'pen', label: 'Toll', icon: '✏️' },
  { id: 'eraser', label: 'Radír', icon: '🧽' },
  { id: 'pan', label: 'Mozgatás', icon: '🖐️' },
];

type EraserMode = 'band' | 'stroke';

interface DrawingCanvasProps {
  drawing: Drawing;
  onCanvasChange: (payload: {
    canvasData: CanvasData;
    paperSize: PaperSize;
    orientation: PaperOrientation;
  }) => void;
  saving: boolean;
  projectName?: string;
  projectUrl?: string;
  drawingsUrl?: string;
}

export default function DrawingCanvas({
  drawing,
  onCanvasChange,
  saving,
  projectName,
  projectUrl,
  drawingsUrl,
}: DrawingCanvasProps) {
  const [strokes, setStrokes] = useState<Stroke[]>(drawing.canvas_data.strokes || []);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);

  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(2);
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke');

  const [paperSize, setPaperSize] = useState<PaperSize>(drawing.paper_size);
  const [orientation, setOrientation] = useState<PaperOrientation>(drawing.orientation);

  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [isWidthMenuOpen, setIsWidthMenuOpen] = useState(false);

  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widthDropdownRef = useRef<HTMLDivElement>(null);
  const isStrokeErasing = useRef(false);
  const pinchState = useRef<{
    initialDistance: number;
    initialScale: number;
    initialPosition: { x: number; y: number };
  } | null>(null);
  const hasMountedRef = useRef(false);
  const onCanvasChangeRef = useRef(onCanvasChange);

  const { width: canvasWidth, height: canvasHeight } = getCanvasSize(paperSize, orientation);

  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getTouchCenter = useCallback((stage: Konva.Stage, touch1: Touch, touch2: Touch) => {
    const rect = stage.container().getBoundingClientRect();
    return {
      x: (touch1.clientX + touch2.clientX) / 2 - rect.left,
      y: (touch1.clientY + touch2.clientY) / 2 - rect.top,
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const recenterCanvas = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scale = calculateCanvasScale(
      canvasWidth,
      canvasHeight,
      container.clientWidth,
      container.clientHeight,
      80
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
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    recenterCanvas();
  }, [recenterCanvas, stageSize.width, stageSize.height]);

  useEffect(() => {
    recenterCanvas();
  }, [recenterCanvas, paperSize, orientation]);

  useEffect(() => {
    onCanvasChangeRef.current = onCanvasChange;
  }, [onCanvasChange]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const canvasData: CanvasData = {
      version: '1.0',
      strokes,
      metadata: {
        canvas_width: canvasWidth,
        canvas_height: canvasHeight,
        grid_size: GRID_SIZE_PX,
      },
    };

    onCanvasChangeRef.current?.({ canvasData, paperSize, orientation });
  }, [canvasHeight, canvasWidth, orientation, paperSize, strokes]);

  useEffect(() => {
    if (!isWidthMenuOpen || typeof document === 'undefined') return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!widthDropdownRef.current) return;
      if (!widthDropdownRef.current.contains(event.target as Node)) {
        setIsWidthMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsWidthMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isWidthMenuOpen]);

  const getCanvasPoint = useCallback(
    (stage: Konva.Stage, options: { requireInside?: boolean } = {}) => {
      const pointer = stage.getPointerPosition();
      if (!pointer) return null;

      const transform = stage.getAbsoluteTransform().copy();
      const inverted = transform.invert();
      const canvasPoint = inverted.point(pointer);
      const inside = isPointInsideCanvas(canvasPoint, canvasWidth, canvasHeight);

      if (options.requireInside && !inside) {
        return null;
      }

      return clampPointToCanvas(canvasPoint, canvasWidth, canvasHeight);
    },
    [canvasWidth, canvasHeight]
  );

  const beginStroke = useCallback((stroke: Stroke) => {
    currentStrokeRef.current = stroke;
    setCurrentStroke(stroke);
  }, []);

  const commitStroke = useCallback(() => {
    const stroke = currentStrokeRef.current;
    if (stroke && stroke.points.length >= 4) {
      setStrokes((prev) => [...prev, stroke]);
    }
    currentStrokeRef.current = null;
    setCurrentStroke(null);
  }, []);

  const distanceToSegment = useCallback((
    point: { x: number; y: number },
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (dx === 0 && dy === 0) {
      const distX = point.x - start.x;
      const distY = point.y - start.y;
      return Math.sqrt(distX * distX + distY * distY);
    }

    const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
    const clampedT = Math.max(0, Math.min(1, t));
    const projX = start.x + clampedT * dx;
    const projY = start.y + clampedT * dy;
    const distX = point.x - projX;
    const distY = point.y - projY;
    return Math.sqrt(distX * distX + distY * distY);
  }, []);

  const eraseStrokeAtPoint = useCallback(
    (point: { x: number; y: number }) => {
      let removed = false;
      setStrokes((prev) => {
        let targetIndex = -1;

        for (let index = prev.length - 1; index >= 0; index--) {
          const stroke = prev[index];
          const pts = stroke.points;
          for (let i = 0; i < pts.length - 2; i += 2) {
            const segmentStart = { x: pts[i], y: pts[i + 1] };
            const segmentEnd = { x: pts[i + 2], y: pts[i + 3] };
            const distance = distanceToSegment(point, segmentStart, segmentEnd);
            const tolerance = Math.max(width * 3, 24);
            if (distance <= tolerance) {
              targetIndex = index;
              break;
            }
          }
          if (targetIndex !== -1) {
            break;
          }
        }

        if (targetIndex === -1) {
          return prev;
        }

        removed = true;
        return prev.filter((_, idx) => idx !== targetIndex);
      });

      if (removed) {
        // noop - state effect will propagate change
      }
    },
    [distanceToSegment, width]
  );

  const handlePointerDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>) => {
      if (tool === 'pan') return;

      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const canvasPos = getCanvasPoint(stage, { requireInside: true });
      if (!canvasPos) return;

      if (tool === 'eraser' && eraserMode === 'stroke') {
        isStrokeErasing.current = true;
        eraseStrokeAtPoint(canvasPos);
        return;
      }

      isDrawing.current = true;

      const isBandEraser = tool === 'eraser' && eraserMode === 'band';
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: [canvasPos.x, canvasPos.y],
        color: isBandEraser ? '#000000' : color,
        width: isBandEraser ? width * 3 : width,
        timestamp: new Date().toISOString(),
        compositeOperation:
          isBandEraser ? 'destination-out' : 'source-over',
      };

      beginStroke(newStroke);
    },
    [beginStroke, color, eraseStrokeAtPoint, eraserMode, getCanvasPoint, tool, width]
  );

  const handlePointerMove = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      if (tool === 'eraser' && eraserMode === 'stroke') {
        if (!isStrokeErasing.current) return;

        e.evt.preventDefault();
        const canvasPos = getCanvasPoint(stage);
        if (!canvasPos) return;
        eraseStrokeAtPoint(canvasPos);
        return;
      }

      if (!isDrawing.current || tool === 'pan') return;

      e.evt.preventDefault();

      const canvasPos = getCanvasPoint(stage);
      if (!canvasPos || !currentStrokeRef.current) return;

      const lastPoints = currentStrokeRef.current.points;
      const lastX = lastPoints[lastPoints.length - 2];
      const lastY = lastPoints[lastPoints.length - 1];
      if (lastX === canvasPos.x && lastY === canvasPos.y) return;

      const updatedStroke: Stroke = {
        ...currentStrokeRef.current,
        points: [...lastPoints, canvasPos.x, canvasPos.y],
      };

      currentStrokeRef.current = updatedStroke;
      setCurrentStroke(updatedStroke);
    },
    [eraseStrokeAtPoint, eraserMode, getCanvasPoint, tool]
  );

  const handlePointerUp = useCallback(() => {
    if (tool === 'eraser' && eraserMode === 'stroke') {
      isStrokeErasing.current = false;
      return;
    }
    if (!isDrawing.current) return;
    isDrawing.current = false;
    commitStroke();
  }, [commitStroke, eraserMode, tool]);

  const handleStageWheel = useCallback(
    (event: KonvaEventObject<WheelEvent>) => {
      event.evt.preventDefault();
      const stage = event.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.05;
      const shouldZoomIn = event.evt.deltaY < 0;
      const newScale = clampZoom(shouldZoomIn ? stageScale * scaleBy : stageScale / scaleBy);

      const mousePointTo = {
        x: (pointer.x - stagePos.x) / stageScale,
        y: (pointer.y - stagePos.y) / stageScale,
      };

      const newPosition = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setStageScale(newScale);
      setStagePos(newPosition);
    },
    [stagePos.x, stagePos.y, stageScale]
  );

  const handleStageTouchStart = useCallback(
    (event: KonvaEventObject<TouchEvent | PointerEvent>) => {
      const stage = event.target.getStage();
      if (!stage) return;

      const touches = (event.evt as TouchEvent).touches;
      if (touches && touches.length === 2) {
        event.evt.preventDefault();
        const [touch1, touch2] = [touches[0], touches[1]];
        const distance = getTouchDistance(touch1, touch2);
        pinchState.current = {
          initialDistance: distance,
          initialScale: stageScale,
          initialPosition: { ...stage.position() },
        };
        isDrawing.current = false;
        currentStrokeRef.current = null;
        setCurrentStroke(null);
        return;
      }

      handlePointerDown(event as KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>);
    },
    [getTouchDistance, handlePointerDown, stageScale]
  );

  const handleStageTouchMove = useCallback(
    (event: KonvaEventObject<TouchEvent | PointerEvent>) => {
      const stage = event.target.getStage();
      if (!stage) return;

      const touches = (event.evt as TouchEvent).touches;
      if (touches && touches.length === 2 && pinchState.current) {
        event.evt.preventDefault();
        const [touch1, touch2] = [touches[0], touches[1]];
        const distance = getTouchDistance(touch1, touch2);
        if (distance === 0) return;

        const scaleFactor = distance / pinchState.current.initialDistance;
        const newScale = clampZoom(pinchState.current.initialScale * scaleFactor);
        const center = getTouchCenter(stage, touch1, touch2);
        const pointTo = {
          x: (center.x - pinchState.current.initialPosition.x) /
            pinchState.current.initialScale,
          y: (center.y - pinchState.current.initialPosition.y) /
            pinchState.current.initialScale,
        };

        const newPosition = {
          x: center.x - pointTo.x * newScale,
          y: center.y - pointTo.y * newScale,
        };

        setStageScale(newScale);
        setStagePos(newPosition);
        return;
      }

      handlePointerMove(event as KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>);
    },
    [getTouchCenter, getTouchDistance, handlePointerMove]
  );

  const handleStageTouchEnd = useCallback(
    (event: KonvaEventObject<TouchEvent | PointerEvent>) => {
      const touches = (event.evt as TouchEvent).touches;
      if (!touches || touches.length < 2) {
        pinchState.current = null;
        isDrawing.current = false;
      }

      handlePointerUp();
    },
    [handlePointerUp]
  );

  const handleUndo = useCallback(() => {
    if (strokes.length === 0) return;
    setStrokes((prev) => prev.slice(0, -1));
  }, [strokes.length]);

  const handleClear = useCallback(() => {
    if (strokes.length === 0) return;
    if (window.confirm('Biztosan törölni szeretnéd az összes rajzelemet?')) {
      setStrokes([]);
    }
  }, [strokes.length]);

  const handleZoomIn = () => {
    setStageScale((prev) => clampZoom(prev * 1.2));
  };

  const handleZoomOut = () => {
    setStageScale((prev) => clampZoom(prev / 1.2));
  };

  const handleFitScreen = () => {
    recenterCanvas();
  };

  const handlePaperSizeChange = (size: PaperSize) => {
    setPaperSize(size);
  };

  const handleOrientationChange = (value: PaperOrientation) => {
    setOrientation(value);
  };

  const renderGrid = () => {
    const lines: ReactElement[] = [];
    const stepCountX = Math.ceil(canvasWidth / GRID_SIZE_PX);
    const stepCountY = Math.ceil(canvasHeight / GRID_SIZE_PX);

    for (let step = 0; step <= stepCountX; step++) {
      const x = Math.min(step * GRID_SIZE_PX, canvasWidth);
      const isMajor = step % GRID_MAJOR_INTERVAL === 0;
      const isMedium = !isMajor && step % GRID_MEDIUM_INTERVAL === 0;
      const strokeColor = isMajor ? '#15803d' : isMedium ? '#34d399' : '#bbf7d0';
      const strokeWidth = isMajor ? 1.1 : isMedium ? 0.8 : 0.35;
      const opacity = isMajor ? 0.85 : isMedium ? 0.7 : 0.45;

      lines.push(
        <Line
          key={`v-${step}`}
          points={[x, 0, x, canvasHeight]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity}
          listening={false}
        />
      );
    }

    for (let step = 0; step <= stepCountY; step++) {
      const y = Math.min(step * GRID_SIZE_PX, canvasHeight);
      const isMajor = step % GRID_MAJOR_INTERVAL === 0;
      const isMedium = !isMajor && step % GRID_MEDIUM_INTERVAL === 0;
      const strokeColor = isMajor ? '#15803d' : isMedium ? '#34d399' : '#bbf7d0';
      const strokeWidth = isMajor ? 1.1 : isMedium ? 0.8 : 0.35;
      const opacity = isMajor ? 0.85 : isMedium ? 0.7 : 0.45;

      lines.push(
        <Line
          key={`h-${step}`}
          points={[0, y, canvasWidth, y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity}
          listening={false}
        />
      );
    }

    return lines;
  };

  return (
    <div className="flex h-full flex-col bg-emerald-50/40">
      <div className="toolbar-container relative flex flex-row items-center gap-1 px-3 py-2 bg-white border-b border-gray-200 overflow-visible overflow-x-auto overflow-y-visible sticky top-0 z-50 scrollbar-thin scrollbar-thumb-gray-300 md:gap-2 md:px-4 md:py-3">
        {drawingsUrl && (
          <Link
            href={drawingsUrl}
            className="toolbar-button inline-flex min-w-[48px] min-h-[48px] flex-shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation md:min-h-[44px] md:min-w-[44px]"
          >
            <span aria-hidden className="text-lg">←</span>
            <span>Vissza a rajzokhoz</span>
          </Link>
        )}

        {projectUrl && (
          <Link
            href={projectUrl}
            className="toolbar-button inline-flex min-w-[48px] min-h-[48px] flex-shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation md:min-h-[44px] md:min-w-[44px]"
          >
            <span aria-hidden className="text-lg">←</span>
            <span>Vissza a projekthez</span>
          </Link>
        )}

        {projectName && (
          <span className="hidden flex-shrink-0 text-sm font-semibold text-gray-500 lg:inline">
            {projectName}
          </span>
        )}

        <div className="flex flex-row items-center gap-1 pr-2 flex-shrink-0">
          {TOOLBAR_TOOLS.map((toolOption) => (
            <button
              key={toolOption.id}
              onClick={() => setTool(toolOption.id)}
              aria-pressed={tool === toolOption.id}
              className={`toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation text-sm font-semibold text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-[44px] md:min-w-[44px] ${
                tool === toolOption.id ? 'bg-blue-50 text-blue-700' : 'bg-white'
              }`}
            >
              <span className="text-lg" aria-hidden>
                {toolOption.icon}
              </span>
              <span className="text-xs uppercase tracking-wide">{toolOption.label}</span>
            </button>
          ))}
        </div>

        {tool === 'eraser' && (
          <div className="flex flex-row items-center gap-2 pr-2 flex-shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Radír mód
            </span>
            <button
              onClick={() => setEraserMode('band')}
              className={`toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-[44px] md:min-w-[44px] ${
                eraserMode === 'band' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'
              }`}
            >
              Sávos
            </button>
            <button
              onClick={() => setEraserMode('stroke')}
              className={`toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-[44px] md:min-w-[44px] ${
                eraserMode === 'stroke' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'
              }`}
            >
              Vonás
            </button>
          </div>
        )}

        <div className="flex flex-row items-center gap-2 pr-2 flex-shrink-0">
          <ColorPicker
            selectedColor={color}
            onChange={setColor}
            className="min-w-[160px] flex-shrink-0"
          />

          <div className="relative flex-shrink-0" ref={widthDropdownRef}>
            <button
              onClick={() => setIsWidthMenuOpen((prev) => !prev)}
              className={`toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-[44px] md:min-w-[44px] ${
                isWidthMenuOpen ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <span className="text-lg" aria-hidden>
                ✏️
              </span>
              <span className="flex items-center gap-1 text-xs uppercase tracking-wide">
                Vastagság
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.65rem] font-bold text-blue-700">
                  {width}px
                </span>
              </span>
              <svg
                className={`ml-1 h-4 w-4 transition-transform ${isWidthMenuOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isWidthMenuOpen && (
              <div className="absolute right-0 top-full z-[100] mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Tollvastagság
                </h3>
                <StrokeWidthSlider width={width} onChange={setWidth} min={1} max={12} />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {WIDTH_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setWidth(preset)}
                      className={`toolbar-button min-w-[48px] min-h-[48px] justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-[44px] md:min-w-[44px] ${
                        width === preset
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {preset}px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <CompactPaperSizeSelector
          paperSize={paperSize}
          orientation={orientation}
          onPaperSizeChange={handlePaperSizeChange}
          onOrientationChange={handleOrientationChange}
          className="flex flex-row flex-wrap items-center gap-2 flex-shrink-0"
        />

        <div className="flex flex-row items-center gap-2 pr-2 flex-shrink-0">
          <button
            onClick={handleZoomOut}
            className="toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg text-lg text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-[44px] md:min-w-[44px]"
          >
            −
          </button>
          <button
            onClick={handleFitScreen}
            className="toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg text-lg text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-[44px] md:min-w-[44px]"
          >
            ⤢
          </button>
          <button
            onClick={handleZoomIn}
            className="toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg text-lg text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-[44px] md:min-w-[44px]"
          >
            +
          </button>
          <span className="min-w-[3rem] text-center text-xs font-semibold text-gray-600">
            {Math.round(stageScale * 100)}%
          </span>
        </div>

        <button
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[44px] md:min-w-[44px]"
        >
          ↺ Visszavonás
        </button>
        <button
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="toolbar-button min-w-[48px] min-h-[48px] p-2 rounded-lg border border-red-200 bg-red-50 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 active:bg-red-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[44px] md:min-w-[44px]"
        >
          🗑️ Törlés
        </button>
        <div className="flex min-w-[200px] flex-shrink-0 flex-row items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm font-semibold text-gray-700">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              saving ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'
            }`}
          />
          <span>{saving ? 'Mentés folyamatban…' : 'Automatikus mentés kész'}</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {stageSize.width > 0 && stageSize.height > 0 && (
          <Stage
            className="border-none outline-none shadow-none"
            width={stageSize.width}
            height={stageSize.height}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePos.x}
            y={stagePos.y}
            draggable={tool === 'pan'}
            onDragMove={(event) => setStagePos(event.target.position())}
            onDragEnd={(event) => setStagePos(event.target.position())}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handleStageTouchStart}
            onTouchMove={handleStageTouchMove}
            onTouchEnd={handleStageTouchEnd}
            onTouchCancel={handleStageTouchEnd}
            onWheel={handleStageWheel}
            ref={stageRef}
          >
            <Layer listening={false}>
              <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#f8fff4" />
            </Layer>

            <Layer
              clipX={0}
              clipY={0}
              clipWidth={canvasWidth}
              clipHeight={canvasHeight}
              listening={false}
            >
              {renderGrid()}
            </Layer>

            <Layer
              clipX={0}
              clipY={0}
              clipWidth={canvasWidth}
              clipHeight={canvasHeight}
            >
              {strokes.map((stroke) => (
                <Line
                  key={stroke.id}
                  points={stroke.points}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.35}
                  globalCompositeOperation={stroke.compositeOperation ?? 'source-over'}
                />
              ))}
              {currentStroke && (
                <Line
                  points={currentStroke.points}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.width}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.35}
                  globalCompositeOperation={currentStroke.compositeOperation ?? 'source-over'}
                />
              )}
            </Layer>

            <Layer listening={false}>
              <Text
                x={canvasWidth - 260}
                y={canvasHeight - 48}
                text={drawing.name}
                fontSize={24}
                fill="#047857"
                align="right"
                width={240}
              />
            </Layer>
          </Stage>
        )}

        <div className="pointer-events-none absolute bottom-6 right-6 rounded-2xl bg-white/90 px-4 py-3 text-sm shadow-xl backdrop-blur">
          <div className="text-base font-semibold text-emerald-900">{drawing.name}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            {paperSize.toUpperCase()} · {orientation === 'portrait' ? 'Álló' : 'Fekvő'}
          </div>
          <div className="mt-1 text-xs text-emerald-500">{strokes.length} rajzelem</div>
        </div>
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .toolbar-container {
            gap: 0.25rem;
            padding: 0.5rem 0.75rem;
          }

          .toolbar-button {
            min-width: 48px;
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
}
