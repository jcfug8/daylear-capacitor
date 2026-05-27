import { z } from "zod";
import type { AuthContext } from "../shared/auth-context.js";
import { requireFamilyId } from "../shared/auth-context.js";
import * as persistence from "./persistence.js";

export type Reward = persistence.Reward;

export const createRewardInput = z.object({
  name: z.string().min(1).max(500),
});

export async function listRewards(ctx: AuthContext): Promise<Reward[]> {
  const familyId = requireFamilyId(ctx);
  return persistence.listByFamilyId(familyId);
}

export async function createReward(
  ctx: AuthContext,
  input: z.infer<typeof createRewardInput>,
): Promise<Reward> {
  const familyId = requireFamilyId(ctx);
  return persistence.create({ familyId, name: input.name });
}
