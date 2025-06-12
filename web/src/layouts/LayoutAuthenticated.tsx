import { Outlet } from "react-router";
import FooterBar from "../components/FooterBar";
import NavBar from "../components/NavBar";
import Breadcrumb from "./Breadcrumb";
import Sidebar from "../components/Sidebar/Sidebar";

export default function LayoutAuthenticated() {
  return (
    <div className="layout-root">
      <Sidebar className="layout-sidebar" />
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
