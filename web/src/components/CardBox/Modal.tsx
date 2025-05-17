import { mdiClose } from "@mdi/js";
import { ReactNode } from "react";
import CardBox from ".";
import type { ColorButtonKey } from "../../interfaces";
import Button from "../Button";
import Buttons from "../Buttons";
import CardBoxComponentTitle from "./Component/Title";

type Props = {
  title: string;
  buttonColor: ColorButtonKey;
  buttonLabel: string;
  isActive: boolean;
  children: ReactNode;
  className?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

const CardBoxModal = ({
  title,
  buttonColor,
  buttonLabel,
  isActive,
  children,
  className,
  onConfirm,
  onCancel,
}: Props) => {
  if (!isActive) {
    return null;
  }

  const footer = (
    <Buttons>
      <Button label={buttonLabel} color={buttonColor} onClick={onConfirm} />
      {!!onCancel && <Button label="Cancel" color={buttonColor} outline onClick={onCancel} />}
    </Buttons>
  );

  return (
    <div className="fixed left-0 top-0 z-10 flex h-screen w-screen items-center justify-center bg-gradient-to-tr dark:from-gray-700/85 dark:via-gray-900/85 dark:to-gray-700/85">
      <CardBox
        className={`max-h-modal shadow-lg transition-transform ${className || "w-11/12 md:w-3/5 lg:w-2/5 xl:w-4/12"}`}
        footer={footer}
      >
        <CardBoxComponentTitle title={title}>
          {!!onCancel && <Button icon={mdiClose} color="whiteDark" onClick={onCancel} small roundedFull />}
        </CardBoxComponentTitle>

        <div className="space-y-3">{children}</div>
      </CardBox>
    </div>
  );
};

export default CardBoxModal;
