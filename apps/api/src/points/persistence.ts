import { eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { familyMember } from "../db/schema/families.js";

type DbExecutor = Pick<typeof db, "update">;

export async function adjustMemberPoints(
  executor: DbExecutor,
  memberId: string,
  delta: number,
): Promise<void> {
  if (delta === 0) return;

  await executor
    .update(familyMember)
    .set({
      points: sql`GREATEST(0, ${familyMember.points} + ${delta})`,
      updatedAt: new Date(),
    })
    .where(eq(familyMember.id, memberId));
}

export async function getMemberPoints(memberId: string): Promise<number | null> {
  const [row] = await db
    .select({ points: familyMember.points })
    .from(familyMember)
    .where(eq(familyMember.id, memberId));
  return row?.points ?? null;
}
