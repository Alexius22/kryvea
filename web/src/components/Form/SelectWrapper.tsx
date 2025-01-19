import { useContext, useState } from "react";
import Select from "react-select";
import { SelectOption } from "./SelectWrapper.types";
import { ActionMeta, InputActionMeta, MultiValue } from "react-select";
import { GlobalContext } from "../../../App";
import makeAnimated from "react-select/animated";

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
          backgroundColor: darkTheme ? "#1E293B" : "#FFFFFF", // Match dark background
          borderColor: state.isFocused ? "#3F4E65" : "#374151", // Border colors for focus and default
          borderRadius: "4px", // Rounded corners
          // boxShadow: state.isFocused ? "0 0 0 1px #3F4E65" : "none",
          boxShadow: state.isFocused ? "none" : "none", // Remove focus box-shadow
          outline: "none", // Remove blue ring
          color: "#FFFFFF", // Text color
          padding: "2px", // Match padding
          "&:hover": {
            borderColor: "#3F4E65", // Hover effect
          },
          height: "3rem",
        }),
        menu: base => ({
          ...base,
          backgroundColor: darkTheme ? "#1E293B" : "#FFFFFF", // Dropdown background
          borderRadius: "6px", // Match dropdown corner style
          overflow: "hidden", // Hide overflow
          border: "1px solid #2E3B4E",
          marginTop: 0,
          color: darkTheme ? "whitesmoke" : "black", // Dropdown text color
        }),
        menuList: base => ({
          ...base,
          padding: 0, // Remove extra padding
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "#2064d4" : darkTheme ? "#1E293B" : "#FFFFFF", // Focus effect
          color: state.isFocused ? "white" : darkTheme ? "#FFFFFF" : "black",
          cursor: "pointer",
          "&:active": {
            backgroundColor: "#3F4E65",
          },
        }),
        singleValue: base => ({
          ...base,
          color: darkTheme ? "white" : "black", // Selected text color
        }),
        multiValue: base => ({
          ...base,
          backgroundColor: darkTheme ? "#3E495B" : "#cccccc", // Selected background color
        }),
        multiValueLabel: base => ({
          ...base,
          color: darkTheme ? "white" : "black", // Selected text color
        }),
        placeholder: base => ({
          ...base,
          color: "#6c757d", // Placeholder color
        }),
        dropdownIndicator: base => ({
          ...base,
          color: "#6c757d", // Arrow color
          "&:hover": {
            color: darkTheme ? "white" : "black", // Arrow hover color
          },
        }),
        indicatorSeparator: () => ({
          display: "none", // Remove the line separator
        }),
        input: base => ({
          ...base,
          color: darkTheme ? "whitesmoke" : "black", // Input text color
          outline: "none", // Remove the focus outline for the input
        }),
      }}
    />
  );
}
