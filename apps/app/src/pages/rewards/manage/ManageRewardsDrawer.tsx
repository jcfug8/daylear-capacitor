import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { useMemo, useState } from "react";
import type { MemberNameFields } from "../../../lib/member-display-name";
import { trpcErrorMessage } from "../../../lib/trpc-errors";
import { trpc } from "../../../lib/trpc";
import { ManageRewardsList } from "./ManageRewardsList";
import { RewardModal } from "./RewardModal";
import { emptyRewardFormValues } from "./reward-form";

type ManageRewardsDrawerProps = {
  isOpen: boolean;
  family?: { members: MemberNameFields[] };
  onClose: () => void;
};

export function ManageRewardsDrawer({ isOpen, family, onClose }: ManageRewardsDrawerProps) {
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState(emptyRewardFormValues());
  const [editRewardId, setEditRewardId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: rewards, isLoading } = trpc.rewards.list.useQuery(undefined, {
    enabled: isOpen,
  });

  const editReward = useMemo(
    () => rewards?.find((reward) => reward.id === editRewardId) ?? null,
    [editRewardId, rewards],
  );

  const createReward = trpc.rewards.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.rewards.list.invalidate(),
        utils.rewards.board.invalidate(),
        utils.families.current.invalidate(),
      ]);
      setCreateOpen(false);
      setCreateDraft(emptyRewardFormValues());
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not create reward")),
  });

  const updateReward = trpc.rewards.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.rewards.list.invalidate(),
        utils.rewards.board.invalidate(),
      ]);
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not update reward")),
  });

  const deleteReward = trpc.rewards.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.rewards.list.invalidate(),
        utils.rewards.board.invalidate(),
      ]);
      setEditRewardId(null);
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not delete reward")),
  });

  const setAssignees = trpc.rewards.setAssignees.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.rewards.list.invalidate(),
        utils.rewards.board.invalidate(),
      ]);
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not update assignees")),
  });

  const pending =
    createReward.isPending ||
    updateReward.isPending ||
    deleteReward.isPending ||
    setAssignees.isPending;

  function submitCreate() {
    const name = createDraft.name.trim();
    if (!name) {
      setError("Enter a name");
      return;
    }
    if (createDraft.assigneeIds.length === 0) {
      setError("Assign at least one person");
      return;
    }
    createReward.mutate({
      name,
      points: createDraft.points,
      memberIds: createDraft.assigneeIds,
    });
  }

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        className="manage-rewards-modal"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Manage rewards</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>Done</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="flex items-center justify-between gap-2 mb-4">
            <IonText>
              <p className="m-0 text-sm text-[var(--ion-color-medium)]">
                Add rewards and assign them to family members.
              </p>
            </IonText>
            <IonButton
              fill="clear"
              aria-label="Add reward"
              onClick={() => {
                setCreateDraft(emptyRewardFormValues());
                setCreateOpen(true);
              }}
            >
              <IonIcon icon={addOutline} slot="icon-only" />
            </IonButton>
          </div>

          {isLoading && (
            <div className="ion-text-center ion-padding">
              <IonSpinner name="crescent" />
            </div>
          )}

          {!isLoading && rewards && family && (
            <ManageRewardsList
              rewards={rewards}
              members={family.members}
              onSelect={setEditRewardId}
            />
          )}

          {rewards?.length === 0 && !isLoading && (
            <IonNote className="block text-center">No rewards yet. Tap + to add one.</IonNote>
          )}

          {error && (
            <IonNote color="danger" className="block mt-3">
              {error}
            </IonNote>
          )}
        </IonContent>
      </IonModal>

      {createOpen && (
        <RewardModal
          mode="create"
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          family={family}
          pending={pending}
          values={createDraft}
          onValuesChange={(patch) => setCreateDraft((prev) => ({ ...prev, ...patch }))}
          onCreate={submitCreate}
        />
      )}

      {editReward && (
        <RewardModal
          mode="edit"
          isOpen={!!editRewardId}
          onClose={() => setEditRewardId(null)}
          family={family}
          pending={pending}
          reward={editReward}
          onSaveName={(name) => updateReward.mutate({ id: editReward.id, name })}
          onChangePoints={(points) => updateReward.mutate({ id: editReward.id, points })}
          onSetAssignees={(memberIds) =>
            setAssignees.mutate({ id: editReward.id, memberIds })
          }
          onDelete={() => deleteReward.mutate({ id: editReward.id })}
        />
      )}
    </>
  );
}
