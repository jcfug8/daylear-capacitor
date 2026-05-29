import { ANYONE_ASSIGNEE_ID } from "../../../lib/assignees";
import { memberDisplayName, type MemberNameFields } from "../../../lib/member-display-name";
import { formatItemPointsLabel } from "../../../lib/format-item-points";

export function listItemBadgeLabel(
  item: { assigneeIds: string[]; points: number },
  familyMembers: MemberNameFields[] = [],
): string | null {
  if (item.assigneeIds.length > 0) {
    if (item.assigneeIds.includes(ANYONE_ASSIGNEE_ID)) {
      return "Anyone";
    }
    const member = familyMembers.find((m) => item.assigneeIds.includes(m.id));
    if (member) {
      return memberDisplayName(member);
    }
  }

  return formatItemPointsLabel(item.points);
}
