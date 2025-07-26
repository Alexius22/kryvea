import Grid from "./Grid";
import Subtitle from "./Subtitle";

type DescribedCodeProps = {
  className?: string;
  subtitle?: string;
  text?: string;
  children?: React.ReactNode;
};

export default function DescribedCode({ className, subtitle, text, children }: DescribedCodeProps) {
  return (
    <Grid className={className}>
      <Subtitle className="ml-2 opacity-50" text={subtitle} />
      {text && <code>{text}</code>}
      {children}
    </Grid>
  );
}
