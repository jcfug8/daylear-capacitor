import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { user } from "../db/schema/auth.js";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
};

export async function findById(id: string): Promise<UserProfile | null> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  return rows[0] ?? null;
}
