import { IonIcon, IonPopover } from "@ionic/react";
import { useRef, useState, type MouseEvent } from "react";
import { MEMBER_AVATAR_ICON_MAP } from "../../components/MemberAvatar";
import { LIST_ITEM_CARD } from "../lists/lib/list-item-card-styles";
import {
  DEFAULT_MEMBER_AVATAR_COLOR,
  MEMBER_AVATAR_COLOR_KEYS,
  MEMBER_AVATAR_COLOR_STYLES,
  MEMBER_AVATAR_ICON_KEYS,
  type MemberAvatarColorKey,
  type MemberAvatarIconKey,
} from "../../lib/member-avatar";
import { userFirstInitial } from "../../lib/user-display";

type MemberAvatarPickerProps = {
  name: string;
  avatarColor: MemberAvatarColorKey;
  avatarIcon: MemberAvatarIconKey | null;
  disabled?: boolean;
  onColorChange: (color: MemberAvatarColorKey) => void;
  onIconChange: (icon: MemberAvatarIconKey | null) => void;
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function MemberAvatarPicker({
  name,
  avatarColor,
  avatarIcon,
  disabled,
  onColorChange,
  onIconChange,
}: MemberAvatarPickerProps) {
  const palette = MEMBER_AVATAR_COLOR_STYLES[avatarColor];
  const initial = userFirstInitial(name);
  const colorPopoverRef = useRef<HTMLIonPopoverElement>(null);
  const iconPopoverRef = useRef<HTMLIonPopoverElement>(null);
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [iconPopoverOpen, setIconPopoverOpen] = useState(false);
  const [colorPopoverEvent, setColorPopoverEvent] = useState<MouseEvent | undefined>();
  const [iconPopoverEvent, setIconPopoverEvent] = useState<MouseEvent | undefined>();

  function selectColor(key: MemberAvatarColorKey) {
    onColorChange(key);
    void colorPopoverRef.current?.dismiss();
  }

  function selectIcon(key: MemberAvatarIconKey | null) {
    onIconChange(key);
    void iconPopoverRef.current?.dismiss();
  }

  return (
    <div className="mb-4 flex flex-col items-center gap-4">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full border text-2xl font-semibold"
        style={{
          backgroundColor: palette.bg,
          color: palette.text,
          borderColor: palette.border,
        }}
      >
        {avatarIcon ? (
          <IonIcon icon={MEMBER_AVATAR_ICON_MAP[avatarIcon]} className="text-2xl" />
        ) : (
          initial
        )}
      </span>

      <div className="grid w-full grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            if (!disabled) {
              setColorPopoverEvent(event);
              setColorPopoverOpen(true);
            }
          }}
          className={[
            "flex flex-col items-center gap-2 px-3 py-3 text-left",
            LIST_ITEM_CARD,
            disabled ? "cursor-default" : "cursor-pointer active:opacity-80",
          ].join(" ")}
        >
          <span className="m-0 w-full text-center text-xs font-medium text-[var(--ion-color-medium)]">
            Color
          </span>
          <span
            className="h-10 w-10 rounded-full border-2"
            style={{
              backgroundColor: palette.bg,
              borderColor: palette.text,
            }}
            aria-hidden
          />
          <span className="m-0 text-xs font-medium text-[var(--ion-text-color)]">
            {capitalize(avatarColor)}
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            if (!disabled) {
              setIconPopoverEvent(event);
              setIconPopoverOpen(true);
            }
          }}
          className={[
            "flex flex-col items-center gap-2 px-3 py-3 text-left",
            LIST_ITEM_CARD,
            disabled ? "cursor-default" : "cursor-pointer active:opacity-80",
          ].join(" ")}
        >
          <span className="m-0 w-full text-center text-xs font-medium text-[var(--ion-color-medium)]">
            Icon
          </span>
          <span
            className="flex h-10 w-10 items-center justify-center text-base font-semibold text-[#2f5c4a]"
            aria-hidden
          >
            {avatarIcon ? (
              <IonIcon icon={MEMBER_AVATAR_ICON_MAP[avatarIcon]} className="text-3xl" />
            ) : (
              initial
            )}
          </span>
          <span className="m-0 text-xs font-medium text-[var(--ion-text-color)]">
            {avatarIcon ? capitalize(avatarIcon) : "Initial"}
          </span>
        </button>
      </div>

      {!disabled && (
        <>
          <IonPopover
            ref={colorPopoverRef}
            isOpen={colorPopoverOpen}
            event={colorPopoverEvent}
            onDidDismiss={() => setColorPopoverOpen(false)}
          >
            <div className="p-4">
              <p className="m-0 mb-3 text-sm font-medium text-[var(--ion-text-color)]">
                Choose a color
              </p>
              <div className="flex flex-nowrap justify-center gap-2 overflow-x-auto pb-1">
                {MEMBER_AVATAR_COLOR_KEYS.map((key) => {
                  const swatch = MEMBER_AVATAR_COLOR_STYLES[key];
                  const selected = key === avatarColor;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={key}
                      onClick={() => selectColor(key)}
                      className={[
                        "h-10 w-10 rounded-full border-2 transition-transform",
                        selected ? "scale-110" : "scale-100",
                      ].join(" ")}
                      style={{
                        backgroundColor: swatch.bg,
                        borderColor: selected ? swatch.text : swatch.border,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </IonPopover>

          <IonPopover
            ref={iconPopoverRef}
            isOpen={iconPopoverOpen}
            event={iconPopoverEvent}
            onDidDismiss={() => setIconPopoverOpen(false)}
          >
            <div className="p-4">
              <p className="m-0 mb-3 text-sm font-medium text-[var(--ion-text-color)]">
                Choose an icon
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  aria-label="Use initial"
                  onClick={() => selectIcon(null)}
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold",
                    avatarIcon === null
                      ? "border-[#2f5c4a] bg-[#e3f0ec] text-[#2f5c4a]"
                      : "border-[#dfe6e3] bg-white text-[#2f5c4a]",
                  ].join(" ")}
                >
                  {initial}
                </button>
                {MEMBER_AVATAR_ICON_KEYS.map((key) => {
                  const selected = key === avatarIcon;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={key}
                      onClick={() => selectIcon(key)}
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-full border",
                        selected
                          ? "border-[#2f5c4a] bg-[#e3f0ec] text-[#2f5c4a]"
                          : "border-[#dfe6e3] bg-white text-[#2f5c4a]",
                      ].join(" ")}
                    >
                      <IonIcon icon={MEMBER_AVATAR_ICON_MAP[key]} />
                    </button>
                  );
                })}
              </div>
            </div>
          </IonPopover>
        </>
      )}
    </div>
  );
}

export { DEFAULT_MEMBER_AVATAR_COLOR };
