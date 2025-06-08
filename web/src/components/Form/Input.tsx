import { HTMLInputTypeAttribute } from "react";
import Grid from "../Composition/Grid";
import Label from "./Label";

interface BaseInputProps {
  id?: string;
  className?: string;
  label?: string;
  helperSubtitle?: string;
  placeholder?: string;
  value?;
  onChange?;
}
interface InputProps extends BaseInputProps {
  type: HTMLInputTypeAttribute;
  accept?: undefined;
}
interface FileInputProps extends BaseInputProps {
  type: "file";
  accept?: string;
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
}: InputProps | FileInputProps) {
  return (
    <Grid>
      {label && <Label text={label} htmlFor={id} />}
      <div className="grid">
        <input
          className={className}
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          accept={accept}
        />
        {helperSubtitle && <span className="text-xs font-light">{helperSubtitle}</span>}
      </div>
    </Grid>
  );
}
