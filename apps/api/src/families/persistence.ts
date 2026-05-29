import { and, asc, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  family,
  familyJoinPending,
  familyMember,
  user,
} from "../db/schema/index.js";
import { normalizeEmail } from "../shared/email.js";
import { generateJoinCode, joinCodeExpiresAt } from "../shared/join-code.js";

export type Family = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FamilyMember = {
  id: string;
  familyId: string;
  userId: string | null;
  displayName: string;
  /** Auth user name when `userId` is set. */
  userName: string | null;
  memberType: "parent" | "child";
  points: number;
  avatarColor: string | null;
  avatarIcon: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type JoinPending = {
  id: string;
  code: string;
  adultEmail: string;
  joinerEmail: string;
  familyId: string;
  targetMemberId: string | null;
  initiatedBy: "joiner" | "parent";
  invitedMemberType: "parent" | "child" | null;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

function toFamily(row: typeof family.$inferSelect): Family {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toMember(
  row: typeof familyMember.$inferSelect,
  userName: string | null = null,
): FamilyMember {
  return {
    id: row.id,
    familyId: row.familyId,
    userId: row.userId,
    displayName: row.displayName,
    userName,
    memberType: row.memberType,
    points: row.points,
    avatarColor: row.avatarColor,
    avatarIcon: row.avatarIcon,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toJoinPending(row: typeof familyJoinPending.$inferSelect): JoinPending {
  return {
    id: row.id,
    code: row.code,
    adultEmail: row.adultEmail,
    joinerEmail: row.joinerEmail,
    familyId: row.familyId,
    targetMemberId: row.targetMemberId,
    initiatedBy: row.initiatedBy,
    invitedMemberType: row.invitedMemberType,
    expiresAt: row.expiresAt,
    usedAt: row.usedAt,
    createdAt: row.createdAt,
  };
}

export async function findMembershipByUserId(
  userId: string,
): Promise<FamilyMember | null> {
  const rows = await db
    .select({
      member: familyMember,
      userName: user.name,
    })
    .from(familyMember)
    .innerJoin(user, eq(familyMember.userId, user.id))
    .where(eq(familyMember.userId, userId))
    .limit(1);
  return rows[0] ? toMember(rows[0].member, rows[0].userName) : null;
}

export async function findFamilyById(id: string): Promise<Family | null> {
  const rows = await db.select().from(family).where(eq(family.id, id)).limit(1);
  return rows[0] ? toFamily(rows[0]) : null;
}

export async function listMembersByFamilyId(
  familyId: string,
): Promise<FamilyMember[]> {
  const rows = await db
    .select({
      member: familyMember,
      userName: user.name,
    })
    .from(familyMember)
    .leftJoin(user, eq(familyMember.userId, user.id))
    .where(eq(familyMember.familyId, familyId))
    .orderBy(
      sql`case when ${familyMember.memberType} = 'parent' then 0 else 1 end`,
      asc(familyMember.createdAt),
    );
  return rows.map((row) => toMember(row.member, row.userName));
}

export async function countParentsInFamily(familyId: string): Promise<number> {
  const rows = await db
    .select({ id: familyMember.id })
    .from(familyMember)
    .where(
      and(
        eq(familyMember.familyId, familyId),
        eq(familyMember.memberType, "parent"),
      ),
    );
  return rows.length;
}

export async function findParentInFamilyByEmail(
  familyId: string,
  email: string,
): Promise<FamilyMember | null> {
  const authUser = await findUserByEmail(email);
  if (!authUser) return null;
  const rows = await db
    .select()
    .from(familyMember)
    .where(
      and(
        eq(familyMember.familyId, familyId),
        eq(familyMember.userId, authUser.id),
        eq(familyMember.memberType, "parent"),
      ),
    )
    .limit(1);
  return rows[0] ? toMember(rows[0]) : null;
}

export async function findParentFamilyByEmail(
  email: string,
): Promise<{ familyId: string; userId: string } | null> {
  const normalized = normalizeEmail(email);
  const rows = await db
    .select({
      familyId: familyMember.familyId,
      userId: user.id,
    })
    .from(user)
    .innerJoin(familyMember, eq(familyMember.userId, user.id))
    .where(
      and(
        eq(sql`lower(${user.email})`, normalized),
        eq(familyMember.memberType, "parent"),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserByEmail(
  email: string,
): Promise<{ id: string; name: string; email: string } | null> {
  const normalized = normalizeEmail(email);
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(sql`lower(${user.email})`, normalized))
    .limit(1);
  return rows[0] ?? null;
}

export async function createFamilyWithFirstParent(input: {
  name: string;
  userId: string;
  displayName: string;
}): Promise<{ family: Family; member: FamilyMember }> {
  return db.transaction(async (tx) => {
    const [fam] = await tx
      .insert(family)
      .values({ name: input.name })
      .returning();
    const [member] = await tx
      .insert(familyMember)
      .values({
        familyId: fam.id,
        userId: input.userId,
        displayName: input.displayName,
        memberType: "parent",
      })
      .returning();
    return { family: toFamily(fam), member: toMember(member) };
  });
}

export async function invalidatePendingForPair(
  adultEmail: string,
  joinerEmail: string,
): Promise<void> {
  const adult = normalizeEmail(adultEmail);
  const joiner = normalizeEmail(joinerEmail);
  await db
    .update(familyJoinPending)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(familyJoinPending.adultEmail, adult),
        eq(familyJoinPending.joinerEmail, joiner),
        isNull(familyJoinPending.usedAt),
      ),
    );
}

export async function createJoinPending(input: {
  adultEmail: string;
  joinerEmail: string;
  familyId: string;
  initiatedBy: "joiner" | "parent";
  targetMemberId?: string | null;
  invitedMemberType?: "parent" | "child" | null;
}): Promise<JoinPending> {
  const adult = normalizeEmail(input.adultEmail);
  const joiner = normalizeEmail(input.joinerEmail);
  await invalidatePendingForPair(adult, joiner);
  const [row] = await db
    .insert(familyJoinPending)
    .values({
      code: generateJoinCode(),
      adultEmail: adult,
      joinerEmail: joiner,
      familyId: input.familyId,
      targetMemberId: input.targetMemberId ?? null,
      initiatedBy: input.initiatedBy,
      invitedMemberType: input.invitedMemberType ?? null,
      expiresAt: joinCodeExpiresAt(),
    })
    .returning();
  return toJoinPending(row);
}

export async function findActivePending(input: {
  adultEmail: string;
  joinerEmail: string;
  code: string;
  initiatedBy: "joiner" | "parent";
}): Promise<JoinPending | null> {
  const adult = normalizeEmail(input.adultEmail);
  const joiner = normalizeEmail(input.joinerEmail);
  const now = new Date();
  const rows = await db
    .select()
    .from(familyJoinPending)
    .where(
      and(
        eq(familyJoinPending.adultEmail, adult),
        eq(familyJoinPending.joinerEmail, joiner),
        eq(familyJoinPending.code, input.code),
        eq(familyJoinPending.initiatedBy, input.initiatedBy),
        isNull(familyJoinPending.usedAt),
        gt(familyJoinPending.expiresAt, now),
      ),
    )
    .limit(1);
  return rows[0] ? toJoinPending(rows[0]) : null;
}

export async function findPendingByCode(input: {
  adultEmail: string;
  joinerEmail: string;
  code: string;
  initiatedBy: "joiner" | "parent";
}): Promise<JoinPending | null> {
  const adult = normalizeEmail(input.adultEmail);
  const joiner = normalizeEmail(input.joinerEmail);
  const rows = await db
    .select()
    .from(familyJoinPending)
    .where(
      and(
        eq(familyJoinPending.adultEmail, adult),
        eq(familyJoinPending.joinerEmail, joiner),
        eq(familyJoinPending.code, input.code),
        eq(familyJoinPending.initiatedBy, input.initiatedBy),
      ),
    )
    .orderBy(desc(familyJoinPending.createdAt))
    .limit(1);
  return rows[0] ? toJoinPending(rows[0]) : null;
}

export async function findMembershipByUserEmailInFamily(
  email: string,
  familyId: string,
): Promise<FamilyMember | null> {
  const authUser = await findUserByEmail(email);
  if (!authUser) return null;
  const membership = await findMembershipByUserId(authUser.id);
  if (!membership || membership.familyId !== familyId) {
    return null;
  }
  return membership;
}

export async function markPendingUsed(id: string): Promise<void> {
  await db
    .update(familyJoinPending)
    .set({ usedAt: new Date() })
    .where(eq(familyJoinPending.id, id));
}

export async function addMemberWithLogin(input: {
  familyId: string;
  userId: string;
  displayName: string;
  memberType?: "parent" | "child";
}): Promise<FamilyMember> {
  const [row] = await db
    .insert(familyMember)
    .values({
      familyId: input.familyId,
      userId: input.userId,
      displayName: input.displayName,
      memberType: input.memberType ?? "parent",
    })
    .returning();
  return toMember(row);
}

export async function linkMemberToUser(input: {
  memberId: string;
  familyId: string;
  userId: string;
}): Promise<FamilyMember> {
  const [row] = await db
    .update(familyMember)
    .set({ userId: input.userId, updatedAt: new Date() })
    .where(
      and(
        eq(familyMember.id, input.memberId),
        eq(familyMember.familyId, input.familyId),
        isNull(familyMember.userId),
      ),
    )
    .returning();
  if (!row) {
    throw new Error("MEMBER_LINK_FAILED");
  }
  return toMember(row);
}

export async function createMemberWithoutLogin(input: {
  familyId: string;
  displayName: string;
  memberType: "parent" | "child";
}): Promise<FamilyMember> {
  const [row] = await db
    .insert(familyMember)
    .values({
      familyId: input.familyId,
      userId: null,
      displayName: input.displayName,
      memberType: input.memberType,
    })
    .returning();
  return toMember(row);
}

export async function removeMember(input: {
  memberId: string;
  familyId: string;
}): Promise<boolean> {
  const rows = await db
    .delete(familyMember)
    .where(
      and(
        eq(familyMember.id, input.memberId),
        eq(familyMember.familyId, input.familyId),
      ),
    )
    .returning();
  return rows.length > 0;
}

export async function findMemberById(
  memberId: string,
): Promise<FamilyMember | null> {
  const rows = await db
    .select({
      member: familyMember,
      userName: user.name,
    })
    .from(familyMember)
    .leftJoin(user, eq(familyMember.userId, user.id))
    .where(eq(familyMember.id, memberId))
    .limit(1);
  return rows[0] ? toMember(rows[0].member, rows[0].userName) : null;
}

export async function updateMember(input: {
  memberId: string;
  familyId: string;
  patch: {
    displayName?: string;
    memberType?: "parent" | "child";
    avatarColor?: string | null;
    avatarIcon?: string | null;
  };
}): Promise<FamilyMember | null> {
  const set: Partial<typeof familyMember.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.patch.displayName !== undefined) {
    set.displayName = input.patch.displayName;
  }
  if (input.patch.memberType !== undefined) {
    set.memberType = input.patch.memberType;
  }
  if (input.patch.avatarColor !== undefined) {
    set.avatarColor = input.patch.avatarColor;
  }
  if (input.patch.avatarIcon !== undefined) {
    set.avatarIcon = input.patch.avatarIcon;
  }

  const [row] = await db
    .update(familyMember)
    .set(set)
    .where(
      and(
        eq(familyMember.id, input.memberId),
        eq(familyMember.familyId, input.familyId),
      ),
    )
    .returning();

  if (!row) return null;
  return findMemberById(input.memberId);
}

export async function unlinkMemberLogin(input: {
  memberId: string;
  familyId: string;
}): Promise<FamilyMember | null> {
  const [row] = await db
    .update(familyMember)
    .set({ userId: null, updatedAt: new Date() })
    .where(
      and(
        eq(familyMember.id, input.memberId),
        eq(familyMember.familyId, input.familyId),
      ),
    )
    .returning();

  if (!row) return null;
  return findMemberById(input.memberId);
}

/** @deprecated use createFamilyWithFirstParent */
export const createFamilyWithOwner = createFamilyWithFirstParent;
