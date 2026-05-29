import { z } from "zod";
import type { AuthContext } from "../shared/auth-context.js";
import {
  requireParent,
  requireFamilyId,
  requireNoFamily,
  requireUserEmail,
  requireUserId,
} from "../shared/auth-context.js";
import { normalizeEmail } from "../shared/email.js";
import {
  isMemberAvatarColorKey,
  isMemberAvatarIconKey,
  MEMBER_AVATAR_COLOR_KEYS,
  MEMBER_AVATAR_ICON_KEYS,
} from "./member-avatar.js";
import * as persistence from "./persistence.js";

export type FamilyCurrent = {
  family: persistence.Family;
  members: persistence.FamilyMember[];
  myMembership: persistence.FamilyMember;
};

export const createFamilyInput = z.object({
  name: z.string().min(1).max(200).optional(),
});

export const adultEmailInput = z.object({
  adultEmail: z.string().email(),
});

export const joinerEmailInput = z.object({
  joinerEmail: z.string().email(),
});

export const requestFamilyInviteInput = z.object({
  joinerEmail: z.string().email(),
  adultEmail: z.string().email(),
  memberType: z.enum(["parent", "child"]),
});

export const inviteLoginInput = z.object({
  memberId: z.string().uuid(),
  joinerEmail: z.string().email(),
});

export const completeJoinInput = z.object({
  adultEmail: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const confirmJoinByCodeInput = z.object({
  joinerEmail: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const createMemberInput = z.object({
  displayName: z.string().min(1).max(200),
  memberType: z.enum(["parent", "child"]),
});

export const removeMemberInput = z.object({
  memberId: z.string().uuid(),
});

export const updateMemberInput = z.object({
  memberId: z.string().uuid(),
  displayName: z.string().min(1).max(200).optional(),
  memberType: z.enum(["parent", "child"]).optional(),
  avatarColor: z.enum(MEMBER_AVATAR_COLOR_KEYS).nullable().optional(),
  avatarIcon: z.enum(MEMBER_AVATAR_ICON_KEYS).nullable().optional(),
});

export const unlinkMemberLoginInput = z.object({
  memberId: z.string().uuid(),
});

export const joinStatusInput = z.object({
  adultEmail: z.string().email(),
  joinerEmail: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/),
  initiatedBy: z.enum(["joiner", "parent"]),
});

export type JoinStatus = "pending" | "completed" | "expired" | "not_found";

export type JoinCodeResult = {
  code: string;
  expiresAt: Date;
  adultEmail: string;
  joinerEmail: string;
};

export async function getCurrent(ctx: AuthContext): Promise<FamilyCurrent | null> {
  const userId = requireUserId(ctx);
  const membership = await persistence.findMembershipByUserId(userId);
  if (!membership) return null;
  const fam = await persistence.findFamilyById(membership.familyId);
  if (!fam) return null;
  const members = await persistence.listMembersByFamilyId(fam.id);
  return { family: fam, members, myMembership: membership };
}

export async function createFamily(
  ctx: AuthContext,
  input: z.infer<typeof createFamilyInput>,
): Promise<FamilyCurrent> {
  const userId = requireUserId(ctx);
  await requireNoFamily(userId);
  const profile = await persistence.findUserByEmail(requireUserEmail(ctx));
  const displayName = profile?.name ?? "User";
  const name = input.name?.trim() || `${displayName}'s family`;
  const { family: fam, member } = await persistence.createFamilyWithFirstParent({
    name,
    userId,
    displayName,
  });
  return {
    family: fam,
    members: [member],
    myMembership: member,
  };
}

export async function requestJoin(
  ctx: AuthContext,
  input: z.infer<typeof adultEmailInput>,
): Promise<JoinCodeResult> {
  const userId = requireUserId(ctx);
  const joinerEmail = requireUserEmail(ctx);
  await requireNoFamily(userId);
  const parent = await persistence.findParentFamilyByEmail(input.adultEmail);
  if (!parent) {
    throw new Error("PARENT_NOT_FOUND");
  }
  const pending = await persistence.createJoinPending({
    adultEmail: input.adultEmail,
    joinerEmail,
    familyId: parent.familyId,
    initiatedBy: "joiner",
    invitedMemberType: "child",
  });
  return {
    code: pending.code,
    expiresAt: pending.expiresAt,
    adultEmail: pending.adultEmail,
    joinerEmail: pending.joinerEmail,
  };
}

export async function inviteByEmail(
  ctx: AuthContext,
  input: z.infer<typeof joinerEmailInput>,
): Promise<JoinCodeResult> {
  requireParent(ctx);
  const familyId = requireFamilyId(ctx);
  const adultEmail = requireUserEmail(ctx);
  const joinerEmail = normalizeEmail(input.joinerEmail);
  const existingUser = await persistence.findUserByEmail(joinerEmail);
  if (existingUser) {
    const membership = await persistence.findMembershipByUserId(existingUser.id);
    if (membership) {
      throw new Error("ALREADY_IN_FAMILY");
    }
  }
  const pending = await persistence.createJoinPending({
    adultEmail,
    joinerEmail,
    familyId,
    initiatedBy: "parent",
    invitedMemberType: "child",
  });
  return {
    code: pending.code,
    expiresAt: pending.expiresAt,
    adultEmail: pending.adultEmail,
    joinerEmail: pending.joinerEmail,
  };
}

export async function requestFamilyInvite(
  ctx: AuthContext,
  input: z.infer<typeof requestFamilyInviteInput>,
): Promise<JoinCodeResult> {
  const familyId = requireFamilyId(ctx);
  const adultEmail = normalizeEmail(input.adultEmail);
  const joinerEmail = normalizeEmail(input.joinerEmail);

  const confirmingParent = await persistence.findParentInFamilyByEmail(
    familyId,
    adultEmail,
  );
  if (!confirmingParent) {
    throw new Error("PARENT_NOT_IN_FAMILY");
  }

  const existingUser = await persistence.findUserByEmail(joinerEmail);
  if (existingUser) {
    const membership = await persistence.findMembershipByUserId(existingUser.id);
    if (membership) {
      throw new Error("ALREADY_IN_FAMILY");
    }
  }

  const pending = await persistence.createJoinPending({
    adultEmail,
    joinerEmail,
    familyId,
    initiatedBy: "joiner",
    invitedMemberType: input.memberType,
  });
  return {
    code: pending.code,
    expiresAt: pending.expiresAt,
    adultEmail: pending.adultEmail,
    joinerEmail: pending.joinerEmail,
  };
}

export async function inviteLoginForMember(
  ctx: AuthContext,
  input: z.infer<typeof inviteLoginInput>,
): Promise<JoinCodeResult> {
  requireParent(ctx);
  const familyId = requireFamilyId(ctx);
  const adultEmail = requireUserEmail(ctx);
  const joinerEmail = normalizeEmail(input.joinerEmail);

  const target = await persistence.findMemberById(input.memberId);
  if (!target || target.familyId !== familyId) {
    throw new Error("MEMBER_NOT_FOUND");
  }
  if (target.userId) {
    throw new Error("MEMBER_ALREADY_HAS_LOGIN");
  }

  const existingUser = await persistence.findUserByEmail(joinerEmail);
  if (existingUser) {
    const membership = await persistence.findMembershipByUserId(existingUser.id);
    if (membership) {
      throw new Error("ALREADY_IN_FAMILY");
    }
  }

  const pending = await persistence.createJoinPending({
    adultEmail,
    joinerEmail,
    familyId,
    initiatedBy: "parent",
    targetMemberId: target.id,
  });
  return {
    code: pending.code,
    expiresAt: pending.expiresAt,
    adultEmail: pending.adultEmail,
    joinerEmail: pending.joinerEmail,
  };
}

async function finalizeJoin(input: {
  pending: persistence.JoinPending;
  joinerUserId: string;
  joinerDisplayName: string;
}): Promise<persistence.FamilyMember | FamilyCurrent> {
  if (input.pending.targetMemberId) {
    const linked = await persistence.linkMemberToUser({
      memberId: input.pending.targetMemberId,
      familyId: input.pending.familyId,
      userId: input.joinerUserId,
    });
    await persistence.markPendingUsed(input.pending.id);
    return linked;
  }

  const memberType =
    input.pending.invitedMemberType ??
    (input.pending.initiatedBy === "parent" ? "child" : "child");

  await persistence.addMemberWithLogin({
    familyId: input.pending.familyId,
    userId: input.joinerUserId,
    displayName: input.joinerDisplayName,
    memberType,
  });
  await persistence.markPendingUsed(input.pending.id);
  const membership = await persistence.findMembershipByUserId(input.joinerUserId);
  const fam = await persistence.findFamilyById(input.pending.familyId);
  if (!membership || !fam) {
    throw new Error("JOIN_FAILED");
  }
  const members = await persistence.listMembersByFamilyId(fam.id);
  return { family: fam, members, myMembership: membership };
}

export async function completeJoin(
  ctx: AuthContext,
  input: z.infer<typeof completeJoinInput>,
): Promise<FamilyCurrent> {
  const userId = requireUserId(ctx);
  const joinerEmail = requireUserEmail(ctx);
  const pending =
    (await persistence.findActivePending({
      adultEmail: input.adultEmail,
      joinerEmail,
      code: input.code,
      initiatedBy: "parent",
    })) ??
    (await persistence.findActivePending({
      adultEmail: input.adultEmail,
      joinerEmail,
      code: input.code,
      initiatedBy: "joiner",
    }));
  if (!pending) {
    throw new Error("INVALID_OR_EXPIRED_CODE");
  }

  if (pending.initiatedBy === "joiner") {
    if (pending.invitedMemberType !== "parent") {
      throw new Error("INVALID_OR_EXPIRED_CODE");
    }
    await requireNoFamily(userId);
  } else if (pending.targetMemberId) {
    const existing = await persistence.findMembershipByUserId(userId);
    if (existing) {
      throw new Error("ALREADY_IN_FAMILY");
    }
  } else {
    await requireNoFamily(userId);
  }

  const profile = await persistence.findUserByEmail(joinerEmail);
  if (!profile) {
    throw new Error("UNAUTHORIZED");
  }

  const result = await finalizeJoin({
    pending,
    joinerUserId: userId,
    joinerDisplayName: profile.name,
  });

  if ("family" in result) {
    return result;
  }

  const membership = await persistence.findMembershipByUserId(userId);
  const fam = await persistence.findFamilyById(pending.familyId);
  if (!membership || !fam) {
    throw new Error("JOIN_FAILED");
  }
  const members = await persistence.listMembersByFamilyId(fam.id);
  return { family: fam, members, myMembership: membership };
}

export async function confirmJoinByCode(
  ctx: AuthContext,
  input: z.infer<typeof confirmJoinByCodeInput>,
): Promise<persistence.FamilyMember> {
  requireParent(ctx);
  const familyId = requireFamilyId(ctx);
  const adultEmail = requireUserEmail(ctx);
  const joinerEmail = normalizeEmail(input.joinerEmail);
  const pending = await persistence.findActivePending({
    adultEmail,
    joinerEmail,
    code: input.code,
    initiatedBy: "joiner",
  });
  if (!pending || pending.familyId !== familyId) {
    throw new Error("INVALID_OR_EXPIRED_CODE");
  }
  const joiner = await persistence.findUserByEmail(joinerEmail);
  if (!joiner) {
    throw new Error("JOINER_NOT_FOUND");
  }

  if (!pending.targetMemberId) {
    const existing = await persistence.findMembershipByUserId(joiner.id);
    if (existing) {
      throw new Error("ALREADY_IN_FAMILY");
    }
  }

  const result = await finalizeJoin({
    pending,
    joinerUserId: joiner.id,
    joinerDisplayName: joiner.name,
  });

  if ("family" in result) {
    return result.myMembership;
  }
  return result;
}

async function isJoinCompleted(
  pending: persistence.JoinPending,
  familyId: string,
): Promise<boolean> {
  if (pending.targetMemberId) {
    const target = await persistence.findMemberById(pending.targetMemberId);
    return Boolean(target?.userId);
  }
  const joined = await persistence.findMembershipByUserEmailInFamily(
    pending.joinerEmail,
    familyId,
  );
  return Boolean(joined);
}

export async function getJoinStatus(
  ctx: AuthContext,
  input: z.infer<typeof joinStatusInput>,
): Promise<{ status: JoinStatus }> {
  const adultEmail = normalizeEmail(input.adultEmail);
  const joinerEmail = normalizeEmail(input.joinerEmail);

  if (input.initiatedBy === "joiner") {
    const email = normalizeEmail(requireUserEmail(ctx));
    if (email === joinerEmail) {
      const membership = await persistence.findMembershipByUserId(requireUserId(ctx));
      if (membership) {
        return { status: "completed" };
      }
    } else if (!ctx.familyId) {
      throw new Error("UNAUTHORIZED");
    }
  } else {
    requireParent(ctx);
    const familyId = requireFamilyId(ctx);
    const email = requireUserEmail(ctx);
    if (email !== adultEmail) {
      throw new Error("UNAUTHORIZED");
    }
    const pendingEarly = await persistence.findPendingByCode({
      adultEmail,
      joinerEmail,
      code: input.code,
      initiatedBy: input.initiatedBy,
    });
    if (pendingEarly && (await isJoinCompleted(pendingEarly, familyId))) {
      return { status: "completed" };
    }
  }

  const pending = await persistence.findPendingByCode({
    adultEmail,
    joinerEmail,
    code: input.code,
    initiatedBy: input.initiatedBy,
  });

  if (!pending) {
    return { status: "not_found" };
  }
  if (pending.usedAt) {
    return { status: "completed" };
  }
  if (pending.expiresAt.getTime() <= Date.now()) {
    return { status: "expired" };
  }
  if (input.initiatedBy === "parent") {
    const familyId = requireFamilyId(ctx);
    if (await isJoinCompleted(pending, familyId)) {
      return { status: "completed" };
    }
  }
  if (input.initiatedBy === "joiner" && ctx.familyId) {
    if (pending.familyId !== ctx.familyId) {
      throw new Error("UNAUTHORIZED");
    }
    if (await isJoinCompleted(pending, ctx.familyId)) {
      return { status: "completed" };
    }
  }
  return { status: "pending" };
}

export async function createMemberWithoutLogin(
  ctx: AuthContext,
  input: z.infer<typeof createMemberInput>,
): Promise<persistence.FamilyMember> {
  requireParent(ctx);
  const familyId = requireFamilyId(ctx);
  return persistence.createMemberWithoutLogin({
    familyId,
    displayName: input.displayName.trim(),
    memberType: input.memberType,
  });
}

export async function removeMember(
  ctx: AuthContext,
  input: z.infer<typeof removeMemberInput>,
): Promise<void> {
  const familyId = requireFamilyId(ctx);
  const myMemberId = ctx.familyMemberId;
  if (!myMemberId) {
    throw new Error("UNAUTHORIZED");
  }

  const target = await persistence.findMemberById(input.memberId);
  if (!target || target.familyId !== familyId) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  if (target.id === myMemberId) {
    if (target.memberType === "parent") {
      const parentCount = await persistence.countParentsInFamily(familyId);
      if (parentCount <= 1) {
        throw new Error("LAST_PARENT_CANNOT_LEAVE");
      }
    }
  } else {
    requireParent(ctx);
  }

  const removed = await persistence.removeMember({
    memberId: input.memberId,
    familyId,
  });
  if (!removed) {
    throw new Error("MEMBER_NOT_FOUND");
  }
}

function assertAvatarPatch(input: z.infer<typeof updateMemberInput>): void {
  if (
    input.avatarColor !== undefined &&
    input.avatarColor !== null &&
    !isMemberAvatarColorKey(input.avatarColor)
  ) {
    throw new Error("INVALID_AVATAR");
  }
  if (
    input.avatarIcon !== undefined &&
    input.avatarIcon !== null &&
    !isMemberAvatarIconKey(input.avatarIcon)
  ) {
    throw new Error("INVALID_AVATAR");
  }
}

export async function updateMember(
  ctx: AuthContext,
  input: z.infer<typeof updateMemberInput>,
): Promise<persistence.FamilyMember> {
  const familyId = requireFamilyId(ctx);
  const myMemberId = ctx.familyMemberId;
  if (!myMemberId) {
    throw new Error("UNAUTHORIZED");
  }

  assertAvatarPatch(input);

  const target = await persistence.findMemberById(input.memberId);
  if (!target || target.familyId !== familyId) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  const isSelf = target.id === myMemberId;
  const isParent = ctx.memberType === "parent";

  if (!isSelf && !isParent) {
    throw new Error("NOT_PARENT");
  }

  if (input.memberType !== undefined && !isParent) {
    throw new Error("NOT_PARENT");
  }

  if (input.memberType === "child" && target.memberType === "parent") {
    const parentCount = await persistence.countParentsInFamily(familyId);
    if (parentCount <= 1) {
      throw new Error("LAST_PARENT_CANNOT_LEAVE");
    }
  }

  const patch: {
    displayName?: string;
    memberType?: "parent" | "child";
    avatarColor?: string | null;
    avatarIcon?: string | null;
  } = {};

  if (input.displayName !== undefined) {
    patch.displayName = input.displayName.trim();
  }
  if (input.memberType !== undefined) {
    patch.memberType = input.memberType;
  }
  if (input.avatarColor !== undefined) {
    patch.avatarColor = input.avatarColor;
  }
  if (input.avatarIcon !== undefined) {
    patch.avatarIcon = input.avatarIcon;
  }

  if (Object.keys(patch).length === 0) {
    return target;
  }

  const updated = await persistence.updateMember({
    memberId: input.memberId,
    familyId,
    patch,
  });
  if (!updated) {
    throw new Error("MEMBER_NOT_FOUND");
  }
  return updated;
}

export async function unlinkMemberLogin(
  ctx: AuthContext,
  input: z.infer<typeof unlinkMemberLoginInput>,
): Promise<persistence.FamilyMember> {
  requireParent(ctx);
  const familyId = requireFamilyId(ctx);

  const target = await persistence.findMemberById(input.memberId);
  if (!target || target.familyId !== familyId) {
    throw new Error("MEMBER_NOT_FOUND");
  }
  if (!target.userId) {
    throw new Error("MEMBER_HAS_NO_LOGIN");
  }

  const updated = await persistence.unlinkMemberLogin({
    memberId: input.memberId,
    familyId,
  });
  if (!updated) {
    throw new Error("MEMBER_NOT_FOUND");
  }
  return updated;
}
