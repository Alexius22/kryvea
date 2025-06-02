import { useContext, useState } from "react";
import Select, { ActionMeta, InputActionMeta } from "react-select";
import makeAnimated from "react-select/animated";
import { GlobalContext } from "../../App";
import { SelectOption } from "./SelectWrapper.types";

type SelectWrapperProps = {
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
}: SelectWrapperProps | SelectWrapperMultiProps) {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);
  const [inputValue, setInputValue] = useState("");

  const handleOnInputChange = (input: string, actionMeta: InputActionMeta) => {
    setInputValue(input);
    if (onInputChange) {
      onInputChange(input, actionMeta);
    }
  };

  const animatedComponents = makeAnimated();

  return (
    <Select
      {...{
        className,
        classNamePrefix: "custom-select",
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
      components={animatedComponents}
      data-dark-theme={darkTheme ? "true" : "false"}
    />
  );
}
