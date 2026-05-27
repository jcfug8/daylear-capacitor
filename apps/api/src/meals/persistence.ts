import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { meals } from "../db/schema/meals.js";

export type Meal = {
  id: string;
  familyId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

function toMeal(row: typeof meals.$inferSelect): Meal {
  return {
    id: row.id,
    familyId: row.familyId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listByFamilyId(familyId: string): Promise<Meal[]> {
  const rows = await db
    .select()
    .from(meals)
    .where(eq(meals.familyId, familyId))
    .orderBy(desc(meals.createdAt));
  return rows.map(toMeal);
}

export async function create(input: {
  familyId: string;
  name: string;
}): Promise<Meal> {
  const [row] = await db
    .insert(meals)
    .values({
      familyId: input.familyId,
      name: input.name,
    })
    .returning();
  return toMeal(row);
}
