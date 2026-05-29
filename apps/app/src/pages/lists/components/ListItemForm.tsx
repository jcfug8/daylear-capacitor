import {
  IonButton,
  IonCheckbox,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { ANYONE_ASSIGNEE_ID } from "../../../lib/assignees";
import { isListItemCompleted } from "../../../lib/list-item-completion";
import {
  memberDisplayName,
  type MemberNameFields,
} from "../../../lib/member-display-name";
import { parsePointsInput } from "../../../lib/format-item-points";
import {
  ADD_SECTION_SELECT_VALUE,
  type ListItemFormValues,
} from "../lib/list-item-form";

type ListItemFormProps = {
  mode: "create" | "edit";
  values: ListItemFormValues;
  /** Active list for section picker and add-section (create + edit). */
  listId: string | null;
  sections: { id: string; name: string }[];
  lists?: { id: string; name: string }[];
  family?: { members: MemberNameFields[] };
  pending?: boolean;
  onValuesChange: (patch: Partial<ListItemFormValues>) => void;
  onAddSection?: () => void;
  onDelete?: () => void;
  onToggleComplete?: (complete: boolean) => void;
};

export function ListItemForm({
  mode,
  values,
  listId,
  sections,
  lists,
  family,
  pending,
  onValuesChange,
  onAddSection,
  onDelete,
  onToggleComplete,
}: ListItemFormProps) {
  const showListPicker = mode === "create" && lists && lists.length > 0;
  const showSectionField = !!listId;
  const isCompleted = isListItemCompleted(values);
  const fieldsDisabled = pending || (mode === "edit" && isCompleted);

  return (
    <IonList lines="full">
      {showListPicker && (
        <IonItem>
          <IonSelect
            label="List"
            labelPlacement="stacked"
            interface="popover"
            value={values.listId ?? ""}
            disabled={pending}
            onIonChange={(e) => {
              const listId = e.detail.value ? String(e.detail.value) : null;
              onValuesChange({ listId, sectionId: null });
            }}
          >
            {lists.map((list) => (
              <IonSelectOption key={list.id} value={list.id}>
                {list.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      )}

      {mode === "create" && lists?.length === 0 && (
        <IonItem lines="none">
          <p className="m-0 text-sm text-[var(--ion-color-medium)]">
            Create a list first to add items.
          </p>
        </IonItem>
      )}

      <IonItem>
        <IonInput
          label="Title"
          labelPlacement="stacked"
          value={values.name}
          disabled={fieldsDisabled}
          onIonInput={(e) => onValuesChange({ name: e.detail.value ?? "" })}
        />
      </IonItem>

      {mode === "edit" && onToggleComplete && (
        <IonItem>
          <IonCheckbox
            checked={isCompleted}
            disabled={pending}
            onIonChange={(e) => onToggleComplete(e.detail.checked)}
          >
            Completed
          </IonCheckbox>
        </IonItem>
      )}

      <IonItem>
        <IonInput
          label="Points"
          labelPlacement="stacked"
          type="number"
          inputmode="numeric"
          min={0}
          value={String(values.points)}
          disabled={fieldsDisabled}
          onIonInput={(e) =>
            onValuesChange({ points: parsePointsInput(e.detail.value ?? "") })
          }
        />
      </IonItem>

      {showSectionField && (
        <IonItem>
          <IonSelect
            label="Section"
            labelPlacement="stacked"
            interface="popover"
            value={values.sectionId ?? ""}
            disabled={fieldsDisabled}
            onIonChange={(e) => {
              const raw = e.detail.value ? String(e.detail.value) : "";
              if (raw === ADD_SECTION_SELECT_VALUE) {
                onAddSection?.();
                return;
              }
              onValuesChange({ sectionId: raw || null });
            }}
          >
            <IonSelectOption value="">No section</IonSelectOption>
            {sections.map((section) => (
              <IonSelectOption key={section.id} value={section.id}>
                {section.name}
              </IonSelectOption>
            ))}
            {onAddSection && (
              <IonSelectOption value={ADD_SECTION_SELECT_VALUE}>
                Add section…
              </IonSelectOption>
            )}
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
            value={values.assigneeIds}
            disabled={fieldsDisabled}
            onIonChange={(e) => {
              const value = e.detail.value;
              const selectedIds = Array.isArray(value)
                ? value.map(String)
                : value
                  ? [String(value)]
                  : [];
              const assigneeIds = [...new Set(selectedIds)];
              onValuesChange({ assigneeIds });
            }}
          >
            <IonSelectOption value={ANYONE_ASSIGNEE_ID}>Anyone</IonSelectOption>
            {family.members.map((member) => (
              <IonSelectOption key={member.id} value={member.id}>
                {memberDisplayName(member)}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      )}

      {mode === "edit" && onDelete && (
        <IonItem lines="none" className="mt-4">
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            disabled={pending}
            onClick={onDelete}
          >
            Delete item
          </IonButton>
        </IonItem>
      )}
    </IonList>
  );
}
