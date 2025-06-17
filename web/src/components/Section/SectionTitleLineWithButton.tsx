import { ReactNode } from "react";
import Icon from "../Icon";

type Props = {
  icon: string;
  title: string;
  main?: boolean;
  children?: ReactNode;
};

export default function SectionTitleLineWithButton({ icon, title, main = false, children }: Props) {
  return (
    <section className={`${main ? "" : "py-2"} mb-2 flex items-center justify-between`}>
      <div className="flex items-center justify-start">
        {icon && main && <Icon path={icon} className="mr-3" />}
        {icon && !main && <Icon path={icon} className="mr-2" size="20" />}
        <h1 className={`leading-tight ${main ? "text-3xl" : "text-2xl"}`}>{title}</h1>
      </div>
      {children}
    </section>
  );
}
