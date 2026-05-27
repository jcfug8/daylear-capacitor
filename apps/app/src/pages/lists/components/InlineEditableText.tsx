import { IonInput } from "@ionic/react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type InlineEditableTextHandle = {
  startEditing: () => void;
};

type InlineEditableTextProps = {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  required?: boolean;
  /** When false, only external startEditing() opens the field (e.g. short-press gesture). */
  clickToEdit?: boolean;
};

export const InlineEditableText = forwardRef<InlineEditableTextHandle, InlineEditableTextProps>(
  function InlineEditableText(
    {
      value,
      onSave,
      className = "",
      inputClassName = "",
      placeholder,
      required = true,
      clickToEdit = true,
    },
    ref,
  ) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLIonInputElement>(null);
    const commitLockRef = useRef(false);

    useEffect(() => {
      if (!editing) setDraft(value);
    }, [value, editing]);

    function commit() {
      if (commitLockRef.current) return;
      const trimmed = draft.trim();
      if (required && !trimmed) {
        setDraft(value);
        setEditing(false);
        return;
      }
      commitLockRef.current = true;
      setEditing(false);
      if (trimmed !== value) {
        onSave(trimmed);
      }
      queueMicrotask(() => {
        commitLockRef.current = false;
      });
    }

    function startEditing() {
      commitLockRef.current = false;
      setDraft(value);
      setEditing(true);
      requestAnimationFrame(() => void inputRef.current?.setFocus());
    }

    useImperativeHandle(ref, () => ({ startEditing }), [value]);

    if (editing) {
      return (
        <IonInput
          ref={inputRef}
          className={inputClassName}
          value={draft}
          placeholder={placeholder}
          onIonInput={(e) => setDraft(e.detail.value ?? "")}
          onIonBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
        />
      );
    }

    if (!clickToEdit) {
      return (
        <span className={`block w-full ${className}`}>{value || placeholder}</span>
      );
    }

    return (
      <button
        type="button"
        className={`text-left w-full bg-transparent border-0 p-0 cursor-text touch-manipulation ${className}`}
        onClick={startEditing}
      >
        {value || placeholder}
      </button>
    );
  },
);
