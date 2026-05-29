/** Section bucket key: real section id, or null for items outside any section. */
export type SectionBucketKey = string | null;

/** Collapse-state key for the uncategorized "Other" bucket (not a real section id). */
export const OTHER_BUCKET_COLLAPSE_KEY = "__other__";

export type ListLayoutItem = {
  id: string;
  sectionId: string | null;
  sortOrder: number;
  name: string;
  completedByMemberId: string | null;
  points: number;
  assigneeIds: string[];
};

export type ListLayoutSection = {
  id: string;
  name: string;
  sortOrder: number;
};

export type ListLayoutBucket = {
  sectionId: SectionBucketKey;
  title: string;
  items: ListLayoutItem[];
};

export type ListLayoutState = {
  sections: ListLayoutSection[];
  buckets: ListLayoutBucket[];
};

type ListDetailLike = {
  sections: ListLayoutSection[];
  items: ListLayoutItem[];
};

function sortItems<T extends { sortOrder: number; id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

export function buildLayoutFromListDetail(list: ListDetailLike): ListLayoutState {
  const sections = sortItems(list.sections);
  const items = sortItems(list.items);

  const buckets: ListLayoutBucket[] = sections.map((section) => ({
    sectionId: section.id,
    title: section.name,
    items: items.filter((item) => item.sectionId === section.id),
  }));

  const uncategorized = items.filter((item) => !item.sectionId);
  if (uncategorized.length > 0 || sections.length > 0) {
    buckets.push({
      sectionId: null,
      title: sections.length > 0 ? "Other" : "Items",
      items: uncategorized,
    });
  }

  return { sections, buckets };
}

export function layoutToApplyInput(listId: string, layout: ListLayoutState) {
  return {
    listId,
    sectionIds: layout.sections.map((s) => s.id),
    items: layout.buckets.flatMap((bucket) =>
      bucket.items.map((item, index) => ({
        id: item.id,
        sectionId: bucket.sectionId,
        sortOrder: index,
      })),
    ),
  };
}
