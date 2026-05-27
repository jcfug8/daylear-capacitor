import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { useEffect, useState } from "react";
import {
  memberDisplayName,
  type MemberNameFields,
} from "../../../lib/member-display-name";

export type ListItemDetail = {
  id: string;
  name: string;
  completed: boolean;
  sectionId: string | null;
  assigneeIds: string[];
};

type ListItemDetailModalProps = {
  item: ListItemDetail | null;
  sections: { id: string; name: string }[];
  family: { members: MemberNameFields[] } | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSaveName: (name: string) => void;
  onToggleComplete: (completed: boolean) => void;
  onChangeSection: (sectionId: string | null) => void;
  onSetAssignees: (memberIds: string[]) => void;
  onDelete: () => void;
  pending?: boolean;
};

export function ListItemDetailModal({
  item,
  sections,
  family,
  isOpen,
  onClose,
  onSaveName,
  onToggleComplete,
  onChangeSection,
  onSetAssignees,
  onDelete,
  pending,
}: ListItemDetailModalProps) {
  const [presentAlert] = useIonAlert();
  const [name, setName] = useState("");

  useEffect(() => {
    if (item) setName(item.name);
  }, [item]);

  function confirmDelete() {
    if (!item) return;
    presentAlert({
      header: "Delete item?",
      message: `Remove "${item.name}" from this list?`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: () => {
            onDelete();
            onClose();
          },
        },
      ],
    });
  }

  function saveNameIfChanged() {
    if (!item) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setName(item.name);
      return;
    }
    if (trimmed !== item.name) {
      onSaveName(trimmed);
    }
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Item</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                saveNameIfChanged();
                onClose();
              }}
            >
              Done
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {item && (
          <IonList lines="full">
            <IonItem>
              <IonInput
                label="Title"
                labelPlacement="stacked"
                value={name}
                disabled={pending}
                onIonInput={(e) => setName(e.detail.value ?? "")}
                onIonBlur={saveNameIfChanged}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveNameIfChanged();
                  }
                }}
              />
            </IonItem>

            <IonItem>
              <IonCheckbox
                checked={item.completed}
                disabled={pending}
                onIonChange={(e) => onToggleComplete(e.detail.checked)}
              >
                Completed
              </IonCheckbox>
            </IonItem>

            {sections.length > 0 && (
              <IonItem>
                <IonSelect
                  label="Section"
                  labelPlacement="stacked"
                  interface="popover"
                  value={item.sectionId ?? ""}
                  disabled={pending}
                  onIonChange={(e) => {
                    const raw = e.detail.value;
                    onChangeSection(raw ? String(raw) : null);
                  }}
                >
                  <IonSelectOption value="">No section</IonSelectOption>
                  {sections.map((section) => (
                    <IonSelectOption key={section.id} value={section.id}>
                      {section.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            )}

            {family && (
              <IonItem>
                <IonSelect
                  label="Assigned to"
                  labelPlacement="stacked"
                  multiple
                  interface="popover"
                  value={item.assigneeIds}
                  disabled={pending}
                  onIonChange={(e) => {
                    const value = e.detail.value;
                    const memberIds = Array.isArray(value)
                      ? value.map(String)
                      : value
                        ? [String(value)]
                        : [];
                    onSetAssignees(memberIds);
                  }}
                >
                  {family.members.map((member) => (
                    <IonSelectOption key={member.id} value={member.id}>
                      {memberDisplayName(member)}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            )}

            <IonItem lines="none" className="mt-4">
              <IonButton
                expand="block"
                color="danger"
                fill="outline"
                disabled={pending}
                onClick={confirmDelete}
              >
                Delete item
              </IonButton>
            </IonItem>
          </IonList>
        )}
      </IonContent>
    </IonModal>
  );
}
