import { IonNote, IonSpinner, IonText } from "@ionic/react";
import { useEffect, useRef } from "react";
import { JoinCodeDisplay } from "./JoinCodeDisplay";
import { trpc } from "../lib/trpc";

const POLL_MS = 2000;

type JoinCodeWaitPanelProps = {
  adultEmail: string;
  joinerEmail: string;
  code: string;
  expiresAt: Date | string;
  initiatedBy: "joiner" | "parent";
  hint: string;
  completedMessage: string;
  onCompleted: () => void;
};

export function JoinCodeWaitPanel({
  adultEmail,
  joinerEmail,
  code,
  expiresAt,
  initiatedBy,
  hint,
  completedMessage,
  onCompleted,
}: JoinCodeWaitPanelProps) {
  const { data, isLoading } = trpc.families.joinStatus.useQuery(
    { adultEmail, joinerEmail, code, initiatedBy },
    {
      refetchInterval: (query) =>
        query.state.data?.status === "pending" ? POLL_MS : false,
    },
  );

  const status = data?.status;
  const completedHandled = useRef(false);

  useEffect(() => {
    if (status === "completed" && !completedHandled.current) {
      completedHandled.current = true;
      onCompleted();
    }
  }, [status, onCompleted]);

  if (isLoading && !data) {
    return (
      <div className="ion-text-center ion-margin-vertical">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="ion-text-center ion-margin-vertical">
        <IonText color="success">
          <p className="text-lg font-semibold">{completedMessage}</p>
        </IonText>
      </div>
    );
  }

  if (status === "expired" || status === "not_found") {
    return (
      <div className="ion-text-center ion-margin-vertical">
        <IonNote color="danger">
          {status === "expired"
            ? "This code has expired. Go back and generate a new one."
            : "This code is no longer valid. Go back and try again."}
        </IonNote>
      </div>
    );
  }

  return (
    <>
      <JoinCodeDisplay code={code} expiresAt={expiresAt} hint={hint} />
      <IonNote className="block ion-text-center mt-2">
        <IonSpinner name="dots" className="inline-block align-middle mr-2" />
        Waiting for the other person to enter the code…
      </IonNote>
    </>
  );
}
