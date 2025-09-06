import { useContext, useEffect, useRef } from "react";
import { Outlet } from "react-router";
import { GlobalContext } from "../../App";
import FooterBar from "./FooterBar";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

export default function Layout() {
  const {
    useFullscreen: [fullscreen],
    useBrowser: [browser],
  } = useContext(GlobalContext);

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scrollTimeout: number | null = null;

    function handleWheel(e: WheelEvent) {
      const main = mainRef.current;
      if (!main) return;

      if (!main.contains(e.target as Node)) {
        const delta = e.deltaY;
        const maxScroll = main.scrollHeight - main.clientHeight;
        const atTop = main.scrollTop <= 0;
        const atBottom = main.scrollTop >= maxScroll;

        if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) {
          e.preventDefault();

          if (scrollTimeout) cancelAnimationFrame(scrollTimeout);

          scrollTimeout = requestAnimationFrame(() => {
            const scrollOptions: ScrollToOptions =
              browser === "Chrome" ? { top: delta, behavior: "instant" } : { top: delta * 4, behavior: "smooth" };
            main.scrollBy(scrollOptions);
          });
        }
      }
    }

    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
      if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    };
  }, []);

  return (
    <div className={`layout-root ${fullscreen ? "layout-fullscreen" : ""}`}>
      <Sidebar />
      <div className="layout-content">
        <NavBar />
        <main ref={mainRef} className="layout-main">
          <Outlet />
          <FooterBar />
        </main>
      </div>
    </div>
  );
}
