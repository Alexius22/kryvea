import { mdiClose } from "@mdi/js";
import { ReactNode } from "react";
import Card from "../CardBox/Card";
import CardTitle from "../CardBox/CardTitle";
import Button from "../Form/Button";
import Buttons from "../Form/Buttons";

type Props = {
  title: string;
  buttonLabel: string;
  isActive: boolean;
  children: ReactNode;
  className?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function Modal({ title, buttonLabel, isActive, children, className, onConfirm, onCancel }: Props) {
  if (!isActive) {
    return null;
  }

  const footer = (
    <Buttons className="-ml-6">
      <Button text={buttonLabel} onClick={onConfirm} />
      {!!onCancel && <Button type="outline-only" text="Cancel" onClick={onCancel} />}
    </Buttons>
  );

  return (
    <div className="card-modal fixed left-0 top-0 z-10 flex h-screen w-screen items-center justify-center">
      <div className={"max-h-modal w-11/12 transition-transform md:w-2/5 lg:w-2/5 xl:w-1/3"}>
        <Card className={`${className}`} footer={footer}>
          <CardTitle title={title}>
            {!!onCancel && <Button type="transparent" icon={mdiClose} onClick={onCancel} small />}
          </CardTitle>
          {children}
        </Card>
      </div>
    </div>
  );
}
