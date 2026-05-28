import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { parseAssigneeItemDndId, parseItemDndId } from "./ids";

function parseDragTarget(id: string): { laneId?: string; itemId: string } | null {
  const assignee = parseAssigneeItemDndId(id);
  if (assignee) {
    return { laneId: assignee.assigneeId, itemId: assignee.itemId };
  }
  const itemId = parseItemDndId(id);
  return itemId ? { itemId } : null;
}

export type ItemLane<T extends { id: string }> = {
  laneId: string;
  items: T[];
};

export function reorderLaneItemsOnDragEnd<T extends { id: string }>(
  lanes: ItemLane<T>[],
  event: DragEndEvent,
): { lanes: ItemLane<T>[]; changedLaneId: string; itemIds: string[] } | null {
  const { active, over } = event;
  if (!over) return null;

  const activeTarget = parseDragTarget(String(active.id));
  const overTarget = parseDragTarget(String(over.id));
  if (!activeTarget || !overTarget) return null;

  const activeItemId = activeTarget.itemId;
  const overItemId = overTarget.itemId;
  if (activeItemId === overItemId && activeTarget.laneId === overTarget.laneId) {
    return null;
  }

  let laneIndex: number;
  if (activeTarget.laneId && overTarget.laneId) {
    if (activeTarget.laneId !== overTarget.laneId) return null;
    laneIndex = lanes.findIndex((lane) => lane.laneId === activeTarget.laneId);
  } else {
    laneIndex = lanes.findIndex((lane) =>
      lane.items.some((item) => item.id === activeItemId),
    );
  }
  if (laneIndex === -1) return null;

  const lane = lanes[laneIndex];
  if (!lane.items.some((item) => item.id === overItemId)) return null;

  const oldIndex = lane.items.findIndex((item) => item.id === activeItemId);
  const newIndex = lane.items.findIndex((item) => item.id === overItemId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;

  const reorderedItems = arrayMove(lane.items, oldIndex, newIndex);
  const nextLanes = lanes.map((entry, index) =>
    index === laneIndex ? { ...entry, items: reorderedItems } : entry,
  );

  return {
    lanes: nextLanes,
    changedLaneId: lane.laneId,
    itemIds: reorderedItems.map((item) => item.id),
  };
}
