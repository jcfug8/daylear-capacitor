import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { lists } from "../db/schema/lists.js";

export type List = {
  id: string;
  familyId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

function toList(row: typeof lists.$inferSelect): List {
  return {
    id: row.id,
    familyId: row.familyId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listByFamilyId(familyId: string): Promise<List[]> {
  const rows = await db
    .select()
    .from(lists)
    .where(eq(lists.familyId, familyId))
    .orderBy(desc(lists.createdAt));
  return rows.map(toList);
}

export async function create(input: {
  familyId: string;
  name: string;
}): Promise<List> {
  const [row] = await db
    .insert(lists)
    .values({
      familyId: input.familyId,
      name: input.name,
    })
    .returning();
  return toList(row);
}
