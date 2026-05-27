import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { PointerEvent as ReactPointerEvent } from "react";

type PointerHandlers = {
  onPointerDown?: (event: ReactPointerEvent) => void;
  onPointerMove?: (event: ReactPointerEvent) => void;
  onPointerUp?: (event: ReactPointerEvent) => void;
  onPointerCancel?: (event: ReactPointerEvent) => void;
};

/**
 * Merges row gesture handlers with dnd-kit listeners.
 * Preserves non-pointer activators (e.g. TouchSensor onTouchStart).
 */
export function composeDraggableListeners(
  dndListeners: DraggableSyntheticListeners,
  gestureListeners: PointerHandlers,
): DraggableSyntheticListeners & PointerHandlers {
  return {
    ...dndListeners,
    onPointerDown: (event) => {
      gestureListeners.onPointerDown?.(event);
      dndListeners?.onPointerDown?.(event);
    },
    onPointerMove: (event) => {
      gestureListeners.onPointerMove?.(event);
      dndListeners?.onPointerMove?.(event);
    },
    onPointerUp: (event) => {
      gestureListeners.onPointerUp?.(event);
      dndListeners?.onPointerUp?.(event);
    },
    onPointerCancel: (event) => {
      gestureListeners.onPointerCancel?.(event);
      dndListeners?.onPointerCancel?.(event);
    },
  };
}
