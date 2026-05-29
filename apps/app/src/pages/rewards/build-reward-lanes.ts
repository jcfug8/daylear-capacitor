import {
  memberDisplayName,
  type MemberNameFields,
} from "../../lib/member-display-name";

export type AssignedReward = {
  id: string;
  name: string;
  points: number;
  assigneeId: string;
};

export type RewardLane = {
  assigneeId: string;
  label: string;
  memberPoints: number;
  rewards: AssignedReward[];
};

export function buildRewardLanes(
  members: MemberNameFields[],
  memberPoints: { id: string; points: number }[],
  rewards: AssignedReward[],
): RewardLane[] {
  const pointsByMember = new Map(memberPoints.map((entry) => [entry.id, entry.points]));
  const rewardsByAssignee = new Map<string, AssignedReward[]>();

  for (const reward of rewards) {
    const laneRewards = rewardsByAssignee.get(reward.assigneeId) ?? [];
    laneRewards.push(reward);
    rewardsByAssignee.set(reward.assigneeId, laneRewards);
  }

  return members.map((member) => ({
    assigneeId: member.id,
    label: memberDisplayName(member),
    memberPoints: pointsByMember.get(member.id) ?? 0,
    rewards: rewardsByAssignee.get(member.id) ?? [],
  }));
}
