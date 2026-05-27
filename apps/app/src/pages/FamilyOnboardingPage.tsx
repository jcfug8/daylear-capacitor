import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { JoinCodeWaitPanel } from "../components/JoinCodeWaitPanel";
import { trpcErrorMessage } from "../lib/trpc-errors";
import { trpc } from "../lib/trpc";

type View =
  | "choose"
  | "create"
  | "join-menu"
  | "join-request"
  | "join-request-code"
  | "join-complete";

export function FamilyOnboardingPage() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [view, setView] = useState<View>("choose");
  const [familyName, setFamilyName] = useState("");
  const [adultEmail, setAdultEmail] = useState("");
  const [joinerAdultEmail, setJoinerAdultEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<{
    code: string;
    expiresAt: Date;
    adultEmail: string;
    joinerEmail: string;
  } | null>(null);

  const createFamily = trpc.families.create.useMutation({
    onSuccess: async () => {
      await utils.users.me.invalidate();
      await utils.families.current.invalidate();
      navigate("/dashboard", { replace: true });
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not create family")),
  });

  const requestJoin = trpc.families.requestJoin.useMutation({
    onSuccess: (data) => {
      setJoinCode({
        code: data.code,
        expiresAt: new Date(data.expiresAt),
        adultEmail: data.adultEmail,
        joinerEmail: data.joinerEmail,
      });
      setView("join-request-code");
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not request join")),
  });

  const completeJoin = trpc.families.completeJoin.useMutation({
    onSuccess: async () => {
      await utils.users.me.invalidate();
      await utils.families.current.invalidate();
      navigate("/dashboard", { replace: true });
    },
    onError: (e) => setError(trpcErrorMessage(e, "Invalid or expired code")),
  });

  function resetJoinCode() {
    setJoinCode(null);
    setView("join-menu");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Set up your family</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText color="medium">
          <p className="mb-6">
            Create a new family or join one with a code from a parent or guardian.
          </p>
        </IonText>

        {view === "choose" && (
          <>
            <IonButton expand="block" onClick={() => setView("create")}>
              Create a new family
            </IonButton>
            <IonButton expand="block" fill="outline" className="mt-3" onClick={() => setView("join-menu")}>
              Join a family
            </IonButton>
          </>
        )}

        {view === "create" && (
          <>
            <IonButton fill="clear" size="small" onClick={() => setView("choose")}>
              Back
            </IonButton>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Family name (optional)</IonLabel>
                <IonInput
                  value={familyName}
                  onIonInput={(e) => setFamilyName(e.detail.value ?? "")}
                  placeholder="The Smiths"
                />
              </IonItem>
            </IonList>
            {error && <IonNote color="danger">{error}</IonNote>}
            <IonButton
              expand="block"
              className="mt-4"
              disabled={createFamily.isPending}
              onClick={() => createFamily.mutate({ name: familyName || undefined })}
            >
              {createFamily.isPending ? "Creating…" : "Create family"}
            </IonButton>
          </>
        )}

        {view === "join-menu" && (
          <>
            <IonButton fill="clear" size="small" onClick={() => setView("choose")}>
              Back
            </IonButton>
            <IonButton expand="block" onClick={() => setView("join-request")}>
              Get a code for my family to add me
            </IonButton>
            <IonButton expand="block" fill="outline" className="mt-3" onClick={() => setView("join-complete")}>
              I have a code
            </IonButton>
          </>
        )}

        {view === "join-request" && (
          <>
            <IonButton fill="clear" size="small" onClick={() => setView("join-menu")}>
              Back
            </IonButton>
            <IonText>
              <p className="mb-4 text-sm">
                Enter the email of a parent in the family you want to join.
              </p>
            </IonText>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Parent email</IonLabel>
                <IonInput
                  type="email"
                  value={adultEmail}
                  onIonInput={(e) => setAdultEmail(e.detail.value ?? "")}
                  autocomplete="email"
                />
              </IonItem>
            </IonList>
            {error && <IonNote color="danger">{error}</IonNote>}
            <IonButton
              expand="block"
              className="mt-4"
              disabled={requestJoin.isPending || !adultEmail.trim()}
              onClick={() => requestJoin.mutate({ adultEmail: adultEmail.trim() })}
            >
              {requestJoin.isPending ? "Generating…" : "Generate code"}
            </IonButton>
          </>
        )}

        {view === "join-request-code" && joinCode && (
          <>
            <IonButton fill="clear" size="small" onClick={resetJoinCode}>
              Back
            </IonButton>
            <JoinCodeWaitPanel
              code={joinCode.code}
              expiresAt={joinCode.expiresAt}
              adultEmail={joinCode.adultEmail}
              joinerEmail={joinCode.joinerEmail}
              initiatedBy="joiner"
              hint={`Ask the parent at ${joinCode.adultEmail} to open Manage family → Add by code and enter your email (${joinCode.joinerEmail}) plus this code.`}
              completedMessage="You've been added to the family!"
              onCompleted={async () => {
                await utils.users.me.invalidate();
                await utils.families.current.invalidate();
                navigate("/dashboard", { replace: true });
              }}
            />
          </>
        )}

        {view === "join-complete" && (
          <>
            <IonButton fill="clear" size="small" onClick={() => setView("join-menu")}>
              Back
            </IonButton>
            <IonText>
              <p className="mb-4 text-sm">
                Enter the parent&apos;s email and the 6-digit code they shared with you.
              </p>
            </IonText>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Parent email</IonLabel>
                <IonInput
                  type="email"
                  value={joinerAdultEmail}
                  onIonInput={(e) => setJoinerAdultEmail(e.detail.value ?? "")}
                  autocomplete="email"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">6-digit code</IonLabel>
                <IonInput
                  value={code}
                  onIonInput={(e) => setCode((e.detail.value ?? "").replace(/\D/g, "").slice(0, 6))}
                  inputmode="numeric"
                  maxlength={6}
                />
              </IonItem>
            </IonList>
            {error && <IonNote color="danger">{error}</IonNote>}
            <IonButton
              expand="block"
              className="mt-4"
              disabled={completeJoin.isPending || code.length !== 6 || !joinerAdultEmail.trim()}
              onClick={() =>
                completeJoin.mutate({
                  adultEmail: joinerAdultEmail.trim(),
                  code,
                })
              }
            >
              {completeJoin.isPending ? "Joining…" : "Join family"}
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
