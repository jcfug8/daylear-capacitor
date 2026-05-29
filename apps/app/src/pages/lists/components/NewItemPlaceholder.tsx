import { IonInput } from "@ionic/react";
import { useRef, useState } from "react";
import { LIST_ITEM_CARD } from "../lib/list-item-card-styles";

type NewItemPlaceholderProps = {
  disabled?: boolean;
  onCommit: (name: string) => void;
};

export function NewItemPlaceholder({ disabled, onCommit }: NewItemPlaceholderProps) {
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLIonInputElement>(null);
  const commitLockRef = useRef(false);

  function commit() {
    if (commitLockRef.current) return;
    const trimmed = draft.trim();
    if (!trimmed) {
      setActive(false);
      setDraft("");
      return;
    }
    commitLockRef.current = true;
    setActive(false);
    setDraft("");
    onCommit(trimmed);
    queueMicrotask(() => {
      commitLockRef.current = false;
    });
  }

  function activate() {
    if (disabled) return;
    commitLockRef.current = false;
    setActive(true);
    requestAnimationFrame(() => void inputRef.current?.setFocus());
  }

  if (active) {
    return (
      <div className={`px-3 py-2 ${LIST_ITEM_CARD} border-dashed`}>
        <IonInput
          ref={inputRef}
          value={draft}
          placeholder="Item name"
          className="text-sm"
          onIonInput={(e) => setDraft(e.detail.value ?? "")}
          onIonBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setDraft("");
              setActive(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={activate}
      className={[
        "m-0 w-full text-left px-3 py-2.5 text-sm text-[var(--ion-color-medium)]",
        LIST_ITEM_CARD,
        "border-dashed opacity-80",
        disabled ? "cursor-not-allowed" : "cursor-pointer active:opacity-70",
      ].join(" ")}
    >
      New item…
    </button>
  );
}
