import { IonItem } from "@ionic/react";
import { useRef } from "react";
import { composeDraggableListeners } from "../../utils/dnd/lib/compose-pointer-listeners";
import { useSectionHeaderGestures } from "../hooks/useSectionHeaderGestures";
import {
  InlineEditableText,
  type InlineEditableTextHandle,
} from "./InlineEditableText";
import type { SortableSectionShellProps } from "./SortableSectionBlock";

type SectionHeaderProps = SortableSectionShellProps & {
  name: string;
  onPrepareReorder: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
};

export function SectionHeader({
  name,
  onPrepareReorder,
  onRename,
  onDelete,
  attributes,
  listeners,
}: SectionHeaderProps) {
  const titleRef = useRef<InlineEditableTextHandle>(null);

  const gestures = useSectionHeaderGestures({
    onShortPress: () => titleRef.current?.startEditing(),
    onPrepareReorder,
  });

  const composedListeners = composeDraggableListeners(listeners, gestures);

  function handleSave(nextName: string) {
    const trimmed = nextName.trim();
    if (!trimmed) {
      onDelete();
      return;
    }
    if (trimmed !== name) {
      onRename(trimmed);
    }
  }

  return (
    <IonItem slot="header" lines="none" className="list-section-accordion-header">
      <div
        {...attributes}
        {...composedListeners}
        className="touch-manipulation min-w-0 flex-1 py-2"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <InlineEditableText
          ref={titleRef}
          value={name}
          onSave={handleSave}
          required={false}
          clickToEdit={false}
          placeholder="Section name"
          className="font-serif text-xl font-semibold text-[var(--ion-text-color)] min-w-0"
        />
      </div>
    </IonItem>
  );
}
