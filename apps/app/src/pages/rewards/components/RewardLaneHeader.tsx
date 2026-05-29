import { IonText } from "@ionic/react";
import { formatItemPointsLabel } from "../../../lib/format-item-points";
import type { RewardLane } from "../build-reward-lanes";

type RewardLaneHeaderProps = {
  lane: RewardLane;
};

export function RewardLaneHeader({ lane }: RewardLaneHeaderProps) {
  const pointsLabel = formatItemPointsLabel(lane.memberPoints) ?? "0 pts";

  return (
    <header className="mb-2 shrink-0 px-1">
      <span className="text-base font-semibold block truncate">{lane.label}</span>
      <IonText color="medium">
        <p className="m-0 text-sm">{pointsLabel}</p>
      </IonText>
    </header>
  );
}
