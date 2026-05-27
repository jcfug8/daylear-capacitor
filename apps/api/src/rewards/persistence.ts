import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { rewards } from "../db/schema/rewards.js";

export type Reward = {
  id: string;
  familyId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

function toReward(row: typeof rewards.$inferSelect): Reward {
  return {
    id: row.id,
    familyId: row.familyId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listByFamilyId(familyId: string): Promise<Reward[]> {
  const rows = await db
    .select()
    .from(rewards)
    .where(eq(rewards.familyId, familyId))
    .orderBy(desc(rewards.createdAt));
  return rows.map(toReward);
}

export async function create(input: {
  familyId: string;
  name: string;
}): Promise<Reward> {
  const [row] = await db
    .insert(rewards)
    .values({
      familyId: input.familyId,
      name: input.name,
    })
    .returning();
  return toReward(row);
}
