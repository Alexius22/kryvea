import React from "react";
import { Link } from "react-router";
import Icon from "./Icon";

type ButtonType = "button" | "submit" | "reset";

type Props = {
  label?: string;
  icon?: string;
  iconSize?: string | number;
  href?: string;
  target?: string;
  type?: ButtonType;
  color?: string;
  className?: string;
  asAnchor?: boolean;
  small?: boolean;
  outline?: boolean;
  active?: boolean;
  disabled?: boolean;
  roundedFull?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
};

export default function Button({
  label,
  icon,
  iconSize,
  href,
  target,
  type = "button",
  color,
  className,
  asAnchor = false,
  small = false,
  outline = false,
  disabled = false,
  roundedFull = false,
  onClick,
}: Props) {
  let baseClasses =
    "inline-flex justify-center items-center whitespace-nowrap focus:outline-none transition-colors duration-150 border ";

  baseClasses += disabled
    ? outline
      ? "opacity-50 cursor-not-allowed "
      : "opacity-70 cursor-not-allowed "
    : "cursor-pointer ";

  baseClasses += roundedFull ? "rounded-full " : "rounded ";

  baseClasses += color + " ";

  if (!label && icon) {
    baseClasses += "p-1 ";
  } else if (small) {
    baseClasses += roundedFull ? "px-3 py-1 text-sm " : "p-1 text-sm ";
  } else {
    baseClasses += roundedFull ? "px-6 py-2 " : "px-3 py-2 ";
  }

  const combinedClasses = `${baseClasses}${className}`.trim();

  const content = (
    <>
      {icon && <Icon path={icon} size={iconSize} />}
      {label && <span className={small && icon ? "px-1" : "px-2"}>{label}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <Link to={href} target={target} className={combinedClasses} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  if (asAnchor) {
    return (
      <a
        className={combinedClasses}
        onClick={disabled ? undefined : onClick}
        target={target}
        aria-disabled={disabled}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={e => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick?.(e as any);
          }
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={combinedClasses} disabled={disabled} onClick={disabled ? undefined : onClick}>
      {content}
    </button>
  );
}
