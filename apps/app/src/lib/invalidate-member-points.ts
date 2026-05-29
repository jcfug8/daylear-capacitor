import type { trpc } from "./trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

/** Refetch balances shown on the rewards page and in family member data. */
export async function invalidateMemberPoints(utils: TrpcUtils) {
  await Promise.all([
    utils.rewards.board.invalidate(),
    utils.families.current.invalidate(),
  ]);
}

/** Call when completing/uncompleting an item that awards or revokes points. */
export async function invalidateMemberPointsAfterCompletion(
  utils: TrpcUtils,
  itemPoints: number,
) {
  if (itemPoints <= 0) return;
  await invalidateMemberPoints(utils);
}
