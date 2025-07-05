import Icon from "../Icon";

interface BaseButtonCoreProps {
  className?: string;
  disabled?: boolean;
  type?: "secondary" | "warning" | "danger" | "outline-only" | "transparent" | "";
  small?: true | "";
  text?: string;
  title?: string;
  formSubmit?: boolean;
}
interface WithIcon {
  icon: string;
  iconSize?: number;
}
interface WithoutIcon {
  icon?: undefined;
  iconSize?: undefined;
}
interface SubmitButton {
  formSubmit: true;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
interface NormalButton {
  formSubmit?: false | undefined;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
type ButtonProps =
  | (BaseButtonCoreProps & WithIcon & SubmitButton)
  | (BaseButtonCoreProps & WithIcon & NormalButton)
  | (BaseButtonCoreProps & WithoutIcon & SubmitButton)
  | (BaseButtonCoreProps & WithoutIcon & NormalButton);

export default function Button({
  className = "",
  disabled,
  type = "",
  text,
  icon,
  small = "",
  iconSize = 18,
  title = "",
  formSubmit,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`clickable flex items-center ${small && "small"} ${!text ? "!px-1" : ""} ${type} ${className}`}
      disabled={disabled}
      onClick={e => {
        if (!formSubmit) {
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
