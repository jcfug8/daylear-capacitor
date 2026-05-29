import { useState } from "react";
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonText,
} from "@ionic/react";
import { JoinCodeWaitPanel } from "../../components/JoinCodeWaitPanel";
import { trpcErrorMessage } from "../../lib/trpc-errors";
import { trpc } from "../../lib/trpc";

type InviteCodeState = {
  code: string;
  expiresAt: Date;
  adultEmail: string;
  joinerEmail: string;
};

type MemberLinkLoginSectionProps = {
  memberId: string;
  memberName: string;
  disabled?: boolean;
  onError: (message: string) => void;
  onLinked: () => void;
};

export function MemberLinkLoginSection({
  memberId,
  memberName,
  disabled,
  onError,
  onLinked,
}: MemberLinkLoginSectionProps) {
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<"share" | "enter">("share");
  const [linkLoginEmail, setLinkLoginEmail] = useState("");
  const [confirmJoinerEmail, setConfirmJoinerEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [linkLoginCode, setLinkLoginCode] = useState<InviteCodeState | null>(null);

  const inviteLoginForMember = trpc.families.inviteLoginForMember.useMutation({
    onSuccess: (data) => {
      setLinkLoginCode({
        code: data.code,
        expiresAt: new Date(data.expiresAt),
        adultEmail: data.adultEmail,
        joinerEmail: data.joinerEmail,
      });
    },
    onError: (e) => onError(trpcErrorMessage(e, "Could not create login invite")),
  });

  const confirmJoinByCode = trpc.families.confirmJoinByCode.useMutation({
    onSuccess: async () => {
      await utils.families.current.invalidate();
      onLinked();
    },
    onError: (e) => onError(trpcErrorMessage(e, "Invalid or expired code")),
  });

  return (
    <div className="mt-2">
      <IonSegment
        value={mode}
        disabled={disabled}
        onIonChange={(e) => {
          setMode((e.detail.value as "share" | "enter") ?? "share");
          setLinkLoginCode(null);
        }}
      >
        <IonSegmentButton value="share">
          <IonLabel>Share a Code</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="enter">
          <IonLabel>Enter Their Code</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {mode === "share" ? (
        <div className="mt-3">
          <IonText color="medium">
            <p className="m-0 mb-3 text-sm">
              They sign in on their device under{" "}
              <strong>Join a family → I have a code</strong>. Their name stays &quot;{memberName}
              &quot;.
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
                    disabled={disabled}
                    onIonInput={(e) => setLinkLoginEmail(e.detail.value ?? "")}
                  />
                </IonItem>
              </IonList>
              <IonButton
                expand="block"
                className="mt-3"
                disabled={
                  disabled || inviteLoginForMember.isPending || !linkLoginEmail.trim()
                }
                onClick={() =>
                  inviteLoginForMember.mutate({
                    memberId,
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
                completedMessage={`${memberName} can now sign in!`}
                onCompleted={async () => {
                  await utils.families.current.invalidate();
                  onLinked();
                }}
              />
              <IonButton
                expand="block"
                fill="outline"
                className="mt-3"
                disabled={disabled}
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
        <div className="mt-3">
          <IonText color="medium">
            <p className="m-0 mb-3 text-sm">
              If they already started on their phone, enter their email and 6-digit code here.
            </p>
          </IonText>
          <IonList>
            <IonItem>
              <IonLabel position="stacked">Their email</IonLabel>
              <IonInput
                type="email"
                value={confirmJoinerEmail}
                disabled={disabled}
                onIonInput={(e) => setConfirmJoinerEmail(e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">6-digit code</IonLabel>
              <IonInput
                value={confirmCode}
                disabled={disabled}
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
              disabled ||
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
    </div>
  );
}
