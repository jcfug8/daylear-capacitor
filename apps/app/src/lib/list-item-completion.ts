export function isListItemCompleted(item: {
  completedByMemberId: string | null;
}): boolean {
  return item.completedByMemberId !== null;
}
