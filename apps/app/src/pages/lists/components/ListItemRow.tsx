import { IonCheckbox } from "@ionic/react";
import { useRef } from "react";
import type { MemberNameFields } from "../../../lib/member-display-name";
import { isListItemCompleted } from "../../../lib/list-item-completion";
import { useItemRowGestures } from "../../utils/dnd/hooks/useItemRowGestures";
import { composeDraggableListeners } from "../../utils/dnd/lib/compose-pointer-listeners";
import { listItemBadgeLabel } from "../lib/list-item-badge-label";
import { LIST_ITEM_CARD } from "../lib/list-item-card-styles";
import {
  InlineEditableText,
  type InlineEditableTextHandle,
} from "./InlineEditableText";
import { ListItemPillBadge } from "./ListItemPillBadge";
import type { SortableItemShellProps } from "./SortableItemWrapper";

type ListItem = {
  id: string;
  name: string;
  completedByMemberId: string | null;
  points: number;
  assigneeIds: string[];
};

type ListItemRowProps = SortableItemShellProps & {
  item: ListItem;
  familyMembers?: MemberNameFields[];
  onRename: (name: string) => void;
  onOpenDetails: () => void;
  onToggleComplete: (itemId: string) => void;
  updatePending?: boolean;
};

export function ListItemRow({
  item,
  familyMembers = [],
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
  const isCompleted = isListItemCompleted(item);
  const badgeLabel = listItemBadgeLabel(item, familyMembers);

  const gestures = useItemRowGestures({
    onShortPress: () => {
      if (!isCompleted) titleRef.current?.startEditing();
    },
    onLongPress: onOpenDetails,
  });

  const composedListeners = composeDraggableListeners(listeners, gestures);

  const titleClassName = isCompleted
    ? "text-sm font-medium line-through text-[var(--ion-color-medium)]"
    : "text-sm font-medium text-[var(--ion-text-color)]";

  return (
    <div
      ref={setNodeRef}
      data-list-item-row
      style={style}
      {...attributes}
      {...composedListeners}
      className="touch-manipulation"
    >
      <div
        className={[
          "flex items-center gap-3 px-3 py-2.5",
          LIST_ITEM_CARD,
          isCompleted ? "opacity-70" : "",
        ].join(" ")}
      >
        <IonCheckbox
          data-no-item-gesture
          checked={isCompleted}
          disabled={updatePending}
          className="shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
          onIonChange={() => onToggleComplete(item.id)}
        />
        <div className="min-w-0 flex-1">
          <InlineEditableText
            ref={titleRef}
            value={item.name}
            onSave={onRename}
            clickToEdit={false}
            className={titleClassName}
            inputClassName="text-sm font-medium"
          />
        </div>
        {badgeLabel ? <ListItemPillBadge>{badgeLabel}</ListItemPillBadge> : null}
      </div>
    </div>
  );
}
