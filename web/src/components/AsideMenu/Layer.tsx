import { mdiClose } from "@mdi/js";
import React, { useContext } from "react";
import Icon from "../Icon/Icon";
import AsideMenu from "./AsideMenu";
import { GlobalContext } from "../../../App";
import { Link } from "react-router";

type Props = {
  className?: string;
  onAsideLgCloseClick: () => void;
};

export default function AsideMenuLayer({ className = "", ...props }: Props) {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);

  const handleAsideLgCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    props.onAsideLgCloseClick();
  };

  return (
    <aside
      className={`${className} zzz w-70 min-w-70 max-w-70 fixed top-0 z-40 flex h-screen overflow-hidden transition-position lg:py-2 lg:pl-2`}
    >
      <div className={`aside flex flex-1 flex-col overflow-hidden dark:bg-slate-900 lg:rounded-2xl`}>
        <div className={`aside-brand flex h-14 flex-row items-center justify-between dark:bg-slate-900`}>
          <div className="flex-1 text-center lg:pl-6 lg:text-left xl:pl-0 xl:text-center">
            <Link className="font-black" to="/dashboard">
              Kryvea
            </Link>
          </div>
          <button className="hidden p-3 lg:inline-block xl:hidden" onClick={handleAsideLgCloseClick}>
            <Icon path={mdiClose} />
          </button>
        </div>
        <div
          className={`navbar-fixed-width flex-1 overflow-y-auto overflow-x-hidden ${
            darkTheme ? "aside-scrollbars-[slate]" : "aside-scrollbars"
          }`}
        >
          <AsideMenu />
        </div>
      </div>
    </aside>
  );
}
