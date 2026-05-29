import type { ReactNode } from "react";
import { useAppUserName } from "../hooks/useAppUserName";
import { AppPageHeader } from "./AppPageHeader";

type PageHeaderProps = {
  title: ReactNode;
  leading?: ReactNode;
  end?: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
};

export function PageHeader({
  title,
  leading,
  end,
  onAdd,
  addLabel,
  className = "mb-3 shrink-0",
}: PageHeaderProps) {
  const userName = useAppUserName();

  return (
    <div className={className}>
      <AppPageHeader
        title={title}
        userName={userName}
        leading={leading}
        end={end}
        onAdd={onAdd}
        addLabel={addLabel}
      />
    </div>
  );
}
