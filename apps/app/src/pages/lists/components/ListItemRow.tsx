import { IonCheckbox, IonIcon, IonItem, IonLabel } from "@ionic/react";
import { personOutline } from "ionicons/icons";
import { useRef } from "react";
import { ItemPointsLabel } from "../../../components/ItemPointsLabel";
import { useItemRowGestures } from "../../utils/dnd/hooks/useItemRowGestures";
import { composeDraggableListeners } from "../../utils/dnd/lib/compose-pointer-listeners";
import {
  InlineEditableText,
  type InlineEditableTextHandle,
} from "./InlineEditableText";
import type { SortableItemShellProps } from "./SortableItemWrapper";

type ListItem = {
  id: string;
  name: string;
  completed: boolean;
  points: number;
  assigneeIds: string[];
};

type ListItemRowProps = SortableItemShellProps & {
  item: ListItem;
  onRename: (name: string) => void;
  onOpenDetails: () => void;
  onToggleComplete: (completed: boolean) => void;
  updatePending?: boolean;
};

export function ListItemRow({
  item,
  onRename,
  onOpenDetails,
  onToggleComplete,
  updatePending,
  setNodeRef,
  style,
  attributes,
  listeners,
}: ListItemRowProps) {
  const titleRef = useRef<InlineEditableTextHandle>(null);

  const gestures = useItemRowGestures({
    onShortPress: () => titleRef.current?.startEditing(),
    onLongPress: onOpenDetails,
  });

  const composedListeners = composeDraggableListeners(listeners, gestures);

  const titleClassName = item.completed
    ? "font-normal line-through text-[var(--ion-color-medium)]"
    : "font-normal";

  const hasAssignees = item.assigneeIds.length > 0;

  return (
    <div
      ref={setNodeRef}
      data-list-item-row
      style={style}
      {...attributes}
      {...composedListeners}
      className="touch-manipulation"
    >
      <IonItem className={`items-center ${item.completed ? "opacity-70" : ""}`} lines="full">
        <IonCheckbox
          slot="start"
          data-no-item-gesture
          checked={item.completed}
          disabled={updatePending}
          onPointerDown={(e) => e.stopPropagation()}
          onIonChange={(e) => onToggleComplete(e.detail.checked)}
        />
        <IonLabel className="ion-text-wrap min-w-0">
          <InlineEditableText
            ref={titleRef}
            value={item.name}
            onSave={onRename}
            clickToEdit={false}
            className={titleClassName}
            inputClassName="font-normal"
          />
        </IonLabel>
        <div slot="end" className="flex items-center gap-2 shrink-0 pointer-events-none">
          <ItemPointsLabel points={item.points} />
          {hasAssignees && (
            <IonIcon
              icon={personOutline}
              className="text-[var(--ion-color-medium)] text-lg"
              aria-label="Assigned"
            />
          )}
        </div>
      </IonItem>
    </div>
  );
}
