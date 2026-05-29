import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { assigneeItemDndId } from "../../utils/dnd/lib/ids";
import { SwimLanesBoard } from "../../utils/swim-lanes";
import type { AssignedTodoItem, TodoLane } from "../build-todo-lanes";
import { TodoSwimLane } from "./TodoSwimLane";

type TodoSwimLanesBoardProps = {
  lanes: TodoLane[];
  dragDisabled?: boolean;
  onOpenItem: (item: AssignedTodoItem) => void;
  onAddItem: (assigneeId: string) => void;
  onToggleComplete: (item: AssignedTodoItem, laneAssigneeId: string) => void;
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
    <SwimLanesBoard>
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
    </SwimLanesBoard>
  );
}
