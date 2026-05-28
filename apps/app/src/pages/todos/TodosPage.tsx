import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { IonButton, IonIcon, IonNote, IonSpinner, IonText } from "@ionic/react";
import { albumsOutline, listOutline } from "ionicons/icons";
import { useMemo, useState } from "react";
import { findAssigneeDragItem } from "./lib/find-assignee-drag-item";
import { TodoDragOverlay } from "./components/TodoDragOverlay";
import { useSortableDndSensors } from "../utils/dnd/hooks/useSortableDndSensors";
import { trpc } from "../../lib/trpc";
import { ListItemModal } from "../lists/components/ListItemModal";
import { buildTodoLanes } from "./build-todo-lanes";
import { TodoListView } from "./components/TodoListView";
import { TodoSwimLanesBoard } from "./components/TodoSwimLanesBoard";
import { useAssigneeLanesDrag } from "./hooks/useAssigneeLanesDrag";
import { usePersistedTodosViewMode } from "./hooks/usePersistedTodosViewMode";
import { useTodoItemDetailModal } from "./hooks/useTodoItemDetailModal";

export function TodosPage() {
  const { viewMode, toggleViewMode } = usePersistedTodosViewMode();
  const { data: family, isLoading: familyLoading } = trpc.families.current.useQuery();
  const { data: todos, isLoading: todosLoading } = trpc.todos.list.useQuery();

  const itemModal = useTodoItemDetailModal();

  const baseLanes = useMemo(() => {
    if (!family) return [];
    return buildTodoLanes(family.members, todos ?? []);
  }, [family, todos]);

  const {
    lanes,
    handleDragStart,
    handleDragEnd,
    reorderPending,
    error: reorderError,
  } = useAssigneeLanesDrag(baseLanes);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const activeDragItem = useMemo(
    () => findAssigneeDragItem(lanes, activeDragId),
    [activeDragId, lanes],
  );

  const sensors = useSortableDndSensors();
  const isLoading = familyLoading || todosLoading;
  const hasAnyItems = (todos?.length ?? 0) > 0;
  const isLanesView = viewMode === "lanes";
  const addDisabled = itemModal.lists.length === 0;
  const dragDisabled = itemModal.isOpen || reorderPending;

  const clearActiveDrag = () => setActiveDragId(null);

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0">
      <div
        className={[
          "flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden",
          isLanesView ? "-mx-4 w-[calc(100%+2rem)]" : "w-full",
        ].join(" ")}
      >
        <div className="px-4 shrink-0">
          <div className="flex items-start justify-between gap-2 mb-4">
            <IonText>
              <h2 className="text-xl font-semibold m-0">Todos</h2>
            </IonText>
            {!isLoading && family && (
              <IonButton
                fill="clear"
                size="small"
                className="m-0 shrink-0"
                aria-label={isLanesView ? "Show list view" : "Show swim lanes"}
                onClick={toggleViewMode}
              >
                <IonIcon slot="icon-only" icon={isLanesView ? listOutline : albumsOutline} />
              </IonButton>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="ion-text-center ion-padding flex-1">
            <IonSpinner name="crescent" />
            <IonText color="medium">
              <p className="mt-2">Loading todos…</p>
            </IonText>
          </div>
        )}

        {!isLoading && family && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(event) => {
              handleDragStart(event);
              setActiveDragId(String(event.active.id));
            }}
            onDragEnd={(event) => {
              handleDragEnd(event);
              clearActiveDrag();
            }}
            onDragCancel={clearActiveDrag}
          >
            {isLanesView ? (
              <TodoSwimLanesBoard
                lanes={lanes}
                dragDisabled={dragDisabled}
                onOpenItem={itemModal.openItem}
                onAddItem={itemModal.openCreate}
                onToggleComplete={itemModal.toggleComplete}
                updatePending={itemModal.pending || reorderPending}
                addDisabled={addDisabled}
              />
            ) : (
              <TodoListView
                lanes={lanes}
                dragDisabled={dragDisabled}
                onOpenItem={itemModal.openItem}
                onAddItem={itemModal.openCreate}
                onToggleComplete={itemModal.toggleComplete}
                updatePending={itemModal.pending || reorderPending}
                addDisabled={addDisabled}
              />
            )}

            <DragOverlay adjustScale={false}>
              {activeDragItem ? (
                <TodoDragOverlay
                  item={activeDragItem}
                  variant={isLanesView ? "card" : "list"}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {!isLoading && !hasAnyItems && (
          <IonNote className="ion-text-center block mt-2 px-4">
            {addDisabled
              ? "Create a list first, then assign items here."
              : "No assigned list items yet. Tap + next to a name or assign items from a list."}
          </IonNote>
        )}
      </div>

      {itemModal.isCreate && itemModal.createDraft && (
        <ListItemModal
          mode="create"
          isOpen={itemModal.isOpen}
          onClose={itemModal.closeModal}
          sections={itemModal.sections}
          family={family ?? undefined}
          pending={itemModal.pending}
          values={itemModal.createDraft}
          lists={itemModal.lists}
          onValuesChange={itemModal.patchCreateDraft}
          onCreate={itemModal.submitCreate}
        />
      )}

      {!itemModal.isCreate && itemModal.editListId && (
        <ListItemModal
          mode="edit"
          listId={itemModal.editListId}
          item={itemModal.detailItem}
          isOpen={itemModal.isOpen}
          onClose={itemModal.closeModal}
          sections={itemModal.sections}
          family={family ?? undefined}
          pending={itemModal.pending}
          onSaveName={itemModal.onSaveName}
          onToggleComplete={itemModal.onToggleComplete}
          onChangePoints={itemModal.onChangePoints}
          onChangeSection={itemModal.onChangeSection}
          onSetAssignees={itemModal.onSetAssignees}
          onDelete={itemModal.onDelete}
        />
      )}

      {(itemModal.error || reorderError) && (
        <IonNote color="danger" className="block mt-3 px-4">
          {itemModal.error ?? reorderError}
        </IonNote>
      )}
    </div>
  );
}
