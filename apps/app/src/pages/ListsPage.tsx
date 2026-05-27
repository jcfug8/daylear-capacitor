import { NameListContent } from "../components/NameListContent";
import { trpc } from "../lib/trpc";

export function ListsPage() {
  const utils = trpc.useUtils();
  const { data: lists, isLoading } = trpc.lists.list.useQuery();
  const createList = trpc.lists.create.useMutation({
    onSuccess: () => utils.lists.list.invalidate(),
  });

  return (
    <NameListContent
      fieldLabel="New list"
      placeholder="Grocery list…"
      emptyNote="No lists yet. Add one above."
      loadingLabel="Loading lists…"
      items={lists}
      isLoading={isLoading}
      isCreating={createList.isPending}
      onAdd={(name) => createList.mutate({ name })}
    />
  );
}
