import { useState } from "react";
import Select, { ActionMeta, InputActionMeta } from "react-select";
import makeAnimated from "react-select/animated";
import { SelectOption } from "./SelectWrapper.types";
import Grid from "../Composition/Grid";

type SelectWrapperProps = {
  label?: string;
  className?: string;
  options: SelectOption[];
  onChange: (newValue: SelectOption, actionMeta: ActionMeta<any>) => any;
  value?: SelectOption | SelectOption[];
  defaultValue?;
  isMulti?: false;
  onInputChange?: (input: string, actionMeta?: InputActionMeta) => any;
  closeMenuOnSelect?: boolean;
  id?: string;
};
type SelectWrapperMultiProps = {
  label?: string;
  className?: string;
  options: SelectOption[];
  onChange: (newValue: SelectOption[], actionMeta: ActionMeta<any>) => any;
  value?: SelectOption | SelectOption[];
  defaultValue?;
  isMulti?: true;
  onInputChange?: (input: string, actionMeta?: InputActionMeta) => any;
  closeMenuOnSelect?: boolean;
  id?: string;
};

export default function SelectWrapper({
  className,
  options,
  defaultValue,
  value,
  onChange,
  isMulti,
  onInputChange,
  closeMenuOnSelect,
  id,
  label,
}: SelectWrapperProps | SelectWrapperMultiProps) {
  const [inputValue, setInputValue] = useState("");

  const handleOnInputChange = (input: string, actionMeta: InputActionMeta) => {
    setInputValue(input);
    if (onInputChange) {
      onInputChange(input, actionMeta);
    }
  };

  const animatedComponents = makeAnimated();

  return (
    <Grid>
      <label className="font-bold" htmlFor={id}>
        {label}
      </label>
      <Select
        {...{
          className,
          classNamePrefix: "select-wrapper",
          isMulti,
          value,
          onInputChange: handleOnInputChange,
          inputValue,
          options,
          onChange,
          defaultValue,
          closeMenuOnSelect,
          inputId: id,
        }}
        unstyled
        components={animatedComponents}
      />
    </Grid>
  );
}
