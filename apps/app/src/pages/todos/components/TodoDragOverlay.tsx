import { IonLabel } from "@ionic/react";
import { isListItemCompleted } from "../../../lib/list-item-completion";
import type { AssignedTodoItem } from "../build-todo-lanes";

type TodoDragOverlayProps = {
  item: AssignedTodoItem;
  variant: "list" | "card";
};

function itemMeta(item: AssignedTodoItem) {
  return item.sectionName ? `${item.listName} · ${item.sectionName}` : item.listName;
}

export function TodoDragOverlay({ item, variant }: TodoDragOverlayProps) {
  if (variant === "card") {
    return (
      <div className="bg-white shadow-lg rounded-lg px-3 py-2.5 w-[min(85vw,17rem)]">
        <p
          className={[
            "m-0 text-sm font-medium",
            isListItemCompleted(item)
              ? "line-through text-[var(--ion-color-medium)]"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {item.name}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--ion-background-color)] shadow-lg rounded w-full max-w-[min(100vw-2rem,32rem)] px-4 py-2">
      <IonLabel className="ion-text-wrap">
        <h3 className="m-0 text-base font-normal">{item.name}</h3>
        <p className="m-0 mt-0.5 text-sm text-[var(--ion-color-medium)]">{itemMeta(item)}</p>
      </IonLabel>
    </div>
  );
}
