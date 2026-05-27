import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import type { Dispatch, SetStateAction } from "react";
import type { ListLayoutState } from "../lib/list-layout";
import {
  bucketKey,
  cloneLayout,
  findItemBucketKey,
  moveItemBetweenBuckets,
  parseBucketKey,
  reorderSectionsInLayout,
} from "../lib/list-dnd";

export function useListDragHandlers(
  layout: ListLayoutState,
  setLayout: Dispatch<SetStateAction<ListLayoutState>>,
  persistLayout: (next: ListLayoutState) => void,
) {
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (!activeId.startsWith("item:")) return;

    const itemId = activeId.slice(5);
    const activeBucketKey = findItemBucketKey(layout, itemId);
    if (!activeBucketKey) return;

    let overBucketKey: string | undefined;
    if (overId.startsWith("bucket:")) {
      overBucketKey = overId.slice(7);
    } else if (overId.startsWith("item:")) {
      overBucketKey = findItemBucketKey(layout, overId.slice(5));
    }
    if (!overBucketKey || activeBucketKey === overBucketKey) return;

    setLayout((prev) => {
      const overBucket = prev.buckets.find((b) => bucketKey(b.sectionId) === overBucketKey);
      if (!overBucket) return prev;
      const overIndex = overId.startsWith("item:")
        ? overBucket.items.findIndex((i) => i.id === overId.slice(5))
        : overBucket.items.length;
      return moveItemBetweenBuckets(prev, itemId, activeBucketKey, overBucketKey, overIndex);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("section:")) {
      const activeSectionId = activeId.slice(8);
      const overSectionId = overId.startsWith("section:") ? overId.slice(8) : null;
      if (!overSectionId || activeSectionId === overSectionId) return;

      const next = reorderSectionsInLayout(layout, activeSectionId, overSectionId);
      if (next !== layout) persistLayout(next);
      return;
    }

    if (!activeId.startsWith("item:")) return;

    const itemId = activeId.slice(5);
    const activeBucketKey = findItemBucketKey(layout, itemId);
    if (!activeBucketKey) return;

    let overBucketKey: string;
    let overItemId: string | null = null;
    if (overId.startsWith("bucket:")) {
      overBucketKey = overId.slice(7);
    } else if (overId.startsWith("item:")) {
      overItemId = overId.slice(5);
      const key = findItemBucketKey(layout, overItemId);
      if (!key) return;
      overBucketKey = key;
    } else {
      return;
    }

    const next = cloneLayout(layout);
    const fromBucket = next.buckets.find((b) => bucketKey(b.sectionId) === activeBucketKey);
    const toBucket = next.buckets.find((b) => bucketKey(b.sectionId) === overBucketKey);
    if (!fromBucket || !toBucket) return;

    const fromIndex = fromBucket.items.findIndex((i) => i.id === itemId);
    if (fromIndex === -1) return;

    let toIndex = overItemId
      ? toBucket.items.findIndex((i) => i.id === overItemId)
      : toBucket.items.length;
    if (toIndex === -1) toIndex = toBucket.items.length;

    if (activeBucketKey === overBucketKey) {
      toBucket.items = arrayMove(toBucket.items, fromIndex, toIndex);
    } else {
      const [moved] = fromBucket.items.splice(fromIndex, 1);
      moved.sectionId = parseBucketKey(overBucketKey);
      toBucket.items.splice(toIndex, 0, moved);
    }

    persistLayout(next);
  }

  return { handleDragOver, handleDragEnd };
}
