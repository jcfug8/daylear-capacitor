import { IonIcon, IonItem, IonLabel, IonList, IonNote } from "@ionic/react";
import { chevronForwardOutline, personOutline } from "ionicons/icons";
import { ItemPointsLabel } from "../../../components/ItemPointsLabel";
import {
  memberDisplayName,
  type MemberNameFields,
} from "../../../lib/member-display-name";

export type ManageRewardRow = {
  id: string;
  name: string;
  points: number;
  assigneeIds: string[];
};

type ManageRewardsListProps = {
  rewards: ManageRewardRow[];
  members: MemberNameFields[];
  onSelect: (rewardId: string) => void;
};

function assigneeSummary(reward: ManageRewardRow, members: MemberNameFields[]) {
  if (reward.assigneeIds.length === 0) return "Unassigned";
  const names = reward.assigneeIds
    .map((id) => members.find((member) => member.id === id))
    .filter((member): member is MemberNameFields => !!member)
    .map((member) => memberDisplayName(member));
  return names.join(", ");
}

export function ManageRewardsList({ rewards, members, onSelect }: ManageRewardsListProps) {
  return (
    <IonList lines="full">
      {rewards.map((reward) => (
        <IonItem key={reward.id} button detail={false} onClick={() => onSelect(reward.id)}>
          <IonLabel className="ion-text-wrap min-w-0">
            <h3 className="m-0 text-base font-normal">{reward.name}</h3>
            <IonNote className="flex items-center gap-1 mt-0.5">
              <IonIcon icon={personOutline} className="text-sm shrink-0" />
              <span>{assigneeSummary(reward, members)}</span>
            </IonNote>
          </IonLabel>
          <div slot="end" className="flex items-center gap-2 shrink-0">
            <ItemPointsLabel points={reward.points} />
            <IonIcon icon={chevronForwardOutline} className="text-[var(--ion-color-medium)]" />
          </div>
        </IonItem>
      ))}
    </IonList>
  );
}
