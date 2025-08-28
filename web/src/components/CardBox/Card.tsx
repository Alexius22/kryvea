import { ReactNode } from "react";
import Grid from "../Composition/Grid";

type Props = {
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
  noHighlight?: boolean;
};

export default function Card({ className, children, footer, noHighlight }: Props) {
  return (
    <Grid className={`cardbox ${noHighlight ? `no-highlight` : ""} ${className}`}>
      {children}
      {footer && <div className="p-6">{footer}</div>}
    </Grid>
  );
}
