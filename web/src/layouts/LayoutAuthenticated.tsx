import { Outlet } from "react-router";
import AsideMenuLayer from "../components/AsideMenu/Layer";
import FooterBar from "../components/FooterBar";
import NavBar from "../components/NavBar";
import NavBarItemPlain from "../components/NavBar/Item/Plain";
import menuNavBar from "../menuNavBar";
import Breadcrumb from "./Breadcrumb";

export default function LayoutAuthenticated() {
  return (
    <div
      className={`max-w-screen flex h-screen bg-slate-300 transition-position dark:bg-slate-800 dark:text-slate-100 lg:w-auto`}
    >
      <AsideMenuLayer className="hidden h-full w-full max-w-[300px] p-4 transition-position xl:flex" />
      <div className="flex w-full flex-col overflow-auto px-4 xl:p-0 xl:pb-4 xl:pr-4">
        <NavBar menu={menuNavBar} className="sticky top-0">
          <NavBarItemPlain useMargin>
            <Breadcrumb homeElement={"Home"} separator={<span> {">"} </span>} capitalizeLinks />
          </NavBarItemPlain>
        </NavBar>
        <main className="no-scrollbar flex h-full w-full flex-col justify-between overflow-auto dark:bg-slate-800">
          <Outlet />
          <FooterBar className="font-thin text-slate-100 dark:text-slate-600">
            <a target="_blank" rel="noreferrer" className="text-blue-600"></a>
          </FooterBar>
        </main>
      </div>
    </div>
  );
}
