'use client';

import Link from 'next/link';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useTransition,
  type ReactElement,
} from 'react';
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
import StrokeWidthSlider from './StrokeWidthSlider';
import { CompactPaperSizeSelector } from './PaperSizeSelector';
import PDFExportModal from './PDFExportModal';

const WIDTH_PRESETS = [1, 2, 3, 5, 8, 10];
const TOOLBAR_TOOLS: { id: DrawingTool; label: string; icon: string }[] = [
  { id: 'pen', label: 'Toll', icon: '✏️' },
  { id: 'eraser', label: 'Radír', icon: '🧽' },
  { id: 'select', label: 'Kijelölés', icon: '➰' },
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
  readOnly?: boolean;
}

export default function DrawingCanvas({
  drawing,
  onCanvasChange,
  saving,
  projectName,
  projectUrl,
  drawingsUrl,
  readOnly = false,
}: DrawingCanvasProps) {
  const [strokes, setStrokes] = useState<Stroke[]>(drawing.canvas_data.strokes || []);
  const [history, setHistory] = useState<Stroke[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [, startTransition] = useTransition();

  const [tool, setTool] = useState<DrawingTool>(readOnly ? 'pan' : 'pen');
  const [color, setColor] = useState('#3B82F6'); // Default blue
  const [width, setWidth] = useState(4); // Default 4px
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke');

  const [paperSize, setPaperSize] = useState<PaperSize>(drawing.paper_size);
  const [orientation, setOrientation] = useState<PaperOrientation>(drawing.orientation);

  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [isWidthMenuOpen, setIsWidthMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<Set<string>>(new Set());
  const [lassoPoints, setLassoPoints] = useState<number[]>([]);
  const [lastLassoPolygon, setLastLassoPolygon] = useState<number[]>([]);
  const [isPDFExportOpen, setIsPDFExportOpen] = useState(false);

  const isDrawing = useRef(false);
  const isDrawingLasso = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widthDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const isStrokeErasing = useRef(false);
  const isDraggingSelection = useRef(false);
  const dragStartPoint = useRef<{ x: number; y: number } | null>(null);
  const isPanning = useRef(false);
  const panStartPos = useRef<{ x: number; y: number; stageX: number; stageY: number } | null>(null);
  const selectionMoveHistorySaved = useRef(false);
  const pinchState = useRef<{
    initialDistance: number;
    initialScale: number;
    initialPosition: { x: number; y: number };
    initialCenter: { x: number; y: number };
  } | null>(null);
  const hasMountedRef = useRef(false);
  const onCanvasChangeRef = useRef(onCanvasChange);
  const renderFrameId = useRef<number | null>(null);
  const pendingStrokeUpdate = useRef(false);
  const historySaveTimeoutId = useRef<NodeJS.Timeout | null>(null);

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

  const getEventClientPosition = useCallback((evt: MouseEvent | TouchEvent | PointerEvent) => {
    // Handle TouchEvent
    if ('touches' in evt && evt.touches && evt.touches.length > 0) {
      return {
        x: evt.touches[0].clientX,
        y: evt.touches[0].clientY,
      };
    }
    // Handle MouseEvent or PointerEvent
    return {
      x: (evt as MouseEvent).clientX,
      y: (evt as MouseEvent).clientY,
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

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.clientWidth === 0 || containerRef.current.clientHeight === 0) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          recenterCanvas();
        }
      });
      return;
    }
    recenterCanvas();
  }, [recenterCanvas]);

  useEffect(() => {
    if (stageSize.width === 0 || stageSize.height === 0) {
      return;
    }
    recenterCanvas();
  }, [recenterCanvas, stageSize.height, stageSize.width]);

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
    document.addEventListener('touchstart', handlePointerDown as any);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown as any);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isWidthMenuOpen]);

  useEffect(() => {
    if (!isColorMenuOpen || typeof document === 'undefined') return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!colorDropdownRef.current) return;
      if (!colorDropdownRef.current.contains(event.target as Node)) {
        setIsColorMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsColorMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown as any);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown as any);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isColorMenuOpen]);

  // Clear selection when changing tools
  useEffect(() => {
    if (tool !== 'select') {
      setSelectedStrokeIds(new Set());
    }
  }, [tool]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (renderFrameId.current !== null) {
        cancelAnimationFrame(renderFrameId.current);
      }
      if (historySaveTimeoutId.current !== null) {
        clearTimeout(historySaveTimeoutId.current);
      }
    };
  }, []);

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

  const saveToHistory = useCallback((newStrokes: Stroke[]) => {
    setHistory((prev) => [...prev, strokes]);
    setStrokes(newStrokes);
  }, [strokes]);

  const beginStroke = useCallback((stroke: Stroke) => {
    currentStrokeRef.current = stroke;
    setCurrentStroke(stroke);
    pendingStrokeUpdate.current = false;
  }, []);

  // Throttled update for smooth rendering during drawing
  const scheduleStrokeUpdate = useCallback(() => {
    if (pendingStrokeUpdate.current) return;

    pendingStrokeUpdate.current = true;
    if (renderFrameId.current !== null) {
      cancelAnimationFrame(renderFrameId.current);
    }

    renderFrameId.current = requestAnimationFrame(() => {
      if (currentStrokeRef.current) {
        setCurrentStroke({ ...currentStrokeRef.current });
      }
      pendingStrokeUpdate.current = false;
      renderFrameId.current = null;
    });
  }, []);

  const commitStroke = useCallback(() => {
    // Cancel any pending render frame
    if (renderFrameId.current !== null) {
      cancelAnimationFrame(renderFrameId.current);
      renderFrameId.current = null;
    }
    pendingStrokeUpdate.current = false;

    const stroke = currentStrokeRef.current;
    if (!stroke || stroke.points.length < 4) {
      currentStrokeRef.current = null;
      setCurrentStroke(null);
      return;
    }

    // Immediately add stroke to array for instant visual feedback
    setStrokes((prevStrokes) => {
      const newStrokes = [...prevStrokes, stroke];

      // Defer history save to avoid blocking the UI
      // This allows rapid consecutive strokes without freezing
      if (historySaveTimeoutId.current !== null) {
        clearTimeout(historySaveTimeoutId.current);
      }

      historySaveTimeoutId.current = setTimeout(() => {
        startTransition(() => {
          setHistory((prevHistory) => {
            // Use the previous strokes as history checkpoint
            if (prevHistory.length === 0 || prevHistory[prevHistory.length - 1].length !== prevStrokes.length) {
              return [...prevHistory, prevStrokes];
            }
            return prevHistory;
          });
        });
        historySaveTimeoutId.current = null;
      }, 300); // 300ms delay for history - batches rapid strokes

      return newStrokes;
    });

    currentStrokeRef.current = null;
    setCurrentStroke(null);
  }, [startTransition]);

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

  const isPointInPolygon = useCallback((point: { x: number; y: number }, polygon: number[]) => {
    // Ray casting algorithm
    let inside = false;
    for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
      const xi = polygon[i];
      const yi = polygon[i + 1];
      const xj = polygon[j];
      const yj = polygon[j + 1];

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }, []);

  const findStrokesInLasso = useCallback(
    (lassoPolygon: number[]) => {
      const selectedIds = new Set<string>();

      for (const stroke of strokes) {
        // Check if any point of the stroke is inside the lasso
        for (let i = 0; i < stroke.points.length; i += 2) {
          const point = { x: stroke.points[i], y: stroke.points[i + 1] };
          if (isPointInPolygon(point, lassoPolygon)) {
            selectedIds.add(stroke.id);
            break; // Found one point inside, no need to check more
          }
        }
      }

      return selectedIds;
    },
    [isPointInPolygon, strokes]
  );

  const findStrokeAtPoint = useCallback(
    (point: { x: number; y: number }) => {
      for (let index = strokes.length - 1; index >= 0; index--) {
        const stroke = strokes[index];
        const pts = stroke.points;
        for (let i = 0; i < pts.length - 2; i += 2) {
          const segmentStart = { x: pts[i], y: pts[i + 1] };
          const segmentEnd = { x: pts[i + 2], y: pts[i + 3] };
          const distance = distanceToSegment(point, segmentStart, segmentEnd);
          const tolerance = Math.max(stroke.width * 2, 16);
          if (distance <= tolerance) {
            return stroke.id;
          }
        }
      }
      return null;
    },
    [distanceToSegment, strokes]
  );

  const eraseStrokeAtPoint = useCallback(
    (point: { x: number; y: number }) => {
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

        // Save to history before erasing
        setHistory((h) => [...h, prev]);
        return prev.filter((_, idx) => idx !== targetIndex);
      });
    },
    [distanceToSegment, width]
  );

  const handlePointerDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const clientPos = getEventClientPosition(e.evt);

      // Middle mouse button for panning (only for MouseEvent)
      if ('button' in e.evt && (e.evt as MouseEvent).button === 1) {
        e.evt.preventDefault();
        isPanning.current = true;
        panStartPos.current = {
          x: clientPos.x,
          y: clientPos.y,
          stageX: stagePos.x,
          stageY: stagePos.y,
        };
        return;
      }

      e.evt.preventDefault();

      // Get raw canvas point without clamping
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy();
      const inverted = transform.invert();
      const rawCanvasPoint = inverted.point(pointer);
      const isInsideCanvas = isPointInsideCanvas(rawCanvasPoint, canvasWidth, canvasHeight);

      // Read-only mode: only allow panning
      if (readOnly) {
        isPanning.current = true;
        panStartPos.current = {
          x: clientPos.x,
          y: clientPos.y,
          stageX: stagePos.x,
          stageY: stagePos.y,
        };
        return;
      }

      // Pan tool OR click outside canvas - enable panning
      if (tool === 'pan' || !isInsideCanvas) {
        isPanning.current = true;
        panStartPos.current = {
          x: clientPos.x,
          y: clientPos.y,
          stageX: stagePos.x,
          stageY: stagePos.y,
        };
        return;
      }

      // Now get clamped point for drawing
      const canvasPos = clampPointToCanvas(rawCanvasPoint, canvasWidth, canvasHeight);

      // Select tool - lasso mode
      if (tool === 'select') {
        // Check if clicking inside the last lasso area to drag selection
        if (selectedStrokeIds.size > 0 && lastLassoPolygon.length > 0) {
          if (isPointInPolygon(canvasPos, lastLassoPolygon)) {
            isDraggingSelection.current = true;
            dragStartPoint.current = canvasPos;
            selectionMoveHistorySaved.current = false; // Reset history flag
            return;
          }
        }

        // Start drawing new lasso
        isDrawingLasso.current = true;
        setLassoPoints([canvasPos.x, canvasPos.y]);
        return;
      }

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
    [beginStroke, canvasHeight, canvasWidth, color, eraseStrokeAtPoint, eraserMode, findStrokeAtPoint, getCanvasPoint, getEventClientPosition, isPointInPolygon, lastLassoPolygon, selectedStrokeIds, stagePos.x, stagePos.y, tool, width]
  );

  const handlePointerMove = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      // Handle panning (middle mouse or outside canvas)
      if (isPanning.current && panStartPos.current) {
        e.evt.preventDefault();
        const clientPos = getEventClientPosition(e.evt);
        const dx = clientPos.x - panStartPos.current.x;
        const dy = clientPos.y - panStartPos.current.y;
        setStagePos({
          x: panStartPos.current.stageX + dx,
          y: panStartPos.current.stageY + dy,
        });
        return;
      }

      // Handle lasso drawing
      if (tool === 'select' && isDrawingLasso.current) {
        e.evt.preventDefault();
        const canvasPos = getCanvasPoint(stage);
        if (!canvasPos) return;

        setLassoPoints((prev) => [...prev, canvasPos.x, canvasPos.y]);
        return;
      }

      // Handle selection dragging
      if (tool === 'select' && isDraggingSelection.current && dragStartPoint.current) {
        e.evt.preventDefault();
        const canvasPos = getCanvasPoint(stage);
        if (!canvasPos) return;

        const dx = canvasPos.x - dragStartPoint.current.x;
        const dy = canvasPos.y - dragStartPoint.current.y;

        // Save to history only once at the start of dragging
        if (!selectionMoveHistorySaved.current) {
          setHistory((prev) => [...prev, strokes]);
          selectionMoveHistorySaved.current = true;
        }

        setStrokes((prev) =>
          prev.map((stroke) => {
            if (selectedStrokeIds.has(stroke.id)) {
              return {
                ...stroke,
                points: stroke.points.map((val, idx) =>
                  idx % 2 === 0 ? val + dx : val + dy
                ),
              };
            }
            return stroke;
          })
        );

        dragStartPoint.current = canvasPos;
        return;
      }

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
      // Use throttled update instead of direct setState to avoid micro-freezes
      scheduleStrokeUpdate();
    },
    [eraseStrokeAtPoint, eraserMode, getCanvasPoint, getEventClientPosition, isPointInPolygon, lastLassoPolygon, scheduleStrokeUpdate, selectedStrokeIds, strokes, tool]
  );

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
    panStartPos.current = null;
    isDraggingSelection.current = false;
    dragStartPoint.current = null;

    // Handle lasso selection completion
    if (isDrawingLasso.current && lassoPoints.length > 4) {
      const selectedIds = findStrokesInLasso(lassoPoints);
      setSelectedStrokeIds(selectedIds);
      setLastLassoPolygon(lassoPoints); // Store lasso area for dragging
      setLassoPoints([]);
      isDrawingLasso.current = false;
      return;
    }

    if (isDrawingLasso.current) {
      isDrawingLasso.current = false;
      setLassoPoints([]);
    }

    if (tool === 'eraser' && eraserMode === 'stroke') {
      isStrokeErasing.current = false;
      return;
    }
    if (!isDrawing.current) return;
    isDrawing.current = false;
    commitStroke();
  }, [commitStroke, eraserMode, findStrokesInLasso, lassoPoints, strokes, tool]);

  const handleStageWheel = useCallback(
    (event: KonvaEventObject<WheelEvent>) => {
      const stage = event.target.getStage();
      if (!stage) return;

      if (!event.evt.ctrlKey && !event.evt.metaKey) {
        if (tool === 'pan' || tool === 'pen' || tool === 'eraser') {
          event.evt.preventDefault();
          const { deltaX, deltaY } = event.evt;
          setStagePos((prev) => ({ x: prev.x - deltaX, y: prev.y - deltaY }));
        }
        return;
      }

      event.evt.preventDefault();

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
    [stagePos.x, stagePos.y, stageScale, tool]
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
        const center = getTouchCenter(stage, touch1, touch2);
        pinchState.current = {
          initialDistance: distance,
          initialScale: stageScale,
          initialPosition: { ...stage.position() },
          initialCenter: center,
        };
        // Cancel any ongoing drawing
        isDrawing.current = false;
        isDrawingLasso.current = false;
        isDraggingSelection.current = false;
        isPanning.current = false;
        currentStrokeRef.current = null;
        setCurrentStroke(null);
        return;
      }

      // Only handle single touch for drawing
      handlePointerDown(event as KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>);
    },
    [getTouchCenter, getTouchDistance, handlePointerDown, stageScale]
  );

  const handleStageTouchMove = useCallback(
    (event: KonvaEventObject<TouchEvent | PointerEvent>) => {
      const stage = event.target.getStage();
      if (!stage) return;

      const touches = (event.evt as TouchEvent).touches;
      if (touches && touches.length === 2 && pinchState.current) {
        event.evt.preventDefault();
        const [touch1, touch2] = [touches[0], touches[1]];
        const currentDistance = getTouchDistance(touch1, touch2);
        const currentCenter = getTouchCenter(stage, touch1, touch2);

        if (currentDistance === 0) return;

        // Calculate distance change for zoom detection
        const distanceChange = Math.abs(currentDistance - pinchState.current.initialDistance);
        const distanceChangeRatio = Math.abs(currentDistance / pinchState.current.initialDistance - 1);

        // Calculate center movement for pan detection
        const centerDx = currentCenter.x - pinchState.current.initialCenter.x;
        const centerDy = currentCenter.y - pinchState.current.initialCenter.y;
        const centerMovement = Math.sqrt(centerDx * centerDx + centerDy * centerDy);

        // If significant pinch/spread detected (> 5% change), apply zoom
        if (distanceChangeRatio > 0.05) {
          const scaleFactor = currentDistance / pinchState.current.initialDistance;
          const newScale = clampZoom(pinchState.current.initialScale * scaleFactor);
          const pointTo = {
            x: (currentCenter.x - pinchState.current.initialPosition.x) /
              pinchState.current.initialScale,
            y: (currentCenter.y - pinchState.current.initialPosition.y) /
              pinchState.current.initialScale,
          };

          const newPosition = {
            x: currentCenter.x - pointTo.x * newScale,
            y: currentCenter.y - pointTo.y * newScale,
          };

          setStageScale(newScale);
          setStagePos(newPosition);
        }
        // If fingers moving together (pan), apply translation
        else if (centerMovement > 3) {
          const newPosition = {
            x: pinchState.current.initialPosition.x + centerDx,
            y: pinchState.current.initialPosition.y + centerDy,
          };
          setStagePos(newPosition);

          // Update initial center for smooth continuous panning
          pinchState.current.initialCenter = currentCenter;
          pinchState.current.initialPosition = newPosition;
        }

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
        // DON'T set isDrawing.current = false here!
        // Let handlePointerUp handle it properly to ensure stroke commit
      }

      handlePointerUp();
    },
    [handlePointerUp]
  );

  const handleOpenPDFExport = useCallback(() => {
    setIsPDFExportOpen(true);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setStrokes(previousState);
  }, [history]);

  const handleClear = useCallback(() => {
    if (strokes.length === 0) return;
    if (window.confirm('Biztosan törölni szeretnéd az összes rajzelemet?')) {
      setHistory((prev) => [...prev, strokes]);
      setStrokes([]);
    }
  }, [strokes]);

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
    <div className="relative h-screen w-screen overflow-hidden bg-emerald-50/40">
      <div
        ref={containerRef}
        className="relative h-full w-full"
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
              {strokes.map((stroke) => {
                const isSelected = selectedStrokeIds.has(stroke.id);
                return (
                  <React.Fragment key={stroke.id}>
                    {/* Selection highlight - outer glow */}
                    {isSelected && (
                      <>
                        <Line
                          points={stroke.points}
                          stroke="#3B82F6"
                          strokeWidth={stroke.width + 16}
                          lineCap="round"
                          lineJoin="round"
                          tension={0.35}
                          opacity={0.25}
                          listening={false}
                        />
                        <Line
                          points={stroke.points}
                          stroke="#2563EB"
                          strokeWidth={stroke.width + 8}
                          lineCap="round"
                          lineJoin="round"
                          tension={0.35}
                          opacity={0.5}
                          listening={false}
                        />
                      </>
                    )}
                    {/* Actual stroke */}
                    <Line
                      points={stroke.points}
                      stroke={stroke.color}
                      strokeWidth={stroke.width}
                      lineCap="round"
                      lineJoin="round"
                      tension={0.35}
                      globalCompositeOperation={stroke.compositeOperation ?? 'source-over'}
                    />
                  </React.Fragment>
                );
              })}
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
              {/* Lasso selection line */}
              {lassoPoints.length > 0 && (
                <Line
                  points={lassoPoints}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dash={[10, 5]}
                  lineCap="round"
                  lineJoin="round"
                  opacity={0.8}
                  listening={false}
                  closed={false}
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

      <div className="toolbar-container pointer-events-auto absolute left-1/2 top-6 z-[1200] w-auto max-w-[98vw] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur overflow-visible">
        <div className={`flex items-center gap-2 px-3 py-2 text-[0.7rem] sm:text-[0.75rem] md:text-sm ${
          isColorMenuOpen || isWidthMenuOpen
            ? 'overflow-visible'
            : 'max-xl:overflow-x-auto max-xl:overflow-y-visible max-xl:pr-6 max-xl:scrollbar-thin max-xl:scrollbar-thumb-gray-300 max-xl:scrollbar-track-transparent'
        }`}>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {drawingsUrl && (
            <Link
              href={drawingsUrl}
              className="toolbar-button inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation sm:px-3"
            >
              <span aria-hidden className="text-base">←</span>
              <span className="hidden xl:inline whitespace-nowrap">Vissza a rajzokhoz</span>
              <span className="sr-only xl:hidden">Vissza a rajzokhoz</span>
            </Link>
          )}

          {projectUrl && (
            <Link
              href={projectUrl}
              className="toolbar-button inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation sm:px-3"
            >
              <span aria-hidden className="text-base">←</span>
              <span className="hidden xl:inline whitespace-nowrap">Vissza a projekthez</span>
              <span className="sr-only xl:hidden">Vissza a projekthez</span>
            </Link>
          )}

          {projectName && (
            <span className="hidden 2xl:inline-flex text-xs font-semibold text-gray-500">
              {projectName}
            </span>
          )}
        </div>

        {!readOnly && (
          <div className="flex flex-shrink-0 items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-50 px-2 py-1.5 shadow-inner">
            {TOOLBAR_TOOLS.map((toolOption) => (
              <button
                key={toolOption.id}
                onClick={() => setTool(toolOption.id)}
                aria-pressed={tool === toolOption.id}
                aria-label={toolOption.label}
                className={`toolbar-button inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 flex-col items-center justify-center rounded-lg px-2 py-1 font-semibold uppercase tracking-wide transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  tool === toolOption.id ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {toolOption.icon}
                </span>
                <span className="hidden 2xl:block text-[0.6rem]">{toolOption.label}</span>
              </button>
            ))}
          </div>
        )}

        {readOnly && (
          <div className="flex flex-shrink-0 items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-blue-800">Megtekintő mód</span>
          </div>
        )}

        {!readOnly && tool === 'eraser' && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <span className="hidden xl:inline text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500">
              Radír mód
            </span>
            <button
              onClick={() => setEraserMode('band')}
              aria-label="Sávos radír mód"
              className={`toolbar-button inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                eraserMode === 'band' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'
              }`}
            >
              <span className="hidden xl:inline whitespace-nowrap">Sávos</span>
              <span className="xl:hidden text-xs font-semibold">S</span>
            </button>
            <button
              onClick={() => setEraserMode('stroke')}
              aria-label="Vonás radír mód"
              className={`toolbar-button inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                eraserMode === 'stroke' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'
              }`}
            >
              <span className="hidden xl:inline whitespace-nowrap">Vonás</span>
              <span className="xl:hidden text-xs font-semibold">V</span>
            </button>
          </div>
        )}

        {!readOnly && (
          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="relative flex-shrink-0" ref={colorDropdownRef}>
              <button
                onClick={() => setIsColorMenuOpen((prev) => !prev)}
                aria-label="Szín választó"
                className={`toolbar-button inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isColorMenuOpen ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
              <div
                className="h-6 w-6 flex-shrink-0 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="hidden lg:inline text-[0.7rem] font-semibold">Szín</span>
            </button>

            {isColorMenuOpen && (
              <div className="absolute right-0 top-full z-[99999] mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Szín választó
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Fekete', hex: '#000000' },
                    { name: 'Piros', hex: '#EF4444' },
                    { name: 'Kék', hex: '#3B82F6' },
                    { name: 'Zöld', hex: '#10B981' },
                    { name: 'Sárga', hex: '#F59E0B' },
                    { name: 'Szürke', hex: '#6B7280' },
                    { name: 'Barna', hex: '#92400E' },
                    { name: 'Lila', hex: '#8B5CF6' },
                  ].map((colorOption) => (
                    <button
                      key={colorOption.hex}
                      onClick={() => {
                        setColor(colorOption.hex);
                        setIsColorMenuOpen(false);
                      }}
                      className={`toolbar-button group relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        color === colorOption.hex
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : ''
                      }`}
                      style={{ backgroundColor: colorOption.hex }}
                      title={colorOption.name}
                      aria-label={colorOption.name}
                    >
                      {color === colorOption.hex && (
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
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative flex-shrink-0" ref={widthDropdownRef}>
            <button
              onClick={() => setIsWidthMenuOpen((prev) => !prev)}
              className={`toolbar-button inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isWidthMenuOpen ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <span className="text-lg" aria-hidden>
                ✏️
              </span>
              <span className="hidden xl:flex items-center gap-1 text-[0.65rem] uppercase tracking-wide">
                Vastagság
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.65rem] font-bold text-blue-700">
                  {width}px
                </span>
              </span>
              <span className="xl:hidden text-[0.7rem] font-semibold">{width}px</span>
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
              <div className="absolute right-0 top-full z-[99999] mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Tollvastagság
                </h3>
                <StrokeWidthSlider width={width} onChange={setWidth} min={1} max={12} />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {WIDTH_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setWidth(preset)}
                      className={`toolbar-button min-h-[44px] min-w-[44px] justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
        )}

        {!readOnly && (
          <CompactPaperSizeSelector
            paperSize={paperSize}
            orientation={orientation}
            onPaperSizeChange={handlePaperSizeChange}
            onOrientationChange={handleOrientationChange}
            className="flex flex-shrink-0 items-center gap-2"
          />
        )}

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            aria-label="Kicsinyítés"
            className="toolbar-button inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            −
          </button>
          <button
            onClick={handleFitScreen}
            aria-label="Teljes nézet"
            className="toolbar-button inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            ⤢
          </button>
          <button
            onClick={handleZoomIn}
            aria-label="Nagyítás"
            className="toolbar-button inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            +
          </button>
          <span className="min-w-[3rem] text-center text-[0.7rem] font-semibold text-gray-600">
            {Math.round(stageScale * 100)}%
          </span>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={handleOpenPDFExport}
            aria-label="Exportálás PDF-ként"
            className="toolbar-button inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:bg-emerald-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span aria-hidden className="text-base">📄</span>
            <span className="hidden xl:inline whitespace-nowrap">PDF</span>
          </button>
          {!readOnly && (
            <>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                aria-label="Visszavonás"
                className="toolbar-button inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span aria-hidden className="text-base">↺</span>
                <span className="hidden xl:inline whitespace-nowrap">Visszavonás</span>
              </button>
              <button
                onClick={handleClear}
                disabled={strokes.length === 0}
                aria-label="Minden törlése"
                className="toolbar-button inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 font-semibold text-red-700 transition-colors hover:bg-red-100 active:bg-red-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span aria-hidden className="text-base">🗑️</span>
                <span className="hidden xl:inline whitespace-nowrap">Törlés</span>
              </button>
              <div
                className="flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2"
                title={saving ? 'Mentés folyamatban…' : 'Automatikus mentés kész'}
              >
                <span
                  className={`h-3 w-3 rounded-full ${
                    saving ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
            </>
          )}
        </div>
        </div>
      </div>

      {/* PDF Export Modal */}
      {isPDFExportOpen && (
        <PDFExportModal
          drawing={drawing}
          onClose={() => setIsPDFExportOpen(false)}
          isOpen={isPDFExportOpen}
        />
      )}

      <style jsx global>{`
        @media (max-width: 1280px) {
          .toolbar-container .scrollbar-thin::-webkit-scrollbar {
            height: 6px;
          }

          .toolbar-container .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }

          .toolbar-container .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
          }

          .toolbar-container .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }

          .toolbar-button {
            min-width: 44px;
            min-height: 44px;
          }
        }

        @media (max-width: 768px) {
          .toolbar-container > div {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
