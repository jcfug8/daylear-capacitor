import { IonNote, IonText } from "@ionic/react";
import { useEffect, useState } from "react";

type JoinCodeDisplayProps = {
  code: string;
  expiresAt: Date | string;
  hint: string;
};

function msUntilExpiry(expiresAt: Date): number {
  return Math.max(0, expiresAt.getTime() - Date.now());
}

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function JoinCodeDisplay({ code, expiresAt, hint }: JoinCodeDisplayProps) {
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const [remaining, setRemaining] = useState(() => msUntilExpiry(expiry));

  useEffect(() => {
    const tick = () => setRemaining(msUntilExpiry(expiry));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiry]);

  const expired = remaining <= 0;

  return (
    <div className="text-center ion-margin-vertical">
      <IonText>
        <p className="text-4xl font-bold tracking-[0.3em] font-mono">{code}</p>
      </IonText>
      <IonNote color={expired ? "danger" : "medium"}>
        {expired ? "Code expired — generate a new one" : `Expires in ${formatCountdown(remaining)}`}
      </IonNote>
      <IonText color="medium">
        <p className="text-sm mt-4">{hint}</p>
      </IonText>
    </div>
  );
}
