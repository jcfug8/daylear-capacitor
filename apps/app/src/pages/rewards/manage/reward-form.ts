export type RewardFormValues = {
  name: string;
  points: number;
  assigneeIds: string[];
};

export type RewardDetail = {
  id: string;
  name: string;
  points: number;
  assigneeIds: string[];
};

export function emptyRewardFormValues(assigneeIds: string[] = []): RewardFormValues {
  return {
    name: "",
    points: 0,
    assigneeIds,
  };
}

export function rewardFormValuesFromDetail(reward: RewardDetail): RewardFormValues {
  return {
    name: reward.name,
    points: reward.points,
    assigneeIds: reward.assigneeIds,
  };
}
