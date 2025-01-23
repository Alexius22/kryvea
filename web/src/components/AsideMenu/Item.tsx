import { useEffect, useState } from "react";
import { getButtonColor } from "../../colors";
import Icon from "../Icon/Icon";
import AsideMenu from "./AsideMenu";
import { mdiMinus, mdiPlus } from "@mdi/js";
import { Link } from "react-router";

export default function Item({ item, isDropdownList = false }) {
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const activeClassAddon = !item.color && isLinkActive ? "aside-menu-item-active font-bold" : "";

  useEffect(() => {
    // try
    if (item.href) {
      const linkPathName = new URL(item.href, window.location.href).pathname;
      const activePathname = new URL(window.location.pathname, window.location.href).pathname;
      setIsLinkActive(linkPathName === activePathname);
    }
  }, [item.href, window.location.pathname]);

  const asideMenuItemInnerContents = (
    <>
      {item.icon && <Icon path={item.icon} className={`flex-none ${activeClassAddon}`} w="w-16" size="18" />}
      <span className={`line-clamp-1 grow text-ellipsis ${item.menu ? "" : "pr-12"} ${activeClassAddon}`}>
        {item.label}
      </span>
      {item.menu && (
        <Icon path={isDropdownActive ? mdiMinus : mdiPlus} className={`flex-none ${activeClassAddon}`} w="w-12" />
      )}
    </>
  );

  const componentClass = [
    "flex cursor-pointer",
    isDropdownList ? "py-3 px-6 text-sm" : "py-3",
    item.color ? getButtonColor(item.color, false, true) : `aside-menu-item dark:text-slate-300 dark:hover:text-white`,
  ].join(" ");

  return (
    <li>
      {item.href && (
        <Link to={item.href} target={item.target} className={componentClass}>
          {asideMenuItemInnerContents}
        </Link>
      )}
      {!item.href && (
        <div className={componentClass} onClick={() => setIsDropdownActive(!isDropdownActive)}>
          {asideMenuItemInnerContents}
        </div>
      )}
      {item.menu && (
        <AsideMenu
          nestedMenu={item.menu}
          className={`aside-menu-dropdown ${isDropdownActive ? "block dark:bg-slate-800/50" : "hidden"}`}
          isDropdownList
        />
      )}
    </li>
  );
}
