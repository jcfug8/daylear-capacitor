import { z } from "zod";
import type { AuthContext } from "../shared/auth-context.js";
import { requireFamilyId } from "../shared/auth-context.js";
import * as familiesPersistence from "../families/persistence.js";
import * as persistence from "./persistence.js";

export type Reward = persistence.Reward;
export type RewardsBoard = {
  members: persistence.MemberPointsSummary[];
  rewards: persistence.AssignedReward[];
};

const rewardIdInput = z.object({
  id: z.string().uuid(),
});

const rewardPointsSchema = z.number().int().min(0).max(999_999);

export const createRewardInput = z.object({
  name: z.string().min(1).max(500),
  points: rewardPointsSchema.optional(),
  memberIds: z.array(z.string().uuid()).min(1),
});

export const updateRewardInput = rewardIdInput.extend({
  name: z.string().min(1).max(500).optional(),
  points: rewardPointsSchema.optional(),
});

export const deleteRewardInput = rewardIdInput;

export const setRewardAssigneesInput = rewardIdInput.extend({
  memberIds: z.array(z.string().uuid()).min(1),
});

export const redeemRewardInput = z.object({
  memberId: z.string().uuid(),
  rewardId: z.string().uuid(),
});

async function assertMembersInFamily(familyId: string, memberIds: string[]) {
  const members = await familiesPersistence.listMembersByFamilyId(familyId);
  const memberIdSet = new Set(members.map((member) => member.id));
  for (const memberId of memberIds) {
    if (!memberIdSet.has(memberId)) {
      throw new Error("MEMBER_NOT_FOUND");
    }
  }
}

export async function getRewardsBoard(ctx: AuthContext): Promise<RewardsBoard> {
  const familyId = requireFamilyId(ctx);
  const [members, rewards] = await Promise.all([
    persistence.listMemberPointsByFamilyId(familyId),
    persistence.listAssignedByFamilyId(familyId),
  ]);
  return { members, rewards };
}

export async function listRewards(ctx: AuthContext): Promise<Reward[]> {
  const familyId = requireFamilyId(ctx);
  return persistence.listByFamilyId(familyId);
}

export async function createReward(
  ctx: AuthContext,
  input: z.infer<typeof createRewardInput>,
): Promise<Reward> {
  const familyId = requireFamilyId(ctx);
  await assertMembersInFamily(familyId, input.memberIds);
  return persistence.create({
    familyId,
    name: input.name,
    points: input.points ?? 0,
    assigneeIds: input.memberIds,
  });
}

export async function updateReward(
  ctx: AuthContext,
  input: z.infer<typeof updateRewardInput>,
): Promise<Reward> {
  const familyId = requireFamilyId(ctx);
  const existing = await persistence.findById(familyId, input.id);
  if (!existing) {
    throw new Error("REWARD_NOT_FOUND");
  }

  const patch: { name?: string; points?: number } = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.points !== undefined) patch.points = input.points;

  if (Object.keys(patch).length === 0) {
    return existing;
  }

  const updated = await persistence.update(familyId, input.id, patch);
  if (!updated) {
    throw new Error("REWARD_NOT_FOUND");
  }
  return updated;
}

export async function deleteReward(
  ctx: AuthContext,
  input: z.infer<typeof deleteRewardInput>,
): Promise<void> {
  const familyId = requireFamilyId(ctx);
  const deleted = await persistence.deleteById(familyId, input.id);
  if (!deleted) {
    throw new Error("REWARD_NOT_FOUND");
  }
}

export async function setRewardAssignees(
  ctx: AuthContext,
  input: z.infer<typeof setRewardAssigneesInput>,
): Promise<Reward> {
  const familyId = requireFamilyId(ctx);
  await assertMembersInFamily(familyId, input.memberIds);

  const updated = await persistence.setAssignees(familyId, input.id, input.memberIds);
  if (!updated) {
    throw new Error("REWARD_NOT_FOUND");
  }
  return updated;
}

export async function redeemReward(
  ctx: AuthContext,
  input: z.infer<typeof redeemRewardInput>,
): Promise<{ memberPoints: number }> {
  const familyId = requireFamilyId(ctx);
  try {
    return await persistence.redeem(familyId, input.memberId, input.rewardId);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_POINTS") throw error;
      if (error.message === "REWARD_NOT_ASSIGNED") throw error;
      if (error.message === "MEMBER_NOT_FOUND") throw error;
    }
    throw error;
  }
}
