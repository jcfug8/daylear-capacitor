import { IonIcon, IonNote, IonText } from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MemberAvatar } from "../components/MemberAvatar";
import { PageHeader } from "../components/PageHeader";
import { memberDisplayName } from "../lib/member-display-name";
import { trpc } from "../lib/trpc";
import { AddFamilyMemberModal } from "./family/AddFamilyMemberModal";
import { FamilyMemberModal } from "./family/FamilyMemberModal";
import { LIST_ITEM_CARD } from "./lists/lib/list-item-card-styles";

export function ManageFamilyPage() {
  const navigate = useNavigate();
  const { data: current, isLoading } = trpc.families.current.useQuery();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const isParent = current?.myMembership.memberType === "parent";
  const selectedMember =
    selectedMemberId && current
      ? (current.members.find((member) => member.id === selectedMemberId) ?? null)
      : null;

  if (isLoading) {
    return <IonNote>Loading family…</IonNote>;
  }

  if (!current) {
    return <IonNote>No family found.</IonNote>;
  }

  return (
    <>
      <PageHeader
        title="Family"
        addLabel="Add member"
        onAdd={isParent ? () => setAddMemberOpen(true) : undefined}
      />
      <IonText>
        <h2 className="text-xl font-semibold mb-1">{current.family.name}</h2>
      </IonText>
      <IonText color="medium">
        <p className="mb-4 text-sm">Members of your family</p>
      </IonText>

      <div className="mb-4 flex flex-col gap-2">
        {current.members.map((member) => {
          const isSelf = member.id === current.myMembership.id;
          const name = memberDisplayName(member);
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelectedMemberId(member.id)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left active:opacity-80 ${LIST_ITEM_CARD}`}
            >
              <MemberAvatar member={member} size="md" />
              <div className="min-w-0 flex-1">
                <h3 className="m-0 text-sm font-medium text-[var(--ion-text-color)]">
                  {name}
                  {isSelf ? " (you)" : ""}
                </h3>
                <p className="m-0 mt-1 text-xs text-[var(--ion-color-medium)]">
                  {member.memberType === "child" ? "Child" : "Parent"}
                  {member.userId ? " · can sign in" : " · no login"}
                </p>
              </div>
              <IonIcon
                icon={chevronForwardOutline}
                className="shrink-0 text-[var(--ion-color-medium)]"
              />
            </button>
          );
        })}
      </div>

      <FamilyMemberModal
        member={selectedMember}
        isOpen={selectedMember !== null}
        onClose={() => setSelectedMemberId(null)}
        isSelf={selectedMember?.id === current.myMembership.id}
        isParent={isParent}
        canEdit={
          selectedMember
            ? isParent || selectedMember.id === current.myMembership.id
            : false
        }
        onRemoved={(leftSelf) => {
          setSelectedMemberId(null);
          if (leftSelf) {
            navigate("/onboarding", { replace: true });
          }
        }}
      />

      {isParent && (
        <AddFamilyMemberModal
          isOpen={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
        />
      )}
    </>
  );
}
