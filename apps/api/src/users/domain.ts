import type { AuthContext } from "../shared/auth-context.js";
import { requireUserId } from "../shared/auth-context.js";
import * as familiesPersistence from "../families/persistence.js";
import * as persistence from "./persistence.js";

export type UserProfile = persistence.UserProfile;

export type UserMembership = {
  id: string;
  familyId: string;
  memberType: "parent" | "child";
  displayName: string;
};

export type MeResponse = UserProfile & {
  membership: UserMembership | null;
};

export async function getMe(ctx: AuthContext): Promise<MeResponse> {
  const userId = requireUserId(ctx);
  const profile = await persistence.findById(userId);
  if (!profile) {
    throw new Error("USER_NOT_FOUND");
  }
  const membership = await familiesPersistence.findMembershipByUserId(userId);
  return {
    ...profile,
    membership: membership
      ? {
          id: membership.id,
          familyId: membership.familyId,
          memberType: membership.memberType,
          displayName: membership.userName ?? profile.name,
        }
      : null,
  };
}
