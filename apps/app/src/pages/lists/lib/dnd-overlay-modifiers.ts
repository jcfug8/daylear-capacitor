import type { ClientRect, Modifier } from "@dnd-kit/core";
import { getClientRect, useDndContext } from "@dnd-kit/core";
import { useLayoutEffect, type MutableRefObject } from "react";

export type OverlayDragAdjust = {
  /** Added to overlay transform.y so it aligns with the row in the DOM. */
  yCorrection: number;
};

/** Measure draggables without sortable transform so overlay top matches the row. */
export function measureDraggableNode(element: HTMLElement): ClientRect {
  return getClientRect(element, { ignoreTransform: true });
}

/**
 * Applies a fixed vertical correction from drag start (X uses dnd-kit default).
 */
export function createOverlayDragAdjustModifier(
  getAdjust: () => OverlayDragAdjust | null,
): Modifier {
  return ({ transform }) => {
    const adjust = getAdjust();
    if (!adjust) {
      return transform;
    }

    return {
      ...transform,
      y: transform.y + adjust.yCorrection,
    };
  };
}

export type OverlayDragMeasureContext = {
  activator: EventTarget | null;
  rowSelector: string;
};

/**
 * Fills overlayDragAdjustRef once activeNodeRect exists (not available in onDragStart).
 */
export function OverlayDragAdjustMeasurer({
  adjustRef,
  contextRef,
}: {
  adjustRef: MutableRefObject<OverlayDragAdjust | null>;
  contextRef: MutableRefObject<OverlayDragMeasureContext | null>;
}) {
  const { activeNodeRect } = useDndContext();

  useLayoutEffect(() => {
    const ctx = contextRef.current;
    if (!ctx || !activeNodeRect) {
      adjustRef.current = null;
      return;
    }

    adjustRef.current = measureOverlayDragAdjust(
      ctx.activator,
      activeNodeRect,
      ctx.rowSelector,
    );
  }, [activeNodeRect, adjustRef, contextRef]);

  return null;
}

export function measureOverlayDragAdjust(
  activatorTarget: EventTarget | null,
  dndRect: ClientRect | null,
  rowSelector: string,
): OverlayDragAdjust | null {
  if (!(activatorTarget instanceof Element) || !dndRect) {
    return null;
  }

  const row = activatorTarget.closest(rowSelector);
  if (!(row instanceof HTMLElement)) {
    return null;
  }

  const domTop = getClientRect(row, { ignoreTransform: true }).top;
  return { yCorrection: domTop - dndRect.top };
}
