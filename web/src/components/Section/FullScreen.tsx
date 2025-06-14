import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function SectionFullScreen({ children }: Props) {
  return <div className="card-modal fixed flex min-h-screen w-screen items-center justify-center">{children}</div>;
}
