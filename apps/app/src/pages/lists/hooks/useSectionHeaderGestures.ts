import { TOUCH_DRAG_PREPARE_MS } from "./useListDndSensors";
import { useRowPressGestures } from "./useRowPressGestures";

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
