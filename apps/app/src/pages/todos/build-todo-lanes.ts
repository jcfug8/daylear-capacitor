import { ANYONE_ASSIGNEE_ID } from "../../lib/assignees";
import {
  memberDisplayName,
  type MemberNameFields,
} from "../../lib/member-display-name";

export type AssignedTodoItem = {
  id: string;
  name: string;
  completed: boolean;
  points: number;
  listId: string;
  listName: string;
  sectionName: string | null;
  assigneeId: string;
};

export type TodoLane = {
  assigneeId: string;
  label: string;
  items: AssignedTodoItem[];
};

export function buildTodoLanes(
  members: MemberNameFields[],
  todos: AssignedTodoItem[],
): TodoLane[] {
  const byAssignee = new Map<string, AssignedTodoItem[]>();
  for (const todo of todos) {
    const laneItems = byAssignee.get(todo.assigneeId) ?? [];
    laneItems.push(todo);
    byAssignee.set(todo.assigneeId, laneItems);
  }

  const lanes: TodoLane[] = members.map((member) => ({
    assigneeId: member.id,
    label: memberDisplayName(member),
    items: byAssignee.get(member.id) ?? [],
  }));

  const anyoneItems = byAssignee.get(ANYONE_ASSIGNEE_ID);
  if (anyoneItems && anyoneItems.length > 0) {
    lanes.push({
      assigneeId: ANYONE_ASSIGNEE_ID,
      label: "Anyone",
      items: anyoneItems,
    });
  }

  return lanes;
}
