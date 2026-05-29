import { IonButton, IonIcon } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { LIST_ITEM_CARD } from "../lib/list-item-card-styles";
import type { ListSummary } from "../types";

type ListsListProps = {
  lists: ListSummary[];
  onSelect: (listId: string) => void;
  onDelete: (list: ListSummary) => void;
};

export function ListsList({ lists, onSelect, onDelete }: ListsListProps) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {lists.map((list) => (
        <div
          key={list.id}
          className={`flex items-center gap-1 px-3 py-2.5 ${LIST_ITEM_CARD}`}
        >
          <button
            type="button"
            onClick={() => onSelect(list.id)}
            className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-left text-sm font-medium text-[var(--ion-text-color)] cursor-pointer active:opacity-80"
          >
            {list.name}
          </button>
          <IonButton
            fill="clear"
            color="danger"
            size="small"
            className="m-0 shrink-0"
            aria-label={`Delete ${list.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(list);
            }}
          >
            <IonIcon icon={trashOutline} slot="icon-only" />
          </IonButton>
        </div>
      ))}
    </div>
  );
}
