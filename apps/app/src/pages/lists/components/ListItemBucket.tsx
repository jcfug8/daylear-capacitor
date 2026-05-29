import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { MemberNameFields } from "../../../lib/member-display-name";
import type { ListLayoutBucket } from "../lib/list-layout";
import { bucketDndId, bucketKey, itemDndId } from "../lib/list-dnd";
import { ListItemRow } from "./ListItemRow";
import { NewItemPlaceholder } from "./NewItemPlaceholder";
import { SortableItemWrapper } from "./SortableItemWrapper";

type ListItemBucketProps = {
  bucket: ListLayoutBucket;
  familyMembers?: MemberNameFields[];
  createItemPending: boolean;
  updateItemPending: boolean;
  dragDisabled?: boolean;
  onOpenItemDetails: (itemId: string) => void;
  onRenameItem: (itemId: string, name: string) => void;
  onToggleComplete: (itemId: string) => void;
  onCreateItem: (name: string) => void;
};

export function ListItemBucket({
  bucket,
  familyMembers = [],
  createItemPending,
  updateItemPending,
  dragDisabled = false,
  onOpenItemDetails,
  onRenameItem,
  onToggleComplete,
  onCreateItem,
}: ListItemBucketProps) {
  const key = bucketKey(bucket.sectionId);
  const { setNodeRef, isOver } = useDroppable({
    id: bucketDndId(key),
    disabled: dragDisabled,
  });
  const itemIds = bucket.items.map((i) => itemDndId(i.id));

  return (
    <div
      ref={setNodeRef}
      className={[
        "flex flex-col gap-2",
        isOver ? "rounded-xl bg-[#e3f0ec]/40 p-1 -m-1" : "",
      ].join(" ")}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {bucket.items.map((item) => (
          <SortableItemWrapper key={item.id} itemId={item.id} dragDisabled={dragDisabled}>
            {(shell) => (
              <ListItemRow
                {...shell}
                item={item}
                familyMembers={familyMembers}
                onRename={(name) => onRenameItem(item.id, name)}
                onOpenDetails={() => onOpenItemDetails(item.id)}
                onToggleComplete={() => onToggleComplete(item.id)}
                updatePending={updateItemPending}
              />
            )}
          </SortableItemWrapper>
        ))}
        <NewItemPlaceholder disabled={createItemPending} onCommit={onCreateItem} />
      </SortableContext>
    </div>
  );
}
