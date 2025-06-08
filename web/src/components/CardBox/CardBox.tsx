import { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function CardBox({ className, children, footer }: Props) {
  return (
    <div className={`cardbox ${className}`}>
      {children}
      {footer && <div className="p-6">{footer}</div>}
    </div>
  );
}
