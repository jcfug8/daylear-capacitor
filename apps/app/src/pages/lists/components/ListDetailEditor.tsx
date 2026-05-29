import { DndContext, DragOverlay, MeasuringStrategy, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IonNote, useIonAlert } from "@ionic/react";
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { flushSync } from "react-dom";
import { invalidateMemberPointsAfterCompletion } from "../../../lib/invalidate-member-points";
import { isListItemCompleted } from "../../../lib/list-item-completion";
import { useCompleteListItem } from "../../../hooks/useCompleteListItem";
import type { MemberNameFields } from "../../../lib/member-display-name";
import { trpcErrorMessage } from "../../../lib/trpc-errors";
import { trpc } from "../../../lib/trpc";
import { useListDragHandlers } from "../hooks/useListDragHandlers";
import { useSortableDndSensors } from "../../utils/dnd/hooks/useSortableDndSensors";
import {
  buildLayoutFromListDetail,
  layoutToApplyInput,
  OTHER_BUCKET_COLLAPSE_KEY,
} from "../lib/list-layout";
import { CollapsibleBucketHeader } from "./CollapsibleBucketHeader";
import type { ListLayoutState } from "../lib/list-layout";
import {
  createOverlayDragAdjustModifier,
  measureDraggableNode,
  OverlayDragAdjustMeasurer,
} from "../lib/dnd-overlay-modifiers";
import type {
  OverlayDragAdjust,
  OverlayDragMeasureContext,
} from "../lib/dnd-overlay-modifiers";
import { sectionDndId } from "../lib/list-dnd";
import type { ListDetail } from "../types";
import { ListItemBucket } from "./ListItemBucket";
import { ListItemModal } from "./ListItemModal";
import { SectionHeader } from "./SectionHeader";
import { SortableSectionBlock } from "./SortableSectionBlock";

type ListDetailEditorProps = {
  list: ListDetail;
  family: { members: MemberNameFields[] } | undefined;
  onError: (message: string) => void;
  addSectionRef?: MutableRefObject<(() => void) | null>;
};

export function ListDetailEditor({
  list,
  family,
  onError,
  addSectionRef,
}: ListDetailEditorProps) {
  const [presentAlert] = useIonAlert();
  const { completeListItem } = useCompleteListItem();
  const utils = trpc.useUtils();
  const [layout, setLayout] = useState<ListLayoutState>(() =>
    buildLayoutFromListDetail(list),
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const expandedBeforeSectionDragRef = useRef<Set<string> | null>(null);
  const overlayDragAdjustRef = useRef<OverlayDragAdjust | null>(null);
  const overlayMeasureContextRef = useRef<OverlayDragMeasureContext | null>(null);

  const dragOverlayModifiers = useMemo(
    () => [createOverlayDragAdjustModifier(() => overlayDragAdjustRef.current)],
    [],
  );

  const applyLayout = trpc.lists.applyLayout.useMutation({
    onSuccess: (data) => {
      utils.lists.get.setData({ id: list.id }, data);
      setLayout(buildLayoutFromListDetail(data));
    },
    onError: () => onError("Could not save order"),
  });

  const createSection = trpc.lists.sections.create.useMutation({
    onSuccess: async () => utils.lists.get.invalidate({ id: list.id }),
    onError: (e) => onError(trpcErrorMessage(e, "Could not add section")),
  });

  const updateSection = trpc.lists.sections.update.useMutation({
    onSuccess: async () => utils.lists.get.invalidate({ id: list.id }),
    onError: (e) => onError(trpcErrorMessage(e, "Could not rename section")),
  });

  const deleteSection = trpc.lists.sections.delete.useMutation({
    onSuccess: async () => utils.lists.get.invalidate({ id: list.id }),
    onError: (e) => onError(trpcErrorMessage(e, "Could not delete section")),
  });

  const createItem = trpc.lists.items.create.useMutation({
    onSuccess: async () => utils.lists.get.invalidate({ id: list.id }),
    onError: (e) => onError(trpcErrorMessage(e, "Could not add item")),
  });

  const updateItem = trpc.lists.items.update.useMutation({
    onSuccess: async () => {
      await utils.lists.get.invalidate({ id: list.id });
      await utils.todos.list.invalidate();
    },
    onError: (e) => onError(trpcErrorMessage(e, "Could not update item")),
  });

  const deleteItem = trpc.lists.items.delete.useMutation({
    onSuccess: async () => {
      await utils.lists.get.invalidate({ id: list.id });
      await utils.todos.list.invalidate();
      setDetailItemId(null);
    },
    onError: (e) => onError(trpcErrorMessage(e, "Could not delete item")),
  });

  const setAssignees = trpc.lists.items.setAssignees.useMutation({
    onSuccess: async () => {
      await utils.lists.get.invalidate({ id: list.id });
      await utils.todos.list.invalidate();
    },
    onError: (e) => onError(trpcErrorMessage(e, "Could not update assignees")),
  });

  useEffect(() => {
    setLayout(buildLayoutFromListDetail(list));
  }, [list]);

  const itemDetailsOpen = !!detailItemId;
  const sensors = useSortableDndSensors();

  useEffect(() => {
    if (itemDetailsOpen) setActiveDragId(null);
  }, [itemDetailsOpen]);

  function openItemDetails(itemId: string) {
    setActiveDragId(null);
    setDetailItemId(itemId);
  }

  function setItemCompletion(itemId: string, completedByMemberId: string | null) {
    const item = list.items.find((entry) => entry.id === itemId);
    const itemPoints = item?.points ?? 0;
    updateItem.mutate(
      { id: itemId, completedByMemberId },
      {
        onSuccess: async () => {
          await invalidateMemberPointsAfterCompletion(utils, itemPoints);
        },
      },
    );
  }

  function toggleItemComplete(itemId: string) {
    const item = list.items.find((entry) => entry.id === itemId);
    if (!item) return;

    if (isListItemCompleted(item)) {
      setItemCompletion(itemId, null);
      return;
    }

    completeListItem({
      itemId,
      assigneeIds: item.assigneeIds,
      familyMembers: family?.members ?? [],
      onComplete: setItemCompletion,
    });
  }

  const listHasSections = layout.sections.length > 0;
  const sectionBuckets = useMemo(
    () => layout.buckets.filter((b) => b.sectionId !== null),
    [layout.buckets],
  );
  const uncategorizedBucket = layout.buckets.find((b) => b.sectionId === null);
  const sectionDndIds = layout.sections.map((s) => sectionDndId(s.id));

  const detailItem = detailItemId
    ? (list.items.find((i) => i.id === detailItemId) ?? null)
    : null;

  const pending =
    applyLayout.isPending ||
    createSection.isPending ||
    updateSection.isPending ||
    deleteSection.isPending ||
    createItem.isPending ||
    updateItem.isPending ||
    deleteItem.isPending ||
    setAssignees.isPending;

  function persistLayout(next: ListLayoutState) {
    setLayout(next);
    applyLayout.mutate(layoutToApplyInput(list.id, next));
  }

  const { handleDragOver, handleDragEnd } = useListDragHandlers(
    layout,
    setLayout,
    persistLayout,
  );

  function promptAddSection() {
    presentAlert({
      header: "New section",
      inputs: [{ name: "name", type: "text", placeholder: "Costco, Trader Joe's…" }],
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Add",
          handler: (data) => {
            const name = data?.name?.trim();
            if (name) {
              createSection.mutate({ listId: list.id, name });
            }
          },
        },
      ],
    });
  }

  useEffect(() => {
    if (!addSectionRef) return;
    addSectionRef.current = promptAddSection;
    return () => {
      addSectionRef.current = null;
    };
  });

  function toggleSectionCollapsed(sectionId: string) {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function confirmDeleteSection(section: { id: string; name: string }) {
    presentAlert({
      header: "Delete section?",
      message: `Delete "${section.name}"? Items in this section will move to Other.`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: () => deleteSection.mutate({ id: section.id }),
        },
      ],
    });
  }

  const sectionReorderActive = activeDragId?.startsWith("section:") ?? false;

  const activeItem = activeDragId?.startsWith("item:")
    ? list.items.find((i) => i.id === activeDragId.slice(5))
    : null;

  const activeSection = activeDragId?.startsWith("section:")
    ? layout.sections.find((s) => s.id === activeDragId.slice(8))
    : null;

  const collapseAllSectionsForReorder = useCallback(() => {
    const expanded = new Set(
      layout.sections.map((s) => s.id).filter((id) => !collapsedSectionIds.has(id)),
    );
    if (!collapsedSectionIds.has(OTHER_BUCKET_COLLAPSE_KEY)) {
      expanded.add(OTHER_BUCKET_COLLAPSE_KEY);
    }
    expandedBeforeSectionDragRef.current = expanded;
    setCollapsedSectionIds(
      new Set([...layout.sections.map((s) => s.id), OTHER_BUCKET_COLLAPSE_KEY]),
    );
  }, [collapsedSectionIds, layout.sections]);

  const prepareSectionReorder = useCallback(() => {
    flushSync(collapseAllSectionsForReorder);
  }, [collapseAllSectionsForReorder]);

  function restoreSectionsAfterReorder() {
    const expanded = expandedBeforeSectionDragRef.current;
    expandedBeforeSectionDragRef.current = null;
    if (!expanded) return;

    const collapsed = new Set(
      layout.sections.map((s) => s.id).filter((id) => !expanded.has(id)),
    );
    if (!expanded.has(OTHER_BUCKET_COLLAPSE_KEY)) {
      collapsed.add(OTHER_BUCKET_COLLAPSE_KEY);
    }
    setCollapsedSectionIds(collapsed);
  }

  function createItemInSection(sectionId: string | null, name: string) {
    createItem.mutate({ listId: list.id, sectionId, name });
  }

  const bucketProps = {
    createItemPending: createItem.isPending,
    updateItemPending: updateItem.isPending,
    dragDisabled: itemDetailsOpen || sectionReorderActive,
    onOpenItemDetails: openItemDetails,
    onRenameItem: (itemId: string, name: string) => {
      const item = list.items.find((entry) => entry.id === itemId);
      if (item && isListItemCompleted(item)) return;
      updateItem.mutate({ id: itemId, name });
    },
    onToggleComplete: (itemId: string) => toggleItemComplete(itemId),
  };

  return (
    <>
      <DndContext
        key={itemDetailsOpen ? `dnd-locked-${detailItemId}` : "dnd-active"}
        sensors={sensors}
        collisionDetection={closestCorners}
        measuring={{
          draggable: { measure: measureDraggableNode },
          droppable: { strategy: MeasuringStrategy.Always },
        }}
        onDragStart={(e) => {
          if (itemDetailsOpen) return;
          const activeId = String(e.active.id);
          setActiveDragId(activeId);

          overlayMeasureContextRef.current = {
            activator: e.activatorEvent?.target ?? null,
            rowSelector: activeId.startsWith("section:")
              ? "[data-list-section-row]"
              : "[data-list-item-row]",
          };
        }}
        onDragOver={(e) => {
          if (itemDetailsOpen) return;
          handleDragOver(e);
        }}
        onDragEnd={(e) => {
          const wasSectionDrag = String(e.active.id).startsWith("section:");
          handleDragEnd(e);
          setActiveDragId(null);
          overlayDragAdjustRef.current = null;
          overlayMeasureContextRef.current = null;
          if (wasSectionDrag) restoreSectionsAfterReorder();
        }}
        onDragCancel={() => {
          const wasSectionDrag = activeDragId?.startsWith("section:");
          setActiveDragId(null);
          overlayDragAdjustRef.current = null;
          overlayMeasureContextRef.current = null;
          if (wasSectionDrag) restoreSectionsAfterReorder();
        }}
      >
        {listHasSections ? (
          <SortableContext items={sectionDndIds} strategy={verticalListSortingStrategy}>
            {layout.sections.map((section) => {
              const bucket = sectionBuckets.find((b) => b.sectionId === section.id);
              if (!bucket) return null;
              const collapsed =
                sectionReorderActive || collapsedSectionIds.has(section.id);

              return (
                <SortableSectionBlock
                  key={section.id}
                  sectionId={section.id}
                  dragDisabled={itemDetailsOpen}
                >
                  {(shell) => (
                    <>
                      <SectionHeader
                        {...shell}
                        name={section.name}
                        collapsed={collapsed}
                        onToggleCollapsed={() => toggleSectionCollapsed(section.id)}
                        onPrepareReorder={prepareSectionReorder}
                        onRename={(name) => updateSection.mutate({ id: section.id, name })}
                        onDelete={() =>
                          confirmDeleteSection({ id: section.id, name: section.name })
                        }
                      />
                      {!collapsed && (
                        <ListItemBucket
                          bucket={bucket}
                          {...bucketProps}
                          onCreateItem={(name) => createItemInSection(section.id, name)}
                        />
                      )}
                    </>
                  )}
                </SortableSectionBlock>
              );
            })}
          </SortableContext>
        ) : (
          uncategorizedBucket && (
            <ListItemBucket
              bucket={uncategorizedBucket}
              {...bucketProps}
              onCreateItem={(name) => createItemInSection(null, name)}
            />
          )
        )}

        {listHasSections && uncategorizedBucket && (
          <>
            <CollapsibleBucketHeader
              title={uncategorizedBucket.title}
              subtitle="Items not in any section"
              collapsed={
                sectionReorderActive ||
                collapsedSectionIds.has(OTHER_BUCKET_COLLAPSE_KEY)
              }
              onToggleCollapsed={() => toggleSectionCollapsed(OTHER_BUCKET_COLLAPSE_KEY)}
            />
            {!(
              sectionReorderActive ||
              collapsedSectionIds.has(OTHER_BUCKET_COLLAPSE_KEY)
            ) && (
              <ListItemBucket
                bucket={uncategorizedBucket}
                {...bucketProps}
                onCreateItem={(name) => createItemInSection(null, name)}
              />
            )}
          </>
        )}

        <OverlayDragAdjustMeasurer
          adjustRef={overlayDragAdjustRef}
          contextRef={overlayMeasureContextRef}
        />
        <DragOverlay adjustScale={false} modifiers={dragOverlayModifiers}>
          {activeItem ? (
            <div className="bg-[var(--ion-background-color)] shadow-lg px-4 py-2 rounded w-full max-w-[min(100vw-2rem,32rem)]">
              {activeItem.name}
            </div>
          ) : activeSection ? (
            <div className="bg-[var(--ion-background-color)] shadow-lg px-4 py-2 rounded font-semibold w-full max-w-[min(100vw-2rem,32rem)]">
              {activeSection.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {listHasSections && layout.sections.length === 0 && list.items.length === 0 && (
        <IonNote className="block text-center mt-4 px-4">
          Use the menu above to add a section, or add items below.
        </IonNote>
      )}

      <ListItemModal
        mode="edit"
        listId={list.id}
        item={detailItem}
        sections={layout.sections}
        family={family}
        isOpen={!!detailItemId}
        onClose={() => setDetailItemId(null)}
        pending={pending}
        onSaveName={(name) => {
          if (!detailItem || isListItemCompleted(detailItem)) return;
          updateItem.mutate({ id: detailItem.id, name });
        }}
        onToggleComplete={(complete) => {
          if (!detailItem) return;
          if (complete) {
            completeListItem({
              itemId: detailItem.id,
              assigneeIds: detailItem.assigneeIds,
              familyMembers: family?.members ?? [],
              onComplete: setItemCompletion,
            });
          } else {
            setItemCompletion(detailItem.id, null);
          }
        }}
        onChangePoints={(points) => {
          if (!detailItem || isListItemCompleted(detailItem)) return;
          updateItem.mutate({ id: detailItem.id, points });
        }}
        onChangeSection={(sectionId) => {
          if (!detailItem || isListItemCompleted(detailItem)) return;
          updateItem.mutate({ id: detailItem.id, sectionId });
        }}
        onSetAssignees={(memberIds) => {
          if (!detailItem || isListItemCompleted(detailItem)) return;
          setAssignees.mutate({ id: detailItem.id, memberIds });
        }}
        onDelete={() => {
          if (!detailItem) return;
          deleteItem.mutate({ id: detailItem.id });
        }}
      />
    </>
  );
}
