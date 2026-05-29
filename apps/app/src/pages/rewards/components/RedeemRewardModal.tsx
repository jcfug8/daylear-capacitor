import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { formatItemPointsLabel } from "../../../lib/format-item-points";
import type { AssignedReward, RewardLane } from "../build-reward-lanes";

type RedeemRewardModalProps = {
  isOpen: boolean;
  lane: RewardLane | null;
  reward: AssignedReward | null;
  pending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function RedeemRewardModal({
  isOpen,
  lane,
  reward,
  pending,
  onClose,
  onConfirm,
}: RedeemRewardModalProps) {
  const pointsLabel = reward ? formatItemPointsLabel(reward.points) : null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Redeem reward</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} disabled={pending}>
              Cancel
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {reward && lane && (
          <>
            <p className="mt-0 text-base">
              Exchange <strong>{pointsLabel}</strong> for{" "}
              <strong>{reward.name}</strong>?
            </p>
            <p className="text-sm text-[var(--ion-color-medium)]">
              {lane.label} will have{" "}
              {formatItemPointsLabel(Math.max(0, lane.memberPoints - reward.points)) ?? "0 pts"}{" "}
              remaining.
            </p>
            <IonButton
              expand="block"
              className="mt-6"
              disabled={pending}
              onClick={onConfirm}
            >
              Redeem
            </IonButton>
          </>
        )}
      </IonContent>
    </IonModal>
  );
}
