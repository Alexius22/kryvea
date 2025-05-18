import { mdiClose } from "@mdi/js";
import React, { useContext } from "react";
import Icon from "../Icon/Icon";
import AsideMenuContent from "./AsideMenuContent";
import { GlobalContext } from "../../../App";
import { Link } from "react-router";

type Props = {
  className?: string;
};

export default function AsideMenuLayer({ className = "", ...props }: Props) {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);

  const handleAsideLgCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <aside className={className}>
      <div className={`aside flex flex-1 flex-col overflow-hidden bg-slate-200 dark:bg-slate-900 lg:rounded-2xl`}>
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
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            darkTheme ? "aside-scrollbars-[slate]" : "aside-scrollbars"
          }`}
        >
          <AsideMenuContent className="flex flex-col gap-4" />
        </div>
      </div>
    </aside>
  );
}
