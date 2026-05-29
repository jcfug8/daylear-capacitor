import { SwimLane } from "../../utils/swim-lanes";
import type { AssignedTodoItem, TodoLane } from "../build-todo-lanes";
import { SortableTodoCard } from "./SortableTodoCard";
import { TodoAssigneeHeader } from "./TodoAssigneeHeader";

type TodoSwimLaneProps = {
  lane: TodoLane;
  dragDisabled?: boolean;
  onOpenItem?: (item: AssignedTodoItem) => void;
  onAddItem?: (assigneeId: string) => void;
  onToggleComplete?: (item: AssignedTodoItem, laneAssigneeId: string) => void;
  updatePending?: boolean;
  addDisabled?: boolean;
};

export function TodoSwimLane({
  lane,
  dragDisabled,
  onOpenItem,
  onAddItem,
  onToggleComplete,
  updatePending,
  addDisabled,
}: TodoSwimLaneProps) {
  return (
    <SwimLane
      header={
        <TodoAssigneeHeader
          lane={lane}
          onAdd={onAddItem ? () => onAddItem(lane.assigneeId) : undefined}
          addDisabled={addDisabled}
        />
      }
      isEmpty={lane.items.length === 0}
      emptyMessage="Nothing assigned"
    >
      {lane.items.map((item) => (
        <SortableTodoCard
          key={`${lane.assigneeId}-${item.id}`}
          assigneeId={lane.assigneeId}
          item={item}
          dragDisabled={dragDisabled}
          updatePending={updatePending}
          onOpen={onOpenItem ? () => onOpenItem(item) : undefined}
          onToggleComplete={
            onToggleComplete ? () => onToggleComplete(item, lane.assigneeId) : undefined
          }
        />
      ))}
    </SwimLane>
  );
}
