import { IonNote, IonText } from "@ionic/react";

export function DashboardPage() {
  return (
    <>
      <IonText>
        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
      </IonText>
      <IonText color="medium">
        <p className="mb-4">Your overview of routines, rewards, meals, and lists will live here.</p>
      </IonText>
      <IonNote className="ion-text-center ion-margin-top">
        Coming soon — no dashboard resource wired yet.
      </IonNote>
    </>
  );
}
