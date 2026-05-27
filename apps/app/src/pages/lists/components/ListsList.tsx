import { IonButton, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import type { ListSummary } from "../types";

type ListsListProps = {
  lists: ListSummary[];
  onSelect: (listId: string) => void;
  onDelete: (list: ListSummary) => void;
};

export function ListsList({ lists, onSelect, onDelete }: ListsListProps) {
  return (
    <IonList className="mt-4" lines="full">
      {lists.map((list) => (
        <IonItem key={list.id} button onClick={() => onSelect(list.id)}>
          <IonLabel>{list.name}</IonLabel>
          <IonButton
            slot="end"
            fill="clear"
            color="danger"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(list);
            }}
          >
            <IonIcon icon={trashOutline} />
          </IonButton>
        </IonItem>
      ))}
    </IonList>
  );
}
