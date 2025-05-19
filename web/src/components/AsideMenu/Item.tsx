import { useEffect, useState } from "react";
import { getButtonColor } from "../../colors";
import Icon from "../Icon/Icon";
import AsideMenuContent from "./AsideMenuContent";
import { mdiMinus, mdiPlus } from "@mdi/js";
import { Link, useLocation } from "react-router";

export default function Item({ item, isDropdownList = false }) {
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [isDropdownActive, setIsDropdownActive] = useState(false);

  const { pathname } = useLocation();

  useEffect(() => {
    setIsLinkActive(pathname === item.href);
  }, [item.href, window.location.pathname]);

  const activeClassAddon = !item.color && isLinkActive ? "aside-menu-item-active font-bold" : "";

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
    isDropdownList ? "text-sm" : "",
    item.color ? getButtonColor(item.color, false, true) : `aside-menu-item dark:text-slate-300 dark:hover:text-white`,
  ].join(" ");

  return (
    <li>
      {item.href ? (
        <Link to={item.href} target={item.target} className={componentClass}>
          {asideMenuItemInnerContents}
        </Link>
      ) : (
        <div className={componentClass} onClick={() => setIsDropdownActive(!isDropdownActive)}>
          {asideMenuItemInnerContents}
        </div>
      )}
      {item.menu && (
        <AsideMenuContent
          nestedMenu={item.menu}
          className={`aside-menu-dropdown ${isDropdownActive ? "flex flex-col gap-4 bg-slate-300/50 p-4 px-8 dark:bg-slate-800/50" : "hidden"}`}
          isDropdownList
        />
      )}
    </li>
  );
}
