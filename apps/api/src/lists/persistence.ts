import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  listItemAssignees,
  listItems,
  listSections,
  lists,
} from "../db/schema/lists.js";
import { adjustMemberPoints } from "../points/persistence.js";

const ANYONE_ASSIGNEE_ID = "anyone";

export type List = {
  id: string;
  familyId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ListSection = {
  id: string;
  listId: string;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ListItem = {
  id: string;
  listId: string;
  sectionId: string | null;
  name: string;
  completedByMemberId: string | null;
  points: number;
  sortOrder: number;
  assigneeIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ListDetail = List & {
  sections: ListSection[];
  items: ListItem[];
};

/** A list item with an assignment, for the family todos board. */
export type AssignedTodoItem = {
  id: string;
  name: string;
  completedByMemberId: string | null;
  points: number;
  listId: string;
  listName: string;
  sectionName: string | null;
  assigneeId: string;
  assigneeIds: string[];
};

function toList(row: typeof lists.$inferSelect): List {
  return {
    id: row.id,
    familyId: row.familyId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toSection(row: typeof listSections.$inferSelect): ListSection {
  return {
    id: row.id,
    listId: row.listId,
    name: row.name,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toListItem(
  row: typeof listItems.$inferSelect,
  assigneeIds: string[],
): ListItem {
  return {
    id: row.id,
    listId: row.listId,
    sectionId: row.sectionId,
    name: row.name,
    completedByMemberId: row.completedByMemberId,
    points: row.points,
    sortOrder: row.sortOrder,
    assigneeIds,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function assigneeIdsByItemIds(
  itemIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (itemIds.length === 0) return map;

  const rows = await db
    .select()
    .from(listItemAssignees)
    .where(inArray(listItemAssignees.listItemId, itemIds));

  for (const row of rows) {
    const existing = map.get(row.listItemId) ?? [];
    existing.push(row.familyMemberId ?? ANYONE_ASSIGNEE_ID);
    map.set(row.listItemId, existing);
  }
  return map;
}

export async function listAssignedTodosByFamilyId(
  familyId: string,
): Promise<AssignedTodoItem[]> {
  const rows = await db
    .select({
      id: listItems.id,
      name: listItems.name,
      completedByMemberId: listItems.completedByMemberId,
      points: listItems.points,
      listId: lists.id,
      listName: lists.name,
      sectionName: listSections.name,
      assigneeId: listItemAssignees.familyMemberId,
    })
    .from(listItemAssignees)
    .innerJoin(listItems, eq(listItemAssignees.listItemId, listItems.id))
    .innerJoin(lists, eq(listItems.listId, lists.id))
    .leftJoin(listSections, eq(listItems.sectionId, listSections.id))
    .where(eq(lists.familyId, familyId))
    .orderBy(
      asc(listItemAssignees.sortOrder),
      asc(listItems.sortOrder),
      asc(listItems.name),
    );

  const itemIds = [...new Set(rows.map((row) => row.id))];
  const assigneeMap = await assigneeIdsByItemIds(itemIds);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    completedByMemberId: row.completedByMemberId,
    points: row.points,
    listId: row.listId,
    listName: row.listName,
    sectionName: row.sectionName,
    assigneeId: row.assigneeId ?? ANYONE_ASSIGNEE_ID,
    assigneeIds: assigneeMap.get(row.id) ?? [],
  }));
}

export async function listByFamilyId(familyId: string): Promise<List[]> {
  const rows = await db
    .select()
    .from(lists)
    .where(eq(lists.familyId, familyId))
    .orderBy(desc(lists.createdAt));
  return rows.map(toList);
}

export async function findById(
  familyId: string,
  listId: string,
): Promise<List | null> {
  const [row] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, listId), eq(lists.familyId, familyId)));
  return row ? toList(row) : null;
}

export async function findSectionById(
  familyId: string,
  sectionId: string,
): Promise<ListSection | null> {
  const [row] = await db
    .select({ section: listSections })
    .from(listSections)
    .innerJoin(lists, eq(listSections.listId, lists.id))
    .where(and(eq(listSections.id, sectionId), eq(lists.familyId, familyId)));

  return row ? toSection(row.section) : null;
}

export async function findByIdWithDetails(
  familyId: string,
  listId: string,
): Promise<ListDetail | null> {
  const list = await findById(familyId, listId);
  if (!list) return null;

  const sectionRows = await db
    .select()
    .from(listSections)
    .where(eq(listSections.listId, listId))
    .orderBy(asc(listSections.sortOrder), asc(listSections.createdAt));

  const itemRows = await db
    .select()
    .from(listItems)
    .where(eq(listItems.listId, listId))
    .orderBy(asc(listItems.sortOrder), asc(listItems.createdAt));

  const assignees = await assigneeIdsByItemIds(itemRows.map((r) => r.id));

  return {
    ...list,
    sections: sectionRows.map(toSection),
    items: itemRows.map((row) =>
      toListItem(row, assignees.get(row.id) ?? []),
    ),
  };
}

export async function create(input: {
  familyId: string;
  name: string;
}): Promise<List> {
  const [row] = await db
    .insert(lists)
    .values({
      familyId: input.familyId,
      name: input.name,
    })
    .returning();
  return toList(row);
}

export async function updateName(
  listId: string,
  name: string,
): Promise<List | null> {
  const [row] = await db
    .update(lists)
    .set({ name, updatedAt: new Date() })
    .where(eq(lists.id, listId))
    .returning();
  return row ? toList(row) : null;
}

export async function deleteById(listId: string): Promise<boolean> {
  const deleted = await db.delete(lists).where(eq(lists.id, listId)).returning();
  return deleted.length > 0;
}

export async function createSection(input: {
  listId: string;
  name: string;
  sortOrder?: number;
}): Promise<ListSection> {
  const [row] = await db
    .insert(listSections)
    .values({
      listId: input.listId,
      name: input.name,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return toSection(row);
}

export async function updateSection(
  sectionId: string,
  patch: { name?: string; sortOrder?: number },
): Promise<ListSection | null> {
  const [row] = await db
    .update(listSections)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(listSections.id, sectionId))
    .returning();
  return row ? toSection(row) : null;
}

export async function deleteSection(sectionId: string): Promise<boolean> {
  const deleted = await db
    .delete(listSections)
    .where(eq(listSections.id, sectionId))
    .returning();
  return deleted.length > 0;
}

export async function findItemById(
  familyId: string,
  itemId: string,
): Promise<ListItem | null> {
  const [row] = await db
    .select({
      item: listItems,
      familyId: lists.familyId,
    })
    .from(listItems)
    .innerJoin(lists, eq(listItems.listId, lists.id))
    .where(and(eq(listItems.id, itemId), eq(lists.familyId, familyId)));

  if (!row) return null;

  const assignees = await assigneeIdsByItemIds([row.item.id]);
  return toListItem(row.item, assignees.get(row.item.id) ?? []);
}

export async function nextItemSortOrder(
  listId: string,
  sectionId: string | null,
): Promise<number> {
  const [result] = await db
    .select({
      max: sql<number>`coalesce(max(${listItems.sortOrder}), -1)`,
    })
    .from(listItems)
    .where(
      and(
        eq(listItems.listId, listId),
        sectionId === null
          ? isNull(listItems.sectionId)
          : eq(listItems.sectionId, sectionId),
      ),
    );
  return (result?.max ?? -1) + 1;
}

export async function createItem(input: {
  listId: string;
  sectionId?: string | null;
  name: string;
  points?: number;
}): Promise<ListItem> {
  const sectionId = input.sectionId ?? null;
  const sortOrder = await nextItemSortOrder(input.listId, sectionId);

  const [row] = await db
    .insert(listItems)
    .values({
      listId: input.listId,
      sectionId,
      name: input.name,
      points: input.points ?? 0,
      sortOrder,
    })
    .returning();
  return toListItem(row, []);
}

export async function applyLayout(
  listId: string,
  input: {
    sectionIds: string[];
    items: Array<{
      id: string;
      sectionId: string | null;
      sortOrder: number;
    }>;
  },
): Promise<void> {
  await db.transaction(async (tx) => {
    for (let i = 0; i < input.sectionIds.length; i++) {
      await tx
        .update(listSections)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(
          and(eq(listSections.id, input.sectionIds[i]), eq(listSections.listId, listId)),
        );
    }

    for (const item of input.items) {
      await tx
        .update(listItems)
        .set({
          sectionId: item.sectionId,
          sortOrder: item.sortOrder,
          updatedAt: new Date(),
        })
        .where(and(eq(listItems.id, item.id), eq(listItems.listId, listId)));
    }
  });
}

export async function applyCompletionPointsChange(
  previousCompleterId: string | null,
  nextCompleterId: string | null,
  points: number,
): Promise<void> {
  if (previousCompleterId === nextCompleterId) return;

  await db.transaction(async (tx) => {
    if (previousCompleterId) {
      await adjustMemberPoints(tx, previousCompleterId, -points);
    }
    if (nextCompleterId) {
      await adjustMemberPoints(tx, nextCompleterId, points);
    }
  });
}

export async function updateItem(
  itemId: string,
  patch: {
    name?: string;
    completedByMemberId?: string | null;
    points?: number;
    sectionId?: string | null;
    sortOrder?: number;
  },
): Promise<ListItem | null> {
  const [row] = await db
    .update(listItems)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(listItems.id, itemId))
    .returning();
  if (!row) return null;

  const assignees = await assigneeIdsByItemIds([row.id]);
  return toListItem(row, assignees.get(row.id) ?? []);
}

export async function deleteItem(itemId: string): Promise<boolean> {
  const deleted = await db
    .delete(listItems)
    .where(eq(listItems.id, itemId))
    .returning();
  return deleted.length > 0;
}

function assigneeKeyMatches(
  rowMemberId: string | null,
  targetMemberId: string | null,
): boolean {
  return (rowMemberId ?? null) === (targetMemberId ?? null);
}

async function nextAssignmentSortOrders(
  executor: Pick<typeof db, "select">,
  familyId: string,
  familyMemberIds: Array<string | null>,
): Promise<Map<string | null, number>> {
  const nextByAssignee = new Map<string | null, number>();

  for (const familyMemberId of familyMemberIds) {
    const [result] = await executor
      .select({
        max: sql<number>`coalesce(max(${listItemAssignees.sortOrder}), -1)`,
      })
      .from(listItemAssignees)
      .innerJoin(listItems, eq(listItemAssignees.listItemId, listItems.id))
      .innerJoin(lists, eq(listItems.listId, lists.id))
      .where(
        and(
          eq(lists.familyId, familyId),
          familyMemberId === null
            ? isNull(listItemAssignees.familyMemberId)
            : eq(listItemAssignees.familyMemberId, familyMemberId),
        ),
      );

    nextByAssignee.set(familyMemberId, (result?.max ?? -1) + 1);
  }

  return nextByAssignee;
}

export async function setItemAssignees(
  familyId: string,
  itemId: string,
  familyMemberIds: Array<string | null>,
): Promise<ListItem | null> {
  const [itemRow] = await db
    .select({ item: listItems })
    .from(listItems)
    .innerJoin(lists, eq(listItems.listId, lists.id))
    .where(and(eq(listItems.id, itemId), eq(lists.familyId, familyId)));
  if (!itemRow) return null;

  const existingRows = await db
    .select()
    .from(listItemAssignees)
    .where(eq(listItemAssignees.listItemId, itemId));

  const targetIds = familyMemberIds;
  const toRemove = existingRows.filter(
    (row) => !targetIds.some((id) => assigneeKeyMatches(row.familyMemberId, id)),
  );
  const toAdd = targetIds.filter(
    (id) => !existingRows.some((row) => assigneeKeyMatches(row.familyMemberId, id)),
  );

  await db.transaction(async (tx) => {
    for (const row of toRemove) {
      await tx
        .delete(listItemAssignees)
        .where(
          and(
            eq(listItemAssignees.listItemId, itemId),
            row.familyMemberId === null
              ? isNull(listItemAssignees.familyMemberId)
              : eq(listItemAssignees.familyMemberId, row.familyMemberId),
          ),
        );
    }

    if (toAdd.length > 0) {
      const nextOrders = await nextAssignmentSortOrders(tx, familyId, toAdd);
      await tx.insert(listItemAssignees).values(
        toAdd.map((familyMemberId) => ({
          listItemId: itemId,
          familyMemberId,
          sortOrder: nextOrders.get(familyMemberId) ?? 0,
        })),
      );
    }
  });

  const assignees = await assigneeIdsByItemIds([itemId]);
  return toListItem(itemRow.item, assignees.get(itemId) ?? []);
}

export async function applyAssigneeTodoOrder(
  familyId: string,
  assigneeId: string | null,
  itemIds: string[],
): Promise<void> {
  if (itemIds.length === 0) return;

  const rows = await db
    .select({
      listItemId: listItemAssignees.listItemId,
    })
    .from(listItemAssignees)
    .innerJoin(listItems, eq(listItemAssignees.listItemId, listItems.id))
    .innerJoin(lists, eq(listItems.listId, lists.id))
    .where(
      and(
        eq(lists.familyId, familyId),
        inArray(listItemAssignees.listItemId, itemIds),
        assigneeId === null
          ? isNull(listItemAssignees.familyMemberId)
          : eq(listItemAssignees.familyMemberId, assigneeId),
      ),
    );

  const foundIds = new Set(rows.map((r) => r.listItemId));
  if (foundIds.size !== itemIds.length) {
    throw new Error("INVALID_TODO_ORDER");
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < itemIds.length; i++) {
      await tx
        .update(listItemAssignees)
        .set({ sortOrder: i })
        .where(
          and(
            eq(listItemAssignees.listItemId, itemIds[i]),
            assigneeId === null
              ? isNull(listItemAssignees.familyMemberId)
              : eq(listItemAssignees.familyMemberId, assigneeId),
          ),
        );
    }
  });
}
