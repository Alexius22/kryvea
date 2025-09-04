import {
  mdiAccountMultiple,
  mdiFileChart,
  mdiListBox,
  mdiMagnify,
  mdiMenuOpen,
  mdiMonitor,
  mdiPencil,
  mdiResponsive,
  mdiShapePlus,
  mdiTabSearch,
  mdiViewList,
} from "@mdi/js";
import { useContext, useState } from "react";
import { Link } from "react-router";
import { navigate } from "../../api/api";
import { getKryveaShadow } from "../../api/cookie";
import { GlobalContext } from "../../App";
import { USER_ROLE_ADMIN } from "../../config";
import Flex from "../Composition/Flex";
import Button from "../Form/Button";
import Icon from "../Icon";

type Props = {
  className?: string;
};

export default function Sidebar({ className = "" }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownMenus, setDropdownMenus] = useState({
    Administration: false,
    Customers: false,
  });
  const {
    useCtxCustomer: [ctxCustomer],
    useCtxSelectedSidebarItem: [ctxSelectedSidebarItem, setCtxSelectedSidebarItem],
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
              {
                href: `/customers/${ctxCustomer.id}/assessments`,
                icon: mdiTabSearch,
                label: "Assessments",
              },
              { href: `/customers/${ctxCustomer.id}/targets`, icon: mdiListBox, label: "Targets" },
              {
                href: `/customers/${ctxCustomer.id}`,
                icon: mdiPencil,
                label: "Edit Customer",
              },
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

  const iconSize = isCollapsed ? 22 : 18;

  return (
    <aside className={`${className} ${isCollapsed ? "w-min" : "w-[400px]"}`}>
      <Flex className="h-full w-full" col>
        {/* Header */}
        <header
          className={`flex items-center p-4 transition-all ${isCollapsed ? "justify-center" : "justify-between"} `}
        >
          {!isCollapsed && (
            <Link to="/dashboard" className="text-lg font-black transition-opacity duration-300">
              Kryvea
            </Link>
          )}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 text-[color:--link] ${isCollapsed ? "rotate-180" : ""}`}
            variant="transparent"
            icon={mdiMenuOpen}
            iconSize={22}
          />
        </header>

        {/* Content */}
        <Flex col className={`flex-1 gap-2 overflow-y-auto p-4`}>
          {defaultMenu.map(item =>
            item.menu == undefined ? (
              <Link
                className={`sidebar-item ${ctxSelectedSidebarItem === item.label ? "sidebar-item-active" : ""} ${isCollapsed ? "aspect-square h-12 justify-center" : "!pl-2"}`}
                to={item.href}
                onClick={() => setCtxSelectedSidebarItem(item.label)}
                key={item.label}
                title={item.label}
              >
                <Icon path={item.icon} size={iconSize} />
                <span className={isCollapsed ? "hidden" : ""}>{item.label}</span>
              </Link>
            ) : (
              <>
                <a
                  className={`sidebar-item flex-col ${ctxSelectedSidebarItem === item.label ? "sidebar-item-active" : ""} ${isCollapsed ? "aspect-square justify-center" : "!pl-2"}`}
                  onClick={() => {
                    setDropdownMenus(prev => ({ ...prev, [item.label]: !prev[item.label] }));
                    setCtxSelectedSidebarItem(item.label);
                  }}
                  title={`${item.label} menu`}
                >
                  <Flex className={`cursor-pointer gap-4 ${isCollapsed ? "justify-center" : ""}`}>
                    <Icon path={item.icon} size={iconSize} />
                    <span className={isCollapsed ? "hidden" : ""}>{item.label}</span>
                  </Flex>
                </a>
                {(item.label === ctxCustomer?.name || dropdownMenus[item.label]) && (
                  <>
                    {item.menu.map(subItem => (
                      <Link
                        className={`sidebar-item ${ctxSelectedSidebarItem === subItem.label ? "sidebar-item-active" : ""} ${isCollapsed ? "ml-0 aspect-square justify-center" : "ml-4 !pl-2"}`}
                        to={subItem.href}
                        onClick={() => setCtxSelectedSidebarItem(subItem.label)}
                        title={subItem.label}
                        key={subItem.label}
                      >
                        <Icon path={subItem.icon} size={iconSize} />
                        <span className={isCollapsed ? "hidden" : ""}>{subItem.label}</span>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )
          )}
        </Flex>
      </Flex>
    </aside>
  );
}
