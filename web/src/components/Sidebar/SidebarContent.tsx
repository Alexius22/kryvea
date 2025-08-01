import {
  mdiAccountMultiple,
  mdiFileChart,
  mdiListBox,
  mdiMagnify,
  mdiMonitor,
  mdiResponsive,
  mdiShapePlus,
  mdiViewList,
} from "@mdi/js";
import { useContext } from "react";
import { navigate } from "../../api/api";
import { getKryveaShadow } from "../../api/cookie";
import { GlobalContext } from "../../App";
import { USER_ROLE_ADMIN } from "../../config";
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
    ...(ctxCustomer != null
      ? [
          {
            label: ctxCustomer.name,
            icon: mdiViewList,
            onClick: () => navigate(`/customers/${ctxCustomer.id}`),
            menu: [
              { href: `/customers/${ctxCustomer.id}/assessments`, label: "Assessments" },
              { href: `/customers/${ctxCustomer.id}/targets`, label: "Targets" },
            ],
          },
        ]
      : []),
    { href: "/vulnerability_search", icon: mdiMagnify, label: "Vulnerability Search" },
    getKryveaShadow() === USER_ROLE_ADMIN && {
      label: "Administration",
      icon: mdiResponsive,
      menu: [
        { href: "/categories", icon: mdiShapePlus, label: "Categories" },
        { href: "/users", icon: mdiAccountMultiple, label: "Users" },
        { href: "/logs", icon: mdiListBox, label: "Logs" },
        { href: "/templates", icon: mdiFileChart, label: "Templates" },
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
