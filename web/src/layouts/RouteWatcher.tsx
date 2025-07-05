import { useContext, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { GlobalContext } from "../App";
import { getData } from "../api/api";
import { Assessment, Category, Customer, Vulnerability } from "../types/common.types";

export default function RouteWatcher() {
  const {
    useCtxCustomer: [ctxCustomer, setCtxCustomer],
    useCtxAssessment: [ctxAssessment, setCtxAssessment],
    useCtxVulnerability: [ctxVulnerability, setCtxVulnerability],
    useCtxCategory: [ctxCategory, setCtxCategory],
  } = useContext(GlobalContext);
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const navigate = useNavigate();
  const { customerId, assessmentId, vulnerabilityId, categoryId } = useParams();

  useEffect(() => {
    if (customerId != undefined && ctxCustomer?.id !== customerId) {
      getData<Customer>(`/api/customers/${customerId}`, setCtxCustomer, () =>
        toast.error("Could not retrieve customer by id: " + customerId)
      );
    }
    if (assessmentId != undefined && ctxAssessment?.id !== assessmentId) {
      getData<Assessment>(`/api/customers/${customerId}/assessments/${assessmentId}`, setCtxAssessment, () =>
        toast.error("Could not retrieve assessment by id: " + assessmentId)
      );
    }
    if (vulnerabilityId != undefined && ctxVulnerability?.id !== vulnerabilityId) {
      getData<Vulnerability>(
        `/api/assessments/${assessmentId}/vulnerabilities/${vulnerabilityId}`,
        setCtxVulnerability,
        () => toast.error("Could not retrieve vulnerability by id: " + vulnerabilityId)
      );
    }
    if (categoryId != undefined && ctxCategory?.id !== categoryId) {
      getData<Category>(`/api/categories/${categoryId}`, setCtxCategory, () =>
        toast.error("Could not retrieve category by id: " + categoryId)
      );
    }
  }, [customerId, assessmentId, vulnerabilityId, categoryId]);

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
        setCtxAssessment(undefined);
        setCtxVulnerability(undefined);
        setCtxCategory(undefined);
        break;
    }
    previousPathname.current = currentPathname;
  }, [location]); // Runs whenever the location changes

  return <Outlet />;
}
