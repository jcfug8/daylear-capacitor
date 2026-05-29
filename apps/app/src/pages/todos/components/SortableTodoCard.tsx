import { composeDraggableListeners } from "../../utils/dnd/lib/compose-pointer-listeners";
import { assigneeItemDndId } from "../../utils/dnd/lib/ids";
import { SortableItemWrapper } from "../../utils/dnd/components/SortableItemWrapper";
import { useItemRowGestures } from "../../utils/dnd/hooks/useItemRowGestures";
import type { AssignedTodoItem } from "../build-todo-lanes";
import { TodoCard } from "./TodoCard";

type SortableTodoCardProps = {
  assigneeId: string;
  item: AssignedTodoItem;
  dragDisabled?: boolean;
  updatePending?: boolean;
  onOpen?: () => void;
  onToggleComplete?: () => void;
};

export function SortableTodoCard({
  assigneeId,
  item,
  dragDisabled,
  updatePending,
  onOpen,
  onToggleComplete,
}: SortableTodoCardProps) {
  const gestures = useItemRowGestures({
    onShortPress: () => onOpen?.(),
    prepareDragOnMovement: false,
  });

  return (
    <SortableItemWrapper
      itemId={item.id}
      sortableId={assigneeItemDndId(assigneeId, item.id)}
      dragDisabled={dragDisabled}
    >
      {(shell) => {
        const listeners = composeDraggableListeners(shell.listeners, gestures);
        return (
          <div
            ref={shell.setNodeRef}
            style={shell.style}
            {...shell.attributes}
            {...listeners}
            className="touch-manipulation"
          >
            <TodoCard
              item={item}
              updatePending={updatePending}
              onToggleComplete={onToggleComplete}
            />
          </div>
        );
      }}
    </SortableItemWrapper>
  );
}
