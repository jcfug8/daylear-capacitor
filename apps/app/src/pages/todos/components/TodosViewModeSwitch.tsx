import { IonIcon } from "@ionic/react";
import { albumsOutline, listOutline } from "ionicons/icons";
import type { TodosViewMode } from "../todos-view-mode";

type TodosViewModeSwitchProps = {
  value: TodosViewMode;
  onToggle: () => void;
};

const MODES: { mode: TodosViewMode; icon: typeof listOutline; label: string }[] = [
  { mode: "list", icon: listOutline, label: "List view" },
  { mode: "lanes", icon: albumsOutline, label: "Swim lanes view" },
];

export function TodosViewModeSwitch({ value, onToggle }: TodosViewModeSwitchProps) {
  const activeIndex = value === "list" ? 0 : 1;

  return (
    <div
      role="group"
      aria-label="Todos layout"
      className="relative inline-grid grid-cols-2 rounded-full border border-[var(--ion-color-light-shade)] bg-white p-0.5 shadow-sm"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-[#2f5c4a] transition-[left] duration-200 ease-out"
        style={{ left: activeIndex === 0 ? "2px" : "calc(50%)" }}
      />
      {MODES.map(({ mode, icon, label }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={onToggle}
            className={[
              "relative z-[1] m-0 flex h-8 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0",
              "cursor-pointer transition-colors",
              isActive ? "text-white" : "text-[var(--ion-color-medium)]",
            ].join(" ")}
          >
            <IonIcon icon={icon} className="text-lg" />
          </button>
        );
      })}
    </div>
  );
}
