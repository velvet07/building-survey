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
import { CompactStrokeWidthSlider } from './StrokeWidthSlider';
import { CompactPaperSizeSelector } from './PaperSizeSelector';

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
  const [isBackgroundPanning, setIsBackgroundPanning] = useState(false);

  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isStrokeErasing = useRef(false);
  const backgroundPanningRef = useRef(false);
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
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    if (!container) return;

    if (backgroundPanningRef.current || isBackgroundPanning) {
      container.style.cursor = 'grabbing';
      return;
    }

    if (tool === 'pan') {
      container.style.cursor = 'grab';
    } else {
      container.style.cursor = 'crosshair';
    }
  }, [isBackgroundPanning, tool]);

  useEffect(() => {
    stageRef.current?.batchDraw();
  }, [currentStroke, strokes]);

  type CanvasPointerResult = { point: { x: number; y: number }; inside: boolean };

  const getCanvasPoint = useCallback(
    (stage: Konva.Stage, options: { requireInside?: boolean } = {}): CanvasPointerResult | null => {
      const pointer = stage.getPointerPosition();
      if (!pointer) return null;

      const transform = stage.getAbsoluteTransform().copy();
      const inverted = transform.invert();
      const canvasPoint = inverted.point(pointer);
      const inside = isPointInsideCanvas(canvasPoint, canvasWidth, canvasHeight);
      const clampedPoint = clampPointToCanvas(canvasPoint, canvasWidth, canvasHeight);

      if (options.requireInside && !inside) {
        return null;
      }

      return { point: clampedPoint, inside };
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
      const stage = e.target.getStage();
      if (!stage) return;

      const pointerInfo = getCanvasPoint(stage);
      if (!pointerInfo) return;
      const { point, inside } = pointerInfo;

      if (!inside) {
        backgroundPanningRef.current = true;
        setIsBackgroundPanning(true);
        requestAnimationFrame(() => {
          stage.startDrag();
        });
        return;
      }

      if (tool === 'pan') {
        return;
      }

      e.evt.preventDefault();

      if (tool === 'eraser' && eraserMode === 'stroke') {
        isStrokeErasing.current = true;
        eraseStrokeAtPoint(point);
        return;
      }

      isDrawing.current = true;

      const isBandEraser = tool === 'eraser' && eraserMode === 'band';
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: [point.x, point.y],
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

      if (backgroundPanningRef.current) return;

      if (tool === 'eraser' && eraserMode === 'stroke') {
        if (!isStrokeErasing.current) return;

        e.evt.preventDefault();
        const pointerInfo = getCanvasPoint(stage);
        if (!pointerInfo) return;
        eraseStrokeAtPoint(pointerInfo.point);
        return;
      }

      if (!isDrawing.current || tool === 'pan') return;

      e.evt.preventDefault();

      const pointerInfo = getCanvasPoint(stage);
      if (!pointerInfo || !currentStrokeRef.current) return;
      const { point } = pointerInfo;

      const lastPoints = currentStrokeRef.current.points;
      const lastX = lastPoints[lastPoints.length - 2];
      const lastY = lastPoints[lastPoints.length - 1];
      if (lastX === point.x && lastY === point.y) return;

      const updatedStroke: Stroke = {
        ...currentStrokeRef.current,
        points: [...lastPoints, point.x, point.y],
      };

      currentStrokeRef.current = updatedStroke;
      setCurrentStroke(updatedStroke);
    },
    [eraseStrokeAtPoint, eraserMode, getCanvasPoint, tool]
  );

  const handlePointerUp = useCallback(() => {
    if (backgroundPanningRef.current) {
      backgroundPanningRef.current = false;
      setIsBackgroundPanning(false);
    }

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
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-emerald-100 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          {drawingsUrl && (
            <Link
              href={drawingsUrl}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-white text-base text-emerald-700 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Vissza a rajzokhoz"
            >
              ←
            </Link>
          )}

          <div className="min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
              {projectUrl && (
                <>
                  <Link
                    href={projectUrl}
                    className="max-w-[12rem] truncate rounded-md bg-emerald-100 px-2 py-1 text-emerald-700 transition-colors hover:bg-emerald-200 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {projectName ?? 'Projekt nézet'}
                  </Link>
                  <span className="text-emerald-200">/</span>
                </>
              )}
              <span>Rajz modul</span>
            </div>

            {drawingsUrl ? (
              <Link
                href={drawingsUrl}
                className="mt-1 truncate text-sm font-semibold text-emerald-900 underline-offset-4 transition-colors hover:text-emerald-600 hover:underline"
                title="Vissza a rajzok dashboardjához"
              >
                {drawing.name}
              </Link>
            ) : (
              <span className="mt-1 truncate text-sm font-semibold text-emerald-900">{drawing.name}</span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${saving ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'}`}
            />
            <span className="whitespace-nowrap">
              {saving ? 'Mentés folyamatban…' : 'Minden változtatás mentve'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-sm">
            {TOOLBAR_TOOLS.map((toolOption) => (
              <button
                key={toolOption.id}
                onClick={() => setTool(toolOption.id)}
                aria-pressed={tool === toolOption.id}
                className={`flex h-10 min-w-[56px] flex-col items-center justify-center rounded-lg px-2 text-[11px] font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  tool === toolOption.id
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <span className="text-lg leading-none">{toolOption.icon}</span>
                <span className="leading-none">{toolOption.label}</span>
              </button>
            ))}
          </div>

          {tool === 'eraser' && (
            <div className="flex items-center gap-1 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 shadow-sm">
              <span>Radír mód:</span>
              <button
                onClick={() => setEraserMode('band')}
                className={`rounded-lg px-3 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  eraserMode === 'band'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Sáv
              </button>
              <button
                onClick={() => setEraserMode('stroke')}
                className={`rounded-lg px-3 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  eraserMode === 'stroke'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Vonal
              </button>
            </div>
          )}

          <ColorPicker selectedColor={color} onChange={setColor} className="w-full max-w-[180px] sm:w-44" />

          <CompactStrokeWidthSlider
            width={width}
            onChange={setWidth}
            className="flex w-full max-w-xs flex-col rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-sm"
          />

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-sm">
            <button
              onClick={handleZoomOut}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Kicsinyítés"
            >
              −
            </button>
            <button
              onClick={handleFitScreen}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Igazítás képernyőhöz"
            >
              ⤢
            </button>
            <button
              onClick={handleZoomIn}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Nagyítás"
            >
              +
            </button>
            <span className="ml-1 text-xs font-semibold text-emerald-700">{Math.round(stageScale * 100)}%</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-sm">
            <CompactPaperSizeSelector
              paperSize={paperSize}
              orientation={orientation}
              onPaperSizeChange={handlePaperSizeChange}
              onOrientationChange={handleOrientationChange}
              className="flex flex-wrap items-center gap-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-sm">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↺ Visszavonás
            </button>
            <button
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              🗑️ Törlés
            </button>
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-3 py-2">
              <div className="text-sm font-semibold text-emerald-900">{strokes.length} rajzelem</div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 bg-slate-50">
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
              draggable={tool === 'pan' || isBackgroundPanning}
              onDragStart={() => {
                backgroundPanningRef.current = true;
                setIsBackgroundPanning(true);
              }}
              onDragMove={(event) => setStagePos(event.target.position())}
              onDragEnd={(event) => {
                backgroundPanningRef.current = false;
                setIsBackgroundPanning(false);
                setStagePos(event.target.position());
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
        </div>
      </main>
    </div>
  );
}
