import { IonNote, IonText } from "@ionic/react";
import { PageHeader } from "../components/PageHeader";

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <IonText color="medium">
        <p className="mb-4">Your overview of routines, rewards, meals, and lists will live here.</p>
      </IonText>
      <IonNote className="ion-text-center ion-margin-top">
        Coming soon — no dashboard resource wired yet.
      </IonNote>
    </>
  );
}
