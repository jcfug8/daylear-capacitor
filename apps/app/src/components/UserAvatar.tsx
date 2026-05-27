import { IonAvatar } from "@ionic/react";
import { userInitials } from "../lib/user-display";

type UserAvatarProps = {
  name: string;
  image: string | null;
};

export function UserAvatar({ name, image }: UserAvatarProps) {
  return (
    <IonAvatar
      slot="start"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ion-color-primary)",
        color: "var(--ion-color-primary-contrast)",
      }}
    >
      {image ? (
        <img src={image} alt="" />
      ) : (
        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{userInitials(name)}</span>
      )}
    </IonAvatar>
  );
}
