import { createContext, Dispatch, SetStateAction, useCallback, useLayoutEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import Button from "./components/Form/Button";
import { getLocalStorageCtxState, GlobalContextKeys, setLocalStorageCtxState } from "./ctxPersistence";
import LayoutAuthenticated from "./layouts/LayoutAuthenticated";
import RouteWatcher from "./layouts/RouteWatcher";
import {
  AddCustomer,
  AddTarget,
  AddUser,
  Assessments,
  AssessmentUpsert,
  AssessmentVulnerabilities,
  Categories,
  CustomerDetail,
  Customers,
  Dashboard,
  EditPoc,
  EditReport,
  Login,
  ManageCategory,
  Profile,
  Targets,
  Users,
  VulnerabilityDetail,
  VulnerabilitySearch,
  VulnerabilityUpsert,
} from "./pages";
import LiveEditor from "./pages/LiveEditor";
import { Assessment as AssessmentObj, Category, Customer, Vulnerability } from "./types/common.types";

export type GlobalContextType = {
  useDarkTheme: [boolean, Dispatch<SetStateAction<boolean>>];
  useCtxAssessment: [Partial<AssessmentObj>, Dispatch<SetStateAction<Partial<AssessmentObj>>>];
  useCtxCustomer: [Customer, Dispatch<SetStateAction<Customer>>];
  useCtxVulnerability: [Partial<Vulnerability>, Dispatch<SetStateAction<Partial<Vulnerability>>>];
  useCtxCategory: [Category, Dispatch<SetStateAction<Category>>];
};

export const GlobalContext = createContext<GlobalContextType>(null);

export default function App() {
  const useDarkTheme = useState(localStorage.getItem("darkMode") === "1");
  const [darkTheme] = useDarkTheme;
  const useCtxCustomer = useState<Customer>(() => getLocalStorageCtxState("useCtxCustomer"));
  const useCtxAssessment = useState<Partial<AssessmentObj>>(() => getLocalStorageCtxState("useCtxAssessment"));
  const useCtxVulnerability = useState<Partial<Vulnerability>>(() => getLocalStorageCtxState("useCtxVulnerability"));
  const useCtxCategory = useState<Category>(() => getLocalStorageCtxState("useCtxCategory"));

  useLayoutEffect(() => {
    localStorage.setItem("darkMode", darkTheme ? "1" : "0");
    document.documentElement.classList[darkTheme ? "add" : "remove"]("dark");
  }, [darkTheme]);

  const bindToLocalStorage = useCallback(function <T>(
    [state, setState]: [T, Dispatch<SetStateAction<T>>],
    key: GlobalContextKeys
  ): [T, (newState: T | ((prevState: T) => T)) => any] {
    return [
      state,
      (value: T | ((prevState: T) => T)) => {
        setState(value);
        setLocalStorageCtxState(key, value);
      },
    ];
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        useDarkTheme,
        useCtxCustomer: bindToLocalStorage(useCtxCustomer, "useCtxCustomer"),
        useCtxAssessment: bindToLocalStorage(useCtxAssessment, "useCtxAssessment"),
        useCtxVulnerability: bindToLocalStorage(useCtxVulnerability, "useCtxVulnerability"),
        useCtxCategory: bindToLocalStorage(useCtxCategory, "useCtxCategory"),
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={3 * 1000}
        closeOnClick
        pauseOnHover
        toastClassName="kryvea-toast"
      />
      <BrowserRouter>
        <Routes>
          <Route element={<RouteWatcher />}>
            <Route element={<LayoutAuthenticated />}>
              <Route // remove after testing
                path="/toast"
                element={
                  <Button
                    text="test"
                    onClick={() => {
                      toast.error("error");
                      toast.success("success");
                      toast.loading("loading");
                      toast.warning("warning");
                    }}
                  />
                }
              />
              <Route path="/" element={<Navigate to={"/dashboard"} replace />} />

              {/* Dashboard and Profile */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Users */}
              <Route path="/users" element={<Users />} />
              <Route path="/add_user" element={<AddUser />} />

              {/* Customers */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/add_customer" element={<AddCustomer />} />
              <Route path="/customers/:customerId" element={<CustomerDetail />} />
              <Route path="/customers/:customerId/targets" element={<Targets />} />
              <Route path="/customers/:customerId/targets/add_target" element={<AddTarget />} />
              <Route path="/customers/:customerId/assessments" element={<Assessments />} />
              <Route path="/customers/:customerId/assessments/new" element={<AssessmentUpsert />} />
              <Route path="/customers/:customerId/assessments/:assessmentId" element={<AssessmentUpsert />} />

              {/* Assessments */}
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities"
                element={<AssessmentVulnerabilities />}
              />
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities/add_vulnerability"
                element={<VulnerabilityUpsert />}
              />
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities/:vulnerabilityId"
                element={<VulnerabilityDetail />}
              />
              <Route
                path="/customers/:customerId/assessments/:assessmentId/vulnerabilities/:vulnerabilityId/edit"
                element={<VulnerabilityUpsert />}
              />

              {/* Vulnerabilities */}
              <Route path="/vulnerability_search" element={<VulnerabilitySearch />} />
              <Route path="/vulnerabilities/:vulnerabilityId/pocs/edit" element={<EditPoc />} />

              {/* Categories */}
              <Route path="/categories" element={<Categories />} />
              <Route path="/manage_category" element={<ManageCategory />} />
              <Route path="/manage_category/:categoryId" element={<ManageCategory />} />

              {/* Other */}
              <Route path="/edit_report" element={<EditReport />} />
              <Route path="/live_editor" element={<LiveEditor />} />
            </Route>
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
}
