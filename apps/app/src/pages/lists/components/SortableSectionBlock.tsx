import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { CSSProperties, ReactNode } from "react";
import { sectionDndId } from "../lib/list-dnd";

export type SortableSectionShellProps = {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
};

type SortableSectionBlockProps = {
  sectionId: string;
  dragDisabled?: boolean;
  children: (props: SortableSectionShellProps) => ReactNode;
};

export function SortableSectionBlock({
  sectionId,
  dragDisabled = false,
  children,
}: SortableSectionBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sectionDndId(sectionId), disabled: dragDisabled });

  const style: CSSProperties = isDragging
    ? { opacity: 0 }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <div ref={setNodeRef} data-list-section-row style={style} className="mt-6">
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}
