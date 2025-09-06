import { useContext } from "react";
import { Outlet } from "react-router";
import { GlobalContext } from "../../App";
import FooterBar from "./FooterBar";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

export default function LayoutAuthenticated() {
  const {
    useFullscreen: [fullscreen],
  } = useContext(GlobalContext);
  return (
    <div className={`layout-root ${fullscreen ? "layout-fullscreen" : ""}`}>
      <Sidebar />
      <div className="layout-content">
        <NavBar />
        <main className="layout-main">
          <Outlet />
          <FooterBar />
        </main>
      </div>
    </div>
  );
}
