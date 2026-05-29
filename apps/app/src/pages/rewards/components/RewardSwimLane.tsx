import { formatItemPointsLabel } from "../../../lib/format-item-points";
import { SwimLane, SwimLaneHeader } from "../../utils/swim-lanes";
import type { AssignedReward, RewardLane } from "../build-reward-lanes";
import { RewardCard } from "./RewardCard";

type RewardSwimLaneProps = {
  lane: RewardLane;
  redeemPending?: boolean;
  onSelectReward: (reward: AssignedReward) => void;
};

export function RewardSwimLane({ lane, redeemPending, onSelectReward }: RewardSwimLaneProps) {
  const pointsLabel = formatItemPointsLabel(lane.memberPoints) ?? "0 pts";

  return (
    <SwimLane
      header={<SwimLaneHeader title={lane.label} subtitle={pointsLabel} />}
      isEmpty={lane.rewards.length === 0}
      emptyMessage="No rewards yet"
    >
      {lane.rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          memberPoints={lane.memberPoints}
          disabled={redeemPending}
          onSelect={() => onSelectReward(reward)}
        />
      ))}
    </SwimLane>
  );
}
