import type { AssignedTodoItem, TodoLane } from "../build-todo-lanes";
import { SortableTodoCard } from "./SortableTodoCard";
import { TodoAssigneeHeader } from "./TodoAssigneeHeader";

type TodoSwimLaneProps = {
  lane: TodoLane;
  dragDisabled?: boolean;
  onOpenItem?: (item: AssignedTodoItem) => void;
  onAddItem?: (assigneeId: string) => void;
  onToggleComplete?: (itemId: string, completed: boolean) => void;
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
    <section className="flex h-full min-h-0 w-[min(85vw,17rem)] shrink-0 flex-col">
      <header className="mb-2 shrink-0 px-1">
        <TodoAssigneeHeader
          lane={lane}
          onAdd={onAddItem ? () => onAddItem(lane.assigneeId) : undefined}
          addDisabled={addDisabled}
        />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain space-y-2">
        {lane.items.length === 0 ? (
          <p className="m-0 px-1 py-6 text-center text-xs text-[var(--ion-color-medium)]">
            Nothing assigned
          </p>
        ) : (
          lane.items.map((item) => (
            <SortableTodoCard
              key={`${lane.assigneeId}-${item.id}`}
              assigneeId={lane.assigneeId}
              item={item}
              dragDisabled={dragDisabled}
              updatePending={updatePending}
              onOpen={onOpenItem ? () => onOpenItem(item) : undefined}
              onToggleComplete={(completed) => onToggleComplete?.(item.id, completed)}
            />
          ))
        )}
      </div>
    </section>
  );
}
