import { mdiBackburger, mdiForwardburger, mdiMenu } from "@mdi/js";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import AsideMenu from "../components/AsideMenu";
import FooterBar from "../components/FooterBar";
import Icon from "../components/Icon";
import NavBar from "../components/NavBar";
import NavBarItemPlain from "../components/NavBar/Item/Plain";
import menuNavBar from "../menuNavBar";
import NextBreadcrumb from "./NextBreadcrumb";

type Props = {
  children: ReactNode;
};

export default function LayoutAuthenticated({ children }: Props) {
  const [isAsideMobileExpanded, setIsAsideMobileExpanded] = useState(false);
  const [isAsideLgActive, setIsAsideLgActive] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsAsideMobileExpanded(false);
      setIsAsideLgActive(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router.events]);

  const layoutAsidePadding = "xl:pl-60";

  return (
    <div className={`overflow-hidden lg:overflow-visible`}>
      <div
        className={`${layoutAsidePadding} ${
          isAsideMobileExpanded ? "ml-60 lg:ml-0" : ""
        } pt-14 min-h-screen w-screen transition-position lg:w-auto bg-gray-50 dark:bg-slate-800 dark:text-slate-100`}
      >
        <NavBar menu={menuNavBar} className={`${layoutAsidePadding} ${isAsideMobileExpanded ? "ml-60 lg:ml-0" : ""}`}>
          <NavBarItemPlain display="flex lg:hidden" onClick={() => setIsAsideMobileExpanded(!isAsideMobileExpanded)}>
            <Icon path={isAsideMobileExpanded ? mdiBackburger : mdiForwardburger} size="24" />
          </NavBarItemPlain>
          <NavBarItemPlain display="hidden lg:flex xl:hidden" onClick={() => setIsAsideLgActive(true)}>
            <Icon path={mdiMenu} size="24" />
          </NavBarItemPlain>
          <NavBarItemPlain useMargin>
            <NextBreadcrumb homeElement={"Home"} separator={<span> {">"} </span>} capitalizeLinks />
          </NavBarItemPlain>
        </NavBar>
        <AsideMenu
          isAsideMobileExpanded={isAsideMobileExpanded}
          isAsideLgActive={isAsideLgActive}
          onAsideLgClose={() => setIsAsideLgActive(false)}
        />
        {children}
        <FooterBar>
          <a target="_blank" rel="noreferrer" className="text-blue-600"></a>
        </FooterBar>
      </div>
    </div>
  );
}
