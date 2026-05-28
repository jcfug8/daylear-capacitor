import { IonCheckbox, IonItem, IonLabel } from "@ionic/react";
import { composeDraggableListeners } from "../../utils/dnd/lib/compose-pointer-listeners";
import { useItemRowGestures } from "../../utils/dnd/hooks/useItemRowGestures";
import { assigneeItemDndId } from "../../utils/dnd/lib/ids";
import { SortableItemWrapper } from "../../utils/dnd/components/SortableItemWrapper";
import { formatItemPointsLabel } from "../../../lib/format-item-points";
import type { AssignedTodoItem } from "../build-todo-lanes";

type SortableTodoListRowProps = {
  assigneeId: string;
  item: AssignedTodoItem;
  meta: string;
  dragDisabled?: boolean;
  updatePending?: boolean;
  onOpen: () => void;
  onToggleComplete: (completed: boolean) => void;
};

export function SortableTodoListRow({
  assigneeId,
  item,
  meta,
  dragDisabled,
  updatePending,
  onOpen,
  onToggleComplete,
}: SortableTodoListRowProps) {
  const gestures = useItemRowGestures({
    onShortPress: onOpen,
  });

  const pointsLabel = formatItemPointsLabel(item.points);
  const subtitle = pointsLabel ? `${meta} · ${pointsLabel}` : meta;

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
            <IonItem className={item.completed ? "opacity-70" : undefined}>
              <IonCheckbox
                slot="start"
                checked={item.completed}
                disabled={updatePending}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onIonChange={(e) => onToggleComplete(e.detail.checked)}
              />
              <IonLabel className="ion-text-wrap min-w-0 flex-1">
                <h3
                  className={[
                    "m-0 text-base font-normal",
                    item.completed
                      ? "line-through text-[var(--ion-color-medium)]"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.name}
                </h3>
                <p className="m-0 mt-0.5 text-sm text-[var(--ion-color-medium)]">
                  {subtitle}
                </p>
              </IonLabel>
            </IonItem>
          </div>
        );
      }}
    </SortableItemWrapper>
  );
}
