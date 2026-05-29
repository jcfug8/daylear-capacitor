import { SwimLanesBoard } from "../../utils/swim-lanes";
import type { AssignedReward, RewardLane } from "../build-reward-lanes";
import { RewardSwimLane } from "./RewardSwimLane";

type RewardSwimLanesBoardProps = {
  lanes: RewardLane[];
  redeemPending?: boolean;
  onSelectReward: (reward: AssignedReward, lane: RewardLane) => void;
};

export function RewardSwimLanesBoard({
  lanes,
  redeemPending,
  onSelectReward,
}: RewardSwimLanesBoardProps) {
  return (
    <SwimLanesBoard edgeToEdge>
      {lanes.map((lane) => (
        <RewardSwimLane
          key={lane.assigneeId}
          lane={lane}
          redeemPending={redeemPending}
          onSelectReward={(reward) => onSelectReward(reward, lane)}
        />
      ))}
    </SwimLanesBoard>
  );
}
