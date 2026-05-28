import { parseAssigneeItemDndId } from "../../utils/dnd/lib/ids";
import type { AssignedTodoItem, TodoLane } from "../build-todo-lanes";

export function findAssigneeDragItem(
  lanes: TodoLane[],
  dragId: string | null,
): AssignedTodoItem | null {
  if (!dragId) return null;
  const parsed = parseAssigneeItemDndId(dragId);
  if (!parsed) return null;
  const lane = lanes.find((entry) => entry.assigneeId === parsed.assigneeId);
  return lane?.items.find((item) => item.id === parsed.itemId) ?? null;
}
