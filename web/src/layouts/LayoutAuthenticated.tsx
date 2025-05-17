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
      className={`max-w-screen flex h-screen bg-gray-50 transition-position dark:bg-slate-800 dark:text-slate-100 lg:w-auto`}
    >
      <AsideMenuLayer className="hidden h-full w-full max-w-[264px] p-4 transition-position xl:flex" />
      <div className="flex w-full flex-col overflow-auto pb-4 pr-4">
        <NavBar menu={menuNavBar} className="sticky top-0">
          <NavBarItemPlain useMargin>
            <Breadcrumb homeElement={"Home"} separator={<span> {">"} </span>} capitalizeLinks />
          </NavBarItemPlain>
        </NavBar>
        <main className="flex h-full w-full flex-col justify-between overflow-auto bg-slate-800">
          <Outlet />
          <FooterBar className="bg-slate-800">
            <a target="_blank" rel="noreferrer" className="text-blue-600"></a>
          </FooterBar>
        </main>
      </div>
    </div>
  );
}
