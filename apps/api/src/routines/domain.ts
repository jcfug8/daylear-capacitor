import { z } from "zod";
import type { AuthContext } from "../shared/auth-context.js";
import { requireFamilyId } from "../shared/auth-context.js";
import * as persistence from "./persistence.js";

export type Routine = persistence.Routine;

export const createRoutineInput = z.object({
  name: z.string().min(1).max(500),
});

export async function listRoutines(ctx: AuthContext): Promise<Routine[]> {
  const familyId = requireFamilyId(ctx);
  return persistence.listByFamilyId(familyId);
}

export async function createRoutine(
  ctx: AuthContext,
  input: z.infer<typeof createRoutineInput>,
): Promise<Routine> {
  const familyId = requireFamilyId(ctx);
  return persistence.create({ familyId, name: input.name });
}
