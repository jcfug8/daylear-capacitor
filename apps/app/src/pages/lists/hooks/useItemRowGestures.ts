import { useRowPressGestures } from "./useRowPressGestures";

type UseItemRowGesturesOptions = {
  onShortPress: () => void;
  onLongPress: () => void;
};

export function useItemRowGestures(options: UseItemRowGesturesOptions) {
  return useRowPressGestures(options);
}
