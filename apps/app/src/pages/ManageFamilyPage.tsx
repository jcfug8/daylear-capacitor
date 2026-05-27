import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonText,
  useIonAlert,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JoinCodeWaitPanel } from "../components/JoinCodeWaitPanel";
import { memberDisplayName } from "../lib/member-display-name";
import { trpcErrorMessage } from "../lib/trpc-errors";
import { trpc } from "../lib/trpc";

type AddPanel = "none" | "add-member" | "link-login" | "invite-parent";
type AddMemberMode = "email" | "code" | "profile";

type InviteCodeState = {
  code: string;
  expiresAt: Date;
  adultEmail: string;
  joinerEmail: string;
};

export function ManageFamilyPage() {
  const navigate = useNavigate();
  const [presentAlert] = useIonAlert();
  const utils = trpc.useUtils();
  const { data: current, isLoading } = trpc.families.current.useQuery();
  const [panel, setPanel] = useState<AddPanel>("none");
  const [addMemberMode, setAddMemberMode] = useState<AddMemberMode>("email");
  const [error, setError] = useState<string | null>(null);

  const [joinerEmail, setJoinerEmail] = useState("");
  const [confirmJoinerEmail, setConfirmJoinerEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [memberType, setMemberType] = useState<"parent" | "child">("child");

  const [inviteCode, setInviteCode] = useState<InviteCodeState | null>(null);

  const [linkLoginMember, setLinkLoginMember] = useState<{
    id: string;
    displayName: string;
  } | null>(null);
  const [linkLoginEmail, setLinkLoginEmail] = useState("");
  const [linkLoginCode, setLinkLoginCode] = useState<InviteCodeState | null>(null);
  const [linkLoginMode, setLinkLoginMode] = useState<"share" | "enter">("share");
  const linkLoginPanelRef = useRef<HTMLDivElement>(null);
  const addMemberPanelRef = useRef<HTMLDivElement>(null);

  const [inviteParentEmail, setInviteParentEmail] = useState("");
  const [confirmingParentEmail, setConfirmingParentEmail] = useState("");
  const [inviteParentCode, setInviteParentCode] = useState<InviteCodeState | null>(null);

  function closeLinkLogin() {
    if (panel === "link-login") {
      setPanel("none");
    }
    setLinkLoginMember(null);
    setLinkLoginEmail("");
    setLinkLoginCode(null);
    setLinkLoginMode("share");
  }

  function closeAddMember() {
    if (panel === "add-member") {
      setPanel("none");
    }
    setInviteCode(null);
    setJoinerEmail("");
    setConfirmJoinerEmail("");
    setConfirmCode("");
    setDisplayName("");
    setAddMemberMode("email");
  }

  function startLinkLogin(member: { id: string; displayName: string }) {
    closeAddMember();
    setLinkLoginMember(member);
    setLinkLoginEmail("");
    setLinkLoginCode(null);
    setLinkLoginMode("share");
    setPanel("link-login");
    setError(null);
  }

  function openAddMember() {
    closeLinkLogin();
    setAddMemberMode("email");
    setPanel("add-member");
    setError(null);
  }

  useEffect(() => {
    if (panel === "link-login" && linkLoginMember) {
      linkLoginPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [panel, linkLoginMember]);

  useEffect(() => {
    if (panel === "add-member") {
      addMemberPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [panel]);

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

  const inviteLoginForMember = trpc.families.inviteLoginForMember.useMutation({
    onSuccess: (data) => {
      setLinkLoginCode({
        code: data.code,
        expiresAt: new Date(data.expiresAt),
        adultEmail: data.adultEmail,
        joinerEmail: data.joinerEmail,
      });
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not create login invite")),
  });

  const confirmJoinByCode = trpc.families.confirmJoinByCode.useMutation({
    onSuccess: async () => {
      await utils.families.current.invalidate();
      closeAddMember();
      closeLinkLogin();
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Invalid or expired code")),
  });

  const createMember = trpc.families.members.create.useMutation({
    onSuccess: async () => {
      await utils.families.current.invalidate();
      closeAddMember();
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not add member")),
  });

  const requestFamilyInvite = trpc.families.requestFamilyInvite.useMutation({
    onSuccess: (data) => {
      setInviteParentCode({
        code: data.code,
        expiresAt: new Date(data.expiresAt),
        adultEmail: data.adultEmail,
        joinerEmail: data.joinerEmail,
      });
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not create invite")),
  });

  const removeMember = trpc.families.members.remove.useMutation({
    onSuccess: async (_data, variables) => {
      const leftSelf = variables.memberId === current?.myMembership.id;
      await utils.users.me.invalidate();
      await utils.families.current.invalidate();
      setError(null);
      if (leftSelf) {
        navigate("/onboarding", { replace: true });
      }
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not remove member")),
  });

  const isParent = current?.myMembership.memberType === "parent";
  const isChild = current?.myMembership.memberType === "child";

  function confirmRemoveMember(member: {
    id: string;
    userId: string | null;
    userName?: string | null;
    displayName: string;
  }) {
    if (!current) return;
    const isSelf = member.id === current.myMembership.id;
    const name = memberDisplayName(member);
    presentAlert({
      header: isSelf ? "Leave family?" : "Remove member?",
      message: isSelf
        ? "You will leave this family. Create or join a family again to use the app."
        : `Remove ${name} from your family? This cannot be undone.`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: isSelf ? "Leave" : "Remove",
          role: "destructive",
          handler: () => {
            removeMember.mutate({ memberId: member.id });
          },
        },
      ],
    });
  }

  if (isLoading) {
    return <IonNote>Loading family…</IonNote>;
  }

  if (!current) {
    return <IonNote>No family found.</IonNote>;
  }

  return (
    <>
      <IonText>
        <h2 className="text-xl font-semibold mb-1">{current.family.name}</h2>
      </IonText>
      <IonText color="medium">
        <p className="mb-4 text-sm">Members of your family</p>
      </IonText>

      <IonList lines="full" className="mb-4">
        {current.members.map((member) => {
          const isSelf = member.id === current.myMembership.id;
          const name = memberDisplayName(member);
          return (
            <IonItem key={member.id}>
              <IonLabel>
                <h3>
                  {name}
                  {isSelf ? " (you)" : ""}
                </h3>
                <p>
                  {member.memberType === "child" ? "Child" : "Parent"}
                  {member.userId ? " · can sign in" : " · no login"}
                </p>
              </IonLabel>
              {(isParent || (isChild && isSelf)) && (
                <div slot="end" className="flex items-center">
                  {isParent && !member.userId && (
                    <IonButton
                      fill="clear"
                      size="small"
                      onClick={() => startLinkLogin(member)}
                    >
                      Add login
                    </IonButton>
                  )}
                  {(isParent || isSelf) && (
                    <IonButton
                      fill="clear"
                      color="danger"
                      size="small"
                      disabled={removeMember.isPending}
                      onClick={() => confirmRemoveMember(member)}
                    >
                      {isSelf ? "Leave" : "Remove"}
                    </IonButton>
                  )}
                </div>
              )}
            </IonItem>
          );
        })}
      </IonList>

      {error && (
        <IonNote color="danger" className="block mb-3">
          {error}
        </IonNote>
      )}

      {panel === "link-login" && linkLoginMember && (
        <div ref={linkLoginPanelRef}>
        <IonCard className="mb-4">
          <IonCardHeader>
            <IonCardTitle>Link login — {linkLoginMember.displayName}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonSegment
              value={linkLoginMode}
              onIonChange={(e) => {
                setLinkLoginMode((e.detail.value as "share" | "enter") ?? "share");
                setLinkLoginCode(null);
                setError(null);
              }}
            >
              <IonSegmentButton value="share">
                <IonLabel>Share a Code</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="enter">
                <IonLabel>Enter Their Code</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            {linkLoginMode === "share" ? (
              <div className="mt-4">
                <IonText color="medium">
                  <p className="text-sm mb-3">
                    Enter their email, generate a code, then they sign in on their device under{" "}
                    <strong>Join a family → I have a code</strong> (your email + this code).
                    Their name stays &quot;{linkLoginMember.displayName}&quot;.
                  </p>
                </IonText>
                {!linkLoginCode ? (
                  <>
                    <IonList>
                      <IonItem>
                        <IonLabel position="stacked">Their email</IonLabel>
                        <IonInput
                          type="email"
                          value={linkLoginEmail}
                          onIonInput={(e) => setLinkLoginEmail(e.detail.value ?? "")}
                        />
                      </IonItem>
                    </IonList>
                    <IonButton
                      expand="block"
                      className="mt-3"
                      disabled={
                        inviteLoginForMember.isPending || !linkLoginEmail.trim()
                      }
                      onClick={() =>
                        inviteLoginForMember.mutate({
                          memberId: linkLoginMember.id,
                          joinerEmail: linkLoginEmail.trim(),
                        })
                      }
                    >
                      {inviteLoginForMember.isPending ? "Generating…" : "Generate code"}
                    </IonButton>
                  </>
                ) : (
                  <>
                    <JoinCodeWaitPanel
                      code={linkLoginCode.code}
                      expiresAt={linkLoginCode.expiresAt}
                      adultEmail={linkLoginCode.adultEmail}
                      joinerEmail={linkLoginCode.joinerEmail}
                      initiatedBy="parent"
                      hint={`They sign in as ${linkLoginCode.joinerEmail}, then enter your email (${linkLoginCode.adultEmail}) and this code.`}
                      completedMessage={`${linkLoginMember.displayName} can now sign in!`}
                      onCompleted={async () => {
                        await utils.families.current.invalidate();
                        closeLinkLogin();
                      }}
                    />
                    <IonButton
                      expand="block"
                      fill="outline"
                      className="mt-3"
                      onClick={() => {
                        setLinkLoginCode(null);
                        setLinkLoginEmail("");
                      }}
                    >
                      Use a different email
                    </IonButton>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <IonText color="medium">
                  <p className="text-sm mb-3">
                    If they already started on their phone and gave you a 6-digit code, enter it
                    here. Use the email for the account they are creating.
                  </p>
                </IonText>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Their email</IonLabel>
                    <IonInput
                      type="email"
                      value={confirmJoinerEmail}
                      onIonInput={(e) => setConfirmJoinerEmail(e.detail.value ?? "")}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">6-digit code</IonLabel>
                    <IonInput
                      value={confirmCode}
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
                  {confirmJoinByCode.isPending ? "Linking…" : "Confirm code"}
                </IonButton>
              </div>
            )}

            <IonButton expand="block" fill="clear" className="mt-2" onClick={closeLinkLogin}>
              Cancel
            </IonButton>
          </IonCardContent>
        </IonCard>
        </div>
      )}

      {isParent && (
        <>
          {panel !== "add-member" && panel !== "link-login" && (
            <IonButton expand="block" className="mb-4" onClick={openAddMember}>
              Add member
            </IonButton>
          )}

          {panel === "add-member" && (
            <div ref={addMemberPanelRef}>
              <IonCard className="mb-4">
                <IonCardHeader>
                  <IonCardTitle>Add a member</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonSegment
                    value={addMemberMode}
                    onIonChange={(e) => {
                      setAddMemberMode((e.detail.value as AddMemberMode) ?? "email");
                      setInviteCode(null);
                      setError(null);
                    }}
                  >
                    <IonSegmentButton value="email">
                      <IonLabel>Share a Code</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="code">
                      <IonLabel>Enter Their Code</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="profile">
                      <IonLabel>No Login</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>

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
                                onIonInput={(e) => setJoinerEmail(e.detail.value ?? "")}
                              />
                            </IonItem>
                          </IonList>
                          <IonButton
                            expand="block"
                            className="mt-3"
                            disabled={inviteByEmail.isPending || !joinerEmail.trim()}
                            onClick={() =>
                              inviteByEmail.mutate({ joinerEmail: joinerEmail.trim() })
                            }
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
                              closeAddMember();
                            }}
                          />
                          <IonButton
                            expand="block"
                            fill="outline"
                            className="mt-3"
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
                          If they generated a code on their device, enter their email and the
                          6-digit code here.
                        </p>
                      </IonText>
                      <IonList>
                        <IonItem>
                          <IonLabel position="stacked">Their email</IonLabel>
                          <IonInput
                            type="email"
                            value={confirmJoinerEmail}
                            onIonInput={(e) => setConfirmJoinerEmail(e.detail.value ?? "")}
                          />
                        </IonItem>
                        <IonItem>
                          <IonLabel position="stacked">6-digit code</IonLabel>
                          <IonInput
                            value={confirmCode}
                            onIonInput={(e) =>
                              setConfirmCode(
                                (e.detail.value ?? "").replace(/\D/g, "").slice(0, 6),
                              )
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
                          For children or parents who will not sign in — they appear on the
                          family board only. You can link a login later with{" "}
                          <strong>Add login</strong> on their row.
                        </p>
                      </IonText>
                      <IonList>
                        <IonItem>
                          <IonLabel position="stacked">Name</IonLabel>
                          <IonInput
                            value={displayName}
                            onIonInput={(e) => setDisplayName(e.detail.value ?? "")}
                          />
                        </IonItem>
                        <IonItem>
                          <IonLabel position="stacked">Type</IonLabel>
                          <IonSelect
                            value={memberType}
                            onIonChange={(e) =>
                              setMemberType(e.detail.value as "parent" | "child")
                            }
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

                  <IonButton expand="block" fill="clear" className="mt-2" onClick={closeAddMember}>
                    Cancel
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </div>
          )}
        </>
      )}

      {isChild && (
        <>
          <IonListHeader>
            <IonLabel>Invite a parent</IonLabel>
          </IonListHeader>
          <IonText color="medium">
            <p className="text-sm mb-3">
              Generate a code for a parent or guardian to join. A parent already in your
              family must confirm the code under Add member → Enter Their Code.
            </p>
          </IonText>
          <IonChip
            color={panel === "invite-parent" ? "primary" : undefined}
            onClick={() => {
              setPanel(panel === "invite-parent" ? "none" : "invite-parent");
              setInviteParentCode(null);
              setError(null);
            }}
          >
            Get a code
          </IonChip>

          {panel === "invite-parent" && (
            <div className="mb-6 mt-3">
              {!inviteParentCode ? (
                <>
                  <IonList>
                    <IonItem>
                      <IonLabel position="stacked">Parent email to add</IonLabel>
                      <IonInput
                        type="email"
                        value={inviteParentEmail}
                        onIonInput={(e) => setInviteParentEmail(e.detail.value ?? "")}
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">
                        Confirming parent email (in your family)
                      </IonLabel>
                      <IonInput
                        type="email"
                        value={confirmingParentEmail}
                        onIonInput={(e) =>
                          setConfirmingParentEmail(e.detail.value ?? "")
                        }
                      />
                    </IonItem>
                  </IonList>
                  <IonButton
                    expand="block"
                    className="mt-3"
                    disabled={
                      requestFamilyInvite.isPending ||
                      !inviteParentEmail.trim() ||
                      !confirmingParentEmail.trim()
                    }
                    onClick={() =>
                      requestFamilyInvite.mutate({
                        joinerEmail: inviteParentEmail.trim(),
                        adultEmail: confirmingParentEmail.trim(),
                        memberType: "parent",
                      })
                    }
                  >
                    {requestFamilyInvite.isPending ? "Generating…" : "Generate code"}
                  </IonButton>
                </>
              ) : (
                <>
                  <JoinCodeWaitPanel
                    code={inviteParentCode.code}
                    expiresAt={inviteParentCode.expiresAt}
                    adultEmail={inviteParentCode.adultEmail}
                    joinerEmail={inviteParentCode.joinerEmail}
                    initiatedBy="joiner"
                    hint={`Ask the parent at ${inviteParentCode.adultEmail} to open Manage family → Add member → Enter Their Code and enter ${inviteParentCode.joinerEmail} plus this code. The new parent signs in with ${inviteParentCode.joinerEmail} under Join a family → I have a code.`}
                    completedMessage={`${inviteParentCode.joinerEmail} joined your family!`}
                    onCompleted={async () => {
                      await utils.families.current.invalidate();
                      setPanel("none");
                      setInviteParentCode(null);
                      setInviteParentEmail("");
                      setConfirmingParentEmail("");
                    }}
                  />
                  <IonButton
                    expand="block"
                    fill="outline"
                    className="mt-3"
                    onClick={() => {
                      setInviteParentCode(null);
                      setInviteParentEmail("");
                    }}
                  >
                    Invite someone else
                  </IonButton>
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
