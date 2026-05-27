import { IonNote, IonText } from "@ionic/react";

export function TodosPage() {
  return (
    <>
      <IonText>
        <h2 className="text-xl font-semibold mb-2">Todos</h2>
      </IonText>
      <IonText color="medium">
        <p className="mb-4">Tasks and to-dos will show up here.</p>
      </IonText>
      <IonNote className="ion-text-center ion-margin-top">
        Coming soon — no todos resource wired yet.
      </IonNote>
    </>
  );
}
