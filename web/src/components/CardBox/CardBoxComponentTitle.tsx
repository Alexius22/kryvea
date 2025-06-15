import { ReactNode } from "react";

type Props = {
  title: string;
  children?: ReactNode;
};

export default function CardBoxComponentTitle({ title, children }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h1 className="text-2xl">{title}</h1>
      {children}
    </div>
  );
}
