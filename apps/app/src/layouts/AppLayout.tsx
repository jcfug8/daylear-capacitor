import {
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonTabBar,
  IonTabButton,
  IonToolbar,
} from "@ionic/react";
import {
  calendarOutline,
  checkmarkCircleOutline,
  giftOutline,
  gridOutline,
  listOutline,
  repeatOutline,
  restaurantOutline,
} from "ionicons/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppMenu } from "../components/AppMenu";

const TABS = [
  { path: "/dashboard", tab: "dashboard", label: "Dashboard", icon: gridOutline },
  { path: "/todos", tab: "todos", label: "Todos", icon: checkmarkCircleOutline },
  { path: "/routines", tab: "routines", label: "Routines", icon: repeatOutline },
  { path: "/rewards", tab: "rewards", label: "Rewards", icon: giftOutline },
  { path: "/meals", tab: "meals", label: "Meals", icon: restaurantOutline },
  { path: "/lists", tab: "lists", label: "Lists", icon: listOutline },
  { path: "/calendar", tab: "calendar", label: "Calendar", icon: calendarOutline },
] as const;

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <AppMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonMenuButton slot="start" />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="ion-padding app-page-shell">
            <Outlet />
          </div>
        </IonContent>
        <IonTabBar slot="bottom">
          {TABS.map((tab) => (
            <IonTabButton
              key={tab.path}
              tab={tab.tab}
              selected={
                location.pathname === tab.path ||
                location.pathname.startsWith(`${tab.path}/`)
              }
              onClick={() => navigate(tab.path)}
            >
              <IonIcon icon={tab.icon} />
              <IonLabel className="tab-bar-label">{tab.label}</IonLabel>
            </IonTabButton>
          ))}
        </IonTabBar>
      </IonPage>
    </>
  );
}
