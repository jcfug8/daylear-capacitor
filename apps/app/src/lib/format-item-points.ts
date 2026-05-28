export function formatItemPointsLabel(points: number): string | null {
  if (points <= 0) return null;
  return `${points} pt${points === 1 ? "" : "s"}`;
}

export function parsePointsInput(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}
