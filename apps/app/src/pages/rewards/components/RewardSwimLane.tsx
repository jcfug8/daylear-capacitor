import type { AssignedReward, RewardLane } from "../build-reward-lanes";
import { RewardCard } from "./RewardCard";
import { RewardLaneHeader } from "./RewardLaneHeader";

type RewardSwimLaneProps = {
  lane: RewardLane;
  redeemPending?: boolean;
  onSelectReward: (reward: AssignedReward) => void;
};

export function RewardSwimLane({ lane, redeemPending, onSelectReward }: RewardSwimLaneProps) {
  return (
    <section className="flex h-full min-h-0 w-[min(85vw,17rem)] shrink-0 flex-col">
      <RewardLaneHeader lane={lane} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain space-y-2">
        {lane.rewards.length === 0 ? (
          <p className="m-0 px-1 py-6 text-center text-xs text-[var(--ion-color-medium)]">
            No rewards yet
          </p>
        ) : (
          lane.rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              memberPoints={lane.memberPoints}
              disabled={redeemPending}
              onSelect={() => onSelectReward(reward)}
            />
          ))
        )}
      </div>
    </section>
  );
}
