import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useRef } from "react";
import { TOUCH_DRAG_DELAY_MS, TOUCH_DRAG_TOLERANCE_PX } from "./useSortableDndSensors";

const SHORT_PRESS_MS = 300;
/** Must be longer than touch drag delay so hold-still long-press is distinct from reorder. */
export const LONG_PRESS_MS = TOUCH_DRAG_DELAY_MS + 350;
const MOVE_CANCEL_PX = TOUCH_DRAG_TOLERANCE_PX;

const IGNORE_SELECTOR =
  "ion-checkbox, button, a, input, textarea, select, [data-no-item-gesture], [data-no-section-gesture]";

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return !!target.closest(IGNORE_SELECTOR);
}

type UseRowPressGesturesOptions = {
  onShortPress: () => void;
  onLongPress?: () => void;
  /** Runs before drag activates (touch hold delay or first movement). */
  onPrepareDrag?: () => void;
  /** Runs when the pointer gesture ends (tap, cancel, or after drag). */
  onPointerRelease?: () => void;
  /** Defaults to {@link TOUCH_DRAG_DELAY_MS}; use earlier value for section reorder. */
  prepareDragDelayMs?: number;
  /**
   * When false, movement before the prepare timer does not arm drag prep (allows scroll on touch).
   * @default true
   */
  prepareDragOnMovement?: boolean;
};

export function useRowPressGestures({
  onShortPress,
  onLongPress,
  onPrepareDrag,
  onPointerRelease,
  prepareDragDelayMs = TOUCH_DRAG_DELAY_MS,
  prepareDragOnMovement = true,
}: UseRowPressGesturesOptions) {
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prepareDragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prepareDragFiredRef = useRef(false);
  const gestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startTime: number;
    longPressFired: boolean;
    target: HTMLElement | null;
  } | null>(null);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const clearPrepareDragTimer = useCallback(() => {
    if (prepareDragTimerRef.current) {
      clearTimeout(prepareDragTimerRef.current);
      prepareDragTimerRef.current = null;
    }
  }, []);

  const firePrepareDrag = useCallback(() => {
    if (!onPrepareDrag || prepareDragFiredRef.current) return;
    prepareDragFiredRef.current = true;
    clearPrepareDragTimer();
    onPrepareDrag();
  }, [clearPrepareDragTimer, onPrepareDrag]);

  const releasePointerCapture = useCallback(() => {
    const g = gestureRef.current;
    if (!g?.target) return;
    try {
      if (g.target.hasPointerCapture(g.pointerId)) {
        g.target.releasePointerCapture(g.pointerId);
      }
    } catch {
      // ignore if capture was already released
    }
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0 || isInteractiveTarget(event.target)) return;

      clearLongPressTimer();
      clearPrepareDragTimer();
      prepareDragFiredRef.current = false;
      gestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: Date.now(),
        longPressFired: false,
        target: event.currentTarget instanceof HTMLElement ? event.currentTarget : null,
      };

      if (onPrepareDrag) {
        prepareDragTimerRef.current = setTimeout(firePrepareDrag, prepareDragDelayMs);
      }

      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          const g = gestureRef.current;
          if (!g || g.longPressFired) return;
          g.longPressFired = true;
          releasePointerCapture();
          onLongPress();
        }, LONG_PRESS_MS);
      }
    },
    [
      clearLongPressTimer,
      clearPrepareDragTimer,
      firePrepareDrag,
      onLongPress,
      prepareDragDelayMs,
      releasePointerCapture,
    ],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const g = gestureRef.current;
      if (!g || g.pointerId !== event.pointerId) return;

      const moved = distance(g.startX, g.startY, event.clientX, event.clientY);

      if (moved > MOVE_CANCEL_PX) {
        clearLongPressTimer();
        if (prepareDragOnMovement) {
          firePrepareDrag();
        } else {
          clearPrepareDragTimer();
        }
      }
    },
    [clearLongPressTimer, clearPrepareDragTimer, firePrepareDrag, prepareDragOnMovement],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent) => {
      const g = gestureRef.current;
      if (!g || g.pointerId !== event.pointerId) return;

      clearLongPressTimer();
      clearPrepareDragTimer();

      const elapsed = Date.now() - g.startTime;
      const moved = distance(g.startX, g.startY, event.clientX, event.clientY);

      if (!g.longPressFired && elapsed < SHORT_PRESS_MS && moved < MOVE_CANCEL_PX) {
        onShortPress();
      }

      gestureRef.current = null;
      onPointerRelease?.();
    },
    [clearLongPressTimer, clearPrepareDragTimer, onPointerRelease, onShortPress],
  );

  const onPointerCancel = useCallback(() => {
    clearLongPressTimer();
    clearPrepareDragTimer();
    gestureRef.current = null;
    onPointerRelease?.();
  }, [clearLongPressTimer, clearPrepareDragTimer, onPointerRelease]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
