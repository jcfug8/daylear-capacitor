import { z } from "zod";
import type { AuthContext } from "../shared/auth-context.js";
import { requireFamilyId } from "../shared/auth-context.js";
import { ANYONE_ASSIGNEE_ID } from "../lists/domain.js";
import * as familiesPersistence from "../families/persistence.js";
import * as listsPersistence from "../lists/persistence.js";

export type AssignedTodoItem = listsPersistence.AssignedTodoItem;

export const applyAssigneeTodoOrderInput = z.object({
  assigneeId: z.union([z.string().uuid(), z.literal(ANYONE_ASSIGNEE_ID)]),
  itemIds: z.array(z.string().uuid()),
});

export async function listAssignedTodos(
  ctx: AuthContext,
): Promise<AssignedTodoItem[]> {
  const familyId = requireFamilyId(ctx);
  return listsPersistence.listAssignedTodosByFamilyId(familyId);
}

export async function applyAssigneeTodoOrder(
  ctx: AuthContext,
  input: z.infer<typeof applyAssigneeTodoOrderInput>,
): Promise<void> {
  const familyId = requireFamilyId(ctx);

  const assigneeId =
    input.assigneeId === ANYONE_ASSIGNEE_ID ? null : input.assigneeId;

  if (assigneeId !== null) {
    const members = await familiesPersistence.listMembersByFamilyId(familyId);
    if (!members.some((m) => m.id === assigneeId)) {
      throw new Error("MEMBER_NOT_FOUND");
    }
  }

  try {
    await listsPersistence.applyAssigneeTodoOrder(
      familyId,
      assigneeId,
      input.itemIds,
    );
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_TODO_ORDER") {
      throw new Error("INVALID_TODO_ORDER");
    }
    throw e;
  }
}
