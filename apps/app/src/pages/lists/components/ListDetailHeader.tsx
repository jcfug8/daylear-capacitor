import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonToolbar,
} from "@ionic/react";
import { arrowBackOutline, ellipsisVertical } from "ionicons/icons";
import { useRef } from "react";
import { InlineEditableText } from "./InlineEditableText";

type ListDetailHeaderProps = {
  listName: string;
  onBack: () => void;
  onRename: (name: string) => void;
  onAddSection?: () => void;
};

export function ListDetailHeader({
  listName,
  onBack,
  onRename,
  onAddSection,
}: ListDetailHeaderProps) {
  const menuRef = useRef<HTMLIonPopoverElement>(null);

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton onClick={onBack}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
        </IonButtons>
        <div className="flex-1 min-w-0 px-2 flex items-center">
          <InlineEditableText
            value={listName}
            onSave={onRename}
            className="text-lg font-semibold truncate"
            inputClassName="text-lg font-semibold"
          />
        </div>
        {onAddSection && (
          <IonButtons slot="end">
            <IonButton
              aria-label="List options"
              onClick={(event) => void menuRef.current?.present(event.nativeEvent)}
            >
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        )}
      </IonToolbar>

      {onAddSection && (
        <IonPopover ref={menuRef} dismissOnSelect>
          <IonContent>
            <IonList>
              <IonItem button onClick={onAddSection}>
                <IonLabel>Add section</IonLabel>
              </IonItem>
            </IonList>
          </IonContent>
        </IonPopover>
      )}
    </IonHeader>
  );
}
