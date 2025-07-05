import Icon from "../Icon";

interface BaseButtonProps {
  className?: string;
  disabled?: boolean;
  type?: "secondary" | "warning" | "danger" | "outline-only" | "transparent" | "";
  small?: true | "";
  text?: string;
  title?: string;
  submitForm?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
  title = "",
  submitForm,
  onClick,
}: ButtonProps | IconButtonProps) {
  return (
    <button
      className={`clickable flex items-center ${small && "small"} ${!text ? "!px-1" : ""} ${type} ${className}`}
      disabled={disabled}
      onClick={e => {
        if (!submitForm) {
          e.preventDefault();
        }
        onClick(e);
      }}
      data-type={type}
      title={title}
    >
      {icon && <Icon path={icon} size={iconSize} />}
      {text}
    </button>
  );
}
