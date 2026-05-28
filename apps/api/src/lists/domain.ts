import { z } from "zod";
import type { AuthContext } from "../shared/auth-context.js";
import { requireFamilyId } from "../shared/auth-context.js";
import * as familiesPersistence from "../families/persistence.js";
import * as persistence from "./persistence.js";

export type List = persistence.List;
export type ListSection = persistence.ListSection;
export type ListItem = persistence.ListItem;
export type ListDetail = persistence.ListDetail;
export const ANYONE_ASSIGNEE_ID = "anyone" as const;

const listIdInput = z.object({
  id: z.string().uuid(),
});

const sectionIdInput = z.object({
  id: z.string().uuid(),
});

const itemIdInput = z.object({
  id: z.string().uuid(),
});

export const createListInput = z.object({
  name: z.string().min(1).max(500),
});

export const updateListInput = listIdInput.extend({
  name: z.string().min(1).max(500),
});

export const deleteListInput = listIdInput;

export const getListInput = listIdInput;

export const createListSectionInput = z.object({
  listId: z.string().uuid(),
  name: z.string().min(1).max(500),
});

export const updateListSectionInput = sectionIdInput.extend({
  name: z.string().min(1).max(500).optional(),
});

export const deleteListSectionInput = sectionIdInput;

const listItemPointsSchema = z.number().int().min(0).max(999_999);

export const createListItemInput = z.object({
  listId: z.string().uuid(),
  sectionId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(500),
  points: listItemPointsSchema.optional(),
});

export const updateListItemInput = itemIdInput.extend({
  name: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  points: listItemPointsSchema.optional(),
  sectionId: z.string().uuid().nullable().optional(),
});

export const deleteListItemInput = itemIdInput;

export const setListItemAssigneesInput = itemIdInput.extend({
  memberIds: z.array(z.union([z.string().uuid(), z.literal(ANYONE_ASSIGNEE_ID)])),
});

export const applyListLayoutInput = z.object({
  listId: z.string().uuid(),
  sectionIds: z.array(z.string().uuid()),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sectionId: z.string().uuid().nullable(),
      sortOrder: z.number().int().min(0),
    }),
  ),
});

export async function listLists(ctx: AuthContext): Promise<List[]> {
  const familyId = requireFamilyId(ctx);
  return persistence.listByFamilyId(familyId);
}

export async function getList(
  ctx: AuthContext,
  input: z.infer<typeof getListInput>,
): Promise<ListDetail> {
  const familyId = requireFamilyId(ctx);
  const list = await persistence.findByIdWithDetails(familyId, input.id);
  if (!list) {
    throw new Error("LIST_NOT_FOUND");
  }
  return list;
}

export async function createList(
  ctx: AuthContext,
  input: z.infer<typeof createListInput>,
): Promise<List> {
  const familyId = requireFamilyId(ctx);
  return persistence.create({ familyId, name: input.name });
}

export async function updateList(
  ctx: AuthContext,
  input: z.infer<typeof updateListInput>,
): Promise<List> {
  const familyId = requireFamilyId(ctx);
  const existing = await persistence.findById(familyId, input.id);
  if (!existing) {
    throw new Error("LIST_NOT_FOUND");
  }

  const updated = await persistence.updateName(input.id, input.name);
  if (!updated) {
    throw new Error("LIST_NOT_FOUND");
  }
  return updated;
}

export async function deleteList(
  ctx: AuthContext,
  input: z.infer<typeof deleteListInput>,
): Promise<void> {
  const familyId = requireFamilyId(ctx);
  const existing = await persistence.findById(familyId, input.id);
  if (!existing) {
    throw new Error("LIST_NOT_FOUND");
  }

  const deleted = await persistence.deleteById(input.id);
  if (!deleted) {
    throw new Error("LIST_NOT_FOUND");
  }
}

export async function createListSection(
  ctx: AuthContext,
  input: z.infer<typeof createListSectionInput>,
): Promise<ListSection> {
  const familyId = requireFamilyId(ctx);
  const list = await persistence.findById(familyId, input.listId);
  if (!list) {
    throw new Error("LIST_NOT_FOUND");
  }

  const detail = await persistence.findByIdWithDetails(familyId, input.listId);
  const sortOrder = detail?.sections.length ?? 0;

  return persistence.createSection({
    listId: input.listId,
    name: input.name,
    sortOrder,
  });
}

export async function updateListSection(
  ctx: AuthContext,
  input: z.infer<typeof updateListSectionInput>,
): Promise<ListSection> {
  const familyId = requireFamilyId(ctx);
  const existing = await persistence.findSectionById(familyId, input.id);
  if (!existing) {
    throw new Error("SECTION_NOT_FOUND");
  }

  if (input.name === undefined) {
    return existing;
  }

  const updated = await persistence.updateSection(input.id, { name: input.name });
  if (!updated) {
    throw new Error("SECTION_NOT_FOUND");
  }
  return updated;
}

export async function deleteListSection(
  ctx: AuthContext,
  input: z.infer<typeof deleteListSectionInput>,
): Promise<void> {
  const familyId = requireFamilyId(ctx);
  const existing = await persistence.findSectionById(familyId, input.id);
  if (!existing) {
    throw new Error("SECTION_NOT_FOUND");
  }

  const deleted = await persistence.deleteSection(input.id);
  if (!deleted) {
    throw new Error("SECTION_NOT_FOUND");
  }
}

async function assertSectionInList(
  familyId: string,
  listId: string,
  sectionId: string,
): Promise<void> {
  const section = await persistence.findSectionById(familyId, sectionId);
  if (!section || section.listId !== listId) {
    throw new Error("SECTION_NOT_FOUND");
  }
}

export async function createListItem(
  ctx: AuthContext,
  input: z.infer<typeof createListItemInput>,
): Promise<ListItem> {
  const familyId = requireFamilyId(ctx);
  const list = await persistence.findById(familyId, input.listId);
  if (!list) {
    throw new Error("LIST_NOT_FOUND");
  }

  if (input.sectionId) {
    await assertSectionInList(familyId, input.listId, input.sectionId);
  }

  return persistence.createItem({
    listId: input.listId,
    sectionId: input.sectionId ?? null,
    name: input.name,
    points: input.points,
  });
}

export async function updateListItem(
  ctx: AuthContext,
  input: z.infer<typeof updateListItemInput>,
): Promise<ListItem> {
  const familyId = requireFamilyId(ctx);
  const existing = await persistence.findItemById(familyId, input.id);
  if (!existing) {
    throw new Error("ITEM_NOT_FOUND");
  }

  if (input.sectionId) {
    await assertSectionInList(familyId, existing.listId, input.sectionId);
  }

  const patch: {
    name?: string;
    completed?: boolean;
    points?: number;
    sectionId?: string | null;
    sortOrder?: number;
  } = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.completed !== undefined) patch.completed = input.completed;
  if (input.points !== undefined) patch.points = input.points;
  if (input.sectionId !== undefined) {
    patch.sectionId = input.sectionId;
    if (input.sectionId !== existing.sectionId) {
      patch.sortOrder = await persistence.nextItemSortOrder(
        existing.listId,
        input.sectionId,
      );
    }
  }

  if (Object.keys(patch).length === 0) {
    return existing;
  }

  const updated = await persistence.updateItem(input.id, patch);
  if (!updated) {
    throw new Error("ITEM_NOT_FOUND");
  }
  return updated;
}

export async function deleteListItem(
  ctx: AuthContext,
  input: z.infer<typeof deleteListItemInput>,
): Promise<void> {
  const familyId = requireFamilyId(ctx);
  const existing = await persistence.findItemById(familyId, input.id);
  if (!existing) {
    throw new Error("ITEM_NOT_FOUND");
  }

  const deleted = await persistence.deleteItem(input.id);
  if (!deleted) {
    throw new Error("ITEM_NOT_FOUND");
  }
}

export async function setListItemAssignees(
  ctx: AuthContext,
  input: z.infer<typeof setListItemAssigneesInput>,
): Promise<ListItem> {
  const familyId = requireFamilyId(ctx);
  const existing = await persistence.findItemById(familyId, input.id);
  if (!existing) {
    throw new Error("ITEM_NOT_FOUND");
  }

  const includesAnyone = input.memberIds.includes(ANYONE_ASSIGNEE_ID);
  if (includesAnyone && input.memberIds.length > 1) {
    throw new Error("INVALID_ASSIGNEES");
  }

  if (!includesAnyone && input.memberIds.length > 0) {
    const members = await familiesPersistence.listMembersByFamilyId(familyId);
    const memberIds = new Set(members.map((m) => m.id));
    for (const memberId of input.memberIds) {
      if (!memberIds.has(memberId)) {
        throw new Error("MEMBER_NOT_FOUND");
      }
    }
  }

  const nextAssignees = includesAnyone
    ? [null]
    : (input.memberIds as string[]);
  const updated = await persistence.setItemAssignees(
    familyId,
    input.id,
    nextAssignees,
  );
  if (!updated) {
    throw new Error("ITEM_NOT_FOUND");
  }
  return updated;
}

export async function applyListLayout(
  ctx: AuthContext,
  input: z.infer<typeof applyListLayoutInput>,
): Promise<ListDetail> {
  const familyId = requireFamilyId(ctx);
  const list = await persistence.findByIdWithDetails(familyId, input.listId);
  if (!list) {
    throw new Error("LIST_NOT_FOUND");
  }

  const listSectionIds = new Set(list.sections.map((s) => s.id));
  const inputSectionIds = new Set(input.sectionIds);
  if (
    listSectionIds.size !== inputSectionIds.size ||
    [...listSectionIds].some((id) => !inputSectionIds.has(id))
  ) {
    throw new Error("INVALID_LAYOUT");
  }

  const listItemIds = new Set(list.items.map((i) => i.id));
  const inputItemIds = new Set(input.items.map((i) => i.id));
  if (
    listItemIds.size !== inputItemIds.size ||
    [...listItemIds].some((id) => !inputItemIds.has(id))
  ) {
    throw new Error("INVALID_LAYOUT");
  }

  for (const item of input.items) {
    if (item.sectionId && !listSectionIds.has(item.sectionId)) {
      throw new Error("SECTION_NOT_FOUND");
    }
  }

  await persistence.applyLayout(input.listId, {
    sectionIds: input.sectionIds,
    items: input.items,
  });

  const updated = await persistence.findByIdWithDetails(familyId, input.listId);
  if (!updated) {
    throw new Error("LIST_NOT_FOUND");
  }
  return updated;
}
