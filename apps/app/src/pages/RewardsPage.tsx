import { NameListContent } from "../components/NameListContent";
import { trpc } from "../lib/trpc";

export function RewardsPage() {
  const utils = trpc.useUtils();
  const { data: rewards, isLoading } = trpc.rewards.list.useQuery();
  const createReward = trpc.rewards.create.useMutation({
    onSuccess: () => utils.rewards.list.invalidate(),
  });

  return (
    <NameListContent
      fieldLabel="New reward"
      placeholder="Extra screen time…"
      emptyNote="No rewards yet. Add one above."
      loadingLabel="Loading rewards…"
      items={rewards}
      isLoading={isLoading}
      isCreating={createReward.isPending}
      onAdd={(name) => createReward.mutate({ name })}
    />
  );
}
