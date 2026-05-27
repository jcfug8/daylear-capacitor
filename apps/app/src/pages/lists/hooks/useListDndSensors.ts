import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/** Desktop: move pointer to start reorder. */
const MOUSE_DRAG_DISTANCE_PX = 10;

/**
 * Touch: hold still, then move to reorder (must stay below long-press duration).
 * @see useRowPressGestures LONG_PRESS_MS
 */
export const TOUCH_DRAG_DELAY_MS = 400;
/** Collapse sections slightly before touch drag arms so layout is stable. */
export const TOUCH_DRAG_PREPARE_MS = 300;
export const TOUCH_DRAG_TOLERANCE_PX = 8;

/**
 * Mouse + delayed touch (no PointerSensor — it steals touch and starts drag on tiny movement).
 * Always registers all three sensors — useSensors requires a stable argument count.
 * Disable drag via sortable `disabled` / DndContext handlers when the details modal is open.
 */
export function useListDndSensors() {
  const mouse = useSensor(MouseSensor, {
    activationConstraint: {
      distance: MOUSE_DRAG_DISTANCE_PX,
    },
  });
  const touch = useSensor(TouchSensor, {
    activationConstraint: {
      delay: TOUCH_DRAG_DELAY_MS,
      tolerance: TOUCH_DRAG_TOLERANCE_PX,
    },
  });
  const keyboard = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  return useSensors(mouse, touch, keyboard);
}
