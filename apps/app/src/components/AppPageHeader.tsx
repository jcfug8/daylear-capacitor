import { IonIcon } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import type { ReactNode } from "react";
import { MenuAvatarButton } from "./MenuAvatarButton";

type AppPageHeaderProps = {
  title: ReactNode;
  userName: string;
  leading?: ReactNode;
  /** Custom controls between the title and the add / menu buttons. */
  end?: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
};

export function AppPageHeader({
  title,
  userName,
  leading,
  end,
  onAdd,
  addLabel = "Add",
}: AppPageHeaderProps) {
  return (
    <div className="flex items-center gap-3 min-h-[2.75rem] px-1">
      {leading}
      <div className="min-w-0 flex-1 text-left">
        {typeof title === "string" ? (
          <h1 className="m-0 font-serif text-2xl font-normal text-[#2f5c4a] truncate">
            {title}
          </h1>
        ) : (
          title
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {end}
        {onAdd && (
          <button
            type="button"
            aria-label={addLabel}
            onClick={onAdd}
            className="m-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#2f5c4a] text-white shadow-sm cursor-pointer active:opacity-80"
          >
            <IonIcon icon={addOutline} className="text-xl" />
          </button>
        )}
        <MenuAvatarButton name={userName} />
      </div>
    </div>
  );
}
