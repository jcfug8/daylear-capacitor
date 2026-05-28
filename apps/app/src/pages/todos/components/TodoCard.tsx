import { IonCheckbox } from "@ionic/react";
import { ItemPointsLabel } from "../../../components/ItemPointsLabel";
import type { AssignedTodoItem } from "../build-todo-lanes";

type TodoCardProps = {
  item: AssignedTodoItem;
  onOpen?: () => void;
  onToggleComplete?: (completed: boolean) => void;
  updatePending?: boolean;
};

function TodoCardText({
  item,
  meta,
}: {
  item: AssignedTodoItem;
  meta: string;
}) {
  return (
    <>
      <p
        className={[
          "m-0 text-sm font-medium leading-snug",
          item.completed
            ? "line-through text-[var(--ion-color-medium)]"
            : "text-[var(--ion-text-color)]",
        ].join(" ")}
      >
        {item.name}
      </p>
      <p className="m-0 mt-1 text-xs text-[var(--ion-color-medium)] truncate">{meta}</p>
    </>
  );
}

export function TodoCard({ item, onOpen, onToggleComplete, updatePending }: TodoCardProps) {
  const meta = item.sectionName
    ? `${item.listName} · ${item.sectionName}`
    : item.listName;

  return (
    <div
      className={[
        "flex items-start gap-2 rounded-lg border border-[var(--ion-color-light-shade)]",
        "bg-[var(--ion-background-color)] px-3 py-2.5 shadow-sm",
        item.completed ? "opacity-70" : "",
      ].join(" ")}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left active:opacity-80"
        >
          <TodoCardText item={item} meta={meta} />
        </button>
      ) : (
        <div className="min-w-0 flex-1">
          <TodoCardText item={item} meta={meta} />
        </div>
      )}
      <ItemPointsLabel points={item.points} className="mt-0.5" />
      <IonCheckbox
        aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
        checked={item.completed}
        disabled={updatePending || !onToggleComplete}
        className="shrink-0 mt-0.5"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onIonChange={(e) => onToggleComplete?.(e.detail.checked)}
      />
    </div>
  );
}
