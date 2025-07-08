import { useLayoutEffect, useRef, useState } from "react";
import Select, { ActionMeta, InputActionMeta } from "react-select";
import makeAnimated from "react-select/animated";
import Grid from "../Composition/Grid";
import Label from "./Label";
import { SelectOption } from "./SelectWrapper.types";

type SelectWrapperProps = {
  label?: string;
  className?: string;
  options: SelectOption[];
  onChange: (newValue: SelectOption, actionMeta: ActionMeta<any>) => any;
  value?: SelectOption | SelectOption[];
  defaultValue?;
  isMulti?: false;
  widthFixed?: boolean;
  onInputChange?: (input: string, actionMeta?: InputActionMeta) => any;
  closeMenuOnSelect?: boolean;
  id?: string;
  small?: boolean;
};
type SelectWrapperMultiProps = {
  label?: string;
  className?: string;
  options: SelectOption[];
  onChange: (newValue: SelectOption[], actionMeta: ActionMeta<any>) => any;
  value?: SelectOption | SelectOption[];
  defaultValue?;
  isMulti?: true;
  widthFixed?: boolean;
  onInputChange?: (input: string, actionMeta?: InputActionMeta) => any;
  closeMenuOnSelect?: boolean;
  id?: string;
  small?: boolean;
};

export default function SelectWrapper({
  className,
  options,
  defaultValue,
  value,
  onChange,
  isMulti,
  widthFixed,
  onInputChange,
  closeMenuOnSelect,
  id,
  label,
  small,
}: SelectWrapperProps | SelectWrapperMultiProps) {
  const [inputValue, setInputValue] = useState("");
  const [width, setWidth] = useState<number>(0);
  const measureRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth + 48); // extra space for arrow + padding
    }
  }, []);

  const handleOnInputChange = (input: string, actionMeta: InputActionMeta) => {
    setInputValue(input);
    if (onInputChange) {
      onInputChange(input, actionMeta);
    }
  };

  const onChangeWrapper = (newValue, actionMeta: ActionMeta<any>) => {
    if (isMulti && newValue.some(option => option.value === "all")) {
      newValue = options.filter(option => option.value !== "all");
      onChange(newValue, actionMeta);
      return;
    }
    onChange(newValue, actionMeta);
  };

  if (isMulti) {
    options = [{ label: "Select all", value: "all" }, ...options];
  }
  if (isMulti && value.length === options.length - 1) {
    options = [];
  }

  const animatedComponents = makeAnimated();

  const longestLabel = options.length ? options.reduce((a, b) => (a.label.length > b.label.length ? a : b)).label : "";

  const longestLabelFixedWidth = widthFixed
    ? {
        container: base => ({
          ...base,
          width,
        }),
        control: base => ({
          ...base,
          width: "100%",
          minWidth: width,
        }),
        menu: base => ({
          ...base,
          width: "100%",
          minWidth: width,
        }),
      }
    : {};

  const controlStyleSmall = small
    ? {
        control: (base: any) => ({
          ...base,
          padding: 0,
          paddingLeft: "8px",
          paddingRight: "8px",
        }),
      }
    : {};

  const combinedStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 10 }),
    ...longestLabelFixedWidth,
    ...controlStyleSmall,
  };

  return (
    <Grid>
      {label && <Label text={label} htmlFor={id} />}
      {widthFixed && (
        <span
          ref={measureRef}
          style={{
            position: "fixed",
            visibility: "hidden",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
          }}
        >
          {longestLabel}
        </span>
      )}
      <Select
        {...{
          className,
          classNamePrefix: "select-wrapper",
          isMulti,
          value,
          onInputChange: handleOnInputChange,
          inputValue,
          options,
          onChange: onChangeWrapper,
          defaultValue,
          closeMenuOnSelect,
          inputId: id,
        }}
        unstyled
        components={animatedComponents}
        menuPortalTarget={document.body}
        styles={combinedStyles}
      />
    </Grid>
  );
}
