import { mdiBackburger, mdiForwardburger, mdiMenu } from "@mdi/js";
import { useState } from "react";
import { Outlet } from "react-router";
import AsideMenu from "../components/AsideMenu";
import FooterBar from "../components/FooterBar";
import Icon from "../components/Icon/Icon";
import NavBar from "../components/NavBar";
import NavBarItemPlain from "../components/NavBar/Item/Plain";
import menuNavBar from "../menuNavBar";
import Breadcrumb from "./Breadcrumb";

export default function LayoutAuthenticated() {
  const [isAsideMobileExpanded, setIsAsideMobileExpanded] = useState(false);
  const [isAsideLgActive, setIsAsideLgActive] = useState(false);

  const layoutAsidePadding = "xl:pl-60";

  return (
    <div className={`overflow-hidden lg:overflow-visible`}>
      <div
        className={`${layoutAsidePadding} ${
          isAsideMobileExpanded ? "ml-60 lg:ml-0" : ""
        } min-h-screen w-screen bg-gray-50 pt-14 transition-position dark:bg-slate-800 dark:text-slate-100 lg:w-auto`}
      >
        <span className="absolute flex h-0 w-0 animate-none cursor-auto flex-col overflow-auto bg-black bg-opacity-15 text-red-300 text-opacity-15"></span>
        <NavBar menu={menuNavBar} className={`${layoutAsidePadding} ${isAsideMobileExpanded ? "ml-60 lg:ml-0" : ""}`}>
          <NavBarItemPlain display="flex lg:hidden" onClick={() => setIsAsideMobileExpanded(!isAsideMobileExpanded)}>
            <Icon path={isAsideMobileExpanded ? mdiBackburger : mdiForwardburger} size="24" />
          </NavBarItemPlain>

          <NavBarItemPlain display="hidden lg:flex xl:hidden" onClick={() => setIsAsideLgActive(true)}>
            <Icon path={mdiMenu} size="24" />
          </NavBarItemPlain>

          <NavBarItemPlain useMargin>
            <Breadcrumb homeElement={"Home"} separator={<span> {">"} </span>} capitalizeLinks />
          </NavBarItemPlain>
        </NavBar>
        <AsideMenu
          isAsideMobileExpanded={isAsideMobileExpanded}
          isAsideLgActive={isAsideLgActive}
          onAsideLgClose={() => setIsAsideLgActive(false)}
        />
        <Outlet />
        <FooterBar>
          <a target="_blank" rel="noreferrer" className="text-blue-600"></a>
        </FooterBar>
      </div>
    </div>
  );
}
