import { IonButton, IonIcon, IonNote, IonSpinner, IonText, useIonAlert } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpcErrorMessage } from "../../lib/trpc-errors";
import { trpc } from "../../lib/trpc";
import { CreateListModal } from "./components/CreateListModal";
import { ListsList } from "./components/ListsList";

export function ListsIndexView() {
  const navigate = useNavigate();
  const [presentAlert] = useIonAlert();
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: lists, isLoading } = trpc.lists.list.useQuery();

  const createList = trpc.lists.create.useMutation({
    onSuccess: async (list) => {
      await utils.lists.list.invalidate();
      setCreateOpen(false);
      navigate(`/lists/${list.id}`);
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not create list")),
  });

  const deleteList = trpc.lists.delete.useMutation({
    onSuccess: async () => {
      await utils.lists.list.invalidate();
      setError(null);
    },
    onError: (e) => setError(trpcErrorMessage(e, "Could not delete list")),
  });

  function confirmDeleteList(list: { id: string; name: string }) {
    presentAlert({
      header: "Delete list?",
      message: `Delete "${list.name}" and all of its sections and items? This cannot be undone.`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: () => deleteList.mutate({ id: list.id }),
        },
      ],
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-1">
        <IonText>
          <h2 className="text-xl font-semibold m-0">Lists</h2>
        </IonText>
        <IonButton
          fill="clear"
          aria-label="Add list"
          onClick={() => setCreateOpen(true)}
        >
          <IonIcon icon={addOutline} slot="icon-only" />
        </IonButton>
      </div>
      <IonText color="medium">
        <p className="mb-4 text-sm">Shared lists for your family</p>
      </IonText>

      <CreateListModal
        isOpen={createOpen}
        pending={createList.isPending}
        onClose={() => {
          if (!createList.isPending) setCreateOpen(false);
        }}
        onCreate={(name) => createList.mutate({ name })}
      />

      {isLoading && (
        <div className="ion-text-center ion-padding">
          <IonSpinner name="crescent" />
          <IonText color="medium">
            <p className="mt-2">Loading lists…</p>
          </IonText>
        </div>
      )}

      {!isLoading && lists && (
        <ListsList
          lists={lists}
          onSelect={(listId) => navigate(`/lists/${listId}`)}
          onDelete={confirmDeleteList}
        />
      )}

      {lists?.length === 0 && !isLoading && (
        <IonNote className="ion-text-center ion-margin-top block">
          No lists yet. Tap + to add one.
        </IonNote>
      )}

      {error && (
        <IonNote color="danger" className="block mt-3">
          {error}
        </IonNote>
      )}
    </>
  );
}
