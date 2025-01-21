import React, { Children, cloneElement, ReactElement, ReactNode } from "react";

type Props = {
  isColumn?: boolean;
  children: ReactNode;
};

const FormCheckRadioGroup = (props: Props) => {
  return (
    <div className={`-mb-3 flex flex-wrap justify-start ${props.isColumn ? "flex-col" : ""}`}>
      {Children.toArray(props.children)
        .filter((child): child is ReactElement => React.isValidElement(child))
        .map(child =>
          cloneElement(child, {
            className: `mr-6 mb-3 last:mr-0 ${child.props.className || ""}`,
          })
        )}
    </div>
  );
};

export default FormCheckRadioGroup;
