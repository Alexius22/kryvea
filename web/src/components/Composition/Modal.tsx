import { mdiClose } from "@mdi/js";
import { ReactNode, useEffect } from "react";
import Button from "../Form/Button";
import Buttons from "../Form/Buttons";
import Card from "./Card";
import CardTitle from "./CardTitle";

type Props = {
  title: string;
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
  children,
  className,
  confirmButtonLabel = "Confirm",
  cancelButtonLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "Enter":
          onConfirm?.();
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const footer = (
    <Buttons>
      {onCancel && <Button variant="outline-only" text={cancelButtonLabel} onClick={onCancel} />}
      {onConfirm && <Button text={confirmButtonLabel} onClick={onConfirm} />}
    </Buttons>
  );

  return (
    <div
      className="card-modal glasscard fixed left-0 top-0 z-10 flex h-screen w-screen items-center justify-center !border-none"
      onClick={onCancel}
    >
      <div className={"w-11/12 transition-transform md:w-2/5 lg:w-2/5 xl:w-1/3"}>
        <Card className={className} footer={footer} noHighlight>
          <CardTitle title={title} subtitle={subtitle}>
            {onCancel && <Button variant="transparent" icon={mdiClose} onClick={onCancel} small />}
          </CardTitle>
          <div className="max-h-[70vh] overflow-scroll">{children}</div>
        </Card>
      </div>
    </div>
  );
}
