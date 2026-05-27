import type { ListLayoutBucket, ListLayoutState, SectionBucketKey } from "./list-layout.js";

export function bucketKey(sectionId: SectionBucketKey): string {
  return sectionId ?? "__none__";
}

export function parseBucketKey(key: string): SectionBucketKey {
  return key === "__none__" ? null : key;
}

export function itemDndId(itemId: string) {
  return `item:${itemId}`;
}

export function sectionDndId(sectionId: string) {
  return `section:${sectionId}`;
}

export function bucketDndId(key: string) {
  return `bucket:${key}`;
}

export function cloneLayout(layout: ListLayoutState): ListLayoutState {
  return {
    sections: layout.sections.map((s) => ({ ...s })),
    buckets: layout.buckets.map((b) => ({
      ...b,
      items: b.items.map((i) => ({ ...i })),
    })),
  };
}

export function findItemBucketKey(
  layout: ListLayoutState,
  itemId: string,
): string | undefined {
  for (const bucket of layout.buckets) {
    if (bucket.items.some((i) => i.id === itemId)) {
      return bucketKey(bucket.sectionId);
    }
  }
  return undefined;
}

export function moveItemBetweenBuckets(
  layout: ListLayoutState,
  itemId: string,
  fromKey: string,
  toKey: string,
  toIndex: number,
): ListLayoutState {
  const next = cloneLayout(layout);
  const fromBucket = next.buckets.find((b) => bucketKey(b.sectionId) === fromKey);
  const toBucket = next.buckets.find((b) => bucketKey(b.sectionId) === toKey);
  if (!fromBucket || !toBucket) return layout;

  const itemIndex = fromBucket.items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) return layout;

  const [item] = fromBucket.items.splice(itemIndex, 1);
  item.sectionId = parseBucketKey(toKey);
  toBucket.items.splice(toIndex, 0, item);
  return next;
}

export function reorderSectionsInLayout(
  layout: ListLayoutState,
  activeSectionId: string,
  overSectionId: string,
): ListLayoutState {
  const oldIndex = layout.sections.findIndex((s) => s.id === activeSectionId);
  const newIndex = layout.sections.findIndex((s) => s.id === overSectionId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return layout;
  }

  const next = cloneLayout(layout);
  const [removed] = next.sections.splice(oldIndex, 1);
  next.sections.splice(newIndex, 0, removed);

  const sectionBucketsOrdered = next.sections
    .map((s) => next.buckets.find((b) => b.sectionId === s.id))
    .filter((b): b is ListLayoutBucket => !!b);
  const other = next.buckets.filter((b) => b.sectionId === null);
  next.buckets = [...sectionBucketsOrdered, ...other];
  return next;
}
