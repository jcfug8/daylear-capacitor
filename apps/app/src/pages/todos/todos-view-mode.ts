export type TodosViewMode = "lanes" | "list";

export function nextTodosViewMode(mode: TodosViewMode): TodosViewMode {
  return mode === "lanes" ? "list" : "lanes";
}
