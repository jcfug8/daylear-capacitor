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
import { RewardForm } from "./RewardForm";
import type { RewardDetail, RewardFormValues } from "./reward-form";

type RewardModalBaseProps = {
  isOpen: boolean;
  onClose: () => void;
  family?: { members: MemberNameFields[] };
  pending?: boolean;
};

type RewardModalCreateProps = RewardModalBaseProps & {
  mode: "create";
  values: RewardFormValues;
  onValuesChange: (patch: Partial<RewardFormValues>) => void;
  onCreate: () => void;
};

type RewardModalEditProps = RewardModalBaseProps & {
  mode: "edit";
  reward: RewardDetail | null;
  onSaveName: (name: string) => void;
  onChangePoints: (points: number) => void;
  onSetAssignees: (memberIds: string[]) => void;
  onDelete: () => void;
};

export type RewardModalProps = RewardModalCreateProps | RewardModalEditProps;

export function RewardModal(props: RewardModalProps) {
  const { isOpen, onClose, family, pending, mode } = props;
  const [presentAlert] = useIonAlert();
  const [name, setName] = useState("");

  const editReward = mode === "edit" ? props.reward : null;

  useEffect(() => {
    if (editReward) setName(editReward.name);
  }, [editReward]);

  function confirmDelete() {
    if (mode !== "edit" || !props.reward) return;
    presentAlert({
      header: "Delete reward?",
      message: `Remove "${props.reward.name}"?`,
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
    if (mode !== "edit" || !props.reward) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setName(props.reward.name);
      return;
    }
    if (trimmed !== props.reward.name) {
      props.onSaveName(trimmed);
    }
  }

  function handleDone() {
    if (mode === "create") {
      props.onCreate();
      return;
    }
    saveNameIfChanged();
    onClose();
  }

  const formValues: RewardFormValues =
    mode === "create"
      ? props.values
      : editReward
        ? {
            name,
            points: editReward.points,
            assigneeIds: editReward.assigneeIds,
          }
        : { name: "", points: 0, assigneeIds: [] };

  function handleValuesChange(patch: Partial<RewardFormValues>) {
    if (mode === "create") {
      props.onValuesChange(patch);
      return;
    }
    if (!editReward) return;
    if (patch.name !== undefined) setName(patch.name);
    if (patch.points !== undefined) props.onChangePoints(patch.points);
    if (patch.assigneeIds !== undefined) props.onSetAssignees(patch.assigneeIds);
  }

  const showForm = mode === "create" || (mode === "edit" && editReward !== null);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{mode === "create" ? "New reward" : "Reward"}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleDone} disabled={pending}>
              {mode === "create" ? "Add" : "Done"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {showForm && (
          <RewardForm
            mode={mode}
            values={formValues}
            family={family}
            pending={pending}
            onValuesChange={handleValuesChange}
            onDelete={mode === "edit" ? confirmDelete : undefined}
          />
        )}
      </IonContent>
    </IonModal>
  );
}
