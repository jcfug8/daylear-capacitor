import { IonButton, IonIcon, IonText } from "@ionic/react";
import { chevronDownOutline, chevronForwardOutline } from "ionicons/icons";

type CollapsibleBucketHeaderProps = {
  title: string;
  subtitle?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function CollapsibleBucketHeader({
  title,
  subtitle,
  collapsed,
  onToggleCollapsed,
}: CollapsibleBucketHeaderProps) {
  return (
    <div className="mt-6 mb-1">
      <div className="flex items-center gap-0 min-w-0 w-full">
        <span className="text-base font-semibold flex-1 min-w-0">{title}</span>
        <IonButton
          fill="clear"
          size="small"
          className="shrink-0 m-0"
          aria-label={collapsed ? "Expand section" : "Collapse section"}
          aria-expanded={!collapsed}
          onClick={onToggleCollapsed}
        >
          <IonIcon icon={collapsed ? chevronForwardOutline : chevronDownOutline} />
        </IonButton>
      </div>
      {subtitle && !collapsed && (
        <IonText color="medium">
          <p className="text-sm mb-2">{subtitle}</p>
        </IonText>
      )}
    </div>
  );
}
