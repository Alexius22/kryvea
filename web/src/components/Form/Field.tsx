import React, { Children, cloneElement, ReactElement, ReactNode } from "react";
import { v4 } from "uuid";
import Icon from "../Icon";

type Props = {
  label?: string | string[];
  labelFor?: string;
  help?: string;
  icons?: string[] | null[];
  isBorderless?: boolean;
  isTransparent?: boolean;
  isError?: boolean;
  hasTextareaHeight?: boolean;
  noHeight?: boolean;
  gridTemplateColumns?: string;
  singleField?: false;
  children: ReactNode;
  singleChild?: true;
};

const FormField = ({ icons = [], noHeight, gridTemplateColumns, isError = false, ...props }: Props) => {
  const childrenCount = Children.count(props.children);

  const elementWrapperClass = gridTemplateColumns
    ? `grid gap-3 ${gridTemplateColumns}`
    : childrenCount === 2
      ? "grid grid-cols-1 gap-3 md:grid-cols-2"
      : childrenCount === 3
        ? "grid grid-cols-1 gap-3 md:grid-cols-3"
        : "grid grid-cols-1 gap-3";

  const labels = Array.isArray(props.label) ? props.label : [props.label];

  return (
    <div className="mb-6 last:mb-0">
      <div className={elementWrapperClass}>
        {props.singleChild ? (
          <>
            <label className="block font-bold">{props.label}</label>
            {props.children}
          </>
        ) : (
          Children.toArray(props.children)
            .filter((child): child is ReactElement => React.isValidElement(child))
            .map((child, index) => {
              const isError = child.props.isError;
              const controlClassName = `
                control-base
                ${isError ? "control-error" : "control-normal"}
                ${props.hasTextareaHeight ? "control-height-48" : "control-height-12"}
                ${props.isBorderless ? "control-borderless" : "control-bordered"}
                ${props.isTransparent ? "control-transparent" : "control-field-bg"}
                ${icons[index] ? "pl-10" : ""}
              `;

              const tmpKey = v4();

              return (
                <div className="relative" key={tmpKey}>
                  {labels[index] ? (
                    <label
                      htmlFor={props.labelFor}
                      className={`mb-2 block font-bold ${props.labelFor ? "cursor-pointer" : ""}`}
                    >
                      {labels[index]}
                    </label>
                  ) : (
                    <div className={`mb-2 block font-bold ${noHeight ? "" : "h-6"}`} />
                  )}
                  {cloneElement(child, {
                    className: `${controlClassName} ${icons[index] ? "pl-10" : ""}`,
                  })}
                  {icons[index] && (
                    <Icon
                      path={icons[index]}
                      w="w-10"
                      h={props.hasTextareaHeight ? "h-full" : "h-12"}
                      className="pointer-events-none absolute left-0 top-8 z-10"
                    />
                  )}
                </div>
              );
            })
        )}
      </div>
      {props.help && <div className={`mt-1 text-xs ${isError ? "text-red-500" : ""}`}>{props.help}</div>}
    </div>
  );
};

export default FormField;
