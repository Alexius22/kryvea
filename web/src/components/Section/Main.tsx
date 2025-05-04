import React, { ReactNode } from "react";
import { containerMaxW } from "../../config";

type Props = {
  children: ReactNode;
};

export default function SectionMain({ children }: Props) {
  return <section className={`px-6 py-2 ${containerMaxW}`}>{children}</section>;
}
