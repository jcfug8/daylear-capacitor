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
    <div className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden -mx-4 w-[calc(100%+2rem)]">
      <div className="flex h-full min-h-full w-max gap-3 px-4 pb-2">
        {lanes.map((lane) => (
          <RewardSwimLane
            key={lane.assigneeId}
            lane={lane}
            redeemPending={redeemPending}
            onSelectReward={(reward) => onSelectReward(reward, lane)}
          />
        ))}
      </div>
    </div>
  );
}
