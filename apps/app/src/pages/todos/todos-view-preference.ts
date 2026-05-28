import { Preferences } from "@capacitor/preferences";
import type { TodosViewMode } from "./todos-view-mode";

const STORAGE_KEY = "daylear.todos.viewMode";

function parseTodosViewMode(value: string | null | undefined): TodosViewMode {
  return value === "list" ? "list" : "lanes";
}

export async function loadTodosViewMode(): Promise<TodosViewMode> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  return parseTodosViewMode(value);
}

export async function saveTodosViewMode(mode: TodosViewMode): Promise<void> {
  await Preferences.set({ key: STORAGE_KEY, value: mode });
}
