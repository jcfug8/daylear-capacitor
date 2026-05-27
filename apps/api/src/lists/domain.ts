import { z } from "zod";
import type { AuthContext } from "../shared/auth-context.js";
import { requireFamilyId } from "../shared/auth-context.js";
import * as persistence from "./persistence.js";

export type List = persistence.List;

export const createListInput = z.object({
  name: z.string().min(1).max(500),
});

export async function listLists(ctx: AuthContext): Promise<List[]> {
  const familyId = requireFamilyId(ctx);
  return persistence.listByFamilyId(familyId);
}

export async function createList(
  ctx: AuthContext,
  input: z.infer<typeof createListInput>,
): Promise<List> {
  const familyId = requireFamilyId(ctx);
  return persistence.create({ familyId, name: input.name });
}
