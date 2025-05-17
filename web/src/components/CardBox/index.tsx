import { ReactNode } from "react";

type Props = {
  className?: string;
  noPadding?: boolean;
  isHoverable?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export default function CardBox({ className, noPadding = false, isHoverable = false, children, footer }: Props) {
  return (
    <div
      className={`flex flex-1 flex-col rounded-2xl bg-white dark:bg-slate-900 ${className} ${noPadding ? "" : "p-6"} ${isHoverable && "transition-shadow duration-500 hover:shadow-lg"}`}
    >
      {children}
      {footer && <div className="p-6">{footer}</div>}
    </div>
  );
}
