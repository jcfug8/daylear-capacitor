import { useIonAlert } from "@ionic/react";
import { useCallback } from "react";
import { memberDisplayName, type MemberNameFields } from "../lib/member-display-name";
import { resolveItemCompleter } from "../lib/resolve-item-completer";

type CompleteListItemArgs = {
  itemId: string;
  assigneeIds: string[];
  laneAssigneeId?: string;
  familyMembers: MemberNameFields[];
  onComplete: (itemId: string, completedByMemberId: string | null) => void;
};

export function useCompleteListItem() {
  const [presentAlert] = useIonAlert();

  const completeListItem = useCallback(
    ({
      itemId,
      assigneeIds,
      laneAssigneeId,
      familyMembers,
      onComplete,
    }: CompleteListItemArgs) => {
      const resolution = resolveItemCompleter(assigneeIds, {
        laneAssigneeId,
        familyMemberIds: familyMembers.map((member) => member.id),
      });

      if (resolution.type === "member") {
        onComplete(itemId, resolution.memberId);
        return;
      }

      const candidates = familyMembers.filter((member) =>
        resolution.memberIds.includes(member.id),
      );

      if (candidates.length === 0) {
        return;
      }

      if (candidates.length === 1) {
        onComplete(itemId, candidates[0].id);
        return;
      }

      presentAlert({
        header: "Who completed this?",
        buttons: [
          ...candidates.map((member) => ({
            text: memberDisplayName(member),
            handler: () => onComplete(itemId, member.id),
          })),
          { text: "Cancel", role: "cancel" },
        ],
      });
    },
    [presentAlert],
  );

  return { completeListItem };
}
