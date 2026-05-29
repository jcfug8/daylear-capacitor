import { NameListContent } from "../components/NameListContent";
import { PageHeader } from "../components/PageHeader";
import { trpc } from "../lib/trpc";

export function MealsPage() {
  const utils = trpc.useUtils();
  const { data: meals, isLoading } = trpc.meals.list.useQuery();
  const createMeal = trpc.meals.create.useMutation({
    onSuccess: () => utils.meals.list.invalidate(),
  });

  return (
    <>
      <PageHeader title="Meals" />
      <NameListContent
        fieldLabel="New meal"
        placeholder="Taco Tuesday…"
        emptyNote="No meals yet. Add one above."
        loadingLabel="Loading meals…"
        items={meals}
        isLoading={isLoading}
        isCreating={createMeal.isPending}
        onAdd={(name) => createMeal.mutate({ name })}
      />
    </>
  );
}
