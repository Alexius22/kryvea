import { ReactNode } from "react";
import Grid from "../Composition/Grid";

type Props = {
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function Card({ className, children, footer }: Props) {
  return (
    <Grid className={`cardbox ${className}`}>
      {children}
      {footer && <div className="p-6">{footer}</div>}
    </Grid>
  );
}
