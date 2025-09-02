import { mdiMinus, mdiPlus } from "@mdi/js";
import { KeyboardEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import Flex from "../Composition/Flex";
import Button from "../Form/Button";
import Label from "../Form/Label";
import Icon from "../Icon";
import SidebarContent from "./SidebarContent";

type MenuAsideItem = {
  href?: string;
  icon?: string;
  label: string;
  menu?: MenuAsideItem[];
  color?: string;
  onClick?: () => void;
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

  const handleClick = (e: React.MouseEvent) => {
    if (item.onClick) {
      item.onClick();
      return;
    }

    if (item.menu) {
      toggleDropdown();
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDropdown();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  const baseClasses = [isDropdownList ? "text-sm" : "", !item.color && isLinkActive ? "sidebar-item-active" : ""]
    .filter(Boolean)
    .join(" ");

  const content = (
    <Flex className="w-full gap-x-2" items="center">
      {item.icon && <Icon path={item.icon} />}
      <Label className={`grow text-base font-normal ${item.menu ? "" : "pr-12"}`} text={item.label} />
      {item.menu && (
        <Button
          onClick={handleIconClick}
          className="dropdown-toggle-button"
          variant="transparent"
          icon={isDropdownActive ? mdiMinus : mdiPlus}
        />
      )}
    </Flex>
  );

  return (
    <li className={`rounded p-1 ${isLinkActive ? "sidebar-item-active" : ""}`}>
      {item.href && !item.onClick ? (
        <Link to={item.href} className={baseClasses}>
          {content}
        </Link>
      ) : (
        <div
          className={`${baseClasses} cursor-pointer`}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-haspopup={!!item.menu}
          aria-expanded={isDropdownActive}
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
