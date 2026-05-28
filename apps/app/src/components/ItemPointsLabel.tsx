import { formatItemPointsLabel } from "../lib/format-item-points";

type ItemPointsLabelProps = {
  points: number;
  className?: string;
};

export function ItemPointsLabel({ points, className = "" }: ItemPointsLabelProps) {
  const label = formatItemPointsLabel(points);
  if (!label) return null;

  return (
    <span
      className={[
        "text-xs font-medium text-[var(--ion-color-primary)] shrink-0",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
