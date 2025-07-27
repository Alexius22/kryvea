import { mdiClose } from "@mdi/js";
import { ReactNode } from "react";
import Card from "../CardBox/Card";
import CardTitle from "../CardBox/CardTitle";
import Button from "../Form/Button";
import Buttons from "../Form/Buttons";

type Props = {
  title: string;
  isActive: boolean;
  children: ReactNode;
  className?: string;
  subtitle?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function Modal({
  title,
  subtitle,
  isActive,
  children,
  className,
  confirmButtonLabel = "Confirm",
  cancelButtonLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  if (!isActive) {
    return null;
  }

  const footer = (
    <Buttons className="-ml-6">
      {onConfirm && <Button text={confirmButtonLabel} onClick={onConfirm} />}
      {onCancel && <Button variant="outline-only" text={cancelButtonLabel} onClick={onCancel} />}
    </Buttons>
  );

  return (
    <div className="card-modal glasscard fixed left-0 top-0 z-10 flex h-screen w-screen items-center justify-center">
      <div className={"w-11/12 transition-transform md:w-2/5 lg:w-2/5 xl:w-1/3"}>
        <Card className={className} footer={footer}>
          <CardTitle title={title} subtitle={subtitle}>
            {onCancel && <Button variant="transparent" icon={mdiClose} onClick={onCancel} small />}
          </CardTitle>
          <div className="max-h-[70vh] overflow-scroll">{children}</div>
        </Card>
      </div>
    </div>
  );
}
