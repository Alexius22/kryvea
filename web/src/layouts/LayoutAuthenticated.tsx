import { useContext } from "react";
import { Outlet } from "react-router";
import { GlobalContext } from "../App";
import FooterBar from "../components/FooterBar";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar/Sidebar";
import Breadcrumb from "./Breadcrumb";

export default function LayoutAuthenticated() {
  const {
    useFullscreen: [fullscreen],
  } = useContext(GlobalContext);
  return (
    <div className={`layout-root ${fullscreen ? "layout-fullscreen" : ""}`}>
      <Sidebar className="layout-sidebar border border-[color:--border-secondary]" />
      <div className="layout-content">
        <NavBar>
          <Breadcrumb homeElement={"Home"} separator={<span> {">"} </span>} capitalizeLinks />
        </NavBar>
        <main className="layout-main">
          <Outlet />
          <FooterBar />
        </main>
      </div>
    </div>
  );
}
