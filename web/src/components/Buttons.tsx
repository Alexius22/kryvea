import { Children, cloneElement, isValidElement, ReactElement } from "react";

type Props = {
  type?: string;
  mb?: string;
  noWrap?: boolean;
  classAddon?: string;
  children: ReactElement | ReactElement[];
  className?: string;
  label?: string;
};

const Buttons = ({
  type = "justify-start",
  mb = "-mb-3",
  classAddon = "mr-3 last:mr-0 mb-3",
  noWrap = false,
  children,
  className,
  label,
}: Props) => {
  return (
    <div className={className}>
      {label && <div className="my-2 font-bold">{label}</div>}
      <div className={`flex items-center ${type} ${mb} ${noWrap ? "flex-nowrap" : "flex-wrap"}`}>
        {Children.map(children, child => {
          if (isValidElement(child)) {
            return cloneElement(child as ReactElement<any>, {
              className: `${classAddon} ${(child.props as any).className || ""}`,
            });
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Buttons;
