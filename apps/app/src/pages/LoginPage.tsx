import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export function LoginPage() {
  const navigate = useNavigate();
  const { refetch: refetchSession } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "User",
        });
        if (result.error) {
          setError(result.error.message ?? "Sign up failed");
          return;
        }
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? "Sign in failed");
          return;
        }
      }

      // Sign-in sets the cookie immediately; useSession updates async — wait before routing.
      await refetchSession();
      navigate("/", { replace: true });
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Daylear</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1 className="text-2xl font-semibold mb-2">
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-gray-600 mb-6">Proof of concept — email & password</p>

        <form onSubmit={handleSubmit}>
          <IonList>
            {mode === "sign-up" && (
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput
                  value={name}
                  onIonInput={(e) => setName(e.detail.value ?? "")}
                  autocomplete="name"
                />
              </IonItem>
            )}
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value ?? "")}
                autocomplete="email"
                required
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value ?? "")}
                autocomplete={mode === "sign-up" ? "new-password" : "current-password"}
                required
              />
            </IonItem>
          </IonList>

          {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

          <IonButton expand="block" type="submit" className="mt-6" disabled={loading}>
            {loading ? "…" : mode === "sign-in" ? "Sign in" : "Sign up"}
          </IonButton>
        </form>

        <IonButton
          fill="clear"
          expand="block"
          className="mt-2"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        >
          {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
