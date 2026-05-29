import { IonNote, IonSpinner } from "@ionic/react";
import { useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { trpcErrorMessage } from "../../lib/trpc-errors";
import { trpc } from "../../lib/trpc";
import { ListDetailEditor } from "./components/ListDetailEditor";
import { ListDetailHeader } from "./components/ListDetailHeader";

export function ListDetailView() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const addSectionRef = useRef<(() => void) | null>(null);
  const utils = trpc.useUtils();

  const { data: family } = trpc.families.current.useQuery();
  const { data: list, isLoading } = trpc.lists.get.useQuery(
    { id: listId! },
    { enabled: !!listId },
  );

  const updateList = trpc.lists.update.useMutation({
    onSuccess: async () => {
      await utils.lists.list.invalidate();
      await utils.lists.get.invalidate({ id: listId! });
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not rename list")),
  });

  if (!listId) {
    return <Navigate to="/lists" replace />;
  }

  if (isLoading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (!list) {
    return (
      <>
        <IonNote className="ion-text-center block ion-padding">List not found.</IonNote>
        <IonNote className="ion-text-center block">
          <button
            type="button"
            className="text-[var(--ion-color-primary)] bg-transparent border-0"
            onClick={() => navigate("/lists")}
          >
            Back to lists
          </button>
        </IonNote>
      </>
    );
  }

  return (
    <>
      <ListDetailHeader
        listName={list.name}
        onBack={() => navigate("/lists")}
        onRename={(name) => updateList.mutate({ id: listId, name })}
      />

      <ListDetailEditor
        list={list}
        family={family ?? undefined}
        onError={(message) => setError(message)}
        addSectionRef={addSectionRef}
      />

      {error && (
        <IonNote color="danger" className="block mt-3 px-4">
          {error}
        </IonNote>
      )}
    </>
  );
}
