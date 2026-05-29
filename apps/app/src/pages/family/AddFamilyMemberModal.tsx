import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { JoinCodeWaitPanel } from "../../components/JoinCodeWaitPanel";
import { trpcErrorMessage } from "../../lib/trpc-errors";
import { trpc } from "../../lib/trpc";

type AddMemberMode = "email" | "code" | "profile";

type InviteCodeState = {
  code: string;
  expiresAt: Date;
  adultEmail: string;
  joinerEmail: string;
};

type AddFamilyMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddFamilyMemberModal({ isOpen, onClose }: AddFamilyMemberModalProps) {
  const utils = trpc.useUtils();
  const [addMemberMode, setAddMemberMode] = useState<AddMemberMode>("profile");
  const [error, setError] = useState<string | null>(null);

  const [joinerEmail, setJoinerEmail] = useState("");
  const [confirmJoinerEmail, setConfirmJoinerEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [memberType, setMemberType] = useState<"parent" | "child">("child");

  const [inviteCode, setInviteCode] = useState<InviteCodeState | null>(null);

  function resetForm() {
    setAddMemberMode("profile");
    setError(null);
    setInviteCode(null);
    setJoinerEmail("");
    setConfirmJoinerEmail("");
    setConfirmCode("");
    setDisplayName("");
    setMemberType("child");
  }

  const inviteByEmail = trpc.families.inviteByEmail.useMutation({
    onSuccess: (data) => {
      setInviteCode({
        code: data.code,
        expiresAt: new Date(data.expiresAt),
        adultEmail: data.adultEmail,
        joinerEmail: data.joinerEmail,
      });
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not create invite")),
  });

  const confirmJoinByCode = trpc.families.confirmJoinByCode.useMutation({
    onSuccess: async () => {
      await utils.families.current.invalidate();
      resetForm();
      onClose();
    },
    onError: (e) => setError(trpcErrorMessage(e, "Invalid or expired code")),
  });

  const createMember = trpc.families.members.create.useMutation({
    onSuccess: async () => {
      await utils.families.current.invalidate();
      resetForm();
      onClose();
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not add member")),
  });

  const pending =
    inviteByEmail.isPending || confirmJoinByCode.isPending || createMember.isPending;

  function close() {
    if (pending) return;
    resetForm();
    onClose();
  }

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={close}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={close} disabled={pending}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>Add member</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSegment
          value={addMemberMode}
          onIonChange={(e) => {
            setAddMemberMode((e.detail.value as AddMemberMode) ?? "profile");
            setInviteCode(null);
            setError(null);
          }}
        >
          <IonSegmentButton value="profile">
            <IonLabel>No Login</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="email">
            <IonLabel>Share a Code</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="code">
            <IonLabel>Enter Their Code</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {error && (
          <IonNote color="danger" className="mt-4 block">
            {error}
          </IonNote>
        )}

        {addMemberMode === "email" && (
          <div className="mt-4">
            <IonText color="medium">
              <p className="text-sm mb-3">
                Enter their email and share the code. They join under{" "}
                <strong>Join a family → I have a code</strong> (your email + code).
              </p>
            </IonText>
            {!inviteCode ? (
              <>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Their email</IonLabel>
                    <IonInput
                      type="email"
                      value={joinerEmail}
                      disabled={pending}
                      onIonInput={(e) => setJoinerEmail(e.detail.value ?? "")}
                    />
                  </IonItem>
                </IonList>
                <IonButton
                  expand="block"
                  className="mt-3"
                  disabled={inviteByEmail.isPending || !joinerEmail.trim()}
                  onClick={() => inviteByEmail.mutate({ joinerEmail: joinerEmail.trim() })}
                >
                  {inviteByEmail.isPending ? "Generating…" : "Generate code"}
                </IonButton>
              </>
            ) : (
              <>
                <JoinCodeWaitPanel
                  code={inviteCode.code}
                  expiresAt={inviteCode.expiresAt}
                  adultEmail={inviteCode.adultEmail}
                  joinerEmail={inviteCode.joinerEmail}
                  initiatedBy="parent"
                  hint={`They sign in as ${inviteCode.joinerEmail}, then enter your email (${inviteCode.adultEmail}) and this code.`}
                  completedMessage={`${inviteCode.joinerEmail} joined your family!`}
                  onCompleted={async () => {
                    await utils.families.current.invalidate();
                    resetForm();
                    onClose();
                  }}
                />
                <IonButton
                  expand="block"
                  fill="outline"
                  className="mt-3"
                  disabled={pending}
                  onClick={() => {
                    setInviteCode(null);
                    setJoinerEmail("");
                  }}
                >
                  Invite someone else
                </IonButton>
              </>
            )}
          </div>
        )}

        {addMemberMode === "code" && (
          <div className="mt-4">
            <IonText color="medium">
              <p className="text-sm mb-3">
                If they generated a code on their device, enter their email and the 6-digit code
                here.
              </p>
            </IonText>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Their email</IonLabel>
                <IonInput
                  type="email"
                  value={confirmJoinerEmail}
                  disabled={pending}
                  onIonInput={(e) => setConfirmJoinerEmail(e.detail.value ?? "")}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">6-digit code</IonLabel>
                <IonInput
                  value={confirmCode}
                  disabled={pending}
                  onIonInput={(e) =>
                    setConfirmCode((e.detail.value ?? "").replace(/\D/g, "").slice(0, 6))
                  }
                  inputmode="numeric"
                  maxlength={6}
                />
              </IonItem>
            </IonList>
            <IonButton
              expand="block"
              className="mt-3"
              disabled={
                confirmJoinByCode.isPending ||
                confirmCode.length !== 6 ||
                !confirmJoinerEmail.trim()
              }
              onClick={() =>
                confirmJoinByCode.mutate({
                  joinerEmail: confirmJoinerEmail.trim(),
                  code: confirmCode,
                })
              }
            >
              {confirmJoinByCode.isPending ? "Adding…" : "Add member"}
            </IonButton>
          </div>
        )}

        {addMemberMode === "profile" && (
          <div className="mt-4">
            <IonText color="medium">
              <p className="text-sm mb-3">
                For children or parents who will not sign in — they appear on the family board
                only. Tap their card and use <strong>Add login</strong> in the member modal.
              </p>
            </IonText>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput
                  value={displayName}
                  disabled={pending}
                  onIonInput={(e) => setDisplayName(e.detail.value ?? "")}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Type</IonLabel>
                <IonSelect
                  value={memberType}
                  disabled={pending}
                  onIonChange={(e) => setMemberType(e.detail.value as "parent" | "child")}
                >
                  <IonSelectOption value="child">Child</IonSelectOption>
                  <IonSelectOption value="parent">Parent</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonList>
            <IonButton
              expand="block"
              className="mt-3"
              disabled={createMember.isPending || !displayName.trim()}
              onClick={() =>
                createMember.mutate({
                  displayName: displayName.trim(),
                  memberType,
                })
              }
            >
              {createMember.isPending ? "Adding…" : "Add to family"}
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
}
