import { mdiAccount, mdiLogout, mdiThemeLightDark } from "@mdi/js";
import { MenuNavBarItem } from "./interfaces";

const menuNavBar: MenuNavBarItem[] = [
  {
    isCurrentUser: true,
    icon: mdiAccount,
    href: "/profile",
  },
  {
    icon: mdiThemeLightDark,
    label: "Light/Dark",
    isDesktopNoLabel: true,
    isToggleLightDark: true,
  },
  {
    icon: mdiLogout,
    label: "Log out",
    isDesktopNoLabel: true,
    isLogout: true,
    href: "/login",
  },
];

export default menuNavBar;
