import type { ReactNode } from "react";
import { LIST_ITEM_PILL } from "../lib/list-item-card-styles";

type ListItemPillBadgeProps = {
  children: ReactNode;
};

export function ListItemPillBadge({ children }: ListItemPillBadgeProps) {
  return <span className={LIST_ITEM_PILL}>{children}</span>;
}
