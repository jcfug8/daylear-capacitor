import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";
import { reorderLaneItemsOnDragEnd } from "../../utils/dnd/lib/reorder-lane-items";
import { trpcErrorMessage } from "../../../lib/trpc-errors";
import { trpc } from "../../../lib/trpc";
import type { TodoLane } from "../build-todo-lanes";

export function useAssigneeLanesDrag(initialLanes: TodoLane[]) {
  const utils = trpc.useUtils();
  const [lanes, setLanes] = useState<TodoLane[]>(initialLanes);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLanes(initialLanes);
  }, [initialLanes]);

  const applyOrder = trpc.todos.applyAssigneeOrder.useMutation({
    onSuccess: async () => {
      await utils.todos.list.invalidate();
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not save order")),
  });

  const handleDragStart = useCallback((_event: DragStartEvent) => {
    setError(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setLanes((current) => {
        const result = reorderLaneItemsOnDragEnd(
          current.map((lane) => ({ laneId: lane.assigneeId, items: lane.items })),
          event,
        );
        if (!result) return current;

        applyOrder.mutate({
          assigneeId: result.changedLaneId,
          itemIds: result.itemIds,
        });

        return result.lanes.map((lane) => {
          const existing = current.find((entry) => entry.assigneeId === lane.laneId);
          return {
            assigneeId: lane.laneId,
            label: existing?.label ?? lane.laneId,
            items: lane.items,
          };
        });
      });
    },
    [applyOrder],
  );

  return {
    lanes,
    handleDragStart,
    handleDragEnd,
    reorderPending: applyOrder.isPending,
    error,
  };
}
