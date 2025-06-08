import { mdiClose } from "@mdi/js";
import { ReactNode } from "react";
import CardBox from "./CardBox";
import Buttons from "../Form/Buttons";
import CardBoxComponentTitle from "./Title";
import Button from "../Form/Button";

type Props = {
  title: string;
  buttonLabel: string;
  isActive: boolean;
  children: ReactNode;
  className?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

const CardBoxModal = ({ title, buttonLabel, isActive, children, className, onConfirm, onCancel }: Props) => {
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
    <div className="fixed left-0 top-0 z-10 flex h-screen w-screen items-center justify-center bg-gradient-to-tr from-gray-400/85 via-gray-600/85 to-gray-400/85 dark:from-gray-700/85 dark:via-gray-900/85 dark:to-gray-700/85">
      <div className={"max-h-modal w-11/12 shadow-lg transition-transform md:w-3/5 lg:w-2/5 xl:w-4/12"}>
        <CardBox className={`${className}`} footer={footer}>
          <CardBoxComponentTitle title={title}>
            {!!onCancel && <Button icon={mdiClose} onClick={onCancel} small />}
          </CardBoxComponentTitle>
          {children}
        </CardBox>
      </div>
    </div>
  );
};

export default CardBoxModal;
