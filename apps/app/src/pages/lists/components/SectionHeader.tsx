import { IonButton, IonIcon } from "@ionic/react";
import { chevronDownOutline, chevronForwardOutline } from "ionicons/icons";
import { useRef } from "react";
import { useSectionHeaderGestures } from "../hooks/useSectionHeaderGestures";
import { composeDraggableListeners } from "../lib/compose-pointer-listeners";
import {
  InlineEditableText,
  type InlineEditableTextHandle,
} from "./InlineEditableText";
import type { SortableSectionShellProps } from "./SortableSectionBlock";

type SectionHeaderProps = SortableSectionShellProps & {
  name: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onPrepareReorder: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
};

export function SectionHeader({
  name,
  collapsed,
  onToggleCollapsed,
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
    <div
      {...attributes}
      {...composedListeners}
      className="touch-manipulation mb-1"
    >
      <div className="flex items-center gap-0 min-w-0 w-full">
        <InlineEditableText
          ref={titleRef}
          value={name}
          onSave={handleSave}
          required={false}
          clickToEdit={false}
          placeholder="Section name"
          className="text-base font-semibold flex-1 min-w-0"
        />
        <IonButton
          fill="clear"
          size="small"
          className="shrink-0 m-0"
          data-no-section-gesture
          aria-label={collapsed ? "Expand section" : "Collapse section"}
          aria-expanded={!collapsed}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onToggleCollapsed}
        >
          <IonIcon icon={collapsed ? chevronForwardOutline : chevronDownOutline} />
        </IonButton>
      </div>
    </div>
  );
}
