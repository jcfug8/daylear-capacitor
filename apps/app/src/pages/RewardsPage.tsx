import { IonButton, IonNote, IonSpinner, IonText } from "@ionic/react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { trpcErrorMessage } from "../lib/trpc-errors";
import { trpc } from "../lib/trpc";
import { buildRewardLanes } from "./rewards/build-reward-lanes";
import type { AssignedReward, RewardLane } from "./rewards/build-reward-lanes";
import { RedeemRewardModal } from "./rewards/components/RedeemRewardModal";
import { RewardSwimLanesBoard } from "./rewards/components/RewardSwimLanesBoard";
import { ManageRewardsDrawer } from "./rewards/manage/ManageRewardsDrawer";

export function RewardsPage() {
  const utils = trpc.useUtils();
  const { data: family, isLoading: familyLoading } = trpc.families.current.useQuery();
  const { data: board, isLoading: boardLoading } = trpc.rewards.board.useQuery();

  const [manageOpen, setManageOpen] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState<{
    reward: AssignedReward;
    lane: RewardLane;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lanes = useMemo(() => {
    if (!family || !board) return [];
    return buildRewardLanes(family.members, board.members, board.rewards);
  }, [board, family]);

  const redeem = trpc.rewards.redeem.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.rewards.board.invalidate(),
        utils.families.current.invalidate(),
      ]);
      setRedeemTarget(null);
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not redeem reward")),
  });

  const isLoading = familyLoading || boardLoading;

  function confirmRedeem() {
    if (!redeemTarget) return;
    redeem.mutate({
      memberId: redeemTarget.lane.assigneeId,
      rewardId: redeemTarget.reward.id,
    });
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0">
      <PageHeader
        title="Rewards"
        end={
          !isLoading && family ? (
            <IonButton
              fill="outline"
              size="small"
              className="m-0 shrink-0"
              onClick={() => setManageOpen(true)}
            >
              Manage rewards
            </IonButton>
          ) : undefined
        }
      />
      <div className="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden w-full">
        {isLoading && (
          <div className="ion-text-center ion-padding flex-1">
            <IonSpinner name="crescent" />
            <IonText color="medium">
              <p className="mt-2">Loading rewards…</p>
            </IonText>
          </div>
        )}

        {!isLoading && family && (
          <RewardSwimLanesBoard
            lanes={lanes}
            redeemPending={redeem.isPending}
            onSelectReward={(reward, lane) => setRedeemTarget({ reward, lane })}
          />
        )}

        {!isLoading && lanes.every((lane) => lane.rewards.length === 0) && (
          <IonNote className="ion-text-center block mt-2 px-4">
            No rewards yet. Tap Manage rewards to add some.
          </IonNote>
        )}
      </div>

      <ManageRewardsDrawer
        isOpen={manageOpen}
        family={family ?? undefined}
        onClose={() => setManageOpen(false)}
      />

      <RedeemRewardModal
        isOpen={!!redeemTarget}
        lane={redeemTarget?.lane ?? null}
        reward={redeemTarget?.reward ?? null}
        pending={redeem.isPending}
        onClose={() => setRedeemTarget(null)}
        onConfirm={confirmRedeem}
      />

      {error && (
        <IonNote color="danger" className="block mt-3 px-4">
          {error}
        </IonNote>
      )}
    </div>
  );
}
