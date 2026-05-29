import { IonButton, IonIcon } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { isListItemCompleted } from "../../../lib/list-item-completion";
import { SwimLaneHeader } from "../../utils/swim-lanes";
import type { TodoLane } from "../build-todo-lanes";

type TodoAssigneeHeaderProps = {
  lane: TodoLane;
  onAdd?: () => void;
  addDisabled?: boolean;
};

export function TodoAssigneeHeader({ lane, onAdd, addDisabled }: TodoAssigneeHeaderProps) {
  const openCount = lane.items.filter((item) => !isListItemCompleted(item)).length;

  const status =
    openCount === 0
      ? lane.items.length === 0
        ? "Nothing assigned"
        : "All done"
      : `${openCount} open`;

  return (
    <SwimLaneHeader
      title={lane.label}
      subtitle={status}
      action={
        onAdd ? (
          <IonButton
            fill="clear"
            size="small"
            className="m-0 shrink-0 -mr-2"
            aria-label={`Add item for ${lane.label}`}
            disabled={addDisabled}
            onClick={onAdd}
          >
            <IonIcon icon={addOutline} slot="icon-only" />
          </IonButton>
        ) : undefined
      }
    />
  );
}
