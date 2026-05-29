import { NameListContent } from "../components/NameListContent";
import { PageHeader } from "../components/PageHeader";
import { trpc } from "../lib/trpc";

export function RoutinesPage() {
  const utils = trpc.useUtils();
  const { data: routines, isLoading } = trpc.routines.list.useQuery();
  const createRoutine = trpc.routines.create.useMutation({
    onSuccess: () => utils.routines.list.invalidate(),
  });

  return (
    <>
      <PageHeader title="Routines" />
      <NameListContent
        fieldLabel="New routine"
        placeholder="Morning routine…"
        emptyNote="No routines yet. Add one above."
        loadingLabel="Loading routines…"
        items={routines}
        isLoading={isLoading}
        isCreating={createRoutine.isPending}
        onAdd={(name) => createRoutine.mutate({ name })}
      />
    </>
  );
}
