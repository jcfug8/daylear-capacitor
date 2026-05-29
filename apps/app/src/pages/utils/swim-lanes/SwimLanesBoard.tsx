import type { ReactNode } from "react";

type SwimLanesBoardProps = {
  children: ReactNode;
  /** Extend scroll area to the horizontal edges of padded page content. */
  edgeToEdge?: boolean;
};

export function SwimLanesBoard({ children, edgeToEdge }: SwimLanesBoardProps) {
  return (
    <div
      className={
        edgeToEdge
          ? "flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden -mx-4 w-[calc(100%+2rem)]"
          : "flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden"
      }
    >
      <div className="flex h-full min-h-full w-max gap-3 px-4 pb-2">{children}</div>
    </div>
  );
}
