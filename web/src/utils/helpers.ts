import {
  mdiAccountMultiple,
  mdiCog,
  mdiCogs,
  mdiDomain,
  mdiFileChart,
  mdiListBox,
  mdiMagnify,
  mdiMathLog,
  mdiPencil,
  mdiResponsive,
  mdiShapePlus,
  mdiTabSearch,
  mdiViewDashboard,
} from "@mdi/js";
import { NavigateFunction } from "react-router";
import { getKryveaShadow } from "../api/cookie";
import { Customer } from "../types/common.types";
import { appTitle, USER_ROLE_ADMIN } from "./constants";

export const getPageTitle = (currentPageTitle: string) => `${currentPageTitle} - ${appTitle}`;

export function getBrowser() {
  if (navigator.userAgent.indexOf("Chrome") != -1) {
    return "Chrome";
  } else if (navigator.userAgent.indexOf("Opera") != -1) {
    return "Opera";
  } else if (navigator.userAgent.indexOf("MSIE") != -1) {
    return "IE";
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    return "Firefox";
  } else {
    return "unknown";
  }
}

export type SidebarItemLabel =
  | "Dashboard"
  | "Customers"
  | "Assessments"
  | "Targets"
  | "Edit Customer"
  | "Vulnerability Search"
  | "Administration"
  | "Categories"
  | "Users"
  | "Logs"
  | "Report Templates"
  | "Settings";
export type SidebarItem = {
  icon: string;
  label: SidebarItemLabel;
  href?: string;
  onClick?: () => void;
  menu?: SidebarItem[];
};
export const getSidebarItems: (ctxCustomer: Customer, navigate: NavigateFunction) => SidebarItem[] = ctxCustomer => [
  { href: "/dashboard", icon: mdiViewDashboard, label: "Dashboard" },
  { href: "/customers", icon: mdiListBox, label: "Customers" },
  ...(ctxCustomer != null
    ? [
        {
          label: ctxCustomer.name,
          icon: mdiDomain,
          href: `/customers/${ctxCustomer.id}/assessments`,
          menu: [
            {
              href: `/customers/${ctxCustomer.id}/assessments`,
              icon: mdiTabSearch,
              label: "Assessments",
            },
            { href: `/customers/${ctxCustomer.id}/targets`, icon: mdiResponsive, label: "Targets" },
            {
              href: `/customers/${ctxCustomer.id}`,
              icon: mdiPencil,
              label: "Edit Customer",
            },
          ],
        } as SidebarItem & { label: string }, // ctxCustomer name is not castable as SidebarItemLabel
      ]
    : []),
  { href: "/vulnerability_search", icon: mdiMagnify, label: "Vulnerability Search" },
  getKryveaShadow() === USER_ROLE_ADMIN && {
    label: "Administration",
    icon: mdiCogs,
    menu: [
      { href: "/categories", icon: mdiShapePlus, label: "Categories" },
      { href: "/users", icon: mdiAccountMultiple, label: "Users" },
      { href: "/logs", icon: mdiMathLog, label: "Logs" },
      { href: "/templates", icon: mdiFileChart, label: "Report Templates" },
      { href: "/settings", icon: mdiCog, label: "Settings" },
    ],
  },
];
