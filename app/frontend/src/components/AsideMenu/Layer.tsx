import { mdiClose } from "@mdi/js";
import React, { useContext } from "react";
import { GlobalContext } from "../../pages/_app";
import Icon from "../Icon";
import AsideMenuList from "./List";

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
      className={`${className} zzz lg:py-2 lg:pl-2 w-70 min-w-70 max-w-70 fixed flex z-40 top-0 h-screen transition-position overflow-hidden`}
    >
      <div className={`aside lg:rounded-2xl flex-1 flex flex-col overflow-hidden dark:bg-slate-900`}>
        <div className={`aside-brand flex flex-row h-14 items-center justify-between dark:bg-slate-900`}>
          <div className="text-center flex-1 lg:text-left lg:pl-6 xl:text-center xl:pl-0">
            <a className="font-black" href="/dashboard">
              Kryvea
            </a>
          </div>
          <button className="hidden lg:inline-block xl:hidden p-3" onClick={handleAsideLgCloseClick}>
            <Icon path={mdiClose} />
          </button>
        </div>
        <div
          className={`navbar-fixed-width flex-1 overflow-y-auto overflow-x-hidden ${
            darkTheme ? "aside-scrollbars-[slate]" : "aside-scrollbars"
          }`}
        >
          <AsideMenuList />
        </div>
      </div>
    </aside>
  );
}
