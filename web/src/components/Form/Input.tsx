import { HTMLInputTypeAttribute } from "react";
import Grid from "../Composition/Grid";

interface InputProps {
  type: HTMLInputTypeAttribute;
  id?: string;
  className?: string;
  label?: string;
  helperSubtitle?: string;
  placeholder?: string;
  value?;
  onChange?;
}

export default function Input({
  className,
  type,
  id,
  label,
  helperSubtitle,
  placeholder,
  value,
  onChange,
}: InputProps) {
  return (
    <Grid className={className}>
      <label className="font-bold" htmlFor={id}>
        {label}
      </label>
      <div className="grid gap-1">
        <input type={type} placeholder={placeholder} id={id} value={value} onChange={onChange} />
        <span className="text-xs font-light">{helperSubtitle}</span>
      </div>
    </Grid>
  );
}
