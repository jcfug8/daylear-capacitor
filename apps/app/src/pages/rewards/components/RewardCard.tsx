import { formatItemPointsLabel } from "../../../lib/format-item-points";
import type { AssignedReward } from "../build-reward-lanes";

type RewardCardProps = {
  reward: AssignedReward;
  memberPoints: number;
  disabled?: boolean;
  onSelect: () => void;
};

export function RewardCard({ reward, memberPoints, disabled, onSelect }: RewardCardProps) {
  const canAfford = memberPoints >= reward.points;
  const isDisabled = disabled || !canAfford;
  const pointsLabel = formatItemPointsLabel(reward.points) ?? "0 pts";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onSelect}
      className={[
        "m-0 w-full rounded-lg border px-3 py-2.5 text-left shadow-sm transition-opacity",
        "border-[var(--ion-color-light-shade)] bg-[var(--ion-background-color)]",
        isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer active:opacity-80",
      ].join(" ")}
    >
      <p
        className={[
          "m-0 text-sm font-medium leading-snug",
          isDisabled
            ? "text-[var(--ion-color-medium)]"
            : "text-[var(--ion-text-color)]",
        ].join(" ")}
      >
        {reward.name}
      </p>
      <p className="m-0 mt-1 text-xs text-[var(--ion-color-medium)]">{pointsLabel}</p>
    </button>
  );
}
