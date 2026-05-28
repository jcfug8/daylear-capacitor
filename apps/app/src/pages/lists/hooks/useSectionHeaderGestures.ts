import { TOUCH_DRAG_PREPARE_MS } from "../../utils/dnd/hooks/useSortableDndSensors";
import { useRowPressGestures } from "../../utils/dnd/hooks/useRowPressGestures";

type UseSectionHeaderGesturesOptions = {
  onShortPress: () => void;
  onPrepareReorder: () => void;
};

export function useSectionHeaderGestures(options: UseSectionHeaderGesturesOptions) {
  return useRowPressGestures({
    onShortPress: options.onShortPress,
    onPrepareDrag: options.onPrepareReorder,
    prepareDragDelayMs: TOUCH_DRAG_PREPARE_MS,
  });
}
