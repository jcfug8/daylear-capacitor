import { ANYONE_ASSIGNEE_ID } from "./assignees";

export type ResolveCompleterResult =
  | { type: "member"; memberId: string }
  | { type: "pick"; memberIds: string[] };

type ResolveCompleterOptions = {
  /** Todo swim lane or list context — a specific family member. */
  laneAssigneeId?: string;
  /** All family member ids (for "Anyone" assignments). */
  familyMemberIds?: string[];
};

export function resolveItemCompleter(
  assigneeIds: string[],
  options: ResolveCompleterOptions = {},
): ResolveCompleterResult {
  const { laneAssigneeId, familyMemberIds = [] } = options;

  if (laneAssigneeId && laneAssigneeId !== ANYONE_ASSIGNEE_ID) {
    return { type: "member", memberId: laneAssigneeId };
  }

  if (assigneeIds.includes(ANYONE_ASSIGNEE_ID)) {
    return { type: "pick", memberIds: familyMemberIds };
  }

  const memberAssignees = assigneeIds.filter((id) => id !== ANYONE_ASSIGNEE_ID);

  if (memberAssignees.length === 1) {
    return { type: "member", memberId: memberAssignees[0]! };
  }

  return { type: "pick", memberIds: memberAssignees };
}
