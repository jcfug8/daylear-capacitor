import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { routines } from "../db/schema/routines.js";

export type Routine = {
  id: string;
  familyId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

function toRoutine(row: typeof routines.$inferSelect): Routine {
  return {
    id: row.id,
    familyId: row.familyId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listByFamilyId(familyId: string): Promise<Routine[]> {
  const rows = await db
    .select()
    .from(routines)
    .where(eq(routines.familyId, familyId))
    .orderBy(desc(routines.createdAt));
  return rows.map(toRoutine);
}

export async function create(input: {
  familyId: string;
  name: string;
}): Promise<Routine> {
  const [row] = await db
    .insert(routines)
    .values({
      familyId: input.familyId,
      name: input.name,
    })
    .returning();
  return toRoutine(row);
}
