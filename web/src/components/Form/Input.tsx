import { HTMLInputTypeAttribute, useEffect, useState } from "react";
import Grid from "../Composition/Grid";
import Subtitle from "../Composition/Subtitle";
import Label from "./Label";

interface BaseInputProps {
  id?: string;
  className?: string;
  label?: string;
  helperSubtitle?: string;
  placeholder?: string;
  value?: string | number;
  // min?: undefined | number;
  // max?: undefined | number;
  autoFocus?: boolean;
  onChange?;
}

interface InputProps extends BaseInputProps {
  type: HTMLInputTypeAttribute;
  min?: undefined;
  max?: undefined;
  accept?: undefined;
}

interface FileInputProps extends BaseInputProps {
  type: "file";
  min?: undefined;
  max?: undefined;
  accept?: string;
}

interface NumberInputProps extends BaseInputProps {
  type: "number";
  min?: number;
  max?: number;
  accept?: string;
  onChange?: (value: number) => void;
}

export default function Input({
  className,
  type,
  id,
  label,
  helperSubtitle,
  placeholder,
  value,
  min,
  max,
  accept,
  autoFocus,
  onChange,
}: InputProps | FileInputProps | NumberInputProps) {
  const [numberPreview, setNumberPreview] = useState(value);
  useEffect(() => {
    setNumberPreview(value);
  }, [value]);
  return (
    <Grid>
      {label && <Label text={label} htmlFor={id} />}
      <div className="grid">
        {type === "number" ? (
          <input
            className={className}
            type={type}
            id={id}
            placeholder={placeholder}
            value={numberPreview}
            accept={accept}
            autoFocus={autoFocus}
            onChange={e => setNumberPreview(e.target.value)}
            onKeyDown={e => {
              if (e.key !== "Enter") {
                return;
              }

              e.currentTarget.blur();
            }}
            onBlur={e => {
              let value = e.currentTarget.value;
              let num = parseInt(value);

              if (+value === 0) {
                num = 0;
              }
              if (value !== "0") {
                value = value.replace(/^0/, "");
              }

              if (min != undefined && num < min) {
                num = min;
              }
              if (max != undefined && num > max) {
                num = max;
              }

              setNumberPreview(num.toString());
              onChange(num);
            }}
          />
        ) : (
          <input
            className={className}
            type={type}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            accept={accept}
            autoFocus={autoFocus}
          />
        )}
        {(helperSubtitle || helperSubtitle === "") && <Subtitle text={helperSubtitle} />}
      </div>
    </Grid>
  );
}
