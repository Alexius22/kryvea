import { ReactNode } from "react";

type Props = {
  className?: string;
  noPadding?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export default function CardBox({ className, noPadding = false, children, footer }: Props) {
  return (
    <div className={`cardbox ${className} ${noPadding ? "" : "p-6"}`}>
      {children}
      {footer && <div className="p-6">{footer}</div>}
    </div>
  );
}
