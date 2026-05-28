const ITEM_PREFIX = "item:";
const ASSIGNEE_ITEM_PREFIX = "assignee-item:";

export function itemDndId(itemId: string) {
  return `${ITEM_PREFIX}${itemId}`;
}

export function parseItemDndId(id: string): string | null {
  return id.startsWith(ITEM_PREFIX) ? id.slice(ITEM_PREFIX.length) : null;
}

/** Unique per assignee lane — same list item can appear under multiple people. */
export function assigneeItemDndId(assigneeId: string, itemId: string) {
  return `${ASSIGNEE_ITEM_PREFIX}${assigneeId}:${itemId}`;
}

export function parseAssigneeItemDndId(
  id: string,
): { assigneeId: string; itemId: string } | null {
  if (!id.startsWith(ASSIGNEE_ITEM_PREFIX)) return null;
  const rest = id.slice(ASSIGNEE_ITEM_PREFIX.length);
  const separator = rest.indexOf(":");
  if (separator === -1) return null;
  return {
    assigneeId: rest.slice(0, separator),
    itemId: rest.slice(separator + 1),
  };
}

export function sortableItemId(id: string): string | null {
  return parseAssigneeItemDndId(id)?.itemId ?? parseItemDndId(id);
}
