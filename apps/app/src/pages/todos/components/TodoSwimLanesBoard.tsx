import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { assigneeItemDndId } from "../../utils/dnd/lib/ids";
import type { AssignedTodoItem, TodoLane } from "../build-todo-lanes";
import { TodoSwimLane } from "./TodoSwimLane";

type TodoSwimLanesBoardProps = {
  lanes: TodoLane[];
  dragDisabled?: boolean;
  onOpenItem: (item: AssignedTodoItem) => void;
  onAddItem: (assigneeId: string) => void;
  onToggleComplete: (itemId: string, completed: boolean) => void;
  updatePending?: boolean;
  addDisabled?: boolean;
};

export function TodoSwimLanesBoard({
  lanes,
  dragDisabled,
  onOpenItem,
  onAddItem,
  onToggleComplete,
  updatePending,
  addDisabled,
}: TodoSwimLanesBoardProps) {
  return (
    <div className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-h-full w-max gap-3 px-4 pb-2">
        {lanes.map((lane) => (
          <SortableContext
            key={lane.assigneeId}
            items={lane.items.map((item) => assigneeItemDndId(lane.assigneeId, item.id))}
            strategy={verticalListSortingStrategy}
          >
            <TodoSwimLane
              lane={lane}
              dragDisabled={dragDisabled}
              onOpenItem={onOpenItem}
              onAddItem={onAddItem}
              onToggleComplete={onToggleComplete}
              updatePending={updatePending}
              addDisabled={addDisabled}
            />
          </SortableContext>
        ))}
      </div>
    </div>
  );
}
