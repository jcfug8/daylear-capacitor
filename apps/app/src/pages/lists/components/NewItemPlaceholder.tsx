import { IonInput, IonItem, IonLabel } from "@ionic/react";
import { useRef, useState } from "react";

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
      <IonItem className="opacity-80">
        <IonInput
          ref={inputRef}
          value={draft}
          placeholder="Item name"
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
      </IonItem>
    );
  }

  return (
    <IonItem
      button
      detail={false}
      disabled={disabled}
      className="opacity-50"
      onClick={activate}
    >
      <IonLabel color="medium">New item…</IonLabel>
    </IonItem>
  );
}
