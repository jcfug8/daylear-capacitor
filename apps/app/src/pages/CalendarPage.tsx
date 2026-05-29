import { IonNote, IonText } from "@ionic/react";
import { PageHeader } from "../components/PageHeader";

export function CalendarPage() {
  return (
    <>
      <PageHeader title="Calendar" />
      <IonText color="medium">
        <p className="mb-4">Events and schedules will show up here.</p>
      </IonText>
      <IonNote className="ion-text-center ion-margin-top">
        Coming soon — no calendar resource wired yet.
      </IonNote>
    </>
  );
}
