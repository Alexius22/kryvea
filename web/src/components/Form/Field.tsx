import React, { Children, cloneElement, createElement, ReactElement, ReactNode } from "react";
import Icon from "../Icon/Icon";
import { v4 } from "uuid";

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
            <label className="block font-bold" htmlFor="customer-selection">
              {props.label}
            </label>
            {props.children}
          </>
        ) : (
          Children.toArray(props.children)
            .filter((child): child is ReactElement => React.isValidElement(child))
            .map((child, index) => {
              const isError = child.props.isError;
              const controlClassName = [
                "px-3 py-2 max-w-full rounded w-full dark:placeholder-gray-400",
                "focus:ring focus:outline-none",
                isError
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-700 focus:ring-blue-600 focus:border-blue-600",
                props.hasTextareaHeight ? "h-48" : "h-12",
                props.isBorderless ? "border-0" : "border",
                props.isTransparent ? "bg-transparent" : "bg-white dark:bg-slate-800",
              ].join(" ");

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
                      className="pointer-events-none absolute left-0 top-8 z-10 text-gray-500 dark:text-slate-400"
                    />
                  )}
                </div>
              );
            })
        )}
      </div>
      {props.help && (
        <div className={`mt-1 text-xs ${isError ? "text-red-500" : "text-gray-500 dark:text-slate-400"}`}>
          {props.help}
        </div>
      )}
    </div>
  );
};

export default FormField;
