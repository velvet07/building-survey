/**
 * Touch Gesture Handlers
 * Érintéses gesztusok kezelése (pan, pinch-to-zoom)
 */

import type { Point } from './types';
import { clampZoom, calculateDistance, calculateCenter } from './canvas-utils';
import type Konva from 'konva';
import type React from 'react';

export interface GestureState {
  isGesturing: boolean;
  touchCount: number;
  initialDistance: number | null;
  initialScale: number;
  initialPosition: Point;
  lastTouchPositions: Point[];
}

export interface GestureResult {
  scale?: number;
  position?: Point;
  shouldPreventDefault: boolean;
}

/**
 * Initialize gesture state
 */
export function createGestureState(): GestureState {
  return {
    isGesturing: false,
    touchCount: 0,
    initialDistance: null,
    initialScale: 1,
    initialPosition: { x: 0, y: 0 },
    lastTouchPositions: [],
  };
}

/**
 * Handle touch start
 * 1 finger = draw mode
 * 2 fingers = pan/zoom mode
 */
export function handleTouchStart(
  e: TouchEvent,
  currentScale: number,
  currentPosition: Point,
  state: GestureState
): { state: GestureState; result: GestureResult } {
  const touches = Array.from(e.touches);
  const touchCount = touches.length;

  // Update state
  const newState: GestureState = {
    ...state,
    isGesturing: touchCount >= 2,
    touchCount,
    initialScale: currentScale,
    initialPosition: { ...currentPosition },
    lastTouchPositions: touches.map((t) => ({ x: t.clientX, y: t.clientY })),
  };

  // Calculate initial distance for pinch
  if (touchCount === 2) {
    const point1 = { x: touches[0].clientX, y: touches[0].clientY };
    const point2 = { x: touches[1].clientX, y: touches[1].clientY };
    newState.initialDistance = calculateDistance(point1, point2);
  }

  return {
    state: newState,
    result: {
      shouldPreventDefault: touchCount >= 2, // Prevent default for multi-touch
    },
  };
}

/**
 * Handle touch move
 * 2 fingers: pan + pinch-to-zoom
 */
export function handleTouchMove(
  e: TouchEvent,
  state: GestureState
): { state: GestureState; result: GestureResult } {
  const touches = Array.from(e.touches);
  const touchCount = touches.length;

  // Only handle 2-finger gestures
  if (touchCount !== 2 || !state.isGesturing) {
    return {
      state,
      result: { shouldPreventDefault: false },
    };
  }

  const currentTouchPositions = touches.map((t) => ({ x: t.clientX, y: t.clientY }));

  // Calculate current distance for pinch zoom
  const point1 = currentTouchPositions[0];
  const point2 = currentTouchPositions[1];
  const currentDistance = calculateDistance(point1, point2);

  let newScale = state.initialScale;
  let newPosition = { ...state.initialPosition };

  // Pinch-to-zoom
  if (state.initialDistance && state.initialDistance > 0) {
    const scaleFactor = currentDistance / state.initialDistance;
    newScale = clampZoom(state.initialScale * scaleFactor);
  }

  // Pan (2-finger drag)
  if (state.lastTouchPositions.length === 2) {
    // Calculate average movement
    const avgDeltaX =
      (currentTouchPositions[0].x - state.lastTouchPositions[0].x +
        currentTouchPositions[1].x - state.lastTouchPositions[1].x) /
      2;
    const avgDeltaY =
      (currentTouchPositions[0].y - state.lastTouchPositions[0].y +
        currentTouchPositions[1].y - state.lastTouchPositions[1].y) /
      2;

    newPosition = {
      x: state.initialPosition.x + avgDeltaX,
      y: state.initialPosition.y + avgDeltaY,
    };
  }

  // Update state
  const newState: GestureState = {
    ...state,
    lastTouchPositions: currentTouchPositions,
    initialPosition: newPosition, // Update for smooth panning
  };

  return {
    state: newState,
    result: {
      scale: newScale,
      position: newPosition,
      shouldPreventDefault: true,
    },
  };
}

/**
 * Handle touch end
 */
export function handleTouchEnd(
  e: TouchEvent,
  state: GestureState
): { state: GestureState; result: GestureResult } {
  const touches = Array.from(e.touches);
  const touchCount = touches.length;

  // Reset gesture state if no more touches
  const newState: GestureState = {
    ...state,
    isGesturing: touchCount >= 2,
    touchCount,
    initialDistance: null,
  };

  return {
    state: newState,
    result: {
      shouldPreventDefault: touchCount > 0,
    },
  };
}

/**
 * Handle mouse wheel for zoom
 */
export function handleMouseWheel(
  e: WheelEvent,
  currentScale: number,
  currentPosition: Point,
  stageRef: React.RefObject<Konva.Stage>
): { scale: number; position: Point } {
  e.preventDefault();

  const scaleBy = 1.1;
  const stage = stageRef.current;
  if (!stage) return { scale: currentScale, position: currentPosition };

  const oldScale = currentScale;

  // Get pointer position
  const pointer = stage.getPointerPosition();
  if (!pointer) return { scale: currentScale, position: currentPosition };

  // Calculate mouse position relative to stage
  const mousePointTo = {
    x: (pointer.x - currentPosition.x) / oldScale,
    y: (pointer.y - currentPosition.y) / oldScale,
  };

  // Calculate new scale
  const newScale = e.deltaY > 0 ? clampZoom(oldScale / scaleBy) : clampZoom(oldScale * scaleBy);

  // Calculate new position (zoom towards mouse)
  const newPosition = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };

  return { scale: newScale, position: newPosition };
}

/**
 * Detect if device supports touch
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Prevent default touch behaviors (double-tap zoom, pull-to-refresh)
 */
export function preventDefaultTouchBehaviors(element: HTMLElement): () => void {
  // Prevent double-tap zoom
  element.style.touchAction = 'none';

  // Prevent pull-to-refresh
  const preventPullToRefresh = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  element.addEventListener('touchstart', preventPullToRefresh, { passive: false });
  element.addEventListener('touchmove', preventPullToRefresh, { passive: false });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', preventPullToRefresh);
    element.removeEventListener('touchmove', preventPullToRefresh);
  };
}