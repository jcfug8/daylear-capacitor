import { IonCheckbox } from "@ionic/react";
import { ItemPointsLabel } from "../../../components/ItemPointsLabel";
import { isListItemCompleted } from "../../../lib/list-item-completion";
import { SWIM_LANE_SURFACE } from "../../utils/swim-lanes";
import type { AssignedTodoItem } from "../build-todo-lanes";

type TodoCardProps = {
  item: AssignedTodoItem;
  onOpen?: () => void;
  onToggleComplete?: () => void;
  updatePending?: boolean;
};

function TodoCardText({
  item,
  meta,
  isCompleted,
}: {
  item: AssignedTodoItem;
  meta: string;
  isCompleted: boolean;
}) {
  return (
    <>
      <p
        className={[
          "m-0 text-sm font-medium leading-snug",
          isCompleted
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
  const isCompleted = isListItemCompleted(item);

  return (
    <div
      className={[
        "flex items-start gap-2 px-3 py-2.5",
        SWIM_LANE_SURFACE,
        isCompleted ? "opacity-70" : "",
      ].join(" ")}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left active:opacity-80"
        >
          <TodoCardText item={item} meta={meta} isCompleted={isCompleted} />
        </button>
      ) : (
        <div className="min-w-0 flex-1">
          <TodoCardText item={item} meta={meta} isCompleted={isCompleted} />
        </div>
      )}
      <ItemPointsLabel points={item.points} className="mt-0.5" />
      <IonCheckbox
        aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        checked={isCompleted}
        disabled={updatePending || !onToggleComplete}
        className="shrink-0 mt-0.5"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onIonChange={() => onToggleComplete?.()}
      />
    </div>
  );
}
