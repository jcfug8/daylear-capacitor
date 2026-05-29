/** Label shown in UI for a family member. */
export type MemberNameFields = {
  id: string;
  userId: string | null;
  userName?: string | null;
  displayName: string;
  avatarColor?: string | null;
  avatarIcon?: string | null;
};

export function memberDisplayName(member: MemberNameFields): string {
  if (member.userId && member.userName) {
    return member.userName;
  }
  return member.displayName;
}
