import React, { ReactNode, useState } from "react";
import { mdiClose, mdiDotsVertical } from "@mdi/js";
import { containerMaxW } from "../../config";
import Icon from "../Icon/Icon";
import NavBarItemPlain from "./Item/Plain";
import NavBarMenuList from "./MenuList";
import { MenuNavBarItem } from "../../interfaces";

type Props = {
  menu: MenuNavBarItem[];
  className: string;
  children: ReactNode;
};

export default function NavBar({ menu, className = "", children }: Props) {
  const [isMenuNavBarActive, setIsMenuNavBarActive] = useState(false);

  const handleMenuNavBarToggleClick = () => {
    setIsMenuNavBarActive(!isMenuNavBarActive);
  };

  return (
    <nav
      className={`${className} fixed inset-x-0 top-0 z-30 h-14 w-screen bg-gray-50 transition-position dark:bg-slate-800 lg:w-auto`}
    >
      <div className={`flex lg:items-stretch ${containerMaxW}`}>
        <div className="flex h-14 flex-1 items-stretch">{children}</div>
        <div className="flex h-14 flex-none items-stretch lg:hidden">
          <NavBarItemPlain onClick={handleMenuNavBarToggleClick}>
            <Icon path={isMenuNavBarActive ? mdiClose : mdiDotsVertical} size="24" />
          </NavBarItemPlain>
        </div>
        <div
          className={`${
            isMenuNavBarActive ? "block" : "hidden"
          } absolute left-0 top-14 max-h-screen-menu w-screen overflow-y-auto bg-gray-50 shadow-lg dark:bg-slate-800 lg:static lg:flex lg:w-auto lg:overflow-visible lg:shadow-none`}
        >
          <NavBarMenuList menu={menu} />
        </div>
      </div>
    </nav>
  );
}
