import { useRowPressGestures } from "./useRowPressGestures";

export type UseItemRowGesturesOptions = {
  onShortPress: () => void;
  onLongPress?: () => void;
  onPrepareDrag?: () => void;
  prepareDragOnMovement?: boolean;
};

export function useItemRowGestures(options: UseItemRowGesturesOptions) {
  return useRowPressGestures(options);
}
