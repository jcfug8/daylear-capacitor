import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
} from "@ionic/react";
import { colorPaletteOutline, notificationsOutline } from "ionicons/icons";
import { PageHeader } from "../components/PageHeader";
import { authClient } from "../lib/auth-client";
import { trpc } from "../lib/trpc";
import { UserAvatar } from "../components/UserAvatar";

export function AccountPage() {
  const { data: session } = authClient.useSession();
  const { data: me } = trpc.users.me.useQuery();

  const name = me?.name ?? session?.user.name ?? "User";
  const email = me?.email ?? session?.user.email ?? "";
  const image = me?.image ?? session?.user.image ?? null;

  return (
    <>
      <PageHeader title="Account" />
      <IonList lines="full" className="mb-4 mt-0">
        <IonItem>
          <UserAvatar name={name} image={image} />
          <IonLabel>
            <h2 style={{ fontWeight: 600 }}>{name}</h2>
            <p>{email}</p>
          </IonLabel>
        </IonItem>
      </IonList>

      <IonList lines="full">
        <IonListHeader>
          <IonLabel>Settings</IonLabel>
        </IonListHeader>
        <IonItem button detail={false}>
          <IonIcon slot="start" icon={colorPaletteOutline} />
          <IonLabel>
            <h3>Display</h3>
            <p>Theme and appearance</p>
          </IonLabel>
        </IonItem>
        <IonItem button detail={false}>
          <IonIcon slot="start" icon={notificationsOutline} />
          <IonLabel>
            <h3>Notifications</h3>
            <p>Alerts and reminders</p>
          </IonLabel>
        </IonItem>
      </IonList>

      <IonNote className="ion-text-center ion-margin-top">
        Display and notification preferences coming soon.
      </IonNote>
    </>
  );
}
