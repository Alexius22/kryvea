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
    useCustomerId: [customerId],
  } = useContext(GlobalContext);

  const defaultMenu = [
    { href: "/dashboard", icon: mdiMonitor, label: "Dashboard" },
    { href: "/customers", icon: mdiListBox, label: "Customers" },
    ...(customerName
      ? [
          {
            label: customerName,
            icon: mdiViewList,
            menu: [
              { href: `/customers/${customerId}/assessments`, label: "Assessments" },
              { href: `/customers/${customerId}/targets`, label: "Hosts" },
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
