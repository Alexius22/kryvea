import { mdiChevronDoubleRight } from "@mdi/js";
import { useContext } from "react";
import { Outlet } from "react-router";
import { GlobalContext } from "../../App";
import Icon from "../Composition/Icon";
import Breadcrumb from "./Breadcrumb";
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
        <NavBar>
          <Breadcrumb
            homeElement={"Home"}
            separator={<Icon viewBox="4 4 20 7.5" path={mdiChevronDoubleRight} />}
            capitalizeLinks
          />
        </NavBar>
        <main className="layout-main">
          <Outlet />
          <FooterBar />
        </main>
      </div>
    </div>
  );
}
