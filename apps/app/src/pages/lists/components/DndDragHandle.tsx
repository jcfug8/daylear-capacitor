import { IonIcon } from "@ionic/react";
import { menuOutline } from "ionicons/icons";
import type { CSSProperties } from "react";

type DndDragHandleProps = {
  attributes: Record<string, unknown>;
  listeners: Record<string, unknown> | undefined;
  /** Ionic slot when used inside IonItem */
  slot?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
};

/**
 * Drag handle only — listeners stay here so click / long-press elsewhere on the row
 * are not captured by dnd-kit (web, iOS, Android).
 */
export function DndDragHandle({
  attributes,
  listeners,
  slot,
  className = "touch-none self-center p-2 text-[var(--ion-color-medium)] shrink-0",
  style,
  ariaLabel = "Drag to reorder",
}: DndDragHandleProps) {
  return (
    <button
      type="button"
      slot={slot}
      data-drag-handle
      className={className}
      style={{ touchAction: "none", ...style }}
      aria-label={ariaLabel}
      onContextMenu={(e) => e.preventDefault()}
      {...attributes}
      {...listeners}
    >
      <IonIcon icon={menuOutline} />
    </button>
  );
}
