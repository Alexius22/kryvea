import {
  mdiAccountMultiple,
  mdiListBox,
  mdiMagnify,
  mdiMonitor,
  mdiResponsive,
  mdiShapePlus,
  mdiViewList,
} from "@mdi/js";
import { useContext } from "react";
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
    useCtxCustomer: [ctxCustomer],
  } = useContext(GlobalContext);

  const defaultMenu = [
    { href: "/dashboard", icon: mdiMonitor, label: "Dashboard" },
    { href: "/customers", icon: mdiListBox, label: "Customers" },
    ...(ctxCustomer
      ? [
          {
            label: ctxCustomer.name,
            icon: mdiViewList,
            menu: [
              { href: `/customers/${ctxCustomer.id}/assessments`, label: "Assessments" },
              { href: `/customers/${ctxCustomer.id}/targets`, label: "Targets" },
            ],
          },
        ]
      : []),
    { href: "/vulnerability_search", icon: mdiMagnify, label: "Vulnerability Search" },
    {
      label: "Administration",
      icon: mdiResponsive,
      menu: [
        { href: "/categories", icon: mdiShapePlus, label: "Categories" },
        { href: "/users", icon: mdiAccountMultiple, label: "Users" },
        { href: "/logs", icon: mdiListBox, label: "Logs" },
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
