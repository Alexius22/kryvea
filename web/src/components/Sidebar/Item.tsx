import { mdiMinus, mdiPlus } from "@mdi/js";
import { KeyboardEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import Icon from "../Icon";
import SidebarContent from "./SidebarContent";

type MenuAsideItem = {
  href?: string;
  icon?: string;
  label: string;
  menu?: MenuAsideItem[];
  color?: string;
};

type Props = {
  item: MenuAsideItem;
  isDropdownList?: boolean;
};

export default function Item({ item, isDropdownList = false }: Props) {
  const { pathname } = useLocation();
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [isDropdownActive, setIsDropdownActive] = useState(false);

  useEffect(() => {
    setIsLinkActive(pathname === item.href);
  }, [pathname, item.href]);

  const toggleDropdown = () => setIsDropdownActive(prev => !prev);
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    }
  };

  const baseClasses = [isDropdownList ? "text-sm" : "", !item.color && isLinkActive ? "aside-menu-item-active" : ""]
    .filter(Boolean)
    .join(" ");

  const content = (
    <div className="flex w-full items-center gap-x-2">
      {item.icon && <Icon path={item.icon} />}
      <span className={`grow ${item.menu ? "" : "pr-12"}`}>{item.label}</span>
      {item.menu && <Icon path={isDropdownActive ? mdiMinus : mdiPlus} />}
    </div>
  );

  return (
    <li className={`rounded p-1 ${isLinkActive ? "aside-menu-item-active" : ""}`}>
      {item.href ? (
        <Link to={item.href}>{content}</Link>
      ) : (
        <div
          className={baseClasses}
          onClick={toggleDropdown}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-expanded={isDropdownActive}
          aria-haspopup="true"
        >
          {content}
        </div>
      )}

      {item.menu && isDropdownActive && (
        <SidebarContent
          nestedMenu={item.menu}
          className="aside-menu-dropdown flex flex-col gap-4 px-4 pt-4"
          isDropdownList
        />
      )}
    </li>
  );
}
