import { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { GlobalContext } from "../../App";

export default function RouteWatcher() {
  const {
    useCustomerName: [customerName, setCustomerName],
  } = useContext(GlobalContext);
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    const currentPathname = location.pathname;
    if (currentPathname === previousPathname.current) {
      return;
    }

    switch (currentPathname) {
      case "/customers":
      case "/assessments":
        break;
      default:
        setCustomerName("");
        break;
    }
    previousPathname.current = currentPathname;
  }, [location]); // Runs whenever the location changes

  return null;
}
