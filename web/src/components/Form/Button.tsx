import Icon from "../Icon";

interface BaseButtonProps {
  className?: string;
  disabled?: boolean;
  type?: "primary" | "secondary" | "warning" | "danger" | "outline-only" | "";
  small?: true | "";
  text?: string;
  onClick: () => void;
}
interface ButtonProps extends BaseButtonProps {
  icon: string;
  iconSize?: number;
}
interface IconButtonProps extends BaseButtonProps {
  icon?: undefined;
  iconSize?: undefined;
}

export default function Button({
  className = "",
  disabled,
  type = "",
  text,
  icon,
  small = "",
  iconSize = 18,
  onClick,
}: ButtonProps | IconButtonProps) {
  return (
    <button
      className={`flex items-center ${small && "small"} ${!text ? "!px-1" : ""} ${type} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <Icon path={icon} size={iconSize} />}
      {text}
    </button>
  );
}
