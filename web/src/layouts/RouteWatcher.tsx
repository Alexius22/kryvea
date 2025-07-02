import { useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { GlobalContext } from "../App";

export default function RouteWatcher() {
  const {
    useCtxCustomer: [, setCtxCustomer],
  } = useContext(GlobalContext);
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.cookie.includes("kryvea_shadow=ok") && location.pathname !== "/login") {
      navigate("/login", { replace: true });
      return;
    }
    const currentPathname = location.pathname.split("/")[1];
    if (currentPathname === previousPathname.current) {
      return;
    }

    switch (currentPathname) {
      case "customers":
      case "assessments":
        break;
      default:
        setCtxCustomer(undefined);
        break;
    }
    previousPathname.current = currentPathname;
  }, [location]); // Runs whenever the location changes

  return null;
}
