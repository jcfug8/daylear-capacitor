import { IonText } from "@ionic/react";
import type { ReactNode } from "react";
import { SWIM_LANE_HEADER_SURFACE } from "./styles";

type SwimLaneHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
};

export function SwimLaneHeader({ title, subtitle, action }: SwimLaneHeaderProps) {
  return (
    <div className={`flex items-start gap-0 min-w-0 px-3 py-2 ${SWIM_LANE_HEADER_SURFACE}`}>
      <div className="min-w-0 flex-1">
        <span className="text-base font-semibold block truncate">{title}</span>
        {subtitle !== undefined && subtitle !== null && (
          <IonText color="medium">
            <p className="m-0 text-sm">{subtitle}</p>
          </IonText>
        )}
      </div>
      {action}
    </div>
  );
}
