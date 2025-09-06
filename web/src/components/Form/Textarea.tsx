import Grid from "../Composition/Grid";
import Label from "./Label";

interface TextareaProps {
  id?: string;
  className?: string;
  label?: string;
  helperSubtitle?: string;
  placeholder?: string;
  value?;
  disabled?: boolean;
  onChange?;
  rows?: number;
}

export default function Textarea({
  className,
  id,
  label,
  helperSubtitle,
  placeholder = "Enter text here...",
  value,
  disabled,
  onChange,
  rows = 6,
}: TextareaProps) {
  return (
    <Grid className={className}>
      {label && <Label text={label} htmlFor={id} />}
      <div className="grid">
        <textarea
          className={`resize-y p-2 ${disabled ? "opacity-75" : ""}`}
          rows={rows}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={onChange}
          id={id}
        />
        {helperSubtitle && <span className="text-xs font-light">{helperSubtitle}</span>}
      </div>
    </Grid>
  );
}
