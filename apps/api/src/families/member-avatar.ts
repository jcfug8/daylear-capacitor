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

export function isMemberAvatarColorKey(value: string): value is MemberAvatarColorKey {
  return (MEMBER_AVATAR_COLOR_KEYS as readonly string[]).includes(value);
}

export function isMemberAvatarIconKey(value: string): value is MemberAvatarIconKey {
  return (MEMBER_AVATAR_ICON_KEYS as readonly string[]).includes(value);
}
