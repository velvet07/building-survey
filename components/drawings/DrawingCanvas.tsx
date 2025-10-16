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
}

export default function DrawingCanvas({
  drawing,
  onCanvasChange,
  saving,
  projectName,
  projectUrl,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBackgroundPan, setIsBackgroundPan] = useState(false);

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

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const container = stage.container();
    if (isBackgroundPan || tool === 'pan') {
      container.style.cursor = 'grab';
    } else {
      container.style.cursor = 'crosshair';
    }
  }, [isBackgroundPan, tool]);

  const getCanvasPoint = useCallback(
    (stage: Konva.Stage) => {
      const pointer = stage.getPointerPosition();
      if (!pointer) return null;

      const transform = stage.getAbsoluteTransform().copy();
      const inverted = transform.invert();
      const canvasPoint = inverted.point(pointer);
      const inside = isPointInsideCanvas(canvasPoint, canvasWidth, canvasHeight);

      return {
        point: clampPointToCanvas(canvasPoint, canvasWidth, canvasHeight),
        inside,
      };
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

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        void container.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      void document.exitFullscreen();
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const canvasPoint = getCanvasPoint(stage);
      if (!canvasPoint) return;

      if (!canvasPoint.inside) {
        setIsBackgroundPan(true);
        stage.draggable(true);
        requestAnimationFrame(() => {
          stage.startDrag();
        });
        return;
      }

      if (tool === 'pan') return;

      e.evt.preventDefault();

      const canvasPos = canvasPoint.point;

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

      if (isBackgroundPan) {
        return;
      }

      if (tool === 'eraser' && eraserMode === 'stroke') {
        if (!isStrokeErasing.current) return;

        e.evt.preventDefault();
        const canvasPoint = getCanvasPoint(stage);
        if (!canvasPoint) return;
        eraseStrokeAtPoint(canvasPoint.point);
        return;
      }

      if (!isDrawing.current || tool === 'pan') return;

      e.evt.preventDefault();

      const canvasPoint = getCanvasPoint(stage);
      if (!canvasPoint || !currentStrokeRef.current) return;

      const lastPoints = currentStrokeRef.current.points;
      const lastX = lastPoints[lastPoints.length - 2];
      const lastY = lastPoints[lastPoints.length - 1];
      if (lastX === canvasPoint.point.x && lastY === canvasPoint.point.y) return;

      const updatedStroke: Stroke = {
        ...currentStrokeRef.current,
        points: [...lastPoints, canvasPoint.point.x, canvasPoint.point.y],
      };

      currentStrokeRef.current = updatedStroke;
      setCurrentStroke(updatedStroke);
    },
    [eraseStrokeAtPoint, eraserMode, getCanvasPoint, isBackgroundPan, tool]
  );

  const handlePointerUp = useCallback(() => {
    setIsBackgroundPan(false);
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
      <div className="border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-3 py-2 md:px-4 md:py-3">
          <div className="flex flex-wrap items-center gap-2">
            {projectUrl && (
              <Link
                href={projectUrl}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                ← Projekt
              </Link>
            )}

            <div className="flex min-w-0 flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
                Rajz
              </span>
              <span className="truncate text-sm font-semibold text-emerald-900 md:text-base">
                {drawing.name}
              </span>
              {projectName && (
                <span className="truncate text-xs text-emerald-600">{projectName}</span>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span
                  className={`h-2 w-2 rounded-full ${
                    saving ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                {saving ? 'Mentés folyamatban…' : 'Automatikus mentés kész'}
              </div>
              <button
                onClick={toggleFullscreen}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-700 shadow-sm transition-colors hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <span className="text-base">{isFullscreen ? '⤢' : '⛶'}</span>
                <span className="hidden sm:inline">{isFullscreen ? 'Kilépés' : 'Teljes képernyő'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-2 py-1 shadow-sm">
              {TOOLBAR_TOOLS.map((toolOption) => (
                <button
                  key={toolOption.id}
                  onClick={() => setTool(toolOption.id)}
                  aria-pressed={tool === toolOption.id}
                  className={`flex h-11 min-w-[60px] flex-col items-center justify-center rounded-lg px-2 text-[11px] font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    tool === toolOption.id
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-white text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <span className="text-lg">{toolOption.icon}</span>
                  {toolOption.label}
                </button>
              ))}
            </div>

            {tool === 'eraser' && (
              <div className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                <span className="hidden text-[11px] uppercase tracking-wide text-emerald-500 sm:inline">Radír mód</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEraserMode('band')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      eraserMode === 'band'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Sáv
                  </button>
                  <button
                    onClick={() => setEraserMode('stroke')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      eraserMode === 'stroke'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Vonal
                  </button>
                </div>
              </div>
            )}

            <ColorPicker
              selectedColor={color}
              onChange={setColor}
              className="w-40 min-w-[10rem]"
            />

            <div className="relative" ref={widthDropdownRef}>
              <button
                onClick={() => setIsWidthMenuOpen((prev) => !prev)}
                className={`flex h-11 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-700 shadow-sm transition-colors hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isWidthMenuOpen ? 'ring-2 ring-emerald-500' : ''
                }`}
              >
                <span className="text-base">✏️</span>
                Vastagság
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  {width}px
                </span>
                <svg
                  className={`ml-1 h-3.5 w-3.5 transition-transform ${isWidthMenuOpen ? 'rotate-180' : ''}`}
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
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Tollvastagság
                  </h3>
                  <StrokeWidthSlider width={width} onChange={setWidth} min={1} max={12} />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {WIDTH_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setWidth(preset)}
                        className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                          width === preset
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                            : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                        }`}
                      >
                        {preset}px
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <CompactPaperSizeSelector
              paperSize={paperSize}
              orientation={orientation}
              onPaperSizeChange={handlePaperSizeChange}
              onOrientationChange={handleOrientationChange}
              className="flex items-center gap-3"
            />

            <div className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-2 py-1 shadow-sm">
              <button
                onClick={handleZoomOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-base text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                −
              </button>
              <button
                onClick={handleFitScreen}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-base text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                ◎
              </button>
              <button
                onClick={handleZoomIn}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-base text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                +
              </button>
              <button
                onClick={toggleFullscreen}
                className="hidden h-9 w-9 items-center justify-center rounded-lg text-base text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:flex"
                aria-pressed={isFullscreen}
              >
                {isFullscreen ? '⤢' : '⛶'}
              </button>
              <span className="ml-2 min-w-[3rem] text-center text-xs font-semibold text-emerald-700">
                {Math.round(stageScale * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="flex h-11 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-700 shadow-sm transition-colors hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↺ Visszavonás
              </button>
              <button
                onClick={handleClear}
                disabled={strokes.length === 0}
                className="flex h-11 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🗑️ Törlés
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="relative h-full w-full"
          style={{ touchAction: 'none' }}
        >
          {stageSize.width > 0 && stageSize.height > 0 && (
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              scaleX={stageScale}
              scaleY={stageScale}
              x={stagePos.x}
              y={stagePos.y}
              draggable={tool === 'pan' || isBackgroundPan}
              onDragStart={() => {
                const stage = stageRef.current;
                if (stage) {
                  stage.container().style.cursor = 'grabbing';
                }
              }}
              onDragMove={(event) => setStagePos(event.target.position())}
              onDragEnd={(event) => {
                setStagePos(event.target.position());
                setIsBackgroundPan(false);
                const stageNode = stageRef.current;
                if (stageNode) {
                  stageNode.container().style.cursor =
                    tool === 'pan' ? 'grab' : 'crosshair';
                }
              }}
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
                <Rect
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  fill="#f8fff4"
                  stroke="#0f766e"
                  strokeWidth={1.6}
                  shadowColor="#0f766e"
                  shadowBlur={20}
                  shadowOpacity={0.12}
                />
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
      </div>
    </div>
  );
}
