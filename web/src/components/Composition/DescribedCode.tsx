import Grid from "./Grid";
import Subtitle from "./Subtitle";

export default function DescribedCode({ subtitle, text }) {
  return (
    <Grid>
      <Subtitle className="ml-2 opacity-50" text={subtitle} />
      <code>{text}</code>
    </Grid>
  );
}
