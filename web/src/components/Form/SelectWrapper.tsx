import { useContext, useState } from "react";
import Select, { ActionMeta, InputActionMeta } from "react-select";
import makeAnimated from "react-select/animated";
import { GlobalContext } from "../../../App";
import { SelectOption } from "./SelectWrapper.types";

type SelectWrapperProps = {
  options: SelectOption[];
  onChange: (newValue: SelectOption | SelectOption[], actionMeta: ActionMeta<any>) => any;
  value?: SelectOption | SelectOption[];
  defaultValue?;
  isMulti?;
  onInputChange?: (input: string, actionMeta?: InputActionMeta) => any;
};

export default function SelectWrapper({
  options,
  defaultValue,
  value,
  onChange,
  isMulti,
  onInputChange,
}: SelectWrapperProps) {
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
        isMulti,
        value,
        onInputChange: handleOnInputChange,
        inputValue,
        options,
        onChange,
        defaultValue,
      }}
      components={animatedComponents}
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: darkTheme ? "#1E293B" : "#FFFFFF",
          borderColor: state.isFocused ? "#3F4E65" : "#374151",
          borderRadius: "4px",
          boxShadow: state.isFocused ? "none" : "none",
          outline: "none",
          color: "#FFFFFF",
          padding: "2px",
          "&:hover": {
            borderColor: "#3F4E65",
          },
          height: "3rem",
        }),
        menu: base => ({
          ...base,
          backgroundColor: darkTheme ? "#1E293B" : "#FFFFFF",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid #2E3B4E",
          marginTop: 0,
          color: darkTheme ? "whitesmoke" : "black",
        }),
        menuList: base => ({
          ...base,
          padding: 0,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "#2064d4" : darkTheme ? "#1E293B" : "#FFFFFF",
          color: state.isFocused ? "white" : darkTheme ? "#FFFFFF" : "black",
          cursor: "pointer",
          "&:active": {
            backgroundColor: "#3F4E65",
          },
        }),
        singleValue: base => ({
          ...base,
          color: darkTheme ? "white" : "black",
        }),
        multiValue: base => ({
          ...base,
          backgroundColor: darkTheme ? "#3E495B" : "#cccccc",
        }),
        multiValueLabel: base => ({
          ...base,
          color: darkTheme ? "white" : "black",
        }),
        placeholder: base => ({
          ...base,
          color: "#6c757d",
        }),
        dropdownIndicator: base => ({
          ...base,
          color: "#6c757d",
          "&:hover": {
            color: darkTheme ? "white" : "black",
          },
        }),
        indicatorSeparator: () => ({
          display: "none",
        }),
        input: base => ({
          ...base,
          color: darkTheme ? "whitesmoke" : "black",
          "input:focus": {
            boxShadow: "none",
          },
        }),
      }}
    />
  );
}
