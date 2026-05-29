import { IonIcon } from "@ionic/react";
import {
  balloonOutline,
  bugOutline,
  cloudOutline,
  diamondOutline,
  fishOutline,
  flowerOutline,
  heartOutline,
  leafOutline,
  moonOutline,
  musicalNotesOutline,
  pawOutline,
  planetOutline,
  rocketOutline,
  snowOutline,
  sparklesOutline,
  starOutline,
  sunnyOutline,
} from "ionicons/icons";
import { memberDisplayName, type MemberNameFields } from "../lib/member-display-name";
import {
  MEMBER_AVATAR_COLOR_STYLES,
  resolveMemberAvatarColor,
  resolveMemberAvatarIcon,
  type MemberAvatarIconKey,
} from "../lib/member-avatar";
import { userFirstInitial } from "../lib/user-display";

export const MEMBER_AVATAR_ICON_MAP: Record<MemberAvatarIconKey, string> = {
  star: starOutline,
  heart: heartOutline,
  leaf: leafOutline,
  sunny: sunnyOutline,
  moon: moonOutline,
  rocket: rocketOutline,
  flower: flowerOutline,
  music: musicalNotesOutline,
  balloon: balloonOutline,
  fish: fishOutline,
  paw: pawOutline,
  planet: planetOutline,
  sparkles: sparklesOutline,
  bug: bugOutline,
  snow: snowOutline,
  diamond: diamondOutline,
  cloud: cloudOutline,
};

const SIZE_CLASS = {
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-base",
  lg: "h-16 w-16 text-2xl",
} as const;

const ICON_SIZE_CLASS = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
} as const;

export type MemberAvatarProps = {
  member: MemberNameFields & {
    avatarColor?: string | null;
    avatarIcon?: string | null;
  };
  size?: keyof typeof SIZE_CLASS;
  anyone?: boolean;
  className?: string;
};

export function MemberAvatar({
  member,
  size = "sm",
  anyone = false,
  className = "",
}: MemberAvatarProps) {
  const name = memberDisplayName(member);
  const colorKey = resolveMemberAvatarColor(member.avatarColor);
  const palette = MEMBER_AVATAR_COLOR_STYLES[colorKey];
  const iconKey = resolveMemberAvatarIcon(member.avatarIcon);

  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-full border font-semibold",
        anyone ? "border-dotted" : "border-solid",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
        borderColor: palette.border,
      }}
      aria-label={name}
      title={name}
    >
      {iconKey ? (
        <IonIcon icon={MEMBER_AVATAR_ICON_MAP[iconKey]} className={ICON_SIZE_CLASS[size]} />
      ) : (
        userFirstInitial(name)
      )}
    </span>
  );
}

export function AnyoneAvatar({
  size = "sm",
  className = "",
}: {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  const palette = MEMBER_AVATAR_COLOR_STYLES.mint;

  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-full border border-dotted font-semibold",
        SIZE_CLASS[size],
        className,
      ].join(" ")}
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
        borderColor: palette.border,
      }}
      aria-label="Anyone"
      title="Anyone"
    >
      A
    </span>
  );
}
