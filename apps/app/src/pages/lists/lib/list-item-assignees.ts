import { ANYONE_ASSIGNEE_ID } from "../../../lib/assignees";
import { memberDisplayName, type MemberNameFields } from "../../../lib/member-display-name";

export type ListItemAssignees = {
  includesAnyone: boolean;
  members: MemberNameFields[];
};

export function resolveListItemAssignees(
  assigneeIds: string[],
  familyMembers: MemberNameFields[] = [],
): ListItemAssignees | null {
  if (assigneeIds.length === 0) return null;

  const includesAnyone = assigneeIds.includes(ANYONE_ASSIGNEE_ID);
  const members = assigneeIds
    .filter((id) => id !== ANYONE_ASSIGNEE_ID)
    .map((id) => familyMembers.find((member) => member.id === id))
    .filter((member): member is MemberNameFields => !!member);

  if (!includesAnyone && members.length === 0) return null;

  return { includesAnyone, members };
}

export function listItemAssigneeLabel(assignees: ListItemAssignees): string {
  const parts: string[] = [];
  if (assignees.includesAnyone) parts.push("Anyone");
  parts.push(...assignees.members.map((member) => memberDisplayName(member)));
  return parts.join(", ");
}
