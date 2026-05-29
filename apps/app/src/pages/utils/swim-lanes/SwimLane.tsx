import type { ReactNode } from "react";

type SwimLaneProps = {
  header: ReactNode;
  isEmpty: boolean;
  emptyMessage?: string;
  children: ReactNode;
};

export function SwimLane({
  header,
  isEmpty,
  emptyMessage = "Nothing here",
  children,
}: SwimLaneProps) {
  return (
    <section className="flex h-full min-h-0 w-[min(85vw,17rem)] shrink-0 flex-col">
      <header className="mb-2 shrink-0">{header}</header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain space-y-2">
        {isEmpty ? (
          <p className="m-0 px-1 py-6 text-center text-xs text-[var(--ion-color-medium)]">
            {emptyMessage}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
