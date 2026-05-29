export const MEMBER_AVATAR_COLOR_KEYS = [
  "rose",
  "coral",
  "peach",
  "lemon",
  "sand",
  "sage",
  "mint",
  "ocean",
  "sky",
  "lavender",
  "plum",
] as const;

export type MemberAvatarColorKey = (typeof MEMBER_AVATAR_COLOR_KEYS)[number];

export const MEMBER_AVATAR_ICON_KEYS = [
  "star",
  "heart",
  "leaf",
  "sunny",
  "moon",
  "rocket",
  "flower",
  "music",
  "balloon",
  "fish",
  "paw",
  "planet",
  "sparkles",
  "bug",
  "snow",
  "diamond",
  "cloud",
] as const;

export type MemberAvatarIconKey = (typeof MEMBER_AVATAR_ICON_KEYS)[number];

export const DEFAULT_MEMBER_AVATAR_COLOR: MemberAvatarColorKey = "mint";

export const MEMBER_AVATAR_COLOR_STYLES: Record<
  MemberAvatarColorKey,
  { bg: string; text: string; border: string }
> = {
  mint: { bg: "#e3f0ec", text: "#2f5c4a", border: "#dfe6e3" },
  sage: { bg: "#d4e8dc", text: "#2f5c4a", border: "#c5ddd0" },
  sky: { bg: "#dce8f0", text: "#2f4a5c", border: "#cddae6" },
  peach: { bg: "#f5e6dc", text: "#5c4030", border: "#e8d4c8" },
  lavender: { bg: "#e8e0f0", text: "#4a3d5c", border: "#d8cfe6" },
  sand: { bg: "#f0ebe0", text: "#5c5240", border: "#e0d8c8" },
  rose: { bg: "#f5e0e8", text: "#5c3040", border: "#e8cdd8" },
  coral: { bg: "#f5dcd6", text: "#5c3530", border: "#e8c8c0" },
  lemon: { bg: "#f0f0d0", text: "#5c5c30", border: "#e0e0b8" },
  ocean: { bg: "#d0e8e8", text: "#2f5050", border: "#b8d8d8" },
  plum: { bg: "#e8d8e8", text: "#4a3050", border: "#d8c0d8" },
};

export function resolveMemberAvatarColor(
  color: string | null | undefined,
): MemberAvatarColorKey {
  if (color && (MEMBER_AVATAR_COLOR_KEYS as readonly string[]).includes(color)) {
    return color as MemberAvatarColorKey;
  }
  return DEFAULT_MEMBER_AVATAR_COLOR;
}

export function resolveMemberAvatarIcon(
  icon: string | null | undefined,
): MemberAvatarIconKey | null {
  if (icon && (MEMBER_AVATAR_ICON_KEYS as readonly string[]).includes(icon)) {
    return icon as MemberAvatarIconKey;
  }
  return null;
}
