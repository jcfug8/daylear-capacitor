import { formatItemPointsLabel } from "../../../lib/format-item-points";
import type { MemberNameFields } from "../../../lib/member-display-name";
import { resolveListItemAssignees } from "./list-item-assignees";

export function listItemPointsBadgeLabel(
  item: { assigneeIds: string[]; points: number },
  familyMembers: MemberNameFields[] = [],
): string | null {
  if (resolveListItemAssignees(item.assigneeIds, familyMembers)) return null;
  return formatItemPointsLabel(item.points);
}
