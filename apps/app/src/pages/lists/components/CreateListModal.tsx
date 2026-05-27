import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";

type CreateListModalProps = {
  isOpen: boolean;
  pending?: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function CreateListModal({
  isOpen,
  pending,
  onClose,
  onCreate,
}: CreateListModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) setName("");
  }, [isOpen]);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed || pending) return;
    onCreate(trimmed);
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose} disabled={pending}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>New list</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={!name.trim() || pending} onClick={submit}>
              Create
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList lines="full">
          <IonItem>
            <IonInput
              label="Name"
              labelPlacement="stacked"
              value={name}
              placeholder="Grocery list…"
              disabled={pending}
              autofocus
              onIonInput={(e) => setName(e.detail.value ?? "")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
            />
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
