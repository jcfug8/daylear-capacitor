import { IonNote, IonText } from "@ionic/react";

export function CalendarPage() {
  return (
    <>
      <IonText>
        <h2 className="text-xl font-semibold mb-2">Calendar</h2>
      </IonText>
      <IonText color="medium">
        <p className="mb-4">Events and schedules will show up here.</p>
      </IonText>
      <IonNote className="ion-text-center ion-margin-top">
        Coming soon — no calendar resource wired yet.
      </IonNote>
    </>
  );
}
