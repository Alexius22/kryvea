import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { useContext, useState } from "react";
import { MenuNavBarItem } from "../../../interfaces";
import { GlobalContext } from "../../../../App";
import Divider from "../../Divider";
import Icon from "../../Icon/Icon";
import NavBarMenuList from "../MenuList";
import { Link } from "react-router";

type Props = {
  item: MenuNavBarItem;
};

export default function NavBarItem({ item }: Props) {
  const {
    useDarkTheme: [_, setDarkMode],
    useUsername: [username],
  } = useContext(GlobalContext);

  const [isDropdownActive, setIsDropdownActive] = useState(false);

  const componentClass = [
    "block lg:flex items-center relative cursor-pointer",
    isDropdownActive
      ? `navbar-item-label-active dark:text-slate-400`
      : `navbar-item-label dark:text-white dark:hover:text-slate-400`,
    item.menu ? "lg:py-2 lg:px-3" : "py-2 px-3",
    item.isDesktopNoLabel ? "lg:w-16 lg:justify-center" : "",
  ].join(" ");

  const itemLabel = item.isCurrentUser ? username : item.label;

  const handleMenuClick = () => {
    if (item.menu) {
      setIsDropdownActive(!isDropdownActive);
    }

    if (item.isToggleLightDark) {
      setDarkMode(prev => !prev);
    }
  };

  const NavBarItemComponentContents = (
    <>
      <div
        className={`flex items-center ${
          item.menu ? "bg-gray-100 p-3 dark:bg-slate-800 lg:bg-transparent lg:p-0 lg:dark:bg-transparent" : ""
        }`}
        onClick={handleMenuClick}
      >
        {item.isCurrentUser}
        {item.icon && <Icon path={item.icon} className="transition-colors" />}
        <span className={`px-2 transition-colors ${item.isDesktopNoLabel && item.icon ? "lg:hidden" : ""}`}>
          {itemLabel}
        </span>
        {item.menu && (
          <Icon
            path={isDropdownActive ? mdiChevronUp : mdiChevronDown}
            className="hidden transition-colors lg:inline-flex"
          />
        )}
      </div>
      {item.menu && (
        <div
          className={`${
            !isDropdownActive ? "lg:hidden" : ""
          } border-b border-gray-100 text-sm dark:border-slate-700 lg:absolute lg:left-0 lg:top-full lg:z-20 lg:min-w-full lg:rounded-lg lg:border lg:bg-white lg:shadow-lg lg:dark:bg-slate-800`}
        >
          <NavBarMenuList menu={item.menu} />
        </div>
      )}
    </>
  );

  if (item.isDivider) {
    return <Divider navBar />;
  }

  if (item.href) {
    return (
      <Link to={item.href} target={item.target} className={componentClass}>
        {NavBarItemComponentContents}
      </Link>
    );
  }

  return <div className={componentClass}>{NavBarItemComponentContents}</div>;
}
