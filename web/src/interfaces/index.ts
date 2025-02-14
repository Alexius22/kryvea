export type MenuAsideItem = {
  label: string;
  icon?: string;
  href?: string;
  target?: string;
  color?: ColorButtonKey;
  isLogout?: boolean;
  menu?: MenuAsideItem[];
};

export type MenuNavBarItem = {
  label?: string;
  icon?: string;
  href?: string;
  target?: string;
  isDivider?: boolean;
  isLogout?: boolean;
  isDesktopNoLabel?: boolean;
  isToggleLightDark?: boolean;
  isCurrentUser?: boolean;
  menu?: MenuNavBarItem[];
};

export type ColorKey = "white" | "light" | "contrast" | "success" | "danger" | "warning" | "info";

export type ColorButtonKey =
  | "white"
  | "whiteDark"
  | "lightDark"
  | "contrast"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "void";

export type BgKey = "purplePink" | "pinkRed";

export type UserForm = {
  name: string;
  email: string;
};
