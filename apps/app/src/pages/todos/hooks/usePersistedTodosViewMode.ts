import { useCallback, useEffect, useState } from "react";
import { loadTodosViewMode, saveTodosViewMode } from "../todos-view-preference";
import { nextTodosViewMode, type TodosViewMode } from "../todos-view-mode";

export function usePersistedTodosViewMode() {
  const [viewMode, setViewModeState] = useState<TodosViewMode>("lanes");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadTodosViewMode()
      .then((mode) => {
        if (!cancelled) setViewModeState(mode);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setViewMode = useCallback((mode: TodosViewMode) => {
    setViewModeState(mode);
    void saveTodosViewMode(mode);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewModeState((current) => {
      const next = nextTodosViewMode(current);
      void saveTodosViewMode(next);
      return next;
    });
  }, []);

  return { viewMode, setViewMode, toggleViewMode, hydrated };
}
