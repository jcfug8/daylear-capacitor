import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { familyMember } from "../db/schema/families.js";
import { rewardAssignees, rewards } from "../db/schema/rewards.js";
import { adjustMemberPoints } from "../points/persistence.js";

export type Reward = {
  id: string;
  familyId: string;
  name: string;
  points: number;
  assigneeIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type AssignedReward = {
  id: string;
  name: string;
  points: number;
  assigneeId: string;
};

export type MemberPointsSummary = {
  id: string;
  points: number;
};

function toReward(
  row: typeof rewards.$inferSelect,
  assigneeIds: string[],
): Reward {
  return {
    id: row.id,
    familyId: row.familyId,
    name: row.name,
    points: row.points,
    assigneeIds,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function assigneeIdsByRewardIds(
  rewardIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (rewardIds.length === 0) return map;

  const rows = await db
    .select()
    .from(rewardAssignees)
    .where(inArray(rewardAssignees.rewardId, rewardIds));

  for (const row of rows) {
    const existing = map.get(row.rewardId) ?? [];
    existing.push(row.familyMemberId);
    map.set(row.rewardId, existing);
  }
  return map;
}

export async function listByFamilyId(familyId: string): Promise<Reward[]> {
  const rows = await db
    .select()
    .from(rewards)
    .where(eq(rewards.familyId, familyId))
    .orderBy(desc(rewards.createdAt));

  const assignees = await assigneeIdsByRewardIds(rows.map((row) => row.id));
  return rows.map((row) => toReward(row, assignees.get(row.id) ?? []));
}

export async function listAssignedByFamilyId(
  familyId: string,
): Promise<AssignedReward[]> {
  const rows = await db
    .select({
      id: rewards.id,
      name: rewards.name,
      points: rewards.points,
      assigneeId: rewardAssignees.familyMemberId,
    })
    .from(rewardAssignees)
    .innerJoin(rewards, eq(rewardAssignees.rewardId, rewards.id))
    .where(eq(rewards.familyId, familyId))
    .orderBy(asc(rewards.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    points: row.points,
    assigneeId: row.assigneeId,
  }));
}

export async function listMemberPointsByFamilyId(
  familyId: string,
): Promise<MemberPointsSummary[]> {
  const rows = await db
    .select({ id: familyMember.id, points: familyMember.points })
    .from(familyMember)
    .where(eq(familyMember.familyId, familyId));

  return rows.map((row) => ({ id: row.id, points: row.points }));
}

export async function findById(
  familyId: string,
  rewardId: string,
): Promise<Reward | null> {
  const [row] = await db
    .select()
    .from(rewards)
    .where(and(eq(rewards.id, rewardId), eq(rewards.familyId, familyId)));
  if (!row) return null;

  const assignees = await assigneeIdsByRewardIds([row.id]);
  return toReward(row, assignees.get(row.id) ?? []);
}

export async function create(input: {
  familyId: string;
  name: string;
  points: number;
  assigneeIds: string[];
}): Promise<Reward> {
  const [row] = await db
    .insert(rewards)
    .values({
      familyId: input.familyId,
      name: input.name,
      points: input.points,
    })
    .returning();

  if (input.assigneeIds.length > 0) {
    await db.insert(rewardAssignees).values(
      input.assigneeIds.map((familyMemberId) => ({
        rewardId: row.id,
        familyMemberId,
      })),
    );
  }

  return toReward(row, input.assigneeIds);
}

export async function update(
  familyId: string,
  rewardId: string,
  patch: { name?: string; points?: number },
): Promise<Reward | null> {
  const [row] = await db
    .update(rewards)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(rewards.id, rewardId), eq(rewards.familyId, familyId)))
    .returning();
  if (!row) return null;

  const assignees = await assigneeIdsByRewardIds([row.id]);
  return toReward(row, assignees.get(row.id) ?? []);
}

export async function deleteById(
  familyId: string,
  rewardId: string,
): Promise<boolean> {
  const deleted = await db
    .delete(rewards)
    .where(and(eq(rewards.id, rewardId), eq(rewards.familyId, familyId)))
    .returning();
  return deleted.length > 0;
}

export async function setAssignees(
  familyId: string,
  rewardId: string,
  memberIds: string[],
): Promise<Reward | null> {
  const existing = await findById(familyId, rewardId);
  if (!existing) return null;

  await db.transaction(async (tx) => {
    await tx.delete(rewardAssignees).where(eq(rewardAssignees.rewardId, rewardId));
    if (memberIds.length > 0) {
      await tx.insert(rewardAssignees).values(
        memberIds.map((familyMemberId) => ({
          rewardId,
          familyMemberId,
        })),
      );
    }
  });

  return findById(familyId, rewardId);
}

export async function redeem(
  familyId: string,
  memberId: string,
  rewardId: string,
): Promise<{ memberPoints: number }> {
  const [assignment] = await db
    .select({
      reward: rewards,
    })
    .from(rewardAssignees)
    .innerJoin(rewards, eq(rewardAssignees.rewardId, rewards.id))
    .where(
      and(
        eq(rewards.id, rewardId),
        eq(rewards.familyId, familyId),
        eq(rewardAssignees.familyMemberId, memberId),
      ),
    );

  if (!assignment) {
    throw new Error("REWARD_NOT_ASSIGNED");
  }

  const [member] = await db
    .select({ points: familyMember.points })
    .from(familyMember)
    .where(and(eq(familyMember.id, memberId), eq(familyMember.familyId, familyId)));

  if (!member) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  if (member.points < assignment.reward.points) {
    throw new Error("INSUFFICIENT_POINTS");
  }

  await db.transaction(async (tx) => {
    await adjustMemberPoints(tx, memberId, -assignment.reward.points);
  });

  const [updated] = await db
    .select({ points: familyMember.points })
    .from(familyMember)
    .where(eq(familyMember.id, memberId));

  return { memberPoints: updated?.points ?? 0 };
}
