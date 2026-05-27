import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { useState } from "react";

type NameListContentProps = {
  fieldLabel: string;
  placeholder: string;
  emptyNote: string;
  loadingLabel: string;
  items: { id: string; name: string }[] | undefined;
  isLoading: boolean;
  isCreating: boolean;
  onAdd: (name: string) => void;
};

export function NameListContent({
  fieldLabel,
  placeholder,
  emptyNote,
  loadingLabel,
  items,
  isLoading,
  isCreating,
  onAdd,
}: NameListContentProps) {
  const [name, setName] = useState("");

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName("");
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <IonList>
          <IonItem>
            <IonLabel position="stacked">{fieldLabel}</IonLabel>
            <IonInput
              value={name}
              placeholder={placeholder}
              onIonInput={(e) => setName(e.detail.value ?? "")}
            />
          </IonItem>
        </IonList>
        <IonButton expand="block" type="submit" className="mt-4" disabled={isCreating}>
          Add
        </IonButton>
      </form>

      {isLoading && (
        <div className="ion-text-center ion-padding">
          <IonSpinner name="crescent" />
          <IonText color="medium">
            <p className="mt-2">{loadingLabel}</p>
          </IonText>
        </div>
      )}

      {!isLoading && (
        <IonList className="mt-4">
          {items?.map((item) => (
            <IonItem key={item.id}>
              <IonLabel>{item.name}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      )}

      {items?.length === 0 && !isLoading && (
        <IonNote className="ion-text-center ion-margin-top">{emptyNote}</IonNote>
      )}
    </>
  );
}
