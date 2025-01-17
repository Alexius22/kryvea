import React, { ReactNode } from "react";
import { containerMaxW } from "../../config";

type Props = {
  children: ReactNode;
};

export default function SectionMain({ children }: Props) {
  return <section className={`py-2 px-6 ${containerMaxW}`}>{children}</section>;
}
