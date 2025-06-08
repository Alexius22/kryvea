import Grid from "../Composition/Grid";
import Label from "./Label";

interface TextareaProps {
  id?: string;
  className?: string;
  label?: string;
  helperSubtitle?: string;
  placeholder?: string;
  value?;
  onChange?;
  rows?: number;
}

export default function Textarea({
  className,
  id,
  label,
  helperSubtitle,
  placeholder,
  value,
  onChange,
  rows = 6,
}: TextareaProps) {
  return (
    <Grid className={className}>
      {label && <Label text={label} htmlFor={id} />}
      <div className="grid">
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          className="resize-y p-2"
        />
        {helperSubtitle && <span className="text-xs font-light">{helperSubtitle}</span>}
      </div>
    </Grid>
  );
}
