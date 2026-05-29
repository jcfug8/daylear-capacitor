import { useEffect, useState } from "react";
import { useCompleteListItem } from "../../../hooks/useCompleteListItem";
import { isListItemCompleted } from "../../../lib/list-item-completion";
import type { MemberNameFields } from "../../../lib/member-display-name";
import { invalidateMemberPointsAfterCompletion } from "../../../lib/invalidate-member-points";
import { trpcErrorMessage } from "../../../lib/trpc-errors";
import { trpc } from "../../../lib/trpc";
import type { ListItemFormValues } from "../../lists/lib/list-item-form";
import {
  defaultAssigneeIdsForLane,
  emptyListItemFormValues,
} from "../../lists/lib/list-item-form";
import type { AssignedTodoItem } from "../build-todo-lanes";

type ModalState =
  | { type: "closed" }
  | { type: "edit"; listId: string; itemId: string }
  | { type: "create" };

export function useTodoItemDetailModal(familyMembers: MemberNameFields[] = []) {
  const utils = trpc.useUtils();
  const { completeListItem } = useCompleteListItem();
  const [modal, setModal] = useState<ModalState>({ type: "closed" });
  const [createDraft, setCreateDraft] = useState<ListItemFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: lists } = trpc.lists.list.useQuery();

  useEffect(() => {
    if (modal.type !== "create" || !createDraft || createDraft.listId || !lists?.[0]) {
      return;
    }
    setCreateDraft({ ...createDraft, listId: lists[0].id });
  }, [modal.type, createDraft, lists]);

  const activeListId =
    modal.type === "edit"
      ? modal.listId
      : modal.type === "create"
        ? createDraft?.listId ?? null
        : null;

  const { data: activeList } = trpc.lists.get.useQuery(
    { id: activeListId! },
    { enabled: !!activeListId && modal.type !== "closed" },
  );

  const detailItem =
    modal.type === "edit"
      ? (activeList?.items.find((item) => item.id === modal.itemId) ?? null)
      : null;

  const sections = activeList?.sections ?? [];

  const updateItem = trpc.lists.items.update.useMutation({
    onSuccess: async () => {
      await utils.todos.list.invalidate();
      if (activeListId) await utils.lists.get.invalidate({ id: activeListId });
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not update item")),
  });

  const createItem = trpc.lists.items.create.useMutation({
    onError: (e) => setError(trpcErrorMessage(e, "Could not create item")),
  });

  const deleteItem = trpc.lists.items.delete.useMutation({
    onSuccess: async () => {
      await utils.todos.list.invalidate();
      closeModal();
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not delete item")),
  });

  const setAssignees = trpc.lists.items.setAssignees.useMutation({
    onSuccess: async () => {
      await utils.todos.list.invalidate();
      if (activeListId) await utils.lists.get.invalidate({ id: activeListId });
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not update assignees")),
  });

  const pending =
    updateItem.isPending ||
    createItem.isPending ||
    deleteItem.isPending ||
    setAssignees.isPending;

  function closeModal() {
    setModal({ type: "closed" });
    setCreateDraft(null);
  }

  function openItem(item: AssignedTodoItem) {
    setCreateDraft(null);
    setModal({ type: "edit", listId: item.listId, itemId: item.id });
  }

  function openCreate(assigneeId: string) {
    const defaultListId = lists?.[0]?.id ?? null;
    setCreateDraft(
      emptyListItemFormValues(defaultAssigneeIdsForLane(assigneeId), defaultListId),
    );
    setModal({ type: "create" });
    setError(null);
  }

  function setCompletion(
    itemId: string,
    completedByMemberId: string | null,
    itemPoints: number,
  ) {
    updateItem.mutate(
      { id: itemId, completedByMemberId },
      {
        onSuccess: async () => {
          await invalidateMemberPointsAfterCompletion(utils, itemPoints);
        },
      },
    );
  }

  function toggleComplete(item: AssignedTodoItem, laneAssigneeId?: string) {
    if (isListItemCompleted(item)) {
      setCompletion(item.id, null, item.points);
      return;
    }

    completeListItem({
      itemId: item.id,
      assigneeIds: item.assigneeIds,
      laneAssigneeId,
      familyMembers,
      onComplete: (itemId, memberId) => setCompletion(itemId, memberId, item.points),
    });
  }

  function patchCreateDraft(patch: Partial<ListItemFormValues>) {
    setCreateDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function submitCreate() {
    if (!createDraft?.listId) {
      setError("Choose a list");
      return;
    }
    const name = createDraft.name.trim();
    if (!name) {
      setError("Enter a title");
      return;
    }

    try {
      const item = await createItem.mutateAsync({
        listId: createDraft.listId,
        sectionId: createDraft.sectionId,
        name,
        points: createDraft.points,
      });

      await setAssignees.mutateAsync({
        id: item.id,
        memberIds: createDraft.assigneeIds,
      });

      await utils.todos.list.invalidate();
      await utils.lists.get.invalidate({ id: createDraft.listId });
      closeModal();
      setError(null);
    } catch {
      // Errors surfaced via mutation onError
    }
  }

  const isOpen = modal.type !== "closed";
  const isCreate = modal.type === "create";

  return {
    modal,
    detailItem,
    sections,
    lists: lists ?? [],
    createDraft,
    isOpen,
    isCreate,
    pending,
    error,
    openItem,
    openCreate,
    closeModal,
    toggleComplete,
    patchCreateDraft,
    submitCreate,
    onSaveName: (name: string) => {
      if (modal.type !== "edit" || !detailItem || isListItemCompleted(detailItem)) return;
      updateItem.mutate({ id: modal.itemId, name });
    },
    onToggleComplete: (complete: boolean) => {
      if (modal.type !== "edit" || !detailItem) return;
      if (complete) {
        completeListItem({
          itemId: detailItem.id,
          assigneeIds: detailItem.assigneeIds,
          familyMembers,
          onComplete: (itemId, memberId) =>
            setCompletion(itemId, memberId, detailItem.points),
        });
      } else {
        setCompletion(detailItem.id, null, detailItem.points);
      }
    },
    onChangePoints: (points: number) => {
      if (modal.type !== "edit" || !detailItem || isListItemCompleted(detailItem)) return;
      updateItem.mutate({ id: modal.itemId, points });
    },
    onChangeSection: (sectionId: string | null) => {
      if (modal.type !== "edit" || !detailItem || isListItemCompleted(detailItem)) return;
      updateItem.mutate({ id: modal.itemId, sectionId });
    },
    onSetAssignees: (memberIds: string[]) => {
      if (modal.type !== "edit" || !detailItem || isListItemCompleted(detailItem)) return;
      setAssignees.mutate({ id: modal.itemId, memberIds });
    },
    onDelete: () => {
      if (modal.type !== "edit") return;
      deleteItem.mutate({ id: modal.itemId });
    },
    editListId: modal.type === "edit" ? modal.listId : null,
  };
}
