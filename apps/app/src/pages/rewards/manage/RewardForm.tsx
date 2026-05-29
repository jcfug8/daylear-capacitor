import {
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  memberDisplayName,
  type MemberNameFields,
} from "../../../lib/member-display-name";
import { parsePointsInput } from "../../../lib/format-item-points";
import type { RewardFormValues } from "./reward-form";

type RewardFormProps = {
  mode: "create" | "edit";
  values: RewardFormValues;
  family?: { members: MemberNameFields[] };
  pending?: boolean;
  onValuesChange: (patch: Partial<RewardFormValues>) => void;
  onDelete?: () => void;
};

export function RewardForm({
  mode,
  values,
  family,
  pending,
  onValuesChange,
  onDelete,
}: RewardFormProps) {
  return (
    <IonList lines="full">
      <IonItem>
        <IonInput
          label="Name"
          labelPlacement="stacked"
          value={values.name}
          disabled={pending}
          onIonInput={(e) => onValuesChange({ name: e.detail.value ?? "" })}
        />
      </IonItem>

      <IonItem>
        <IonInput
          label="Points"
          labelPlacement="stacked"
          type="number"
          inputmode="numeric"
          min={0}
          value={String(values.points)}
          disabled={pending}
          onIonInput={(e) =>
            onValuesChange({ points: parsePointsInput(e.detail.value ?? "") })
          }
        />
      </IonItem>

      {family && (
        <IonItem>
          <IonSelect
            label="Assigned to"
            labelPlacement="stacked"
            multiple
            interface="popover"
            value={values.assigneeIds}
            disabled={pending}
            onIonChange={(e) => {
              const value = e.detail.value;
              const selectedIds = Array.isArray(value)
                ? value.map(String)
                : value
                  ? [String(value)]
                  : [];
              onValuesChange({ assigneeIds: selectedIds });
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

      {mode === "edit" && onDelete && (
        <IonItem lines="none" className="mt-4">
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            disabled={pending}
            onClick={onDelete}
          >
            Delete reward
          </IonButton>
        </IonItem>
      )}
    </IonList>
  );
}
