import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { useEffect, useState } from "react";
import type { MemberNameFields } from "../../../lib/member-display-name";
import { trpcErrorMessage } from "../../../lib/trpc-errors";
import { trpc } from "../../../lib/trpc";
import { isListItemCompleted } from "../../../lib/list-item-completion";
import type { ListItemDetail, ListItemFormValues } from "../lib/list-item-form";
import { ListItemForm } from "./ListItemForm";

type ListItemModalBaseProps = {
  isOpen: boolean;
  onClose: () => void;
  sections: { id: string; name: string }[];
  family?: { members: MemberNameFields[] };
  pending?: boolean;
};

type ListItemModalEditProps = ListItemModalBaseProps & {
  mode: "edit";
  item: ListItemDetail | null;
  listId: string;
  onSaveName: (name: string) => void;
  onToggleComplete: (complete: boolean) => void;
  onChangePoints: (points: number) => void;
  onChangeSection: (sectionId: string | null) => void;
  onSetAssignees: (memberIds: string[]) => void;
  onDelete: () => void;
};

type ListItemModalCreateProps = ListItemModalBaseProps & {
  mode: "create";
  values: ListItemFormValues;
  lists: { id: string; name: string }[];
  onValuesChange: (patch: Partial<ListItemFormValues>) => void;
  onCreate: () => void;
};

export type ListItemModalProps = ListItemModalEditProps | ListItemModalCreateProps;

export function ListItemModal(props: ListItemModalProps) {
  const { isOpen, onClose, sections, family, pending, mode } = props;
  const [presentAlert] = useIonAlert();
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const utils = trpc.useUtils();

  const editItem = mode === "edit" ? props.item : null;
  const listId =
    mode === "edit" ? props.listId : (props.values.listId ?? null);

  const createSection = trpc.lists.sections.create.useMutation({
    onSuccess: async (section) => {
      if (!listId) return;
      await utils.lists.get.invalidate({ id: listId });
      if (mode === "create") {
        props.onValuesChange({ sectionId: section.id });
      } else {
        props.onChangeSection(section.id);
      }
    },
    onError: (e) => {
      presentAlert({
        header: "Could not add section",
        message: trpcErrorMessage(e, "Try again."),
        buttons: ["OK"],
      });
    },
  });

  function promptAddSection() {
    if (!listId) return;
    presentAlert({
      header: "New section",
      inputs: [{ name: "name", type: "text", placeholder: "Costco, Trader Joe's…" }],
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Add",
          handler: (data) => {
            const sectionName = data?.name?.trim();
            if (sectionName) {
              createSection.mutate({ listId, name: sectionName });
            }
          },
        },
      ],
    });
  }

  const formPending = pending || createSection.isPending;

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPoints(editItem.points);
    }
  }, [editItem]);

  function confirmDelete() {
    if (mode !== "edit" || !props.item) return;
    presentAlert({
      header: "Delete item?",
      message: `Remove "${props.item.name}" from this list?`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: () => {
            props.onDelete();
            onClose();
          },
        },
      ],
    });
  }

  function saveNameIfChanged() {
    if (mode !== "edit" || !props.item || isListItemCompleted(props.item)) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setName(props.item.name);
      return;
    }
    if (trimmed !== props.item.name) {
      props.onSaveName(trimmed);
    }
  }

  function savePointsIfChanged() {
    if (mode !== "edit" || !props.item || isListItemCompleted(props.item)) return;
    if (points !== props.item.points) {
      props.onChangePoints(points);
    }
  }

  function handleDone() {
    if (mode === "create") {
      props.onCreate();
      return;
    }
    saveNameIfChanged();
    savePointsIfChanged();
    onClose();
  }

  const title = mode === "create" ? "New item" : "Item";
  const formValues: ListItemFormValues =
    mode === "create"
      ? props.values
      : editItem
        ? {
            name,
            completedByMemberId: editItem.completedByMemberId,
            points,
            sectionId: editItem.sectionId,
            assigneeIds: editItem.assigneeIds,
            listId: props.listId,
          }
        : {
            name: "",
            completedByMemberId: null,
            points: 0,
            sectionId: null,
            assigneeIds: [],
            listId: props.listId,
          };

  function handleValuesChange(patch: Partial<ListItemFormValues>) {
    if (mode === "create") {
      props.onValuesChange(patch);
      return;
    }
    if (!editItem || isListItemCompleted(editItem)) return;

    if (patch.name !== undefined) setName(patch.name);
    if (patch.points !== undefined) setPoints(patch.points);
    if (patch.sectionId !== undefined) props.onChangeSection(patch.sectionId);
    if (patch.assigneeIds !== undefined) props.onSetAssignees(patch.assigneeIds);
  }

  const showForm =
    mode === "create" || (mode === "edit" && editItem !== null);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleDone} disabled={formPending}>
              {mode === "create" ? "Add" : "Done"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {showForm && (
          <ListItemForm
            mode={mode}
            values={formValues}
            listId={listId}
            sections={sections}
            lists={mode === "create" ? props.lists : undefined}
            family={family}
            pending={formPending}
            onValuesChange={handleValuesChange}
            onAddSection={listId ? promptAddSection : undefined}
            onDelete={mode === "edit" ? confirmDelete : undefined}
            onToggleComplete={mode === "edit" ? props.onToggleComplete : undefined}
          />
        )}
      </IonContent>
    </IonModal>
  );
}

/** @deprecated Use ListItemModal */
export type { ListItemDetail };
export function ListItemDetailModal(
  props: Omit<ListItemModalEditProps, "mode" | "listId"> & { listId?: string },
) {
  if (!props.listId) {
    throw new Error("ListItemDetailModal requires listId");
  }
  return (
    <ListItemModal
      mode="edit"
      listId={props.listId}
      item={props.item}
      isOpen={props.isOpen}
      onClose={props.onClose}
      sections={props.sections}
      family={props.family}
      pending={props.pending}
      onSaveName={props.onSaveName}
      onToggleComplete={props.onToggleComplete}
      onChangePoints={props.onChangePoints}
      onChangeSection={props.onChangeSection}
      onSetAssignees={props.onSetAssignees}
      onDelete={props.onDelete}
    />
  );
}
