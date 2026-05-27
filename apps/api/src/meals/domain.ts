import { z } from "zod";
import type { AuthContext } from "../shared/auth-context.js";
import { requireFamilyId } from "../shared/auth-context.js";
import * as persistence from "./persistence.js";

export type Meal = persistence.Meal;

export const createMealInput = z.object({
  name: z.string().min(1).max(500),
});

export async function listMeals(ctx: AuthContext): Promise<Meal[]> {
  const familyId = requireFamilyId(ctx);
  return persistence.listByFamilyId(familyId);
}

export async function createMeal(
  ctx: AuthContext,
  input: z.infer<typeof createMealInput>,
): Promise<Meal> {
  const familyId = requireFamilyId(ctx);
  return persistence.create({ familyId, name: input.name });
}
