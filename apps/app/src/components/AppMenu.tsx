import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
} from "@ionic/react";
import { logOutOutline, peopleOutline } from "ionicons/icons";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { trpc } from "../lib/trpc";
import { UserAvatar } from "./UserAvatar";

export function AppMenu() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const { data: me } = trpc.users.me.useQuery();

  const name = me?.name ?? session?.user.name ?? "User";
  const email = me?.email ?? session?.user.email ?? "";
  const image = me?.image ?? session?.user.image ?? null;

  function goTo(path: string) {
    navigate(path);
  }

  async function signOut() {
    await authClient.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonContent>
        <div className="flex min-h-full flex-col">
          <IonList lines="full">
            <IonMenuToggle>
              <IonItem button detail onClick={() => goTo("/account")}>
                <UserAvatar name={name} image={image} />
                <IonLabel>
                  <h2 style={{ fontWeight: 600 }}>{name}</h2>
                  <p>{email}</p>
                </IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>

          <IonList lines="full">
            <IonMenuToggle>
              <IonItem button detail onClick={() => goTo("/manage-family")}>
                <IonIcon slot="start" icon={peopleOutline} />
                <IonLabel>Manage family</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>

          <IonList lines="full" style={{ marginTop: "auto" }}>
            <IonMenuToggle>
              <IonItem button detail={false} onClick={() => signOut()}>
                <IonIcon slot="start" icon={logOutOutline} />
                <IonLabel>Sign out</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>
        </div>
      </IonContent>
    </IonMenu>
  );
}
