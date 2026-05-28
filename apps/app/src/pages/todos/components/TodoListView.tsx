import { IonList, IonNote } from "@ionic/react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { assigneeItemDndId } from "../../utils/dnd/lib/ids";
import type { AssignedTodoItem, TodoLane } from "../build-todo-lanes";
import { SortableTodoListRow } from "./SortableTodoListRow";
import { TodoAssigneeHeader } from "./TodoAssigneeHeader";

type TodoListViewProps = {
  lanes: TodoLane[];
  dragDisabled?: boolean;
  onOpenItem: (item: AssignedTodoItem) => void;
  onAddItem: (assigneeId: string) => void;
  onToggleComplete: (itemId: string, completed: boolean) => void;
  updatePending?: boolean;
  addDisabled?: boolean;
};

function itemMeta(item: AssignedTodoItem) {
  return item.sectionName ? `${item.listName} · ${item.sectionName}` : item.listName;
}

export function TodoListView({
  lanes,
  dragDisabled,
  onOpenItem,
  onAddItem,
  onToggleComplete,
  updatePending,
  addDisabled,
}: TodoListViewProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 pb-4">
      {lanes.map((lane, index) => (
        <section key={lane.assigneeId} className={index > 0 ? "mt-6" : ""}>
          <TodoAssigneeHeader
            lane={lane}
            onAdd={() => onAddItem(lane.assigneeId)}
            addDisabled={addDisabled}
          />

          {lane.items.length === 0 ? (
            <IonNote className="block text-sm mb-2">Nothing assigned</IonNote>
          ) : (
            <SortableContext
              items={lane.items.map((item) => assigneeItemDndId(lane.assigneeId, item.id))}
              strategy={verticalListSortingStrategy}
            >
              <IonList className="m-0 p-0" lines="full">
                {lane.items.map((item) => (
                  <SortableTodoListRow
                    key={`${lane.assigneeId}-${item.id}`}
                    assigneeId={lane.assigneeId}
                    item={item}
                    meta={itemMeta(item)}
                    dragDisabled={dragDisabled}
                    updatePending={updatePending}
                    onOpen={() => onOpenItem(item)}
                    onToggleComplete={(completed) => onToggleComplete(item.id, completed)}
                  />
                ))}
              </IonList>
            </SortableContext>
          )}
        </section>
      ))}
    </div>
  );
}
