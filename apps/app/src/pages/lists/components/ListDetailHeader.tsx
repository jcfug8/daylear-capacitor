import { IonButton, IonIcon } from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { PageHeader } from "../../../components/PageHeader";
import { InlineEditableText } from "./InlineEditableText";

type ListDetailHeaderProps = {
  listName: string;
  onBack: () => void;
  onRename: (name: string) => void;
};

export function ListDetailHeader({
  listName,
  onBack,
  onRename,
}: ListDetailHeaderProps) {
  return (
    <PageHeader
      leading={
        <IonButton fill="clear" className="m-0 -ml-2" onClick={onBack} aria-label="Back">
          <IonIcon icon={arrowBackOutline} slot="icon-only" />
        </IonButton>
      }
      title={
        <InlineEditableText
          value={listName}
          onSave={onRename}
          className="font-serif text-2xl font-normal text-[#2f5c4a] truncate text-left block"
          inputClassName="font-serif text-2xl font-normal text-left"
        />
      }
    />
  );
}
