import Icon from "../Composition/Icon";

interface BaseButtonCoreProps {
  className?: string;
  disabled?: boolean;
  variant?: "secondary" | "warning" | "danger" | "outline-only" | "transparent" | "";
  small?: true | "";
  text?: string;
  title?: string;
  formSubmit?: boolean;
  children?;
  customColor?;
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
  variant = "",
  text,
  icon,
  small = "",
  iconSize = 18,
  title = "",
  formSubmit,
  onClick = () => {},
  children,
  customColor,
}: ButtonProps) {
  return (
    <button
      type={formSubmit ? "submit" : "button"}
      className={`clickable flex items-center ${small && "small"} ${!text ? "!px-1" : ""} ${variant} ${className}`}
      disabled={disabled}
      onClick={e => {
        if (!formSubmit) {
          e.preventDefault();
        }
        onClick(e);
      }}
      data-variant={variant}
      title={title}
      style={customColor ? { backgroundColor: customColor, borderColor: customColor } : undefined}
    >
      {icon && <Icon path={icon} size={iconSize} />}
      {text}
      {children}
    </button>
  );
}
