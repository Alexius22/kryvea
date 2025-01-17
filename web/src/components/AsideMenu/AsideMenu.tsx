import { mdiListBox, mdiMagnify, mdiMonitor, mdiResponsive, mdiTelevisionGuide, mdiViewList } from "@mdi/js";
import { useContext } from "react";
import { MenuAsideItem } from "../../interfaces";
import { GlobalContext } from "../../../App";
import Item from "./Item";

type Props = {
  nestedMenu?: MenuAsideItem[];
  isDropdownList?: boolean;
  className?: string;
};

export default function AsideMenu({ nestedMenu, isDropdownList = false, className = "" }: Props) {
  const {
    useCustomerName: [customerName],
  } = useContext(GlobalContext);

  const menuAside: MenuAsideItem[] = [
    {
      href: "/dashboard",
      icon: mdiMonitor,
      label: "Dashboard",
    },
    {
      href: "/customers",
      label: "Customers",
      icon: mdiListBox,
    },
    {
      href: "/vulnerabilities",
      label: "Vuln Search",
      icon: mdiMagnify,
    },
    ...(customerName !== ""
      ? [
          {
            label: customerName,
            icon: mdiViewList,
            menu: [
              {
                href: "/assessments",
                label: "Assessments",
              },
            ],
          },
        ]
      : []),
    {
      href: "/users",
      label: "Users",
      icon: mdiTelevisionGuide,
    },
    {
      href: "/",
      label: "Administration",
      icon: mdiResponsive,
    },
  ];

  return (
    <ul className={className}>
      {nestedMenu
        ? // if menu is passed as prop
          nestedMenu.map((item, index) => <Item key={index} item={item} isDropdownList={isDropdownList} />)
        : // else use default menuAside (for layout case)
          menuAside.map((item, index) => <Item key={index} item={item} isDropdownList={isDropdownList} />)}
    </ul>
  );
}
