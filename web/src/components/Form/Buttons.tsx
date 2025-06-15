import Grid from "../Composition/Grid";
import Label from "./Label";

type Props = {
  type?: string;
  noWrap?: boolean;
  className?: string;
  label?: string;
  children;
};

export default function Buttons({ type = "justify-start", noWrap = false, children, className, label }: Props) {
  return (
    <Grid>
      {label && <Label text={label} />}
      <div className={`flex items-center gap-2 ${type} ${noWrap ? "flex-nowrap" : "flex-wrap"} ${className}`}>
        {children}
      </div>
    </Grid>
  );
}
