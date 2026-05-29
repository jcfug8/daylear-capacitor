import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { memberDisplayName } from "../../lib/member-display-name";
import {
  resolveMemberAvatarColor,
  resolveMemberAvatarIcon,
  type MemberAvatarColorKey,
  type MemberAvatarIconKey,
} from "../../lib/member-avatar";
import { trpcErrorMessage } from "../../lib/trpc-errors";
import { trpc } from "../../lib/trpc";
import { DEFAULT_MEMBER_AVATAR_COLOR, MemberAvatarPicker } from "./MemberAvatarPicker";
import { MemberLinkLoginSection } from "./MemberLinkLoginSection";

export type FamilyMemberRow = {
  id: string;
  userId: string | null;
  userName: string | null;
  displayName: string;
  memberType: "parent" | "child";
  points: number;
  avatarColor?: string | null;
  avatarIcon?: string | null;
};

type FamilyMemberModalProps = {
  member: FamilyMemberRow | null;
  isOpen: boolean;
  onClose: () => void;
  isSelf: boolean;
  isParent: boolean;
  canEdit: boolean;
  onRemoved: (leftSelf: boolean) => void;
};

export function FamilyMemberModal({
  member,
  isOpen,
  onClose,
  isSelf,
  isParent,
  canEdit,
  onRemoved,
}: FamilyMemberModalProps) {
  const [presentAlert] = useIonAlert();
  const utils = trpc.useUtils();

  const [displayName, setDisplayName] = useState("");
  const [memberType, setMemberType] = useState<"parent" | "child">("child");
  const [avatarColor, setAvatarColor] = useState<MemberAvatarColorKey>(DEFAULT_MEMBER_AVATAR_COLOR);
  const [avatarIcon, setAvatarIcon] = useState<MemberAvatarIconKey | null>(null);
  const [showLinkLogin, setShowLinkLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;
    setDisplayName(member.displayName);
    setMemberType(member.memberType);
    setAvatarColor(resolveMemberAvatarColor(member.avatarColor));
    setAvatarIcon(resolveMemberAvatarIcon(member.avatarIcon));
    setShowLinkLogin(false);
    setError(null);
  }, [member]);

  const updateMember = trpc.families.members.update.useMutation({
    onSuccess: async () => {
      await utils.families.current.invalidate();
      setError(null);
      onClose();
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not save member")),
  });

  const unlinkLogin = trpc.families.members.unlinkLogin.useMutation({
    onSuccess: async () => {
      await utils.families.current.invalidate();
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not remove login")),
  });

  const removeMember = trpc.families.members.remove.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.users.me.invalidate();
      await utils.families.current.invalidate();
      onClose();
      onRemoved(variables.memberId === member?.id && isSelf);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not remove member")),
  });

  const pending =
    updateMember.isPending || unlinkLogin.isPending || removeMember.isPending;

  const hasLogin = !!member?.userId;
  const linkedName = member ? memberDisplayName(member) : "";
  const canChangeType = isParent && canEdit;
  const canManageLogin = isParent && canEdit;
  const canDelete = canEdit && (isParent || isSelf);
  const nameReadOnly = hasLogin;

  function confirmDelete() {
    if (!member) return;
    presentAlert({
      header: isSelf ? "Leave family?" : "Remove member?",
      message: isSelf
        ? "You will leave this family. Create or join a family again to use the app."
        : `Remove ${linkedName} from your family? This cannot be undone.`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: isSelf ? "Leave" : "Remove",
          role: "destructive",
          handler: () => removeMember.mutate({ memberId: member.id }),
        },
      ],
    });
  }

  function confirmUnlinkLogin() {
    if (!member) return;
    presentAlert({
      header: "Remove login?",
      message: `${linkedName} will no longer be able to sign in, but will stay on your family board.`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Remove login",
          role: "destructive",
          handler: () => unlinkLogin.mutate({ memberId: member.id }),
        },
      ],
    });
  }

  function handleDone() {
    if (!member || !canEdit) {
      onClose();
      return;
    }

    updateMember.mutate({
      memberId: member.id,
      displayName: nameReadOnly ? undefined : displayName.trim(),
      memberType: canChangeType ? memberType : undefined,
      avatarColor,
      avatarIcon,
    });
  }

  if (!member) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          {canDelete ? (
            <IonButtons slot="start">
              <IonButton
                color="danger"
                aria-label={isSelf ? "Leave family" : "Remove member"}
                disabled={pending}
                onClick={confirmDelete}
              >
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          ) : null}
          <IonTitle>
            {linkedName}
            {isSelf ? " (you)" : ""}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={canEdit ? handleDone : onClose} disabled={pending}>
              {canEdit ? "Done" : "Close"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {canEdit ? (
          <MemberAvatarPicker
            name={nameReadOnly ? linkedName : displayName || member.displayName}
            avatarColor={avatarColor}
            avatarIcon={avatarIcon}
            disabled={pending}
            onColorChange={setAvatarColor}
            onIconChange={setAvatarIcon}
          />
        ) : (
          <MemberAvatarPicker
            name={linkedName}
            avatarColor={resolveMemberAvatarColor(member.avatarColor)}
            avatarIcon={resolveMemberAvatarIcon(member.avatarIcon)}
            disabled
            onColorChange={() => {}}
            onIconChange={() => {}}
          />
        )}

        <IonList lines="full">
          <IonItem>
            <IonInput
              label="Name"
              labelPlacement="stacked"
              value={nameReadOnly ? linkedName : displayName}
              disabled={!canEdit || pending || nameReadOnly}
              onIonInput={(e) => setDisplayName(e.detail.value ?? "")}
            />
          </IonItem>
          {nameReadOnly && (
            <IonNote className="block px-4 pb-2 text-xs">
              Name comes from their login account. Family display name: {member.displayName}
            </IonNote>
          )}

          {canChangeType ? (
            <IonItem lines="none">
              <IonLabel>Type</IonLabel>
              <IonSegment
                slot="end"
                value={memberType}
                disabled={pending}
                onIonChange={(e) =>
                  setMemberType((e.detail.value as "parent" | "child") ?? "child")
                }
              >
                <IonSegmentButton value="parent">
                  <IonLabel>Parent</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="child">
                  <IonLabel>Child</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonItem>
          ) : (
            <IonItem>
              <IonLabel>Type</IonLabel>
              <IonText slot="end">{member.memberType === "child" ? "Child" : "Parent"}</IonText>
            </IonItem>
          )}

          <IonItem>
            <IonLabel>Points</IonLabel>
            <IonText slot="end">{member.points}</IonText>
          </IonItem>

          <IonItem lines="none">
            <IonLabel>Login</IonLabel>
            <IonText slot="end" color={hasLogin ? undefined : "medium"}>
              {hasLogin ? "Can sign in" : "No login"}
            </IonText>
          </IonItem>
        </IonList>

        {canManageLogin && !hasLogin && !showLinkLogin && (
          <IonButton
            expand="block"
            fill="outline"
            className="mt-4"
            disabled={pending}
            onClick={() => setShowLinkLogin(true)}
          >
            Add login
          </IonButton>
        )}

        {canManageLogin && !hasLogin && showLinkLogin && (
          <MemberLinkLoginSection
            memberId={member.id}
            memberName={member.displayName}
            disabled={pending}
            onError={setError}
            onLinked={() => {
              setShowLinkLogin(false);
              void utils.families.current.invalidate();
            }}
          />
        )}

        {canManageLogin && hasLogin && (
          <IonButton
            expand="block"
            fill="outline"
            color="danger"
            className="mt-4"
            disabled={pending}
            onClick={confirmUnlinkLogin}
          >
            Remove login
          </IonButton>
        )}

        {error && (
          <IonNote color="danger" className="mt-4 block">
            {error}
          </IonNote>
        )}
      </IonContent>
    </IonModal>
  );
}
