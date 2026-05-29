import type { ReactNode } from "react";
import { AnyoneAvatar, MemberAvatar } from "../../../components/MemberAvatar";
import type { ListItemAssignees } from "../lib/list-item-assignees";
import { listItemAssigneeLabel } from "../lib/list-item-assignees";

type ListItemAssigneeAvatarsProps = {
  assignees: ListItemAssignees;
};

export function ListItemAssigneeAvatars({ assignees }: ListItemAssigneeAvatarsProps) {
  const groupLabel = listItemAssigneeLabel(assignees);
  const nodes: Array<{ key: string; node: ReactNode }> = [];

  if (assignees.includesAnyone) {
    nodes.push({ key: "anyone", node: <AnyoneAvatar size="sm" /> });
  }

  for (const member of assignees.members) {
    nodes.push({
      key: member.id,
      node: <MemberAvatar member={member} size="sm" />,
    });
  }

  if (nodes.length === 0) return null;

  if (nodes.length === 1) {
    return nodes[0]!.node;
  }

  return (
    <div className="flex shrink-0 -space-x-1.5" aria-label={groupLabel} title={groupLabel}>
      {nodes.map(({ key, node }, index) => (
        <span key={key} className={index > 0 ? "ring-2 ring-white rounded-full" : ""}>
          {node}
        </span>
      ))}
    </div>
  );
}
