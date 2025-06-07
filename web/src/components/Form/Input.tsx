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
  accept?;
  as?;
  onChange?;
  multiline?: boolean;
  rows?: number;
}

export default function Input({
  className,
  type,
  id,
  label,
  helperSubtitle,
  placeholder,
  value,
  accept,
  onChange,
  multiline = false,
  rows = 6,
}: InputProps) {
  return (
    <Grid className={className}>
      {label && (
        <label className="font-bold" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="grid">
        {multiline ? (
          <textarea
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            className="resize-y p-2"
          />
        ) : (
          <input type={type} id={id} placeholder={placeholder} value={value} onChange={onChange} accept={accept} />
        )}
        {helperSubtitle && <span className="text-xs font-light">{helperSubtitle}</span>}
      </div>
    </Grid>
  );
}
