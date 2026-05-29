import { ANYONE_ASSIGNEE_ID } from "../../../lib/assignees";
import { isListItemCompleted } from "../../../lib/list-item-completion";

/** IonSelect value that opens the add-section flow instead of assigning a section. */
export const ADD_SECTION_SELECT_VALUE = "__add_section__";

export type ListItemFormValues = {
  name: string;
  completedByMemberId: string | null;
  points: number;
  sectionId: string | null;
  assigneeIds: string[];
  listId: string | null;
};

export type ListItemDetail = {
  id: string;
  name: string;
  completedByMemberId: string | null;
  points: number;
  sectionId: string | null;
  assigneeIds: string[];
};

export function listItemFormValuesFromDetail(
  item: ListItemDetail,
  listId: string,
): ListItemFormValues {
  return {
    name: item.name,
    completedByMemberId: item.completedByMemberId,
    points: item.points,
    sectionId: item.sectionId,
    assigneeIds: item.assigneeIds,
    listId,
  };
}

export function emptyListItemFormValues(
  assigneeIds: string[],
  listId: string | null,
): ListItemFormValues {
  return {
    name: "",
    completedByMemberId: null,
    points: 0,
    sectionId: null,
    assigneeIds,
    listId,
  };
}

export function defaultAssigneeIdsForLane(assigneeId: string): string[] {
  return assigneeId === ANYONE_ASSIGNEE_ID ? [ANYONE_ASSIGNEE_ID] : [assigneeId];
}

export function isListItemFormCompleted(values: ListItemFormValues): boolean {
  return isListItemCompleted(values);
}
