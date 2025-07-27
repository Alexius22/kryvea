import { ReactNode } from "react";
import Grid from "../Composition/Grid";
import Subtitle from "../Composition/Subtitle";

type Props = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

export default function CardTitle({ title, subtitle, children }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <Grid className="!gap-1">
        {title && <h1 className="text-2xl">{title}</h1>}
        {subtitle && <Subtitle className="opacity-55" text={subtitle} />}
      </Grid>
      {children}
    </div>
  );
}
