import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { CSSProperties, ReactNode } from "react";
import { itemDndId } from "../lib/ids";

export type SortableItemShellProps = {
  setNodeRef: (node: HTMLElement | null) => void;
  style: CSSProperties;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
};

type SortableItemWrapperProps = {
  itemId: string;
  /** Defaults to {@link itemDndId}. Use {@link assigneeItemDndId} when the same item appears in multiple lanes. */
  sortableId?: string;
  dragDisabled?: boolean;
  children: (props: SortableItemShellProps) => ReactNode;
};

export function SortableItemWrapper({
  itemId,
  sortableId,
  dragDisabled = false,
  children,
}: SortableItemWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sortableId ?? itemDndId(itemId), disabled: dragDisabled });

  const style: CSSProperties = isDragging
    ? { opacity: 0 }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <>
      {children({
        setNodeRef,
        style,
        attributes,
        listeners,
        isDragging,
      })}
    </>
  );
}
