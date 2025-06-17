import { useContext } from "react";
import { mdiAccountMultiple, mdiListBox, mdiMagnify, mdiMonitor, mdiResponsive, mdiViewList } from "@mdi/js";
import { GlobalContext } from "../../App";
import Item from "./Item";

export type MenuAsideItem = {
  label: string;
  icon?: string;
  href?: string;
  menu?: MenuAsideItem[];
};

type Props = {
  className?: string;
  nestedMenu?: MenuAsideItem[];
  isDropdownList?: boolean;
};

export default function SidebarContent({ nestedMenu, isDropdownList = false, className = "" }: Props) {
  const {
    useCustomerName: [customerName],
  } = useContext(GlobalContext);

  const defaultMenu: MenuAsideItem[] = [
    { href: "/dashboard", icon: mdiMonitor, label: "Dashboard" },
    { href: "/customers", icon: mdiListBox, label: "Customers" },
    ...(customerName
      ? [
          {
            label: customerName,
            icon: mdiViewList,
            menu: [
              { href: "/assessments", label: "Assessments" },
              { href: "/hosts", label: "Hosts" },
            ],
          },
        ]
      : []),
    { href: "/vulnerabilities", icon: mdiMagnify, label: "Vulnerability Search" },
    {
      label: "Administration",
      icon: mdiResponsive,
      menu: [
        { href: "/users", icon: mdiAccountMultiple, label: "Users" },
        { href: "/categories", icon: mdiAccountMultiple, label: "Categories" },
      ],
    },
  ];

  const menuToRender = nestedMenu ?? defaultMenu;

  return (
    <ul className={className}>
      {menuToRender.map((item, idx) => (
        <Item key={idx} item={item} isDropdownList={isDropdownList} />
      ))}
    </ul>
  );
}
