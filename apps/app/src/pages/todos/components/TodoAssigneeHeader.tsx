import { IonButton, IonIcon, IonText } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import type { TodoLane } from "../build-todo-lanes";

type TodoAssigneeHeaderProps = {
  lane: TodoLane;
  onAdd?: () => void;
  addDisabled?: boolean;
};

export function TodoAssigneeHeader({ lane, onAdd, addDisabled }: TodoAssigneeHeaderProps) {
  const openCount = lane.items.filter((item) => !item.completed).length;

  const status =
    openCount === 0
      ? lane.items.length === 0
        ? "Nothing assigned"
        : "All done"
      : `${openCount} open`;

  return (
    <div className="flex items-start gap-0 mb-1 min-w-0">
      <div className="min-w-0 flex-1">
        <span className="text-base font-semibold block truncate">{lane.label}</span>
        <IonText color="medium">
          <p className="m-0 text-sm">{status}</p>
        </IonText>
      </div>
      {onAdd && (
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
      )}
    </div>
  );
}
