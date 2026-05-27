import type { Session } from "../lib/auth.js";
import * as familiesPersistence from "../families/persistence.js";

export type AuthContext = {
  session: Session | null;
  userId: string | null;
  userEmail: string | null;
  familyId: string | null;
  familyMemberId: string | null;
  memberType: "parent" | "child" | null;
};

export async function authFromSession(
  session: Session | null,
): Promise<AuthContext> {
  const userId = session?.user.id ?? null;
  const userEmail = session?.user.email ?? null;

  if (!userId) {
    return {
      session,
      userId: null,
      userEmail: null,
      familyId: null,
      familyMemberId: null,
      memberType: null,
    };
  }

  const membership = await familiesPersistence.findMembershipByUserId(userId);
  return {
    session,
    userId,
    userEmail,
    familyId: membership?.familyId ?? null,
    familyMemberId: membership?.id ?? null,
    memberType: membership?.memberType ?? null,
  };
}

export function requireUserId(ctx: AuthContext): string {
  if (!ctx.userId) {
    throw new Error("UNAUTHORIZED");
  }
  return ctx.userId;
}

export function requireUserEmail(ctx: AuthContext): string {
  if (!ctx.userEmail) {
    throw new Error("UNAUTHORIZED");
  }
  return ctx.userEmail;
}

export function requireFamilyId(ctx: AuthContext): string {
  if (!ctx.familyId) {
    throw new Error("NO_FAMILY");
  }
  return ctx.familyId;
}

export async function requireNoFamily(userId: string): Promise<void> {
  const membership = await familiesPersistence.findMembershipByUserId(userId);
  if (membership) {
    throw new Error("ALREADY_IN_FAMILY");
  }
}

export function requireParent(ctx: AuthContext): void {
  if (ctx.memberType !== "parent") {
    throw new Error("NOT_PARENT");
  }
}
