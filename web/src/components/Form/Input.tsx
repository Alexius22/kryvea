import { mdiEye, mdiEyeOff } from "@mdi/js";
import { HTMLInputTypeAttribute, useEffect, useState } from "react";
import Grid from "../Composition/Grid";
import Subtitle from "../Composition/Subtitle";
import Button from "./Button";
import Label from "./Label";

interface BaseInputProps {
  id?: string;
  className?: string;
  label?: string;
  helperSubtitle?: string;
  placeholder?: string;
  value?: string | number;
  autoFocus?: boolean;
}

interface InputProps extends BaseInputProps {
  type: HTMLInputTypeAttribute;
  min?: undefined;
  max?: undefined;
  accept?: undefined;
  onChange?: any;
}

interface FileInputProps extends BaseInputProps {
  type: "file";
  min?: undefined;
  max?: undefined;
  accept?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  const [showPassword, setShowPassword] = useState(false);

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

              if (min !== undefined && num < min) {
                num = min;
              }
              if (max !== undefined && num > max) {
                num = max;
              }

              setNumberPreview(num.toString());
              onChange(num);
            }}
          />
        ) : (
          <>
            <div className="relative w-full">
              <input
                className={`${className} ${type === "password" ? "pr-10" : ""} w-full`}
                type={type === "password" ? (showPassword ? "text" : "password") : type}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                accept={accept}
                autoFocus={autoFocus}
              />
              {type === "password" && (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer p-1"
                  icon={showPassword ? mdiEye : mdiEyeOff}
                  variant="transparent"
                  title={showPassword ? "Hide password" : "Show password"}
                />
              )}
            </div>
            {(helperSubtitle || helperSubtitle === "") && <Subtitle text={helperSubtitle} />}
          </>
        )}
      </div>
    </Grid>
  );
}
