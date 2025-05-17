import React from "react";
import { MenuNavBarItem } from "../../interfaces";
import NavBarItem from "./Item";

type Props = {
  menu: MenuNavBarItem[];
};

export default function NavBarMenuList({ menu }: Props) {
  return (
    <div className="flex flex-col lg:flex-row">
      {menu.map((item, index) => (
        <NavBarItem key={index} item={item} />
      ))}
    </div>
  );
}
